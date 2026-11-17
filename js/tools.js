/**
 * Gerenciamento do Carrinho e Ferramentas Executadas Deterministicamente em JavaScript
 * O modelo NUNCA calcula subtotais, taxas ou totais diretamente.
 */

import { getCardapioDoDia, TAXA_ENTREGA, FORMAS_PAGAMENTO } from "./menu.js";

export class CartManager {
  constructor() {
    this.itens = []; // Array de { linhaId, itemId, nome, precoUnitario, quantidade, personalizacoes, subtotalItem }
    this.cliente = {
      nome: "",
      endereco: "",
      formaPagamento: ""
    };
    this.proximaLinhaId = 1;
    this.pedidoFinalizado = false;
    this.numeroPedido = null;
  }

  /**
   * Reseta todo o carrinho e estado do pedido
   */
  limpar() {
    this.itens = [];
    this.cliente = { nome: "", endereco: "", formaPagamento: "" };
    this.proximaLinhaId = 1;
    this.pedidoFinalizado = false;
    this.numeroPedido = null;
  }

  /**
   * Normaliza texto para comparações
   * @param {string} str
   */
  normalizar(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  /**
   * Consulta o cardápio do dia
   */
  consultarCardapio() {
    const cardapio = getCardapioDoDia();
    return {
      sucesso: true,
      diaSemana: cardapio.diaNome,
      taxaEntrega: cardapio.taxaEntrega,
      itens: cardapio.pratos.map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        precoUnitario: p.preco,
        ingredientesRemoviveis: p.ingredientesRemoviveis,
        opcoesPontoCarne: p.opcoesPontoCarne
      }))
    };
  }

  /**
   * Adiciona um item ao carrinho com validações estritas
   * @param {string} itemId
   * @param {number} quantidade
   * @param {string[]} [personalizacoes=[]]
   */
  adicionarItem(itemId, quantidade, personalizacoes = []) {
    if (this.pedidoFinalizado) {
      return { sucesso: false, erro: "O pedido anterior já foi finalizado. Inicie uma nova conversa para outro pedido." };
    }

    const cardapio = getCardapioDoDia();
    const itemCardapio = cardapio.pratos.find(p => p.id === itemId);

    if (!itemCardapio) {
      return {
        sucesso: false,
        erro: `Item "${itemId}" não encontrado no cardápio de hoje (${cardapio.diaNome}). Itens válidos: ${cardapio.pratos.map(p => `${p.id} (${p.nome})`).join(", ")}`
      };
    }

    const qtd = Number(quantidade);
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > 20) {
      return {
        sucesso: false,
        erro: "A quantidade deve ser um número inteiro entre 1 e 20."
      };
    }

    // Validação de personalizações
    const validacaoPers = this.validarPersonalizacoes(itemCardapio, personalizacoes);
    if (!validacaoPers.valido) {
      return {
        sucesso: false,
        erro: validacaoPers.erro
      };
    }

    const linhaId = `item-${this.proximaLinhaId++}`;
    const precoUnitario = Number(itemCardapio.preco.toFixed(2));
    const subtotalItem = Number((precoUnitario * qtd).toFixed(2));

    const novoItem = {
      linhaId,
      itemId: itemCardapio.id,
      nome: itemCardapio.nome,
      precoUnitario,
      quantidade: qtd,
      personalizacoes: validacaoPers.personalizacoesFormatadas,
      subtotalItem
    };

    this.itens.push(novoItem);

    return {
      sucesso: true,
      mensagem: `${qtd}x "${itemCardapio.nome}" adicionado com sucesso!`,
      itemAdicionado: novoItem,
      resumoCarrinho: this.verCarrinho()
    };
  }

  /**
   * Altera quantidade e/ou personalizações de uma linha do carrinho
   * @param {string} linhaId
   * @param {number} [novaQuantidade]
   * @param {string[]} [novasPersonalizacoes]
   */
  alterarItem(linhaId, novaQuantidade, novasPersonalizacoes) {
    if (this.pedidoFinalizado) {
      return { sucesso: false, erro: "O pedido já foi finalizado." };
    }

    const item = this.itens.find(i => i.linhaId === linhaId);
    if (!item) {
      return {
        sucesso: false,
        erro: `Linha "${linhaId}" não encontrada no carrinho. Linhas disponíveis: ${this.itens.map(i => `${i.linhaId} (${i.nome})`).join(", ") || "carrinho vazio"}`
      };
    }

    const cardapio = getCardapioDoDia();
    const itemCardapio = cardapio.pratos.find(p => p.id === item.itemId);

    if (novaQuantidade !== undefined && novaQuantidade !== null) {
      const qtd = Number(novaQuantidade);
      if (!Number.isInteger(qtd) || qtd < 1 || qtd > 20) {
        return {
          sucesso: false,
          erro: "A nova quantidade deve ser um número inteiro entre 1 e 20."
        };
      }
      item.quantidade = qtd;
      item.subtotalItem = Number((item.precoUnitario * qtd).toFixed(2));
    }

    if (novasPersonalizacoes !== undefined && novasPersonalizacoes !== null) {
      if (!Array.isArray(novasPersonalizacoes)) {
        return { sucesso: false, erro: "Personalizações devem ser fornecidas em uma lista de strings." };
      }
      const validacaoPers = this.validarPersonalizacoes(itemCardapio, novasPersonalizacoes);
      if (!validacaoPers.valido) {
        return { sucesso: false, erro: validacaoPers.erro };
      }
      item.personalizacoes = validacaoPers.personalizacoesFormatadas;
    }

    return {
      sucesso: true,
      mensagem: `Item "${item.nome}" (${linhaId}) atualizado com sucesso.`,
      itemAtualizado: item,
      resumoCarrinho: this.verCarrinho()
    };
  }

  /**
   * Remove uma linha do carrinho
   * @param {string} linhaId
   */
  removerItem(linhaId) {
    if (this.pedidoFinalizado) {
      return { sucesso: false, erro: "O pedido já foi finalizado." };
    }

    const index = this.itens.findIndex(i => i.linhaId === linhaId);
    if (index === -1) {
      return {
        sucesso: false,
        erro: `Linha "${linhaId}" não encontrada no carrinho.`
      };
    }

    const removido = this.itens.splice(index, 1)[0];

    return {
      sucesso: true,
      mensagem: `Item "${removido.nome}" foi removido do carrinho.`,
      itemRemovido: removido,
      resumoCarrinho: this.verCarrinho()
    };
  }

  /**
   * Calcula totais de forma rigorosamente matemática e determinística
   */
  verCarrinho() {
    const subtotal = Number(
      this.itens.reduce((acc, curr) => acc + curr.subtotalItem, 0).toFixed(2)
    );
    const taxaEntrega = this.itens.length > 0 ? Number(TAXA_ENTREGA.toFixed(2)) : 0;
    const totalGeral = Number((subtotal + taxaEntrega).toFixed(2));

    return {
      sucesso: true,
      quantidadeItens: this.itens.reduce((acc, curr) => acc + curr.quantidade, 0),
      itens: this.itens.map(i => ({
        linhaId: i.linhaId,
        itemId: i.itemId,
        nome: i.nome,
        precoUnitario: i.precoUnitario,
        quantidade: i.quantidade,
        personalizacoes: i.personalizacoes,
        subtotalItem: i.subtotalItem
      })),
      subtotal,
      taxaEntrega,
      totalGeral,
      dadosEntrega: {
        nome: this.cliente.nome || null,
        endereco: this.cliente.endereco || null,
        formaPagamento: this.cliente.formaPagamento || null
      },
      pedidoFinalizado: this.pedidoFinalizado,
      numeroPedido: this.numeroPedido
    };
  }

  /**
   * Define e valida dados de entrega e forma de pagamento
   * @param {string} nome
   * @param {string} endereco
   * @param {string} formaPagamento
   */
  definirEntregaPagamento(nome, endereco, formaPagamento) {
    if (this.pedidoFinalizado) {
      return { sucesso: false, erro: "O pedido já foi finalizado." };
    }

    if (!nome || typeof nome !== "string" || nome.trim().length < 2) {
      return { sucesso: false, erro: "Nome do cliente inválido. Forneça o nome completo." };
    }
    if (nome.length > 100) {
      return { sucesso: false, erro: "Nome muito longo (máximo 100 caracteres)." };
    }

    if (!endereco || typeof endereco !== "string" || endereco.trim().length < 5) {
      return { sucesso: false, erro: "Endereço incompleto. Forneça rua, número e bairro/complemento." };
    }
    if (endereco.length > 250) {
      return { sucesso: false, erro: "Endereço muito longo (máximo 250 caracteres)." };
    }

    // Validação da forma de pagamento
    const fpNormalizada = this.normalizar(formaPagamento);
    let formaValida = null;

    if (fpNormalizada.includes("pix")) {
      formaValida = "Pix na entrega";
    } else if (fpNormalizada.includes("dinheiro")) {
      formaValida = "Dinheiro";
    } else if (fpNormalizada.includes("debito") || fpNormalizada.includes("débito")) {
      formaValida = "Cartão de Débito na entrega";
    } else if (fpNormalizada.includes("credito") || fpNormalizada.includes("crédito") || fpNormalizada.includes("cartao") || fpNormalizada.includes("cartão")) {
      formaValida = "Cartão de Crédito na entrega";
    }

    if (!formaValida) {
      return {
        sucesso: false,
        erro: `Forma de pagamento "${formaPagamento}" não aceita. Aceitamos apenas: ${FORMAS_PAGAMENTO.join(", ")}.`
      };
    }

    this.cliente = {
      nome: nome.trim(),
      endereco: endereco.trim(),
      formaPagamento: formaValida
    };

    return {
      sucesso: true,
      mensagem: "Dados de entrega e pagamento registrados com sucesso!",
      dadosEntrega: this.cliente,
      carrinhoCompleto: this.verCarrinho()
    };
  }

  /**
   * Finaliza o pedido e gera o número de confirmação simulado
   */
  finalizarPedido() {
    if (this.pedidoFinalizado) {
      return {
        sucesso: true,
        mensagem: `Este pedido já foi finalizado anteriormente sob o protocolo #${this.numeroPedido}.`,
        numeroPedido: this.numeroPedido,
        resumo: this.verCarrinho()
      };
    }

    if (this.itens.length === 0) {
      return {
        sucesso: false,
        erro: "Não é possível finalizar um pedido com o carrinho vazio. Adicione marmitas antes de fechar a compra."
      };
    }

    if (!this.cliente.nome || !this.cliente.endereco || !this.cliente.formaPagamento) {
      const faltantes = [];
      if (!this.cliente.nome) faltantes.push("nome do cliente");
      if (!this.cliente.endereco) faltantes.push("endereço completo");
      if (!this.cliente.formaPagamento) faltantes.push("forma de pagamento (Dinheiro, Pix ou Cartão)");

      return {
        sucesso: false,
        erro: `Não é possível finalizar. Faltam informações obrigatórias de entrega: ${faltantes.join(", ")}.`
      };
    }

    // Gera número de pedido simulado (ex: MARM-202611-8492)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const dataStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    this.numeroPedido = `MARM-${dataStr}-${randomCode}`;
    this.pedidoFinalizado = true;

    return {
      sucesso: true,
      mensagem: `🎉 Pedido #${this.numeroPedido} confirmado com sucesso! Nossa cozinha já começou a preparar sua marmita quentinha.`,
      numeroPedido: this.numeroPedido,
      resumoFinal: this.verCarrinho()
    };
  }

  /**
   * Valida lista de personalizações contra o cardápio oficial do prato
   * @param {object} itemCardapio
   * @param {string[]} personalizacoes
   */
  validarPersonalizacoes(itemCardapio, personalizacoes) {
    if (!personalizacoes || !Array.isArray(personalizacoes)) {
      return { valido: true, personalizacoesFormatadas: [] };
    }

    const formatadas = [];

    for (const rawOpt of personalizacoes) {
      if (typeof rawOpt !== "string" || !rawOpt.trim()) continue;
      const opt = rawOpt.trim();

      if (opt.length > 80) {
        return {
          valido: false,
          erro: `A personalização "${opt.slice(0, 30)}..." é muito extensa (máx 80 caracteres).`
        };
      }

      const optNorm = this.normalizar(opt);

      // Checa se é especificação de ponto da carne
      let pontoEncontrado = null;
      if (itemCardapio.opcoesPontoCarne && itemCardapio.opcoesPontoCarne.length > 0) {
        for (const ponto of itemCardapio.opcoesPontoCarne) {
          const pNorm = this.normalizar(ponto);
          if (optNorm.includes(pNorm) || (pNorm.includes("bem") && optNorm.includes("bem")) || (pNorm.includes("mal") && optNorm.includes("mal")) || (optNorm.includes("ao ponto"))) {
            pontoEncontrado = `Ponto: ${ponto}`;
            break;
          }
        }
      }

      if (pontoEncontrado) {
        formatadas.push(pontoEncontrado);
        continue;
      }

      // Checa se é remoção de ingrediente permitido
      let ingredienteEncontrado = null;
      for (const ing of itemCardapio.ingredientesRemoviveis || []) {
        const ingNorm = this.normalizar(ing);
        if (optNorm.includes(ingNorm)) {
          ingredienteEncontrado = `Sem ${ing}`;
          break;
        }
      }

      if (ingredienteEncontrado) {
        formatadas.push(ingredienteEncontrado);
        continue;
      }

      // Se não for nem ponto nem ingrediente permitido do prato, rejeita
      const permitidosDesc = [];
      if (itemCardapio.ingredientesRemoviveis?.length) {
        permitidosDesc.push(`Remoções permitidas: ${itemCardapio.ingredientesRemoviveis.join(", ")}`);
      }
      if (itemCardapio.opcoesPontoCarne?.length) {
        permitidosDesc.push(`Pontos da carne: ${itemCardapio.opcoesPontoCarne.join(", ")}`);
      }

      return {
        valido: false,
        erro: `Personalização "${opt}" não é aplicável ao prato "${itemCardapio.nome}". ${permitidosDesc.join(" | ") || "Este prato não possui opções personalizáveis."}`
      };
    }

    return {
      valido: true,
      personalizacoesFormatadas: [...new Set(formatadas)] // Remove duplicadas
    };
  }
}

