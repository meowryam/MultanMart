/* =========================================================
   GREEN BASKET — script.js
   =========================================================
   HOW THIS FILE IS ORGANIZED (for the shop owner)
   ---------------------------------------------------------
   1. OWNER SETTINGS   — everything you might need to change lives here.
   2. PRODUCTS         — your catalog. Add, remove, or edit products here.
   3. Everything below "DO NOT EDIT BELOW THIS LINE" is the app's
      internal logic. You shouldn't need to touch it to update your
      shop's details or product list.
   ========================================================= */


/* =========================================================
   1. OWNER SETTINGS
   Update the values below with your real business details.
   ========================================================= */
const OWNER_SETTINGS = {
  phoneNumberDisplay: "0300 8770122",
  phoneNumberDial: "+923008770122",
  whatsAppNumber: "923008770122",
  whatsAppNumberDisplay: "0300 8770122",
  businessAddress: "Multan, Pakistan",
  businessHours: "Mon – Sat, 9:00 AM – 9:00 PM",
};

/* =========================================================
   GOOGLE FORM INTEGRATION
   ---------------------------------------------------------
   Replace GOOGLE_FORM_ACTION_URL with your Google Form's
   "formResponse" submission URL. To find it:
     1. Open your Google Form.
     2. Click the three dots menu -> "Get pre-filled link".
     3. Fill in dummy answers and click "Get link".
     4. Copy the URL, then change "viewform" to "formResponse"
        near the end of the URL.

   Replace each ENTRY_ID_HERE below with the matching field's
   entry ID from that same pre-filled link (look for
   "entry.XXXXXXXXX=" in the URL for each field).
   ========================================================= */
const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd8Osj3Dm2Vqi-1ESWPm4cOwHViXwPl9a5qJ-027yZhtuAU_Q/formResponse";

const FORM_FIELDS = {
  customerName: "654362780",
  phoneNumber: "1650395781",
  address: "1880747020",
  productName: "1960638125",
  quantity: "253835968",
  notes: "1027403879",
};
/* =========================================================
   OWNER SETUP GUIDE — connecting your Google Form
   ---------------------------------------------------------
   1. Go to forms.google.com and create a new form with these
      fields (plain text, short answer): Customer Name, Phone
      Number, Address, Product Name, Quantity, Notes.

   2. Click Send → click the link icon → copy the link. It
      looks like:
        https://docs.google.com/forms/d/e/XXXX/viewform
      Change "viewform" at the end to "formResponse" and paste
      the whole thing into GOOGLE_FORM_ACTION_URL above.

   3. To get the entry IDs for each field:
        - Click the 3-dot menu (top right of the form) →
          "Get pre-filled link".
        - Fill in any dummy answer for every field, then click
          "Get link" and copy it.
        - That copied link will contain a bunch of pieces like
          entry.123456789=your+answer — the number after
          "entry." is the entry ID for that field.
        - Match each entry ID to the right field name in
          FORM_FIELDS above (e.g. the entry ID next to your
          dummy phone number answer goes into "phoneNumber").

   4. Paste the URL from step 2 into GOOGLE_FORM_ACTION_URL,
      and paste each entry ID from step 3 into its matching
      slot in FORM_FIELDS. Save the file.

   5. To view incoming orders: open your Google Form → click
      the "Responses" tab at the top → click the green Sheets
      icon. This opens a spreadsheet that fills in
      automatically every time a customer orders — no extra
      setup needed.
   ========================================================= */


/* =========================================================
   2. PRODUCTS
   Add, remove, or edit products in this list. Each product needs:
     id          — a unique short id, no spaces (e.g. "tomato-vine")
     name        — shown to customers
     category    — one of: "produce", "dairy", "bakery", "pantry"
     price       — a number, shown as "Rs. <price>"
     unit        — e.g. "per kg", "per dozen", "per loaf"
     stock       — "in" | "low" | "out"
     description — a sentence or two shown in the product modal
   ========================================================= */
