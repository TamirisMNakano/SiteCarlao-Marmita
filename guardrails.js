// Módulo de Guardrails para proteção do Chatbot contra Prompt Injection, Jailbreak e Fuga de Escopo
const Guardrails = {
  // Padrões maliciosos típicos de prompt injection e jailbreak
  injectionPatterns: [
    /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|directions)/i,
    /desconsidere\s+(todas\s+as\s+)?(instruções|ordens|regras)\s+(anteriores|acima)/i,
    /esqueça\s+(tudo|suas\s+regras|o\s+que\s+foi\s+dito)/i,
    /system\s+prompt/i,
    /you\s+are\s+now\s+(DAN|unrestricted|an\s+AI\s+without\s+rules|developer)/i,
    /você\s+agora\s+é\s+(um\s+hacker|livre|dan|sem\s+regras)/i,
    /reveal\s+(your\s+)?(prompt|system|secret|token|api\s*key)/i,
    /revele\s+(seu\s+prompt|suas\s+instruções|sua\s+chave|sua\s+api\s*key)/i,
    /bypass\s+filter/i,
    /burle\s+(as\s+regras|os\s+filtros)/i,
    /print\s+everything\s+above/i,
    /mostre\s+tudo\s+o\s+que\s+está\s+escrito\s+acima/i,
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /DROP\s+TABLE/i,
    /eval\s*\(/i
  ],

  // Validação de entrada do usuário
  validateInput(input) {
    if (!input || typeof input !== 'string') {
      return { allowed: false, reason: "Mensagem vazia ou inválida." };
    }

    const trimmed = input.trim();
    if (trimmed.length > 500) {
      return {
        allowed: false,
        reason: "Sua mensagem é muito longa. Por favor, seja mais sucinto para realizarmos seu pedido."
      };
    }

    // Verificar padrões de injeção e jailbreak
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          reason: "🛡️ [Guardrail Acionado] Detectamos uma tentativa de manipulação ou comando não permitido. Como assistente da Marmitaria Sabor & Ponto, só posso ajudar com pedidos de marmitas, cardápio e personalizações."
        };
      }
    }

    return { allowed: true };
  },

  // Higienização para exibição segura no DOM (anti-XSS)
  sanitizeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  // Validação de saída (evitar vazamento acidental de tokens ou chaves na resposta da LLM)
  sanitizeOutput(text) {
    if (!text) return "";
    // Ocultar qualquer potencial chave de API (padrões AIzaSy... ou sk-...)
    return text
      .replace(/AIzaSy[0-9A-Za-z-_]{33}/gi, "[CHAVE_PROTEGIDA]")
      .replace(/sk-[0-9A-Za-z]{20,}/gi, "[CHAVE_PROTEGIDA]");
  }
};
