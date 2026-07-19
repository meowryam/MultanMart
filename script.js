/* =========================================================
   MULTAN MART — script.js
   ========================================================= */


const OWNER_SETTINGS = {
  phoneNumberDisplay: "0300 8770122",
  phoneNumberDial: "+923008770122",
  whatsAppNumber: "923008770122",
  whatsAppNumberDisplay: "0300 8770122",
  businessAddress: "Multan, Pakistan",
  businessHours: "Mon – Sat, 9:00 AM – 9:00 PM",
};

const CART_STORAGE_KEY = "multanMartCart";
const DELIVERY_FEE = 150;

const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd8Osj3Dm2Vqi-1ESWPm4cOwHViXwPl9a5qJ-027yZhtuAU_Q/formResponse";

const FORM_FIELDS = {
  customerName: "654362780",
  phoneNumber: "1650395781",
  address: "1880747020",
  productName: "1960638125",
  quantity: "253835968",
  notes: "1027403879",
};

const PRODUCTS = [
  { id: "tomato-vine", name: "Vine Tomatoes", category: "produce", price: 180, unit: "per kg", stock: "in", description: "Ripe, red, and grown nearby — picked within the last two days for the best flavor." },
  { id: "spinach-bunch", name: "Fresh Spinach", category: "produce", price: 60, unit: "per bunch", stock: "in", description: "Tender leafy spinach, washed and ready for your favorite saag or salad." },
  { id: "banana-dozen", name: "Bananas", category: "produce", price: 140, unit: "per dozen", stock: "low", description: "Sweet, ripe bananas — a lunchbox favorite for kids and grown-ups alike." },
  { id: "potato-5kg", name: "Potatoes", category: "produce", price: 350, unit: "5 kg bag", stock: "in", description: "All-purpose potatoes, great for curries, fries, or a Sunday roast." },
  { id: "eggs-dozen", name: "Farmhouse Eggs", category: "dairy", price: 320, unit: "per dozen", stock: "in", description: "Free-range eggs from a nearby farm, delivered fresh every week." },
  { id: "milk-1l", name: "Fresh Milk", category: "dairy", price: 210, unit: "1 litre", stock: "in", description: "Pasteurized whole milk, delivered cold and ready for your morning chai." },
  { id: "yogurt-500g", name: "Plain Yogurt", category: "dairy", price: 150, unit: "500 g tub", stock: "out", description: "Thick, tangy yogurt made the traditional way. Great with meals or on its own." },
  { id: "cheddar-block", name: "Cheddar Cheese", category: "dairy", price: 890, unit: "250 g block", stock: "low", description: "A mild, creamy cheddar that melts beautifully — perfect for sandwiches and toasties." },
  { id: "bread-wheat", name: "Whole Wheat Bread", category: "bakery", price: 170, unit: "per loaf", stock: "in", description: "Soft, wholesome bread baked fresh each morning by our neighborhood baker." },
  { id: "bun-pack6", name: "Sesame Buns", category: "bakery", price: 130, unit: "pack of 6", stock: "in", description: "Soft sesame-topped buns, ideal for burgers or a quick sandwich." },
  { id: "croissant-4", name: "Butter Croissants", category: "bakery", price: 320, unit: "pack of 4", stock: "low", description: "Flaky, buttery croissants baked fresh — a small treat for the weekend table." },
  { id: "rice-basmati-5kg", name: "Basmati Rice", category: "pantry", price: 1450, unit: "5 kg bag", stock: "in", description: "Long-grain aged basmati rice, fragrant and fluffy once cooked." },
  { id: "cooking-oil-3l", name: "Cooking Oil", category: "pantry", price: 1650, unit: "3 litre can", stock: "in", description: "A light, everyday cooking oil suited to frying, sautéing, and baking." },
  { id: "lentils-1kg", name: "Red Lentils", category: "pantry", price: 320, unit: "1 kg pack", stock: "in", description: "Quick-cooking red lentils (masoor daal), a pantry staple for weeknight meals." },
  { id: "tea-500g", name: "Black Tea Leaves", category: "pantry", price: 480, unit: "500 g pack", stock: "low", description: "A robust, full-bodied black tea blend — the everyday cup for your kitchen." },
];