const PRODUCTS = [
  {
    id: "tomato-vine",
    name: "Vine Tomatoes",
    category: "produce",
    price: 180,
    unit: "per kg",
    stock: "in",
    description: "Ripe, red, and grown nearby — picked within the last two days for the best flavor.",
  },
  {
    id: "spinach-bunch",
    name: "Fresh Spinach",
    category: "produce",
    price: 60,
    unit: "per bunch",
    stock: "in",
    description: "Tender leafy spinach, washed and ready for your favorite saag or salad.",
  },
  {
    id: "banana-dozen",
    name: "Bananas",
    category: "produce",
    price: 140,
    unit: "per dozen",
    stock: "low",
    description: "Sweet, ripe bananas — a lunchbox favorite for kids and grown-ups alike.",
  },
  {
    id: "potato-5kg",
    name: "Potatoes",
    category: "produce",
    price: 350,
    unit: "5 kg bag",
    stock: "in",
    description: "All-purpose potatoes, great for curries, fries, or a Sunday roast.",
  },
  {
    id: "eggs-dozen",
    name: "Farmhouse Eggs",
    category: "dairy",
    price: 320,
    unit: "per dozen",
    stock: "in",
    description: "Free-range eggs from a nearby farm, delivered fresh every week.",
  },
  {
    id: "milk-1l",
    name: "Fresh Milk",
    category: "dairy",
    price: 210,
    unit: "1 litre",
    stock: "in",
    description: "Pasteurized whole milk, delivered cold and ready for your morning chai.",
  },
  {
    id: "yogurt-500g",
    name: "Plain Yogurt",
    category: "dairy",
    price: 150,
    unit: "500 g tub",
    stock: "out",
    description: "Thick, tangy yogurt made the traditional way. Great with meals or on its own.",
  },
  {
    id: "cheddar-block",
    name: "Cheddar Cheese",
    category: "dairy",
    price: 890,
    unit: "250 g block",
    stock: "low",
    description: "A mild, creamy cheddar that melts beautifully — perfect for sandwiches and toasties.",
  },
  {
    id: "bread-wheat",
    name: "Whole Wheat Bread",
    category: "bakery",
    price: 170,
    unit: "per loaf",
    stock: "in",
    description: "Soft, wholesome bread baked fresh each morning by our neighborhood baker.",
  },
  {
    id: "bun-pack6",
    name: "Sesame Buns",
    category: "bakery",
    price: 130,
    unit: "pack of 6",
    stock: "in",
    description: "Soft sesame-topped buns, ideal for burgers or a quick sandwich.",
  },
  {
    id: "croissant-4",
    name: "Butter Croissants",
    category: "bakery",
    price: 320,
    unit: "pack of 4",
    stock: "low",
    description: "Flaky, buttery croissants baked fresh — a small treat for the weekend table.",
  },
  {
    id: "rice-basmati-5kg",
    name: "Basmati Rice",
    category: "pantry",
    price: 1450,
    unit: "5 kg bag",
    stock: "in",
    description: "Long-grain aged basmati rice, fragrant and fluffy once cooked.",
  },
  {
    id: "cooking-oil-3l",
    name: "Cooking Oil",
    category: "pantry",
    price: 1650,
    unit: "3 litre can",
    stock: "in",
    description: "A light, everyday cooking oil suited to frying, sautéing, and baking.",
  },
  {
    id: "lentils-1kg",
    name: "Red Lentils",
    category: "pantry",
    price: 320,
    unit: "1 kg pack",
    stock: "in",
    description: "Quick-cooking red lentils (masoor daal), a pantry staple for weeknight meals.",
  },
  {
    id: "tea-500g",
    name: "Black Tea Leaves",
    category: "pantry",
    price: 480,
    unit: "500 g pack",
    stock: "low",
    description: "A robust, full-bodied black tea blend — the everyday cup for your kitchen.",
  },
];


