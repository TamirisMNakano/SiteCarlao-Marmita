/**
 * Controlador Principal da Interface do Usuário (UI)
 * Gerencia eventos, sincronização do carrinho, histórico seguro e renderização protegida contra XSS.
 */

import { GeminiAgent } from "./agent.js";
import { cartManager } from "./tools.js";
import { getCardapioDoDia, TAXA_ENTREGA } from "./menu.js";

// Elementos da Interface
const messagesContainer = document.getElementById("messages-container");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const btnSend = document.getElementById("btn-send-message");
const charCount = document.getElementById("char-count");
const typingIndicator = document.getElementById("typing-indicator");
const btnRestart = document.getElementById("btn-restart");

// Elementos de Configuração de Chave API
const apiKeyForm = document.getElementById("api-key-form");
const apiKeyInput = document.getElementById("gemini-key-input");
const keyStatusBadge = document.getElementById("key-status-badge");

// Elementos de Cardápio e Carrinho (Sidebar / Drawer)
const tabBtnMenu = document.getElementById("tab-btn-menu");
const tabBtnCart = document.getElementById("tab-btn-cart");
const tabContentMenu = document.getElementById("tab-content-menu");
const tabContentCart = document.getElementById("tab-content-cart");
const menuDayTitle = document.getElementById("menu-day-title");
const menuItemsList = document.getElementById("menu-items-list");
const cartContentWrapper = document.getElementById("cart-content-wrapper");
const cartCounterTab = document.getElementById("cart-counter-tab");
const mobileCartBadge = document.getElementById("mobile-cart-badge");
const btnOpenDrawer = document.getElementById("btn-open-drawer");
const btnCloseDrawer = document.getElementById("btn-close-drawer");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const sidebarPanel = document.getElementById("sidebar-panel");
const quickPromptButtons = document.querySelectorAll(".quick-chip");

// Inicializa o Agente com listener de mudança de estado das ferramentas
const agent = new GeminiAgent({
  onStateChange: handleAgentStateChange
});

/**
 * Atualiza o badge visual do status da chave da API
 */
function updateKeyBadgeUI() {
  const hasKey = Boolean(agent.apiKey);
  if (hasKey) {
    keyStatusBadge.textContent = "Chave configurada ✓";
    keyStatusBadge.className = "api-key-status status-configured";
    if (apiKeyInput) {
      apiKeyInput.value = agent.apiKey;
    }
  } else {
    keyStatusBadge.textContent = "Não configurada";
    keyStatusBadge.className = "api-key-status status-missing";
    if (apiKeyInput) {
      apiKeyInput.value = "";
    }
  }
}

/**
 * Renderização segura de mensagem no chat (ESTRITAMENTE textContent, sem innerHTML vulnerável a XSS)
 * @param {'bot'|'user'} sender
 * @param {string} text
 */