// Definição das ferramentas para envio na API do Gemini (Function Calling Declaration)
export const GEMINI_TOOL_DECLARATIONS = [
  {
    name: "consultar_cardapio",
    description: "Consulta o cardápio oficial de marmitas do dia com os preços unitários, acompanhamentos e ingredientes personalizáveis.",
    parameters: {
      type: "OBJECT",
      properties: {},
      required: []
    }
  },
  {
    name: "adicionar_item",
    description: "Adiciona uma ou mais marmitas ao carrinho de compras com possíveis personalizações.",
    parameters: {
      type: "OBJECT",
      properties: {
        item_id: {
          type: "STRING",
          description: "ID exato do prato no cardápio de hoje (ex: seg-bife, qua-feijoada)."
        },
        quantidade: {
          type: "INTEGER",
          description: "Quantidade inteira de marmitas deste item (mínimo 1, máximo 20)."
        },
        personalizacoes: {
          type: "ARRAY",
          items: {
            type: "STRING"
          },
          description: "Lista de ingredientes a remover ou ponto da carne (ex: ['sem cebola', 'ao ponto'])."
        }
      },
      required: ["item_id", "quantidade"]
    }
  },
  {
    name: "alterar_item",
    description: "Modifica a quantidade ou personalizações de uma linha já existente no carrinho de compras.",
    parameters: {
      type: "OBJECT",
      properties: {
        linha_id: {
          type: "STRING",
          description: "Identificador da linha no carrinho (ex: 'item-1', 'item-2')."
        },
        quantidade: {
          type: "INTEGER",
          description: "Nova quantidade inteira (entre 1 e 20)."
        },
        personalizacoes: {
          type: "ARRAY",
          items: {
            type: "STRING"
          },
          description: "Nova lista completa de personalizações daquele item."
        }
      },
      required: ["linha_id"]
    }
  },
  {
    name: "remover_item",
    description: "Exclui uma linha inteira do carrinho pelo seu identificador de linha.",
    parameters: {
      type: "OBJECT",
      properties: {
        linha_id: {
          type: "STRING",
          description: "Identificador da linha a ser removida (ex: 'item-1')."
        }
      },
      required: ["linha_id"]
    }
  },
  {
    name: "ver_carrinho",
    description: "Retorna a relação de itens adicionados, preços unitários, subtotal somado, taxa de entrega e total geral calculado deterministicamente pelo sistema.",
    parameters: {
      type: "OBJECT",
      properties: {},
      required: []
    }
  },
  {
    name: "definir_entrega_pagamento",
    description: "Registra os dados do cliente para entrega e a forma de pagamento escolhida.",
    parameters: {
      type: "OBJECT",
      properties: {
        nome: {
          type: "STRING",
          description: "Nome do cliente."
        },
        endereco: {
          type: "STRING",
          description: "Endereço completo para entrega (rua, número, bairro ou complemento)."
        },
        forma_pagamento: {
          type: "STRING",
          description: "Forma de pagamento: Dinheiro, Pix na entrega, Cartão de Débito ou Cartão de Crédito."
        }
      },
      required: ["nome", "endereco", "forma_pagamento"]
    }
  },
  {
    name: "finalizar_pedido",
    description: "Finaliza e confirma a compra quando o cliente já possui itens no carrinho e forneceu nome, endereço e forma de pagamento. Retorna o número do pedido.",
    parameters: {
      type: "OBJECT",
      properties: {},
      required: []
    }
  }
];

// Instância padrão compartilhada
export const cartManager = new CartManager();
