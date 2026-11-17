/**
 * Cardápio do Restaurante Sabor & Afeto - Marmitas Caseiras
 * Cada dia da semana possui pratos balanceados com ingredientes personalizáveis
 */

export const TAXA_ENTREGA = 6.00;

export const PONTOS_CARNE = [
  "Bem passada",
  "Ao ponto",
  "Ao ponto para mal",
  "Mal passada"
];

export const FORMAS_PAGAMENTO = [
  "Dinheiro",
  "Pix na entrega",
  "Cartão de Débito na entrega",
  "Cartão de Crédito na entrega"
];

// 0: Domingo, 1: Segunda, 2: Terça, 3: Quarta, 4: Quinta, 5: Sexta, 6: Sábado
export const CARDAPIO_SEMANAL = {
  // Segunda-feira (1)
  1: {
    diaNome: "Segunda-feira",
    pratos: [
      {
        id: "seg-bife",
        nome: "Bife Acebolado Especial",
        descricao: "Bife bovino macio grelhado com cebolas douradas, arroz branco, feijão carioca bem temperado e farofa crocante.",
        preco: 27.90,
        ingredientesRemoviveis: ["Cebola", "Alho", "Farofa", "Feijão", "Arroz", "Salada"],
        opcoesPontoCarne: PONTOS_CARNE
      },
      {
        id: "seg-frango",
        nome: "Frango Grelhado com Ervas",
        descricao: "Filé de peito grelhado com azeite e ervas finas, arroz integral, feijão carioca e legumes no vapor.",
        preco: 24.90,
        ingredientesRemoviveis: ["Ervas finas", "Alho", "Legumes", "Feijão", "Arroz integral"],
        opcoesPontoCarne: []
      },
      {
        id: "seg-strogonoff",
        nome: "Strogonoff de Frango Cremoso",
        descricao: "Strogonoff suculento de peito de frango em cubos, batata palha artesanal crocante e arroz branco soltinho.",
        preco: 26.50,
        ingredientesRemoviveis: ["Batata palha", "Champignon", "Mostarda", "Cebola", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "seg-veggie",
        nome: "Marmita Vegana de Grão-de-Bico",
        descricao: "Curry perfumado de grão-de-bico com legumes frescos, arroz com cúrcuma e salada fresca de folhas.",
        preco: 23.90,
        ingredientesRemoviveis: ["Coentro", "Pimenta", "Cúrcuma", "Alho", "Cebola", "Salada"],
        opcoesPontoCarne: []
      }
    ]
  },

  // Terça-feira (2)
  2: {
    diaNome: "Terça-feira",
    pratos: [
      {
        id: "ter-parmegiana",
        nome: "Parmegiana de Frango Gratinada",
        descricao: "Filé empanado crocante, coberto com molho de tomate caseiro e queijo derretido, arroz e purê de batatas.",
        preco: 28.90,
        ingredientesRemoviveis: ["Queijo", "Molho de tomate", "Orégano", "Purê de batatas", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "ter-costelinha",
        nome: "Costelinha Suína ao Barbecue Caseiro",
        descricao: "Costelinha assada lentamente desmanchando, molho barbecue artesanal, arroz branco e mandioca na manteiga.",
        preco: 29.50,
        ingredientesRemoviveis: ["Molho barbecue", "Manteiga", "Alho", "Cebolinha", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "ter-peixe",
        nome: "Peixe Frito Crocante (Filé de Tilápia)",
        descricao: "Filé de tilápia empanado no fubá bem sequinho, arroz branco, feijão e salada colorida de repolho e cenoura.",
        preco: 27.90,
        ingredientesRemoviveis: ["Limão", "Coentro", "Alho", "Feijão", "Salada", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "ter-omelete",
        nome: "Omelete Recheada com Queijo e Tomate",
        descricao: "Omelete fofinha recheada com queijo minas, tomate e orégano, acompanhada de arroz integral e feijão.",
        preco: 22.90,
        ingredientesRemoviveis: ["Queijo", "Tomate", "Orégano", "Cebola", "Arroz integral", "Feijão"],
        opcoesPontoCarne: []
      }
    ]
  },

  // Quarta-feira (3)
  3: {
    diaNome: "Quarta-feira",
    pratos: [
      {
        id: "qua-feijoada",
        nome: "Feijoada Tradicional Completa",
        descricao: "Feijoada saborosa com carnes selecionadas (bacon, paio e costelinha), arroz branco, couve refogada, farofa da casa e laranja fatiada.",
        preco: 31.90,
        ingredientesRemoviveis: ["Bacon", "Paio", "Couve", "Farofa", "Laranja", "Pimenta", "Alho", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "qua-frango-assado",
        nome: "Sobrecoxa Assada com Batatas Coradas",
        descricao: "Sobrecoxa dourada marinada no vinho branco e alecrim, arroz de açafrão, feijão preto e batatas coradas.",
        preco: 25.50,
        ingredientesRemoviveis: ["Alecrim", "Alho", "Batatas", "Feijão preto", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "qua-bife-rolê",
        nome: "Bife a Rolê Caseiro",
        descricao: "Bife recheado com cenoura e bacon ao molho ferrugem denso, arroz branco, purê cremoso e feijão carioca.",
        preco: 28.50,
        ingredientesRemoviveis: ["Bacon", "Cenoura", "Pimentão", "Alho", "Cebola", "Purê"],
        opcoesPontoCarne: PONTOS_CARNE
      },
      {
        id: "qua-feijoada-veggie",
        nome: "Feijoada Vegana com Cogumelos e Tofu Defumado",
        descricao: "Feijão preto encorpado com cogumelos frescos, tofu defumado artesanal, arroz, couve refogada e farofa de milho.",
        preco: 27.90,
        ingredientesRemoviveis: ["Cogumelos", "Tofu defumado", "Couve", "Farofa", "Alho", "Arroz"],
        opcoesPontoCarne: []
      }
    ]
  },

  // Quinta-feira (4)
  4: {
    diaNome: "Quinta-feira",
    pratos: [
      {
        id: "qui-lasanha",
        nome: "Lasanha à Bolonhesa da Nona",
        descricao: "Massa fresca artesanal, molho bolonhesa encorpado de carne bovina, molho bechamel cremoso e queijo gratinado.",
        preco: 28.90,
        ingredientesRemoviveis: ["Queijo", "Presunto", "Orégano", "Noz-moscada", "Cebola"],
        opcoesPontoCarne: []
      },
      {
        id: "qui-alcatra",
        nome: "Alcatra Grelhada na Manteiga de Garrafa",
        descricao: "Corte macio de alcatra na chapa com toque de manteiga de garrafa, arroz branco, feijão tropeiro e vinagrete.",
        preco: 32.50,
        ingredientesRemoviveis: ["Manteiga de garrafa", "Bacon do tropeiro", "Vinagrete", "Alho", "Cebola"],
        opcoesPontoCarne: PONTOS_CARNE
      },
      {
        id: "qui-frango-quiabo",
        nome: "Frango Caipira com Quiabo",
        descricao: "Frango ensopado à moda mineira com quiabo sem baba, angu de milho cremoso e arroz branco.",
        preco: 26.90,
        ingredientesRemoviveis: ["Quiabo", "Angu", "Cheiro-verde", "Alho", "Cebola", "Pimenta"],
        opcoesPontoCarne: []
      },
      {
        id: "qui-nhoque-ricota",
        nome: "Nhoque de Batata com Ricota e Espinafre",
        descricao: "Nhoque artesanal leve ao molho pomodoro rústico com manjericão fresco e lascas de parmesão.",
        preco: 25.90,
        ingredientesRemoviveis: ["Parmesão", "Manjericão", "Alho", "Cebola"],
        opcoesPontoCarne: []
      }
    ]
  },

  // Sexta-feira (5)
  5: {
    diaNome: "Sexta-feira",
    pratos: [
      {
        id: "sex-peixada",
        nome: "Moqueca Suave de Peixe com Camarão",
        descricao: "Posta de cação e camarões em molho de leite de coco, azeite de dendê moderado, pimentões, pirão e arroz branco.",
        preco: 34.90,
        ingredientesRemoviveis: ["Camarão", "Dendê", "Coentro", "Pimentão", "Pirão", "Pimenta"],
        opcoesPontoCarne: []
      },
      {
        id: "sex-strogonoff-carne",
        nome: "Strogonoff de Filé Mignon",
        descricao: "Tiras macias de mignon flambadas ao molho de cogumelos e creme de leite fresco, arroz branco e batata palha caseira.",
        preco: 33.90,
        ingredientesRemoviveis: ["Champignon", "Batata palha", "Mostarda", "Cebola", "Arroz"],
        opcoesPontoCarne: PONTOS_CARNE
      },
      {
        id: "sex-parmegiana-carne",
        nome: "Parmegiana de Carne Bovina",
        descricao: "Bife bovino empanado e dourado, queijo muçarela derretido, molho de tomate fresco, arroz e batatas fritas.",
        preco: 30.90,
        ingredientesRemoviveis: ["Queijo", "Batata frita", "Molho de tomate", "Orégano", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "sex-moqueca-banana",
        nome: "Moqueca Vegana de Banana-da-Terra",
        descricao: "Banana-da-terra cozida com pimentões, leite de coco, azeite de oliva, tomate, pirão de legumes e arroz branco.",
        preco: 26.50,
        ingredientesRemoviveis: ["Pimentão", "Coentro", "Alho", "Cebola", "Pirão"],
        opcoesPontoCarne: []
      }
    ]
  },

  // Sábado (6)
  6: {
    diaNome: "Sábado",
    pratos: [
      {
        id: "sab-feijoada",
        nome: "Feijoada Nobre de Sábado",
        descricao: "Feijoada tradicional com lombo, costelinha defumada, calabresa, arroz soltinho, couve mineira, farofa de bacon e torresmo crocante.",
        preco: 33.90,
        ingredientesRemoviveis: ["Torresmo", "Bacon da farofa", "Couve", "Alho", "Pimenta", "Laranja"],
        opcoesPontoCarne: []
      },
      {
        id: "sab-churrasco",
        nome: "Marmita Gaúcha de Churrasco Misto",
        descricao: "Picanha, linguiça toscana e peito de frango assados na brasa, maionese artesanal de batatas, arroz e vinagrete.",
        preco: 35.90,
        ingredientesRemoviveis: ["Linguiça", "Maionese", "Vinagrete", "Alho", "Cebola", "Farofa"],
        opcoesPontoCarne: PONTOS_CARNE
      },
      {
        id: "sab-bobó",
        nome: "Bobó Cremoso de Frango com Mandioca",
        descricao: "Creme aveludado de mandioca com peito de frango desfiado, toque de leite de coco e cheiro-verde, servido com arroz branco e chips de mandioca.",
        preco: 27.90,
        ingredientesRemoviveis: ["Cheiro-verde", "Pimentão", "Alho", "Chips de mandioca", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "sab-risoto-funghi",
        nome: "Risoto Vegetariano de Cogumelos Frescos",
        descricao: "Arroz arbóreo com cogumelos paris e shimeji, manteiga, vinho branco e finalizado com queijo parmesão.",
        preco: 29.90,
        ingredientesRemoviveis: ["Parmesão", "Alho-poró", "Cebola", "Manteiga"],
        opcoesPontoCarne: []
      }
    ]
  },

  // Domingo (0)
  0: {
    diaNome: "Domingo",
    pratos: [
      {
        id: "dom-frango-assado",
        nome: "Frango Assado com Farofa Rica e Batatas",
        descricao: "O clássico do almoço de domingo: frango assado bem temperado, batatas douradas, farofa rica de ovos e arroz branco.",
        preco: 27.90,
        ingredientesRemoviveis: ["Ovo da farofa", "Alho", "Batatas", "Cheiro-verde", "Arroz"],
        opcoesPontoCarne: []
      },
      {
        id: "dom-costela-forno",
        nome: "Costela Bovina Assada no Bafo",
        descricao: "Costela bovina desmanchando do osso, mandioca cozida amanteigada, feijão tropeiro e arroz branco.",
        preco: 36.90,
        ingredientesRemoviveis: ["Manteiga", "Feijão tropeiro", "Cebola", "Alho", "Arroz"],
        opcoesPontoCarne: PONTOS_CARNE
      },
      {
        id: "dom-massa-artesanal",
        nome: "Rondelli Quatro Queijos ao Molho Sugo",
        descricao: "Massa artesanal recheada com muçarela, provolone, gorgonzola e parmesão, gratinada ao forno com molho de tomate rústico.",
        preco: 28.50,
        ingredientesRemoviveis: ["Gorgonzola", "Manjericão", "Parmesão", "Orégano"],
        opcoesPontoCarne: []
      },
      {
        id: "dom-parmegiana-berinjela",
        nome: "Parmegiana de Berinjela Crocante (Vegetariana)",
        descricao: "Fatias de berinjela empanadas, molho sugo artesanal com bastante queijo derretido, arroz branco e batata rústica.",
        preco: 25.90,
        ingredientesRemoviveis: ["Queijo", "Batata rústica", "Molho sugo", "Alho", "Arroz"],
        opcoesPontoCarne: []
      }
    ]
  }
};

/**
 * Retorna o cardápio do dia baseado em uma data (padrão: hoje)
 * @param {Date} [date=new Date()]
 * @returns {{ diaSemana: number, diaNome: string, taxaEntrega: number, pratos: Array }}
 */
export function getCardapioDoDia(date = new Date()) {
  const diaSemana = date.getDay();
  const cardapioDia = CARDAPIO_SEMANAL[diaSemana] || CARDAPIO_SEMANAL[1];
  return {
    diaSemana,
    diaNome: cardapioDia.diaNome,
    taxaEntrega: TAXA_ENTREGA,
    pratos: cardapioDia.pratos.map(p => ({ ...p }))
  };
}
