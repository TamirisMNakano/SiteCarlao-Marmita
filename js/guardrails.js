/**
 * Módulo de Guardrails e Defesa em Camadas
 * Protege a aplicação contra Prompt Injection, Jailbreaks, Vazamento de Dados e DoS
 */

export const MAX_MESSAGE_LENGTH = 500;
export const MIN_INTERVAL_MS = 1500; // Rate limit: intervalo mínimo entre mensagens
export const MAX_MESSAGES_PER_SESSION = 50; // Limite de mensagens por sessão

// Padrões de ataque (pt-BR e en) para detecção no pré-filtro
const ATTACK_PATTERNS = [
  // Instruções de esquecimento / sobreposição de regras
  /ignore\s+(all\s+)?(previous|past|prior|above)\s+(instructions|prompts?|rules|commands)/i,
  /ignore\s+(todas\s+as\s+|as\s+)?(instruções|regras|ordens)\s+(anteriores|prévias|acima)/i,
  /esqueça\s+(tudo|todas\s+as\s+instruções|todas\s+as\s+regras|suas\s+regras|as\s+regras|o\s+que\s+foi\s+dito)/i,
  /desconsidere\s+(tudo|todas\s+as\s+instruções|as\s+regras|o\s+prompt)/i,
  /forget\s+(all\s+)?(instructions|rules|previous\s+context|everything)/i,
  /disregard\s+(all\s+)?(previous|prior|past)\s+(instructions|directives)/i,

  // Troca de papel / personificação maliciosa
  /you\s+are\s+now\s+(an?\s+)?/i,
  /você\s+agora\s+é\s+(um|uma)?/i,
  /voce\s+agora\s+e\s+(um|uma)?/i,
  /agir\s+como\s+(um|uma)?\s+(hacker|desenvolvedor|ia\s+sem\s+filtros|dan|vilão|bot)/i,
  /act\s+as\s+(an?\s+)?(unrestricted|jailbroken|dan|developer|evil|linux|admin)/i,
  /pretend\s+(you\s+are|to\s+be)\s+/i,
  /finja\s+que\s+(você\s+é|é|foi)/i,

  // Jailbreaks clássicos conhecidos
  /\bDAN\b/,
  /\bdo\s+anything\s+now\b/i,
  /\bfaça\s+qualquer\s+coisa\s+agora\b/i,
  /\bdeveloper\s+mode\b/i,
  /\bmodo\s+desenvolvedor\b/i,
  /\bjailbreak\b/i,
  /\bchaos\s*gpt\b/i,
  /\bgodmode\b/i,

  // Tentativas de extração de prompt / system prompt / vazamento
  /(mostre|revele|exiba|imprima|repita|diga|qual\s+é|quais\s+são)\s+(o\s+|seu\s+|suas\s+)?(system\s*prompt|prompt\s+do\s+sistema|instruções\s+iniciais|prompt\s+original|regras\s+internas)/i,
  /(show|reveal|display|print|repeat|output|what\s+is)\s+(me\s+)?(your\s+|the\s+)?(system\s*prompt|initial\s+instructions|hidden\s+rules|developer\s+prompt)/i,
  /repeat\s+(everything|the\s+text)\s+(above|before)/i,
  /repita\s+(tudo|o\s+texto)\s+(acima|anterior)/i,
  /copy\s+paste\s+your\s+(instructions|system)/i,

  // Delimitadores falsos e injeção estrutural
  /<\/?system>/i,
  /<\/?instructions?>/i,
  /\[system\]/i,
  /\[developer\]/i,
  /(^|\n|\r)system\s*:/i,
  /(^|\n|\r)assistant\s*:/i,
  /(^|\n|\r)user\s*:/i,
  /```\s*(system|prompt|instruction)/i,

  // Injeção de tags XML simuladas
  /<\/user_input>/i,
  /<user_input>/i,
  /<system_instructions>/i,
  /<\/system_instructions>/i,

  // Ofuscação / codificação
  /base64\s*(decode|descodifique|decodifique)/i,
  /em\s+código\s+morse/i,
  /em\s+binário/i,
  /in\s+rot13/i
];

// Padrões de conteúdo restrito da saída (evita vazamento de trechos de regras internas)
const SENSITIVE_OUTPUT_PATTERNS = [
  /VOCE\s+E\s+O\s+ATENDENTE\s+VIRTUAL/i,
  /REGRA\s+SUPREMA/i,
  /BLINDAGEM\s+DO\s+SISTEMA/i,
  /system_instructions/i,
  /<user_input>/i,
  /FERRAMENTAS\s+OBRIGATORIAS/i,
  /NUNCA\s+ALTERE\s+PRECOS/i
];

export class GuardrailsService {
  constructor(options = {}) {
    this.minIntervalMs = options.minIntervalMs ?? MIN_INTERVAL_MS;
    this.maxMessagesPerSession = options.maxMessagesPerSession ?? MAX_MESSAGES_PER_SESSION;
    this.lastMessageTime = 0;
    this.messageCount = 0;
    this.blockedLogs = [];
  }

  /**
   * Normaliza texto para análise de segurança (remove invisíveis, acentos duplicados, leetspeak óbvio)
   * @param {string} text
   * @returns {string}
   */
  normalizeText(text) {
    if (typeof text !== "string") return "";
    return text
      // Normalização Unicode NFKC
      .normalize("NFKC")
      // Remove caracteres invisíveis / controle (zero-width spaces, soft hyphens, etc.)
      .replace(/[\u200B-\u200D\uFEFF\u00AD\u200E\u200F\u202A-\u202E]/g, "")
      // Espaços contínuos
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Avalia taxa de mensagens do cliente (Rate Limiting)
   * @returns {{ allowed: boolean, reason?: string }}
   */
  checkRateLimit() {
    const now = Date.now();
    if (this.lastMessageTime > 0 && now - this.lastMessageTime < this.minIntervalMs) {
      return {
        allowed: false,
        reason: "Por favor, aguarde um instante antes de enviar outra mensagem."
      };
    }

    if (this.messageCount >= this.maxMessagesPerSession) {
      return {
        allowed: false,
        reason: "Limite de mensagens da sessão atingido. Por favor, reinicie a conversa para um novo pedido."
      };
    }

    return { allowed: true };
  }

  /**
   * Atualiza os contadores de rate limit após mensagem aceita
   */
  recordMessageSent() {
    this.lastMessageTime = Date.now();
    this.messageCount++;
  }

  /**
   * Reseta o estado da sessão (ex: quando o usuário clica em reiniciar)
   */
  resetSession() {
    this.lastMessageTime = 0;
    this.messageCount = 0;
  }

  /**
   * Pré-filtro de entrada: valida tamanho, caracteres e ataques de injeção
   * @param {string} rawInput
   * @returns {{ safe: boolean, normalizedText: string, reason?: string, attackType?: string }}
   */
  validateInput(rawInput) {
    if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
      return {
        safe: false,
        normalizedText: "",
        reason: "Por favor, digite uma mensagem para que eu possa te ajudar."
      };
    }

    if (rawInput.length > MAX_MESSAGE_LENGTH) {
      return {
        safe: false,
        normalizedText: rawInput.slice(0, 100),
        reason: `Sua mensagem é muito longa. Por favor, seja mais breve (máximo de ${MAX_MESSAGE_LENGTH} caracteres).`
      };
    }

    const normalized = this.normalizeText(rawInput);

    // Detecção de padrões maliciosos
    for (const pattern of ATTACK_PATTERNS) {
      if (pattern.test(normalized)) {
        this.logBlockedAttempt("INPUT_INJECTION_DETECTED", normalized, pattern.toString());
        return {
          safe: false,
          normalizedText: normalized,
          attackType: "PROMPT_INJECTION",
          reason: "Sou o atendente virtual do restaurante e só posso ajudar com dúvidas sobre o cardápio e realização de pedidos de marmitas. Como posso te servir hoje?"
        };
      }
    }

    // Leetspeak / ofuscações específicas comuns em ataques (ex.: "1gn0r3")
    const deobfuscated = normalized
      .replace(/0/g, "o")
      .replace(/1/g, "i")
      .replace(/3/g, "e")
      .replace(/4/g, "a")
      .replace(/5/g, "s")
      .replace(/7/g, "t");

    for (const pattern of ATTACK_PATTERNS) {
      if (pattern.test(deobfuscated)) {
        this.logBlockedAttempt("OBFUSCATED_INJECTION_DETECTED", normalized, pattern.toString());
        return {
          safe: false,
          normalizedText: normalized,
          attackType: "PROMPT_INJECTION_OBFUSCATED",
          reason: "Desculpe, só posso responder a assuntos relacionados ao cardápio e aos pedidos de marmitas da nossa casa. Como posso te ajudar com o almoço hoje?"
        };
      }
    }

    return {
      safe: true,
      normalizedText: normalized
    };
  }

  /**
   * Valida a saída gerada pelo modelo antes de apresentá-la ao usuário
   * @param {string} outputText
   * @returns {{ safe: boolean, text: string, reason?: string }}
   */
  validateOutput(outputText) {
    if (!outputText || typeof outputText !== "string") {
      return {
        safe: true,
        text: "Como posso ajudar você com seu pedido de marmita hoje?"
      };
    }

    // Checar vazamento de regras do sistema
    for (const pattern of SENSITIVE_OUTPUT_PATTERNS) {
      if (pattern.test(outputText)) {
        this.logBlockedAttempt("OUTPUT_LEAK_PREVENTED", outputText.slice(0, 100), pattern.toString());
        return {
          safe: false,
          text: "Posso te ajudar a escolher uma marmita deliciosa do nosso cardápio de hoje! O que gostaria de pedir?",
          reason: "Detecção de potencial vazamento de instruções internas."
        };
      }
    }

    return {
      safe: true,
      text: outputText
    };
  }

  /**
   * Log seguro de tentativas bloqueadas para modo debug no console
   * @param {string} type
   * @param {string} sample
   * @param {string} rule
   */
  logBlockedAttempt(type, sample, rule) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      sampleSnippet: sample.slice(0, 80),
      rule
    };
    this.blockedLogs.push(entry);
    if (typeof console !== "undefined" && console.warn) {
      console.warn(`[GUARDRAILS BLOQUEIO] [${type}] Regra: ${rule} | Amostra: "${entry.sampleSnippet}"`);
    }
  }

  /**
   * Retorna histórico de bloqueios para visualização ou auditoria
   */
  getBlockedLogs() {
    return [...this.blockedLogs];
  }
}

// Instância padrão compartilhada
export const guardrails = new GuardrailsService();