function appendMessage(sender, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper msg-${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = sender === "bot" ? "👩‍🍳" : "👤";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";

  const textNode = document.createElement("span");
  textNode.className = "msg-text";
  textNode.textContent = text; // Previne XSS

  const timeNode = document.createElement("time");
  timeNode.className = "msg-time";
  const now = new Date();
  timeNode.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  bubble.appendChild(textNode);
  bubble.appendChild(timeNode);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);

  messagesContainer.appendChild(wrapper);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Exibe ou esconde o indicador de carregamento
 * @param {boolean} show
 */
function setTyping(show) {
  if (show) {
    typingIndicator.style.display = "flex";
    btnSend.disabled = true;
    chatInput.disabled = true;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } else {
    typingIndicator.style.display = "none";
    btnSend.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
}

/**
 * Renderiza a lista de pratos do dia no painel lateral
 */
function renderCardapioSidebar() {
  const cardapio = getCardapioDoDia();
  menuDayTitle.textContent = `📅 Cardápio de ${cardapio.diaNome}`;
  menuItemsList.innerHTML = "";

  cardapio.pratos.forEach(prato => {
    const card = document.createElement("div");
    card.className = "menu-card";

    const header = document.createElement("div");
    header.className = "menu-card-header";

    const title = document.createElement("div");
    title.className = "menu-card-title";
    title.textContent = prato.nome;

    const price = document.createElement("div");
    price.className = "menu-card-price";
    price.textContent = `R$ ${prato.preco.toFixed(2).replace(".", ",")}`;

    header.appendChild(title);
    header.appendChild(price);

    const desc = document.createElement("p");
    desc.className = "menu-card-desc";
    desc.textContent = prato.descricao;

    const tags = document.createElement("div");
    tags.className = "menu-card-tags";

    if (prato.ingredientesRemoviveis?.length) {
      const tagRemov = document.createElement("span");
      tagRemov.className = "tag-item";
      tagRemov.textContent = `Personalizável: ${prato.ingredientesRemoviveis.slice(0, 3).join(", ")}...`;
      tags.appendChild(tagRemov);
    }

    if (prato.opcoesPontoCarne?.length) {
      const tagCarne = document.createElement("span");
      tagCarne.className = "tag-item";
      tagCarne.textContent = "Ponto da carne opcional";
      tags.appendChild(tagCarne);
    }

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(tags);
    menuItemsList.appendChild(card);
  });
}

/**
 * Atualiza o painel do carrinho de compras com cálculos matemáticos reais
 */
function updateCartUI() {
  const resumo = cartManager.verCarrinho();
  const totalItens = resumo.quantidadeItens;

  // Atualiza badges
  cartCounterTab.textContent = String(totalItens);
  mobileCartBadge.textContent = `Carrinho (${totalItens})`;

  if (resumo.itens.length === 0) {
    cartContentWrapper.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon" aria-hidden="true">🛒</div>
        <p>Seu carrinho está vazio.</p>
        <small>Converse com a Ana para adicionar itens!</small>
      </div>
    `;
    return;
  }

  cartContentWrapper.innerHTML = "";

  // Renderiza cada item
  resumo.itens.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";

    const itemHeader = document.createElement("div");
    itemHeader.className = "cart-item-header";

    const name = document.createElement("span");
    name.className = "cart-item-name";
    name.textContent = `${item.quantidade}x ${item.nome}`;

    const total = document.createElement("span");
    total.className = "cart-item-total";
    total.textContent = `R$ ${item.subtotalItem.toFixed(2).replace(".", ",")}`;

    itemHeader.appendChild(name);
    itemHeader.appendChild(total);
    itemEl.appendChild(itemHeader);

    if (item.personalizacoes && item.personalizacoes.length > 0) {
      const pers = document.createElement("div");
      pers.className = "cart-item-customizations";
      pers.textContent = `Observações: ${item.personalizacoes.join(", ")}`;
      itemEl.appendChild(pers);
    }

    cartContentWrapper.appendChild(itemEl);
  });

  // Resumo financeiro calculado deterministicamente
  const summary = document.createElement("div");
  summary.className = "cart-summary";

  summary.innerHTML = `
    <div class="summary-row">
      <span>Subtotal dos itens:</span>
      <span>R$ ${resumo.subtotal.toFixed(2).replace(".", ",")}</span>
    </div>
    <div class="summary-row">
      <span>Taxa de entrega fixa:</span>
      <span>R$ ${resumo.taxaEntrega.toFixed(2).replace(".", ",")}</span>
    </div>
    <div class="summary-row total-row">
      <span>Total a pagar:</span>
      <span>R$ ${resumo.totalGeral.toFixed(2).replace(".", ",")}</span>
    </div>
  `;

  // Informações de entrega / pagamento se preenchidas
  if (resumo.dadosEntrega?.nome || resumo.dadosEntrega?.endereco) {
    const entregaDiv = document.createElement("div");
    entregaDiv.style.marginTop = "0.75rem";
    entregaDiv.style.padding = "0.6rem";
    entregaDiv.style.backgroundColor = "#f8fafc";
    entregaDiv.style.borderRadius = "8px";
    entregaDiv.style.fontSize = "0.8rem";

    entregaDiv.innerHTML = `
      <strong>Dados de entrega:</strong><br>
      Cliente: ${escapeHTML(resumo.dadosEntrega.nome || "-")}<br>
      Endereço: ${escapeHTML(resumo.dadosEntrega.endereco || "-")}<br>
      Pagamento: ${escapeHTML(resumo.dadosEntrega.formaPagamento || "-")}
    `;
    summary.appendChild(entregaDiv);
  }

  // Se o pedido foi confirmado
  if (resumo.pedidoFinalizado && resumo.numeroPedido) {
    const finalizadoDiv = document.createElement("div");
    finalizadoDiv.className = "order-badge-success";
    finalizadoDiv.textContent = `✓ Pedido Confirmado! #${resumo.numeroPedido}`;
    summary.appendChild(finalizadoDiv);
  }

  cartContentWrapper.appendChild(summary);
}

/**
 * Função utilitária para escape de HTML simples ao montar dados de texto
 */
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Trata eventos emitidos pelas ferramentas do agente
 */
function handleAgentStateChange(event) {
  console.log("[State Change]", event);
  updateCartUI();

  // Se adicionou item ou atualizou carrinho, muda a aba do painel para o carrinho automaticamente
  if (event.tool === "adicionar_item" || event.tool === "alterar_item" || event.tool === "finalizar_pedido") {
    switchTab("cart");
  }
}

/**
 * Alterna as abas no painel lateral
 * @param {'menu'|'cart'} tab
 */
function switchTab(tab) {
  if (tab === "menu") {
    tabBtnMenu.classList.add("active");
    tabBtnCart.classList.remove("active");
    tabContentMenu.classList.add("active");
    tabContentCart.classList.remove("active");
    tabBtnMenu.setAttribute("aria-selected", "true");
    tabBtnCart.setAttribute("aria-selected", "false");
  } else {
    tabBtnCart.classList.add("active");
    tabBtnMenu.classList.remove("active");
    tabContentCart.classList.add("active");
    tabContentMenu.classList.remove("active");
    tabBtnCart.setAttribute("aria-selected", "true");
    tabBtnMenu.setAttribute("aria-selected", "false");
  }
}

/**
 * Envia uma mensagem do usuário
 */
async function handleUserSubmit() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = "";
  charCount.textContent = "0";

  // Exibe a mensagem do usuário no chat
  appendMessage("user", text);

  // Ativa indicador de digitação
  setTyping(true);

  try {
    const result = await agent.sendMessage(text);
    setTyping(false);

    if (result && result.replyText) {
      appendMessage("bot", result.replyText);
    }
  } catch (err) {
    setTyping(false);
    console.error("Erro ao processar envio:", err);
    appendMessage("bot", "Ops, desculpe! Houve um problema na comunicação. Pode tentar novamente?");
  }
}

// Inicia a aplicação
function init() {
  // Configuração inicial de chave
  updateKeyBadgeUI();
  renderCardapioSidebar();
  updateCartUI();

  // Mensagem inicial de boas-vindas
  appendMessage(
    "bot",
    "Olá! Seja muito bem-vindo ao Sabor & Afeto Marmitas Caseiras! 🍱\n\nEu sou a Ana, sua atendente virtual. Hoje temos pratos fresquinhos feitos com todo carinho. Gostaria de ver o cardápio do dia ou já sabe qual marmita vai querer?"
  );

  // Evento de salvar chave de API
  apiKeyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newKey = apiKeyInput.value.trim();
    if (!newKey) {
      alert("Por favor, cole sua chave da API do Google Gemini.");
      return;
    }
    agent.saveApiKey(newKey);
    updateKeyBadgeUI();
    appendMessage("bot", "Ótimo! Sua chave da API Gemini foi salva localmente nesta sessão do navegador. Como posso ajudar com seu pedido?");
  });

  // Evento de envio do formulário de chat
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleUserSubmit();
  });

  // Envio ao teclar Enter (sem Shift)
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserSubmit();
    }
  });

  // Contador de caracteres
  chatInput.addEventListener("input", () => {
    charCount.textContent = String(chatInput.value.length);
  });

  // Botões de sugestão rápida
  quickPromptButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const promptText = btn.getAttribute("data-text");
      if (promptText) {
        chatInput.value = promptText;
        charCount.textContent = String(promptText.length);
        chatInput.focus();
      }
    });
  });

  // Botão de reiniciar
  btnRestart.addEventListener("click", () => {
    if (confirm("Deseja realmente iniciar um novo atendimento? O carrinho e a conversa atual serão reiniciados.")) {
      agent.resetConversation();
      messagesContainer.innerHTML = "";
      updateCartUI();
      switchTab("menu");
      appendMessage(
        "bot",
        "Atendimento reiniciado! 🍱 Em que posso ajudar você hoje? Deseja consultar as marmitas do dia?"
      );
    }
  });

  // Alternância de abas do painel lateral
  tabBtnMenu.addEventListener("click", () => switchTab("menu"));
  tabBtnCart.addEventListener("click", () => switchTab("cart"));

  // Drawer Mobile
  const toggleDrawer = (open) => {
    if (open) {
      sidebarPanel.classList.add("open");
      drawerBackdrop.classList.add("open");
      btnCloseDrawer.style.display = "inline-flex";
    } else {
      sidebarPanel.classList.remove("open");
      drawerBackdrop.classList.remove("open");
      btnCloseDrawer.style.display = "none";
    }
  };

  btnOpenDrawer.addEventListener("click", () => toggleDrawer(true));
  btnCloseDrawer.addEventListener("click", () => toggleDrawer(false));
  drawerBackdrop.addEventListener("click", () => toggleDrawer(false));
}

// Inicializa quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
