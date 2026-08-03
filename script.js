/* =========================================================
   MULTAN MART — script.js
   =========================================================


   CONFIG & DATA
   Cart logic (state)
   Rendering
   UI interactions

   Products are loaded once at startup from products.json (generated
   from the Excel inventory via tools/import_inventory.py). The Excel
   file is never read by the website.
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

const PRODUCTS_URL = "products.json";
const PLACEHOLDER_IMAGE = "images/placeholder.webp";

const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd8Osj3Dm2Vqi-1ESWPm4cOwHViXwPl9a5qJ-027yZhtuAU_Q/formResponse";

const FORM_FIELDS = {
  customerName: "654362780",
  phoneNumber: "1650395781",
  address: "1880747020",
  productName: "1960638125",
  quantity: "253835968",
  notes: "1027403879",
};

// Category slug -> display label. Object key order is also the order in
// which categories appear in the filter bar and in the catalogue.
const CATEGORY_LABELS = {
  cleaning: "Cleaning",
  beverages: "Beverages",
  confectionery: "Confectionery",
  cooking: "Cooking",
  "cooking-oil": "Cooking Oil",
  diapers: "Diapers",
  "baby-care": "Baby Care",
  foods: "Foods",
  grocery: "Grocery",
  "hair-care": "Hair Care",
  "home-care": "Home Care",
  laundry: "Laundry",
  "milk-dairy": "Milk & Dairy",
  "oral-care": "Oral Care",
  others: "Others",
  "household-paper": "Household & Paper",
  razors: "Razors",
  "skin-care": "Skin Care",
  "skin-cleansing": "Soap & Cleansing",
  snacks: "Snacks",
  spices: "Spices",
  stationery: "Stationery",
};

(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const formatPrice = (amount) => `Rs. ${Number(amount).toLocaleString("en-PK")}`;

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------------------------------------------------------
     PRODUCT DATA
     --------------------------------------------------------- */
  let products = [];

  function getProductById(id) {
    return products.find((p) => String(p.id) === String(id));
  }

  function isProductInStock(product) {
    return Boolean(product) && Number(product.stock) > 0;
  }

  function getCategoriesInOrder() {
    return Object.keys(CATEGORY_LABELS).filter((slug) =>
      products.some((p) => p.category === slug)
    );
  }

  async function loadProducts() {
    try {
      const response = await fetch(PRODUCTS_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      products = Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Multan Mart: could not load products.json.", err);
      products = [];
    }
    return products;
  }

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

  function findCartItem(id) {
    return cart.find((item) => String(item.id) === String(id));
  }

  function addToCart(product, quantity) {
    if (!isProductInStock(product)) {
      showToast("Sorry, this item is out of stock");
      return;
    }
    const existing = findCartItem(product.id);
    const currentQty = existing ? existing.quantity : 0;
    const maxAddable = Number(product.stock) - currentQty;
    if (maxAddable <= 0) {
      showToast("No more of this item in stock");
      return;
    }
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const addQty = Math.min(qty, maxAddable);
    if (existing) { existing.quantity += addQty; }
    else {
      cart.push({ id: product.id, name: product.name, price: product.price, quantity: addQty });
    }
    saveCart();
    renderCartUI(product.id);
    showToast(`✓ ${product.name} added to cart`);
  }

  function updateCartQuantity(id, newQuantity) {
    const item = findCartItem(id);
    if (!item) return;
    const qty = parseInt(newQuantity, 10) || 0;
    if (qty <= 0) { removeFromCart(id); return; }
    const product = getProductById(id);
    if (product && qty > item.quantity) {
      const maxQty = Number(product.stock);
      if (maxQty > 0 && qty > maxQty) {
        item.quantity = maxQty;
        saveCart();
        renderCartUI(id);
        showToast(`Only ${maxQty} in stock`);
        return;
      }
    }
    item.quantity = qty;
    saveCart();
    renderCartUI(id);
    showToast("✓ Quantity updated");
  }

  function removeFromCart(id) {
    const item = findCartItem(id);
    cart = cart.filter((i) => String(i.id) !== String(id));
    saveCart();
    renderCartUI(id);
    if (item) showToast(`✓ ${item.name} removed`);
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCartUI();
    updateAllCardFooters();
  }

  /* ---------------------------------------------------------
     RENDERING — catalog
     --------------------------------------------------------- */
  const productGrid = $("productGrid");
  const CATALOG_PREVIEW_COUNT = 6;

  let activeFilter = "all";
  let searchQuery = "";
  let searchDebounce = null;
  const expandedCategories = new Set();

  const searchInput = $("catalogSearch");
  const searchClearBtn = $("searchClear");

  function stockLabel(product) {
    return isProductInStock(product) ? "Available" : "Out of Stock";
  }

  function stockPillClass(product) {
    return isProductInStock(product) ? "" : "is-out";
  }

  function productImageHTML(product) {
    return `<img class="product-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'">`;
  }

  function getCartQuantity(id) {
    const item = findCartItem(id);
    return item ? item.quantity : 0;
  }

  function productCardFooterHTML(product) {
    if (!isProductInStock(product)) {
      return `<button type="button" class="add-to-cart-btn" disabled>Out of Stock</button>`;
    }
    const qty = getCartQuantity(product.id);
    if (qty === 0) {
      return `<button type="button" class="add-to-cart-btn" data-action="add-to-cart" data-id="${product.id}">+ Add</button>`;
    }
    const atMax = qty >= Number(product.stock);
    return `
      <div class="quantity-stepper card-qty-stepper">
        <button type="button" class="stepper-btn" data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity of ${escapeHTML(product.name)}">−</button>
        <span class="card-qty-value" aria-live="polite">${qty}</span>
        <button type="button" class="stepper-btn" data-action="increase" data-id="${product.id}" ${atMax ? "disabled" : ""} aria-label="Increase quantity of ${escapeHTML(product.name)}">+</button>
      </div>
    `;
  }

  function cardFooterWrapperHTML(product) {
    return `<div class="product-card-footer">${productCardFooterHTML(product)}</div>`;
  }

  function productCardHTML(product) {
    const outOfStock = !isProductInStock(product);
    return `
      <article class="product-card${outOfStock ? " is-out-of-stock" : ""}" data-id="${product.id}" data-category="${product.category}">
        <div class="product-card-media">
          <div class="product-image-placeholder">
            ${productImageHTML(product)}
          </div>
          <span class="stock-pill ${stockPillClass(product)}">${stockLabel(product)}</span>
        </div>
        <div class="product-card-body">
          <span class="category-pill">${CATEGORY_LABELS[product.category] || product.category}</span>
          <span class="product-card-name">${escapeHTML(product.name)}</span>
          <div>
            <span class="product-card-price">${formatPrice(product.price)}</span>
          </div>
        ${cardFooterWrapperHTML(product)}
      </div>
    </article>
    `;
  }

  function getVisibleProducts() {
    let list = activeFilter === "all" ? products : products.filter((p) => p.category === activeFilter);
    const q = searchQuery.toLowerCase();
    if (!q) return list;
    return list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.sku && String(p.sku).toLowerCase().includes(q))
    );
  }

  function categoryGroupHTML(category, productsInCategory) {
    const isSearching = searchQuery.length > 0;
    const isAllView = activeFilter === "all";
    const isExpanded = expandedCategories.has(category);
    const showPreview = isAllView && !isSearching && !isExpanded;
    const shown = showPreview ? productsInCategory.slice(0, CATALOG_PREVIEW_COUNT) : productsInCategory;
    const canToggle = isAllView && !isSearching && productsInCategory.length > CATALOG_PREVIEW_COUNT;
    return `
      <div class="category-group" data-category-group="${category}">
        <div class="category-group-header">
          <h3 class="category-group-title">${CATEGORY_LABELS[category] || category}</h3>
          ${canToggle ? `<button type="button" class="view-more-btn" data-action="toggle-category" data-category="${category}" aria-expanded="${isExpanded}">${isExpanded ? "Show Less" : "View More"}</button>` : ""}
        </div>
        <div class="category-row">
          ${shown.map(productCardHTML).join("")}
        </div>
      </div>
    `;
  }

  function emptyStateHTML() {
    if (searchQuery.length > 0) {
      return `
        <div class="empty-state">
          <p class="empty-state-title">No products found</p>
          <p class="empty-state-sub">Try a different product name, brand, or SKU — or clear your search.</p>
          <button type="button" class="btn btn-ghost" data-action="clear-search">Clear Search</button>
        </div>
      `;
    }
    return `<p class="empty-state">No products in this category right now — check back soon.</p>`;
  }

  function renderCatalog() {
    const visible = getVisibleProducts();
    if (visible.length === 0) {
      productGrid.innerHTML = emptyStateHTML();
      return;
    }
    const categoriesToShow = activeFilter === "all"
      ? getCategoriesInOrder()
      : [activeFilter];
    productGrid.innerHTML = categoriesToShow
      .map((category) => {
        const productsInCategory = visible.filter((p) => p.category === category);
        if (productsInCategory.length === 0) return "";
        return categoryGroupHTML(category, productsInCategory);
      })
      .join("");
  }

  function updateCategoryGroup(category) {
    const productsInCategory = getVisibleProducts().filter((p) => p.category === category);
    const group = productGrid.querySelector(`.category-group[data-category-group="${category}"]`);
    if (group) group.outerHTML = categoryGroupHTML(category, productsInCategory);
  }

  function updateCardFooter(productId) {
    const product = getProductById(productId);
    if (!product) return;
    productGrid.querySelectorAll(`.product-card[data-id="${productId}"]`).forEach((card) => {
      const footer = card.querySelector(".product-card-footer");
      if (footer) footer.outerHTML = cardFooterWrapperHTML(product);
    });
  }

  function updateAllCardFooters() {
    productGrid.querySelectorAll(".product-card").forEach((card) => {
      const product = getProductById(card.dataset.id);
      if (!product) return;
      const footer = card.querySelector(".product-card-footer");
      if (footer) footer.outerHTML = cardFooterWrapperHTML(product);
    });
  }

  function toggleCategoryExpansion(category) {
    if (expandedCategories.has(category)) { expandedCategories.delete(category); }
    else { expandedCategories.add(category); }
    updateCategoryGroup(category);
  }

  function renderFilters() {
    const filterBar = document.querySelector(".catalog-filters");
    if (!filterBar) return;
    const chips = [`<button class="filter-chip is-active" data-filter="all" role="tab" aria-selected="true">All</button>`];
    getCategoriesInOrder().forEach((slug) => {
      chips.push(
        `<button class="filter-chip" data-filter="${slug}" role="tab" aria-selected="false">${CATEGORY_LABELS[slug]}</button>`
      );
    });
    filterBar.innerHTML = chips.join("");
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

  function onSearchInput() {
    const value = searchInput.value;
    searchClearBtn.hidden = value.length === 0;
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      searchQuery = value.trim();
      renderCatalog();
    }, 120);
  }

  function clearSearch() {
    searchInput.value = "";
    searchClearBtn.hidden = true;
    searchQuery = "";
    clearTimeout(searchDebounce);
    renderCatalog();
  }

  document.querySelector(".catalog-filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    setActiveFilter(chip.dataset.filter);
  });

  productGrid.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "add-to-cart" || action === "increase") {
      const product = getProductById(target.dataset.id);
      if (product) addToCart(product, 1);
    } else if (action === "decrease") {
      updateCartQuantity(target.dataset.id, getCartQuantity(target.dataset.id) - 1);
    } else if (action === "toggle-category") {
      toggleCategoryExpansion(target.dataset.category);
    } else if (action === "clear-search") {
      clearSearch();
    }
  });

  searchInput.addEventListener("input", onSearchInput);
  searchInput.addEventListener("search", onSearchInput);
  searchClearBtn.addEventListener("click", clearSearch);

  /* ---------------------------------------------------------
     RENDERING — cart
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
          <span class="cart-item-name">${escapeHTML(item.name)}</span>
          <span class="cart-item-price">${formatPrice(item.price)} × ${item.quantity} = ${formatPrice(lineTotal)}</span>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-stepper quantity-stepper-sm" data-id="${item.id}">
            <button type="button" class="stepper-btn" data-cart-action="decrease" data-id="${item.id}" aria-label="Decrease quantity of ${escapeHTML(item.name)}">−</button>
            <span class="stepper-value" aria-live="polite">${item.quantity}</span>
            <button type="button" class="stepper-btn" data-cart-action="increase" data-id="${item.id}" aria-label="Increase quantity of ${escapeHTML(item.name)}">+</button>
          </div>
          <button type="button" class="cart-item-remove" data-cart-action="remove" data-id="${item.id}" aria-label="Remove ${escapeHTML(item.name)} from cart">Remove</button>
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

  function renderCartUI(updatedProductId) {
    renderCartBadge();
    renderStickyCartBtn();
    renderCartDrawer();
    if (updatedProductId != null) {
      updateCardFooter(updatedProductId);
    }
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

  /* ---------------------------------------------------------
     MODALS
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     ORDER / CHECKOUT MODAL
     --------------------------------------------------------- */
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
            <span>${escapeHTML(item.name)} <span class="checkout-summary-qty">× ${item.quantity}</span></span>
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
      // A stock decrement (stock = stock - orderedQuantity) can hook in here
      // later, keeping products.json as the single source of truth.
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

  /* ---------------------------------------------------------
     FAB + NAV
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  (async function init() {
    applyOwnerSettings();
    loadCart();
    renderCartUI();
    await loadProducts();
    if (products.length === 0) {
      productGrid.innerHTML = `<p class="empty-state">We couldn't load the product catalogue. Please check your connection and refresh.</p>`;
      console.warn("Multan Mart: no products loaded from " + PRODUCTS_URL + ".");
      return;
    }
    renderFilters();
    renderCatalog();
    if (!isGoogleFormConfigured()) {
      console.info(
        "Multan Mart: heads up — the Google Form isn't connected yet. Open script.js and fill in GOOGLE_FORM_ACTION_URL and FORM_FIELDS near the top so orders start reaching your Google Sheet."
      );
    }
  })();
})();
