/**
 * Agente de IA para Atendimento de Vendas
 * Comunicação direta com a API Google Gemini com suporte a Function Calling em loop
 */

import { SYSTEM_PROMPT, formatIsolatedUserMessage } from "./prompts.js";
import { GEMINI_TOOL_DECLARATIONS, cartManager } from "./tools.js";
import { guardrails } from "./guardrails.js";

// Modelo padrão recomendado pelo Google para chat rápido e multimodal
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const SESSION_STORAGE_KEY = "marmitas_gemini_api_key";
const MAX_FUNCTION_CALL_TURNS = 6;

export class GeminiAgent {
  constructor(options = {}) {
    this.modelName = options.modelName || DEFAULT_GEMINI_MODEL;
    this.history = []; // Histórico no formato da API Gemini: [{ role: 'user'|'model', parts: [...] }]
    this.apiKey = this.loadApiKey();
    this.onStateChange = options.onStateChange || (() => {});
  }

  /**
   * Obtém a chave salva em sessionStorage
   */
  loadApiKey() {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_KEY) || "";
    } catch (e) {
      console.warn("sessionStorage inacessível:", e);
      return "";
    }
  }

  /**
   * Salva a chave estritamente em sessionStorage
   */
  saveApiKey(key) {
    this.apiKey = (key || "").trim();
    try {
      if (this.apiKey) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, this.apiKey);
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Erro ao salvar chave em sessionStorage:", e);
    }
  }

  /**
   * Remove a chave da sessão
   */
  clearApiKey() {
    this.apiKey = "";
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      // Ignora erro
    }
  }

  /**
   * Reinicia a conversa e limpa histórico
   */
  resetConversation() {
    this.history = [];
    cartManager.limpar();
    guardrails.resetSession();
    this.onStateChange({ type: "RESET" });
  }

  /**
   * Executa a ferramenta localmente de forma determinística
   * @param {string} name
   * @param {object} args
   */
  executeLocalTool(name, args = {}) {
    console.log(`[Ferramenta Acionada] ${name}`, args);

    switch (name) {
      case "consultar_cardapio":
        return cartManager.consultarCardapio();

      case "adicionar_item":
        return cartManager.adicionarItem(args.item_id, args.quantidade, args.personalizacoes);

      case "alterar_item":
        return cartManager.alterarItem(args.linha_id, args.quantidade, args.personalizacoes);

      case "remover_item":
        return cartManager.removerItem(args.linha_id);

      case "ver_carrinho":
        return cartManager.verCarrinho();

      case "definir_entrega_pagamento":
        return cartManager.definirEntregaPagamento(args.nome, args.endereco, args.forma_pagamento);

      case "finalizar_pedido":
        return cartManager.finalizarPedido();

      default:
        return { sucesso: false, erro: `Ferramenta "${name}" não reconhecida.` };
    }
  }

  /**
   * Envia uma mensagem do usuário com pré-validação de guardrails e loop de function calling
   * @param {string} userMessageText
   * @returns {Promise<{ replyText: string, blocked?: boolean, error?: string }>}
   */
  async sendMessage(userMessageText) {
    if (!this.apiKey) {
      return {
        replyText: "Para iniciar o atendimento, por favor insira sua chave da API do Google Gemini no campo acima. Ela fica gravada apenas no seu navegador.",
        error: "API_KEY_MISSING"
      };
    }

    // 1. Rate limit
    const rateCheck = guardrails.checkRateLimit();
    if (!rateCheck.allowed) {
      return {
        replyText: rateCheck.reason,
        blocked: true
      };
    }

    // 2. Pré-filtro de entrada contra prompt injection / tamanho excessivo
    const inputValidation = guardrails.validateInput(userMessageText);
    if (!inputValidation.safe) {
      // Registra a mensagem no contador para evitar spam
      guardrails.recordMessageSent();
      return {
        replyText: inputValidation.reason,
        blocked: true
      };
    }

    const cleanInput = inputValidation.normalizedText;
    guardrails.recordMessageSent();

    // 3. Monta a mensagem do usuário protegida e isolada
    const isolatedText = formatIsolatedUserMessage(cleanInput);

    // Registra a mensagem do usuário no histórico para a API
    this.history.push({
      role: "user",
      parts: [{ text: isolatedText }]
    });

    try {
      // Loop de execução de Function Calling (até o modelo responder com texto puro ou atingir limite)
      let turns = 0;
      let finalBotText = "";

      while (turns < MAX_FUNCTION_CALL_TURNS) {
        turns++;

        const requestBody = {
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: this.history,
          tools: [
            {
              function_declarations: GEMINI_TOOL_DECLARATIONS
            }
          ],
          generationConfig: {
            temperature: 0.2, // Baixa temperatura para fidelidade estrita às regras
            maxOutputTokens: 800
          }
        };

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.modelName)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Erro HTTP ${response.status}`;
          console.error("Erro na API Gemini:", errData);

          if (response.status === 400 && errMsg.includes("API key not valid")) {
            return {
              replyText: "A chave da API Gemini informada parece ser inválida. Por favor, confira a chave no campo de configuração.",
              error: "INVALID_KEY"
            };
          }
          if (response.status === 429) {
            return {
              replyText: "O limite de requisições da sua cota da API Gemini foi atingido temporariamente. Por favor, aguarde alguns instantes e tente novamente.",
              error: "QUOTA_EXCEEDED"
            };
          }

          throw new Error(errMsg);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const content = candidate?.content;

        if (!content || !content.parts || content.parts.length === 0) {
          finalBotText = "Desculpe, tive uma instabilidade momentânea. Poderia repetir o seu pedido?";
          break;
        }

        // Armazena a resposta do modelo no histórico
        this.history.push(content);

        // Verifica se o modelo chamou uma ou mais funções
        const functionCalls = content.parts.filter(p => p.functionCall);

        if (functionCalls.length > 0) {
          const responseParts = [];

          for (const callPart of functionCalls) {
            const { name, args } = callPart.functionCall;
            const executionResult = this.executeLocalTool(name, args || {});

            // Notifica UI que o carrinho/estado mudou
            this.onStateChange({
              type: "TOOL_EXECUTED",
              tool: name,
              args,
              result: executionResult
            });

            responseParts.push({
              functionResponse: {
                name,
                response: executionResult
              }
            });
          }

          // Adiciona a resposta da ferramenta ao histórico para o modelo interpretar
          this.history.push({
            role: "user",
            parts: responseParts
          });

          // Continua o loop para que o modelo formule o texto com base no resultado da ferramenta
          continue;
        }

        // Se não houve chamada de função, pega o texto de resposta
        const textParts = content.parts.filter(p => p.text).map(p => p.text);
        finalBotText = textParts.join(" ").trim();
        break;
      }

      // 4. Validação de saída (evita vazamento de regras internas)
      const validatedOutput = guardrails.validateOutput(finalBotText);

      return {
        replyText: validatedOutput.text
      };
    } catch (error) {
      console.error("Falha na chamada ao Gemini:", error);
      // Remove o último turno de usuário do histórico se falhou para evitar dessincronização
      if (this.history.length > 0 && this.history[this.history.length - 1].role === "user") {
        this.history.pop();
      }

      return {
        replyText: "Tivemos um problema de conexão com a inteligência artificial. Verifique se sua chave da API está correta e com cota disponível, ou tente novamente em alguns segundos.",
        error: error.message || "NETWORK_ERROR"
      };
    }
  }
}