(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const formatPrice = (amount) => `Rs. ${Number(amount).toLocaleString("en-PK")}`;
  const STOCK_LABELS = { in: "In Stock", low: "Low Stock", out: "Out of Stock" };
  const CATEGORY_LABELS = { produce: "Produce", dairy: "Dairy & Eggs", bakery: "Bakery", pantry: "Pantry" };
  function getProductById(id) { return PRODUCTS.find((p) => p.id === id); }
  function stockPillClass(stock) { if (stock === "low") return "is-low"; if (stock === "out") return "is-out"; return ""; }

  /* ---------------------------------------------------------
     CART STATE
     --------------------------------------------------------- */
  let cart = [];

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      cart = Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.quantity > 0) : [];
    } catch (err) {
      console.warn("Multan Mart: couldn't read saved cart, starting fresh.", err);
      cart = [];
    }
  }

  function saveCart() {
    try {
      if (cart.length === 0) { localStorage.removeItem(CART_STORAGE_KEY); }
      else { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }
    } catch (err) {
      console.warn("Multan Mart: couldn't save cart to localStorage.", err);
    }
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function findCartItem(id) { return cart.find((item) => item.id === id); }

  function addToCart(product, quantity) {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const existing = findCartItem(product.id);
    if (existing) { existing.quantity += qty; }
    else {
      cart.push({ id: product.id, name: product.name, price: product.price, unit: product.unit, quantity: qty });
    }
    saveCart();
    renderCartUI();
    showToast(`✓ ${product.name} added to cart`);
  }

  function updateCartQuantity(id, newQuantity) {
    const item = findCartItem(id);
    if (!item) return;
    const qty = parseInt(newQuantity, 10) || 0;
    if (qty <= 0) { removeFromCart(id); return; }
    item.quantity = qty;
    saveCart();
    renderCartUI();
    showToast("✓ Quantity updated");
  }

  function removeFromCart(id) {
    const item = findCartItem(id);
    cart = cart.filter((i) => i.id !== id);
    saveCart();
    renderCartUI();
    if (item) showToast(`✓ ${item.name} removed`);
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCartUI();
  }

  /* ---------------------------------------------------------
     CART RENDERING
     --------------------------------------------------------- */
  function renderCartBadge() {
    const badge = $("cartBadge");
    const count = getCartCount();
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  function renderStickyCartBtn() {
    const btn = $("stickyCartBtn");
    const count = getCartCount();
    $("stickyCartCount").textContent = String(count);
    btn.hidden = count === 0;
  }

  function cartItemRowHTML(item) {
    const lineTotal = item.price * item.quantity;
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${formatPrice(item.price)} × ${item.quantity} = ${formatPrice(lineTotal)}</span>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-stepper quantity-stepper-sm" data-id="${item.id}">
            <button type="button" class="stepper-btn" data-cart-action="decrease" data-id="${item.id}" aria-label="Decrease quantity of ${item.name}">−</button>
            <span class="stepper-value" aria-live="polite">${item.quantity}</span>
            <button type="button" class="stepper-btn" data-cart-action="increase" data-id="${item.id}" aria-label="Increase quantity of ${item.name}">+</button>
          </div>
          <button type="button" class="cart-item-remove" data-cart-action="remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">Remove</button>
        </div>
      </div>
    `;
  }

  function cartEmptyStateHTML() {
    return `
      <div class="cart-empty-state">
        <span class="cart-empty-icon" aria-hidden="true">🛒</span>
        <p class="cart-empty-title">Your cart is empty</p>
        <p class="cart-empty-sub">Browse products to start shopping.</p>
        <button type="button" class="btn btn-ghost" id="cartContinueShoppingBtn">Continue Shopping</button>
      </div>
    `;
  }

  function renderCartDrawer() {
    const body = $("cartDrawerBody");
    const footer = $("cartDrawerFooter");
    if (cart.length === 0) {
      body.innerHTML = cartEmptyStateHTML();
      footer.hidden = true;
      const continueBtn = $("cartContinueShoppingBtn");
      if (continueBtn) continueBtn.addEventListener("click", () => closeModal(cartOverlay));
      return;
    }
    body.innerHTML = cart.map(cartItemRowHTML).join("");
    footer.hidden = false;
    const subtotal = getCartSubtotal();
    const total = subtotal + DELIVERY_FEE;
    $("cartSubtotal").textContent = formatPrice(subtotal);
    $("cartDeliveryFee").textContent = formatPrice(DELIVERY_FEE);
    $("cartTotal").textContent = formatPrice(total);
  }

  function renderCartUI() {
    renderCartBadge();
    renderStickyCartBtn();
    renderCartDrawer();
  }

  /* ---------------------------------------------------------
     TOASTS
     --------------------------------------------------------- */
  function showToast(message) {
    const container = $("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    setTimeout(() => {
      toast.classList.remove("is-visible");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
      setTimeout(() => toast.remove(), 500);
    }, 2400);
  }

  function applyOwnerSettings() {
    $("contactPhoneDisplay").textContent = OWNER_SETTINGS.phoneNumberDisplay;
    $("contactWhatsAppDisplay").textContent = OWNER_SETTINGS.whatsAppNumberDisplay;
    $("contactAddressDisplay").textContent = OWNER_SETTINGS.businessAddress;
    $("contactHoursDisplay").textContent = OWNER_SETTINGS.businessHours;
    const telLink = `tel:${OWNER_SETTINGS.phoneNumberDial}`;
    const waLink = `https://wa.me/${OWNER_SETTINGS.whatsAppNumber}?text=${encodeURIComponent("Hi! I have a question about Multan Mart.")}`;
    $("callBusinessBtn").setAttribute("href", telLink);
    $("whatsappInquiryBtn").setAttribute("href", waLink);
    $("fabCall").setAttribute("href", telLink);
    $("fabWhatsApp").setAttribute("href", waLink);
    $("footerYear").textContent = new Date().getFullYear();
  }

  const productGrid = $("productGrid");
  let activeFilter = "all";

  function productCardHTML(product) {
    const outOfStock = product.stock === "out";
    return `
      <article class="product-card" data-id="${product.id}" data-category="${product.category}">
        <div class="product-card-media" data-action="open-product" data-id="${product.id}">
          <div class="product-image-placeholder" aria-hidden="true"></div>
          <span class="stock-pill ${stockPillClass(product.stock)}">${STOCK_LABELS[product.stock]}</span>
        </div>
        <div class="product-card-body">
          <span class="category-pill">${CATEGORY_LABELS[product.category]}</span>
          <span class="product-card-name" data-action="open-product" data-id="${product.id}" role="button" tabindex="0">${product.name}</span>
          <div>
            <span class="product-card-price">${formatPrice(product.price)}</span>
            <span class="product-card-unit"> · ${product.unit}</span>
          </div>
          <div class="product-card-footer">
            <button class="add-to-cart-btn" data-action="add-to-cart" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
              ${outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  const CATEGORY_ORDER = ["produce", "dairy", "bakery", "pantry"];

  function categoryGroupHTML(category, products) {
    return `
      <div class="category-group" data-category-group="${category}">
        <h3 class="category-group-title">${CATEGORY_LABELS[category]}</h3>
        <div class="category-row">
          ${products.map(productCardHTML).join("")}
        </div>
      </div>
    `;
  }

  function renderCatalog() {
    const filtered = activeFilter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeFilter);
    if (filtered.length === 0) {
      productGrid.innerHTML = `<p class="empty-state">No products in this category right now — check back soon.</p>`;
      return;
    }

    // Group products by category (in a fixed display order) so the catalog
    // can render as category rows — CSS decides whether each row scrolls
    // horizontally (mobile) or the whole thing lays out as one grid (desktop).
    const categoriesToShow = activeFilter === "all"
      ? CATEGORY_ORDER
      : [activeFilter];

    productGrid.innerHTML = categoriesToShow
      .map((category) => {
        const productsInCategory = filtered.filter((p) => p.category === category);
        if (productsInCategory.length === 0) return "";
        return categoryGroupHTML(category, productsInCategory);
      })
      .join("");
  }

  function setActiveFilter(filter) {
    activeFilter = filter;
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      const isActive = chip.dataset.filter === filter;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-selected", String(isActive));
    });
    renderCatalog();
  }

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => setActiveFilter(chip.dataset.filter));
  });

  productGrid.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const productId = target.dataset.id;
    if (target.dataset.action === "open-product") { openProductModal(productId); }
    else if (target.dataset.action === "add-to-cart") {
      const product = getProductById(productId);
      if (product) addToCart(product, 1);
    }
  });

  productGrid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const target = e.target.closest("[data-action='open-product']");
    if (!target) return;
    e.preventDefault();
    openProductModal(target.dataset.id);
  });

  let lastFocusedElement = null;
  function openModal(overlay) {
    lastFocusedElement = document.activeElement;
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden";
    const closeBtn = overlay.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeModal(overlay) {
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") { lastFocusedElement.focus(); }
  }
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(overlay); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal-overlay.is-visible").forEach(closeModal);
  });

  const productModalOverlay = $("productModalOverlay");
  let currentProductInModal = null;
  function openProductModal(productId) {
    const product = getProductById(productId);
    if (!product) return;
    currentProductInModal = product;
    $("productModalName").textContent = product.name;
    $("productModalPrice").textContent = `${formatPrice(product.price)} · ${product.unit}`;
    $("productModalDesc").textContent = product.description;
    $("productModalCategory").textContent = CATEGORY_LABELS[product.category];
    const stockPill = $("productModalStock");
    stockPill.textContent = STOCK_LABELS[product.stock];
    stockPill.className = `stock-pill ${stockPillClass(product.stock)}`;
    $("productModalQty").value = 1;
    const orderBtn = $("productModalOrderBtn");
    if (product.stock === "out") { orderBtn.textContent = "Out of Stock"; orderBtn.disabled = true; }
    else { orderBtn.textContent = "Add to Cart"; orderBtn.disabled = false; }
    openModal(productModalOverlay);
  }
  $("productModalClose").addEventListener("click", () => closeModal(productModalOverlay));
  $("productModalMinus").addEventListener("click", () => {
    const input = $("productModalQty");
    input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
  });
  $("productModalPlus").addEventListener("click", () => {
    const input = $("productModalQty");
    input.value = (parseInt(input.value, 10) || 1) + 1;
  });
  $("productModalQty").addEventListener("change", (e) => {
    const val = parseInt(e.target.value, 10);
    e.target.value = !val || val < 1 ? 1 : val;
  });
  $("productModalOrderBtn").addEventListener("click", () => {
    if (!currentProductInModal) return;
    const qty = parseInt($("productModalQty").value, 10) || 1;
    addToCart(currentProductInModal, qty);
    closeModal(productModalOverlay);
  });

  const orderModalOverlay = $("orderModalOverlay");
  const orderFormState = $("orderFormState");
  const orderSuccessState = $("orderSuccessState");
  const orderForm = $("orderForm");

  function resetOrderForm() {
    orderForm.reset();
    document.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
    $("formErrorSummary").classList.remove("is-visible");
    $("formErrorSummary").textContent = "";
  }
  function showOrderForm() { orderSuccessState.hidden = true; orderFormState.hidden = false; }
  function showOrderSuccess() {
    orderFormState.hidden = true;
    orderSuccessState.hidden = false;
    const stampCheck = orderSuccessState.querySelector(".stamp-check");
    const stampCircle = orderSuccessState.querySelector("circle");
    [stampCheck, stampCircle].forEach((el) => {
      if (!el) return;
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });
  }

  function renderCheckoutSummary() {
    const container = $("checkoutSummary");
    const subtotal = getCartSubtotal();
    const total = subtotal + DELIVERY_FEE;
    container.innerHTML = `
      <ul class="checkout-summary-list">
        ${cart.map((item) => `
          <li class="checkout-summary-item">
            <span>${item.name} <span class="checkout-summary-qty">× ${item.quantity}</span></span>
            <span>${formatPrice(item.price * item.quantity)}</span>
          </li>
        `).join("")}
      </ul>
      <div class="checkout-summary-totals">
        <div class="cart-summary-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        <div class="cart-summary-row"><span>Delivery</span><span>${formatPrice(DELIVERY_FEE)}</span></div>
        <div class="cart-summary-row cart-summary-total"><span>Total</span><span>${formatPrice(total)}</span></div>
      </div>
    `;
  }

  function openCheckoutModal() {
    if (cart.length === 0) return;
    resetOrderForm();
    showOrderForm();
    renderCheckoutSummary();
    openModal(orderModalOverlay);
    setTimeout(() => $("orderCustomerName").focus(), 50);
  }
  $("orderModalClose").addEventListener("click", () => closeModal(orderModalOverlay));
  $("orderCancelBtn").addEventListener("click", () => closeModal(orderModalOverlay));
  $("continueBrowsingBtn").addEventListener("click", () => closeModal(orderModalOverlay));
  $("successCloseBtn").addEventListener("click", () => closeModal(orderModalOverlay));

  function setFieldError(fieldId, hasError) {
    const wrapper = $(fieldId).closest(".field");
    if (wrapper) wrapper.classList.toggle("has-error", hasError);
  }
  function validateOrderForm() {
    let isValid = true;
    const errors = [];
    const name = $("orderCustomerName").value.trim();
    const phone = $("orderPhoneNumber").value.trim();
    const nameValid = name.length > 0;
    setFieldError("orderCustomerName", !nameValid);
    if (!nameValid) { isValid = false; errors.push("your name"); }
    const phoneValid = phone.length > 0;
    setFieldError("orderPhoneNumber", !phoneValid);
    if (!phoneValid) { isValid = false; errors.push("a phone number"); }
    if (cart.length === 0) { isValid = false; errors.push("at least one product in your cart"); }
    const summary = $("formErrorSummary");
    if (!isValid) {
      summary.textContent = `Please provide ${errors.join(", ")} before submitting.`;
      summary.classList.add("is-visible");
    } else {
      summary.textContent = "";
      summary.classList.remove("is-visible");
    }
    return isValid;
  }
  ["orderCustomerName", "orderPhoneNumber"].forEach((fieldId) => {
    $(fieldId).addEventListener("input", () => setFieldError(fieldId, false));
  });

  function buildOrderSummaryString() {
    return cart.map((item) => `${item.name} x${item.quantity}`).join(", ");
  }

  function buildGoogleFormBody(orderData) {
    const body = new URLSearchParams();
    body.append(FORM_FIELDS.customerName, orderData.customerName);
    body.append(FORM_FIELDS.phoneNumber, orderData.phoneNumber);
    body.append(FORM_FIELDS.address, orderData.address);
    body.append(FORM_FIELDS.productName, orderData.productName);
    body.append(FORM_FIELDS.quantity, orderData.quantity);
    body.append(FORM_FIELDS.notes, orderData.notes);
    return body;
  }
  async function submitOrderToGoogleForm(orderData) {
    const body = buildGoogleFormBody(orderData);
    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  }
  function isGoogleFormConfigured() {
    if (GOOGLE_FORM_ACTION_URL === "GOOGLE_FORM_URL_HERE") return false;
    return Object.values(FORM_FIELDS).every((val) => val !== "ENTRY_ID_HERE");
  }
  function setSubmitLoading(isLoading) {
    const btn = $("orderSubmitBtn");
    btn.classList.toggle("order-submit-btn-loading", isLoading);
    btn.disabled = isLoading;
  }
  function openWhatsAppConfirmation(orderData) {
    const itemLines = cart.map((item) => `• ${item.name} x${item.quantity}`).join("\n");
    const total = getCartSubtotal() + DELIVERY_FEE;
    const message =
      `Assalam o Alaikum,\n\n` +
      `I placed an order through Multan Mart.\n\n` +
      `Name: ${orderData.customerName}\n\n` +
      `Items:\n${itemLines}\n\n` +
      `Total: ${formatPrice(total)}\n\n` +
      `Please confirm my order.`;
    const waLink = `https://wa.me/${OWNER_SETTINGS.whatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(waLink, "_blank", "noopener");
  }

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateOrderForm()) return;
    const orderData = {
      productName: buildOrderSummaryString(),
      quantity: `Total Items: ${getCartCount()}`,
      customerName: $("orderCustomerName").value.trim(),
      phoneNumber: $("orderPhoneNumber").value.trim(),
      address: $("orderAddress").value.trim(),
      notes: $("orderNotes").value.trim(),
    };
    if (!isGoogleFormConfigured()) {
      console.warn(
        "Multan Mart: GOOGLE_FORM_ACTION_URL / FORM_FIELDS are still placeholders. Orders are not being saved anywhere yet. Update these values near the top of script.js.",
        orderData
      );
      showOrderSuccess();
      openWhatsAppConfirmation(orderData);
      clearCart();
      return;
    }
    setSubmitLoading(true);
    try {
      await submitOrderToGoogleForm(orderData);
      showOrderSuccess();
      openWhatsAppConfirmation(orderData);
      clearCart();
    } catch (err) {
      console.error("Multan Mart: order submission failed.", err);
      const summary = $("formErrorSummary");
      summary.textContent = "We couldn't send your order just now. Please check your connection and try again, or call us directly.";
      summary.classList.add("is-visible");
    } finally {
      setSubmitLoading(false);
    }
  });

  /* ---------------------------------------------------------
     CART DRAWER WIRING
     --------------------------------------------------------- */
  const cartOverlay = $("cartOverlay");
  const cartDrawerBody = $("cartDrawerBody");

  $("cartToggleBtn").addEventListener("click", () => openModal(cartOverlay));
  $("cartCloseBtn").addEventListener("click", () => closeModal(cartOverlay));
  $("stickyCartBtn").addEventListener("click", () => openModal(cartOverlay));

  cartDrawerBody.addEventListener("click", (e) => {
    const target = e.target.closest("[data-cart-action]");
    if (!target) return;
    const id = target.dataset.id;
    const action = target.dataset.cartAction;
    const item = findCartItem(id);
    if (!item) return;
    if (action === "increase") { updateCartQuantity(id, item.quantity + 1); }
    else if (action === "decrease") { updateCartQuantity(id, item.quantity - 1); }
    else if (action === "remove") { removeFromCart(id); }
  });

  $("cartCheckoutBtn").addEventListener("click", () => {
    closeModal(cartOverlay);
    setTimeout(openCheckoutModal, 150);
  });

  // Simple focus trap: while a modal/drawer overlay is open, keep Tab
  // cycling within its focusable elements instead of escaping to the page.
  function getFocusableEls(container) {
    return Array.from(
      container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.disabled && el.offsetParent !== null);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const visibleOverlay = document.querySelector(".modal-overlay.is-visible");
    if (!visibleOverlay) return;
    const container = visibleOverlay.querySelector(".modal, .cart-drawer");
    if (!container) return;
    const focusables = getFocusableEls(container);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  const fabWrap = $("fabWrap");
  const fabMain = $("fabMain");
  const fabMenu = $("fabMenu");
  function setFabOpen(isOpen) {
    fabWrap.classList.toggle("is-open", isOpen);
    fabMain.setAttribute("aria-expanded", String(isOpen));
    fabMenu.setAttribute("aria-hidden", String(!isOpen));
  }
  fabMain.addEventListener("click", () => { setFabOpen(!fabWrap.classList.contains("is-open")); });
  document.addEventListener("click", (e) => { if (!fabWrap.contains(e.target)) setFabOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setFabOpen(false); });

  const navToggle = $("navToggle");
  const mainNav = document.querySelector(".main-nav");
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  applyOwnerSettings();
  renderCatalog();
  loadCart();
  renderCartUI();

  if (!isGoogleFormConfigured()) {
    console.info(
      "Multan Mart: heads up — the Google Form isn't connected yet. Open script.js and fill in GOOGLE_FORM_ACTION_URL and FORM_FIELDS near the top so orders start reaching your Google Sheet."
    );
  }
})();