/* =========================================================
   ================  DO NOT EDIT BELOW THIS LINE  ===========
   The rest of this file renders the catalog, runs the modals,
   validates the order form, and submits orders to Google
   Forms. Advanced users may extend it (see the "FUTURE
   SCALABILITY" notes near the bottom of the file).
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Small helpers ---------- */

  const $ = (id) => document.getElementById(id);
  const formatPrice = (amount) => `Rs. ${Number(amount).toLocaleString("en-PK")}`;

  const STOCK_LABELS = {
    in: "In Stock",
    low: "Low Stock",
    out: "Out of Stock",
  };

  const CATEGORY_LABELS = {
    produce: "Produce",
    dairy: "Dairy & Eggs",
    bakery: "Bakery",
    pantry: "Pantry",
  };

  function getProductById(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function stockPillClass(stock) {
    if (stock === "low") return "is-low";
    if (stock === "out") return "is-out";
    return "";
  }

  /* =========================================================
     CONTACT DETAILS — wire up owner settings to the page
     ========================================================= */

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

  /* =========================================================
     CATALOG RENDERING
     ========================================================= */

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
            <button class="order-now-btn" data-action="order-now" data-id="${product.id}" ${outOfStock ? "disabled" : ""}>
              ${outOfStock ? "Out of Stock" : "Order Now"}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderCatalog() {
    const filtered = activeFilter === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeFilter);

    if (filtered.length === 0) {
      productGrid.innerHTML = `<p class="empty-state">No products in this category right now — check back soon.</p>`;
      return;
    }

    productGrid.innerHTML = filtered.map(productCardHTML).join("");
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

  // Event delegation for dynamically rendered product cards.
  productGrid.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const productId = target.dataset.id;
    if (target.dataset.action === "open-product") {
      openProductModal(productId);
    } else if (target.dataset.action === "order-now") {
      openOrderModal(getProductById(productId));
    }
  });

  productGrid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const target = e.target.closest("[data-action='open-product']");
    if (!target) return;
    e.preventDefault();
    openProductModal(target.dataset.id);
  });


  /* =========================================================
     MODAL — generic open/close helpers
     ========================================================= */

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
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal-overlay.is-visible").forEach(closeModal);
  });


  /* =========================================================
     PRODUCT DETAIL MODAL
     ========================================================= */

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
    if (product.stock === "out") {
      orderBtn.textContent = "Out of Stock";
      orderBtn.disabled = true;
    } else {
      orderBtn.textContent = "Order Now";
      orderBtn.disabled = false;
    }

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
    closeModal(productModalOverlay);
    // Small delay so the product modal has visually cleared before the order modal appears.
    setTimeout(() => openOrderModal(currentProductInModal, qty), 150);
  });


  /* =========================================================
     ORDER MODAL — form state + success state
     ========================================================= */

  const orderModalOverlay = $("orderModalOverlay");
  const orderFormState = $("orderFormState");
  const orderSuccessState = $("orderSuccessState");
  const orderForm = $("orderForm");
  let currentOrderProduct = null;

  function resetOrderForm() {
    orderForm.reset();
    document.querySelectorAll(".field.has-error").forEach((f) => f.classList.remove("has-error"));
    $("formErrorSummary").classList.remove("is-visible");
    $("formErrorSummary").textContent = "";
    $("orderQuantity").value = 1;
  }

  function showOrderForm() {
    orderSuccessState.hidden = true;
    orderFormState.hidden = false;
  }

  function showOrderSuccess() {
    orderFormState.hidden = true;
    orderSuccessState.hidden = false;
    // Restart the stamp-draw animation each time it's shown.
    const stampCheck = orderSuccessState.querySelector(".stamp-check");
    const stampCircle = orderSuccessState.querySelector("circle");
    [stampCheck, stampCircle].forEach((el) => {
      if (!el) return;
      el.style.animation = "none";
      void el.offsetWidth; // eslint-disable-line no-void -- forces reflow to restart CSS animation
      el.style.animation = "";
    });
  }

  function openOrderModal(product, quantity) {
    currentOrderProduct = product;
    resetOrderForm();
    showOrderForm();

    $("orderProductName").value = product.name;
    $("orderQuantity").value = quantity && quantity > 0 ? quantity : 1;

    openModal(orderModalOverlay);
    // Focus the first editable field rather than the (readonly) product field or close button.
    setTimeout(() => $("orderCustomerName").focus(), 50);
  }

  function openOrderModalEmpty() {
    // Used by the floating "Order Now" contexts where no specific product was pre-selected.
    // Not currently linked from the UI, but kept available for future entry points
    // (see FUTURE SCALABILITY notes) without needing a product argument.
    currentOrderProduct = null;
    resetOrderForm();
    showOrderForm();
    $("orderProductName").value = "";
    openModal(orderModalOverlay);
  }

  $("orderModalClose").addEventListener("click", () => closeModal(orderModalOverlay));
  $("orderCancelBtn").addEventListener("click", () => closeModal(orderModalOverlay));
  $("continueBrowsingBtn").addEventListener("click", () => closeModal(orderModalOverlay));
  $("successCloseBtn").addEventListener("click", () => closeModal(orderModalOverlay));


  /* =========================================================
     ORDER FORM VALIDATION
     ========================================================= */

  function setFieldError(fieldId, hasError) {
    const wrapper = $(fieldId).closest(".field");
    if (wrapper) wrapper.classList.toggle("has-error", hasError);
  }

  function validateOrderForm() {
    let isValid = true;
    const errors = [];

    const name = $("orderCustomerName").value.trim();
    const phone = $("orderPhoneNumber").value.trim();
    const quantity = parseInt($("orderQuantity").value, 10);
    const productName = $("orderProductName").value.trim();

    const nameValid = name.length > 0;
    setFieldError("orderCustomerName", !nameValid);
    if (!nameValid) { isValid = false; errors.push("your name"); }

    const phoneValid = phone.length > 0;
    setFieldError("orderPhoneNumber", !phoneValid);
    if (!phoneValid) { isValid = false; errors.push("a phone number"); }

    const quantityValid = Number.isFinite(quantity) && quantity >= 1;
    setFieldError("orderQuantity", !quantityValid);
    if (!quantityValid) { isValid = false; errors.push("a quantity of at least 1"); }

    const productValid = productName.length > 0;
    if (!productValid) { isValid = false; errors.push("a product"); }

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

  // Clear a field's error state as soon as the customer starts fixing it.
  ["orderCustomerName", "orderPhoneNumber", "orderQuantity"].forEach((fieldId) => {
    $(fieldId).addEventListener("input", () => setFieldError(fieldId, false));
  });


  /* =========================================================
     GOOGLE FORM SUBMISSION
     ---------------------------------------------------------
     Submission logic is isolated here so the owner (or a future
     developer) can swap Google Forms for a backend API without
     touching anything else in this file. See FUTURE SCALABILITY
     notes at the bottom.
     ========================================================= */

  function buildGoogleFormBody(orderData) {
    const body = new URLSearchParams();
    body.append(FORM_FIELDS.customerName, orderData.customerName);
    body.append(FORM_FIELDS.phoneNumber, orderData.phoneNumber);
    body.append(FORM_FIELDS.address, orderData.address);
    body.append(FORM_FIELDS.productName, orderData.productName);
    body.append(FORM_FIELDS.quantity, String(orderData.quantity));
    body.append(FORM_FIELDS.notes, orderData.notes);
    return body;
  }

  async function submitOrderToGoogleForm(orderData) {
    const body = buildGoogleFormBody(orderData);

    // Google Forms' formResponse endpoint doesn't send CORS headers, so the
    // browser can't read the response. "no-cors" lets the request go through
    // as a genuine submission while treating it as fire-and-forget: we cannot
    // read status codes back, so success/failure here reflects only whether
    // the network request itself could be sent, not Google's own response.
    await fetch(GOOGLE_FORM_ACTION_URL, {
      method: "POST",
      mode: "no-cors",
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

  /* =========================================================
     WHATSAPP ORDER CONFIRMATION
     ---------------------------------------------------------
     After a successful order submission, open WhatsApp in a
     new tab with a pre-filled confirmation message so the
     customer can send it straight to the shop.
     ========================================================= */

  function openWhatsAppConfirmation(orderData) {
    const message =
      `Assalam o Alaikum,\n` +
      `I have placed an order on the Multan Mart website.\n\n` +
      `Name: ${orderData.customerName}\n` +
      `Product: ${orderData.productName}\n` +
      `Quantity: ${orderData.quantity}\n\n` +
      `Please confirm my order.`;

    const waLink = `https://wa.me/${OWNER_SETTINGS.whatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(waLink, "_blank", "noopener");
  }

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateOrderForm()) return;

    const orderData = {
      productName: $("orderProductName").value.trim(),
      quantity: parseInt($("orderQuantity").value, 10) || 1,
      customerName: $("orderCustomerName").value.trim(),
      phoneNumber: $("orderPhoneNumber").value.trim(),
      address: $("orderAddress").value.trim(),
      notes: $("orderNotes").value.trim(),
    };

    if (!isGoogleFormConfigured()) {
      // The shop owner hasn't plugged in their Google Form yet.
      // Let the customer complete the flow normally in the meantime,
      // and leave a clear trail in the console for whoever sets it up.
      console.warn(
        "Multan Mart: GOOGLE_FORM_ACTION_URL / FORM_FIELDS are still placeholders. " +
        "Orders are not being saved anywhere yet. Update these values near the top of script.js.",
        orderData
      );
      showOrderSuccess();
      openWhatsAppConfirmation(orderData);
      return;
    }

    setSubmitLoading(true);
    try {
      await submitOrderToGoogleForm(orderData);
      showOrderSuccess();
      openWhatsAppConfirmation(orderData);
    } catch (err) {
      console.error("Multan Mart: order submission failed.", err);
      const summary = $("formErrorSummary");
      summary.textContent = "We couldn't send your order just now. Please check your connection and try again, or call us directly.";
      summary.classList.add("is-visible");
    } finally {
      setSubmitLoading(false);
    }
  });


  /* =========================================================
     FLOATING ACTION BUTTON
     ========================================================= */

  const fabWrap = $("fabWrap");
  const fabMain = $("fabMain");
  const fabMenu = $("fabMenu");

  function setFabOpen(isOpen) {
    fabWrap.classList.toggle("is-open", isOpen);
    fabMain.setAttribute("aria-expanded", String(isOpen));
    fabMenu.setAttribute("aria-hidden", String(!isOpen));
  }

  fabMain.addEventListener("click", () => {
    setFabOpen(!fabWrap.classList.contains("is-open"));
  });

  document.addEventListener("click", (e) => {
    if (!fabWrap.contains(e.target)) setFabOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setFabOpen(false);
  });


  /* =========================================================
     MOBILE NAV TOGGLE
     ========================================================= */

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


  /* =========================================================
     INIT
     ========================================================= */

  applyOwnerSettings();
  renderCatalog();

  if (!isGoogleFormConfigured()) {
    console.info(
      "Multan Mart: heads up — the Google Form isn't connected yet. " +
      "Open script.js and fill in GOOGLE_FORM_ACTION_URL and FORM_FIELDS near the top " +
      "so orders start reaching your Google Sheet."
    );
  }
})();


/* =========================================================
   FUTURE SCALABILITY NOTES
   ---------------------------------------------------------
   This file is intentionally organized so each concern can be
   swapped independently as the shop grows:

   • Replacing Google Forms with a backend API:
     Only `buildGoogleFormBody`, `submitOrderToGoogleForm`, and
     `isGoogleFormConfigured` need to change. Keep the same
     `orderData` shape (productName, quantity, customerName,
     phoneNumber, address, notes) and everything calling into
     submission (the form's submit handler) keeps working unmodified.

   • Loading products from JSON instead of the PRODUCTS array:
     Replace the PRODUCTS constant with a fetch() call that
     populates the same array shape, then call renderCatalog()
     once it resolves. No other function depends on PRODUCTS
     being defined statically.

   • Adding real inventory management:
     The `stock` field already drives UI state (pill labels,
     disabled "Order Now" buttons). A future version could
     refresh PRODUCTS periodically from an API and re-run
     renderCatalog() to reflect live stock levels.
   ========================================================= */