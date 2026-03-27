(() => {
    "use strict";

    const WHATSAPP_NUMBER = "+584247777965";
    const STORAGE_KEY = "mundofit_clone_cart_v1";

    const products = [
      {
        id: 1,
        name: "Arepas Artesanales",
        category: "Arepas",
        description: "Arepas sin azúcar en múltiples sabores. Pack de 10 unidades listas para calentar.",
        price: 4,
        unit: "10 unidades",
        image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f63c5c37-1773095812464.png",
        imageAlt: "Arepas artesanales recién hechas con masa de colores naturales sobre tabla de madera",
        badge: "Popular",
        badgeClass: "",
        variantLabel: "Tipo de masa",
        variants: ["Papa", "Auyama", "Maíz amarillo", "Maíz blanco", "Yuca", "Yuca con chía", "Plátano", "Topocho", "Zanahoria", "Espinaca", "Zanahoria + Remolacha", "Mixtas", "Zanahoria con chía"]
      },
      {
        id: 2,
        name: "Tequeños Rellenos de Queso",
        category: "Tequeños",
        description: "Crujientes por fuera, derretidos por dentro. Masa artesanal sin azúcar añadida.",
        price: 3,
        unit: "Por docena",
        image: "https://img.rocket.new/generatedImages/rocket_gen_img_141ceddb0-1765232175619.png",
        imageAlt: "Tequeños dorados rellenos de queso apilados sobre papel kraft",
        badge: "Favorito",
        badgeClass: "product-badge-green",
        variantLabel: "Tipo de masa",
        variants: ["Plátano amarillo", "Yuca con chía"]
      },
      {
        id: 3,
        name: "Empanadas de Pollo",
        category: "Empanadas",
        description: "Rellenas de pollo jugoso. Masa artesanal sin azúcar, horneadas o fritas.",
        price: 4,
        unit: "10 unidades",
        image: "https://img.rocket.new/generatedImages/rocket_gen_img_1def07db2-1770161098458.png",
        imageAlt: "Empanadas doradas rellenas de pollo desmechado sobre tabla de madera",
        variantLabel: "Tipo de masa",
        variants: ["Maíz amarillo", "Plátano maduro", "Yuca con chía"]
      },
      {
        id: 4,
        name: "Pollo Desmechado",
        category: "Proteínas",
        description: "Pollo cocido y desmechado, condimentado con especias naturales. Ideal para rellenar.",
        price: 4,
        unit: "250 gramos",
        image: "https://images.unsplash.com/photo-1707624749629-ee34818b0c2e",
        imageAlt: "Pollo desmechado condimentado en bowl blanco sobre fondo verde",
        badge: "Proteína",
        badgeClass: "product-badge-green"
      },
      {
        id: 5,
        name: "Jugo Detox Congelado",
        category: "Bebidas",
        description: "Blend de vegetales y frutas para licuar. Sin azúcar, listo para preparar en casa.",
        price: 2.5,
        unit: "Por porción",
        image: "https://img.rocket.new/generatedImages/rocket_gen_img_1698aba35-1772215197563.png",
        imageAlt: "Jugo verde detox congelado con vegetales frescos y frutas coloridas",
        badge: "Detox",
        badgeClass: ""
      },
      {
        id: 6,
        name: "Yogurt Natural Sin Azúcar",
        category: "Lácteos",
        description: "Yogurt pequeño artesanal, sin azúcar añadida. Rico en probióticos naturales.",
        price: 1.5,
        unit: "Porción individual",
        image: "https://images.unsplash.com/photo-1670843838196-0c1c15e85d5e",
        imageAlt: "Yogurt natural blanco cremoso en vaso de vidrio con frutas rojas encima"
      }
    ];

    const categoryMeta = {
      "Todos": "🍽️",
      "Arepas": "🌽",
      "Tequeños": "🧀",
      "Empanadas": "🫓",
      "Proteínas": "🍗",
      "Bebidas": "🥤",
      "Lácteos": "🥛"
    };

    const state = {
      category: "Todos",
      cart: []
    };

    const refs = {
      navbar: document.querySelector(".navbar"),
      categoryTabs: document.getElementById("categoryTabs"),
      productsGrid: document.getElementById("productsGrid"),
      navCartBtn: document.getElementById("navCartBtn"),
      navCartBadge: document.getElementById("navCartBadge"),
      cartFab: document.getElementById("cartFab"),
      heroMenuBtn: document.getElementById("heroMenuBtn"),
      heroOrderBtn: document.getElementById("heroOrderBtn"),
      ctaOrderBtn: document.getElementById("ctaOrderBtn"),
      cartOverlay: document.getElementById("cartOverlay"),
      cartPanel: document.getElementById("cartPanel"),
      closeCartBtn: document.getElementById("closeCartBtn"),
      cartItems: document.getElementById("cartItems"),
      cartTotal: document.getElementById("cartTotal"),
      clearCartBtn: document.getElementById("clearCartBtn"),
      sendOrderBtn: document.getElementById("sendOrderBtn"),
      orderForm: document.getElementById("orderForm"),
      toastContainer: document.getElementById("toastContainer")
    };

    const currency = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let revealObserver = null;

    const money = value => currency.format(value);

    function slugify(text) {
      return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    function createLineKey(productId, variant) {
      return variant ? `${productId}:${slugify(variant)}` : `${productId}:base`;
    }

    function getProduct(productId) {
      return products.find(p => p.id === productId);
    }

    function getCategories() {
      return ["Todos", ...new Set(products.map(p => p.category))];
    }

    function escapeHtml(text) {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
      return String(text).replace(/[&<>"']/g, m => map[m]);
    }
    function persistCart() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
    }

    function loadCart() {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (!Array.isArray(parsed)) return;

        state.cart = parsed.map(item => {
          const product = getProduct(Number(item.productId));
          if (!product) return null;
          return {
            lineKey: typeof item.lineKey === "string" ? item.lineKey : createLineKey(product.id, item.variant || ""),
            productId: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
            variantLabel: typeof item.variantLabel === "string" ? item.variantLabel : "",
            variant: typeof item.variant === "string" ? item.variant : ""
          };
        }).filter(Boolean);
      } catch {
        state.cart = [];
      }
    }

    function getTotals() {
      return state.cart.reduce((acc, item) => {
        acc.count += item.quantity;
        acc.total += item.quantity * item.price;
        return acc;
      }, { count: 0, total: 0 });
    }

    function showToast(message, icon) {
      const item = document.createElement("div");
      item.className = "toast";
      item.innerHTML = `<span class="toast-icon">${icon || "✅"}</span><span class="toast-text">${escapeHtml(message)}</span>`;
      refs.toastContainer.appendChild(item);
      setTimeout(() => item.remove(), 3200);
    }

    function renderCategoryTabs() {
      refs.categoryTabs.innerHTML = getCategories().map(category => {
        const active = category === state.category;
        return `<button role="tab" aria-selected="${active}" class="cat-tab${active ? " active" : ""}" data-category="${escapeHtml(category)}"><span aria-hidden="true">${categoryMeta[category] || "🥗"}</span>${escapeHtml(category)}</button>`;
      }).join("");
    }

    function renderVariantSelect(product) {
      if (!Array.isArray(product.variants) || !product.variants.length) {
        return "";
      }
      return `<div style="margin-bottom:0.5rem"><select class="product-variant-select" data-variant-for="${product.id}" aria-label="Seleccionar ${escapeHtml(product.variantLabel || "variante")} para ${escapeHtml(product.name)}"><option value="" selected>— ${escapeHtml(product.variantLabel || "Variante")} —</option>${product.variants.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("")}</select></div>`;
    }

    function renderProducts() {
      const visibleProducts = state.category === "Todos"
        ? products
        : products.filter(product => product.category === state.category);

      refs.productsGrid.innerHTML = visibleProducts.map((product, index) => {
        const badge = product.badge ? `<span class="product-badge ${product.badgeClass || ""}" aria-label="Etiqueta: ${escapeHtml(product.badge)}">${escapeHtml(product.badge)}</span>` : "";
        const stagger = `stagger-${Math.min(index + 1, 4)}`;

        return `<article class="product-card reveal-scale ${stagger}" aria-label="${escapeHtml(product.name)}, ${money(product.price)}"><div class="product-card-img-wrap"><img alt="${escapeHtml(product.imageAlt)}" loading="lazy" decoding="async" src="${escapeHtml(product.image)}">${badge}</div><div class="product-card-body"><h3 class="product-name">${escapeHtml(product.name)}</h3><p class="product-desc">${escapeHtml(product.description)}</p>${renderVariantSelect(product)}<div class="product-footer"><div><div class="product-price">${money(product.price)}</div><div class="product-price-sub">${escapeHtml(product.unit || "Porción")}</div></div><button class="btn-add-cart" data-action="add" data-product-id="${product.id}" aria-label="Agregar ${escapeHtml(product.name)} al carrito"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Agregar</button></div></div></article>`;
      }).join("");

      registerReveal(refs.productsGrid);
    }

    function updateCartBadges() {
      const totals = getTotals();
      refs.navCartBadge.textContent = String(totals.count);
      refs.navCartBtn.setAttribute("aria-label", `Abrir carrito, ${totals.count} productos`);

      const existingFabCount = refs.cartFab.querySelector(".cart-fab-count");
      if (totals.count > 0) {
        if (existingFabCount) {
          existingFabCount.textContent = String(totals.count);
        } else {
          const bubble = document.createElement("span");
          bubble.className = "cart-fab-count";
          bubble.textContent = String(totals.count);
          refs.cartFab.appendChild(bubble);
        }
      } else if (existingFabCount) {
        existingFabCount.remove();
      }
    }

    function renderCartItems() {
      const totals = getTotals();
      refs.cartTotal.textContent = money(totals.total);
      refs.sendOrderBtn.disabled = totals.count === 0;
      refs.clearCartBtn.disabled = totals.count === 0;

      if (!state.cart.length) {
        refs.cartItems.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><strong>Tu carrito está vacío</strong><p>Agrega productos del menú para comenzar tu pedido.</p></div>`;
        return;
      }

      refs.cartItems.innerHTML = state.cart.map(item => {
        const variantLine = item.variant ? `<div class="cart-item-variant">${escapeHtml(item.variantLabel)}: ${escapeHtml(item.variant)}</div>` : "";
        return `<article class="cart-item"><img class="cart-item-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><div class="cart-item-info"><div class="cart-item-name">${escapeHtml(item.name)}</div>${variantLine}<div class="cart-item-price">${money(item.price * item.quantity)}</div><div class="qty-controls"><button type="button" class="qty-btn" data-action="dec" data-line-key="${encodeURIComponent(item.lineKey)}">−</button><span class="qty-value">${item.quantity}</span><button type="button" class="qty-btn" data-action="inc" data-line-key="${encodeURIComponent(item.lineKey)}">+</button></div></div><button type="button" class="cart-item-remove" data-action="remove" data-line-key="${encodeURIComponent(item.lineKey)}" aria-label="Eliminar">✕</button></article>`;
      }).join("");
    }

    function addProduct(productId) {
      const product = getProduct(productId);
      if (!product) return;

      let variant = "";
      if (Array.isArray(product.variants) && product.variants.length) {
        const select = refs.productsGrid.querySelector(`select[data-variant-for="${product.id}"]`);
        variant = select ? select.value.trim() : "";
        if (!variant) {
          showToast("Selecciona una variante antes de agregar.", "⚠️");
          select && select.focus();
          return;
        }
      }

      const lineKey = createLineKey(product.id, variant);
      const existing = state.cart.find(item => item.lineKey === lineKey);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({
          lineKey,
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 1,
          variantLabel: product.variantLabel || "",
          variant
        });
      }

      persistCart();
      renderCartItems();
      updateCartBadges();
      showToast(`${product.name} agregado al carrito.`, "✅");
    }
    function updateLineQuantity(lineKey, delta) {
      const item = state.cart.find(line => line.lineKey === lineKey);
      if (!item) return;
      item.quantity += delta;
      if (item.quantity <= 0) {
        state.cart = state.cart.filter(line => line.lineKey !== lineKey);
      }
      persistCart();
      renderCartItems();
      updateCartBadges();
    }

    function removeLine(lineKey) {
      state.cart = state.cart.filter(line => line.lineKey !== lineKey);
      persistCart();
      renderCartItems();
      updateCartBadges();
    }

    function clearCart() {
      state.cart = [];
      persistCart();
      renderCartItems();
      updateCartBadges();
      showToast("Carrito vaciado.", "🧹");
    }

    function openCart() {
      refs.cartOverlay.classList.add("visible");
      refs.cartPanel.classList.remove("closing");
      refs.cartPanel.classList.add("open");
      refs.cartPanel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeCart() {
      refs.cartOverlay.classList.remove("visible");
      refs.cartPanel.classList.remove("open");
      refs.cartPanel.classList.add("closing");
      refs.cartPanel.setAttribute("aria-hidden", "true");
      setTimeout(() => refs.cartPanel.classList.remove("closing"), 260);
      document.body.style.overflow = "";
    }

    function clearFieldError(name) {
      const input = refs.orderForm.elements[name];
      const error = refs.orderForm.querySelector(`[data-error="${name}"]`);
      if (input) input.setAttribute("aria-invalid", "false");
      if (error) error.textContent = "";
    }

    function setFieldError(name, message) {
      const input = refs.orderForm.elements[name];
      const error = refs.orderForm.querySelector(`[data-error="${name}"]`);
      if (input) input.setAttribute("aria-invalid", "true");
      if (error) error.textContent = message;
    }

    function validateForm() {
      const data = {
        name: String(refs.orderForm.elements.name.value || "").trim(),
        phone: String(refs.orderForm.elements.phone.value || "").trim(),
        zone: String(refs.orderForm.elements.zone.value || "").trim(),
        reference: String(refs.orderForm.elements.reference.value || "").trim(),
        payment: String(refs.orderForm.elements.payment.value || "").trim(),
        comment: String(refs.orderForm.elements.comment.value || "").trim()
      };

      ["name", "phone", "zone", "reference", "payment"].forEach(clearFieldError);
      let valid = true;

      if (data.name.length < 3) {
        setFieldError("name", "Ingresa nombre y apellido.");
        valid = false;
      }
      if (!/^[+\d][\d\s()-]{6,}$/.test(data.phone)) {
        setFieldError("phone", "Ingresa un teléfono válido.");
        valid = false;
      }
      if (data.zone.length < 6) {
        setFieldError("zone", "Agrega una zona o dirección más completa.");
        valid = false;
      }
      if (data.reference.length < 4) {
        setFieldError("reference", "Agrega un punto de referencia.");
        valid = false;
      }
      if (!data.payment) {
        setFieldError("payment", "Selecciona un método de pago.");
        valid = false;
      }

      return { valid, data };
    }

    function buildWhatsAppMessage(customer) {
      const totals = getTotals();
      const lines = ["Hola, quiero hacer este pedido:", ""];

      state.cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        const variant = item.variant ? ` (${item.variantLabel}: ${item.variant})` : "";
        lines.push(`${index + 1}. ${item.name}${variant}`);
        lines.push(`   Cantidad: ${item.quantity} | Subtotal: ${money(subtotal)}`);
      });

      lines.push("");
      lines.push(`Total: ${money(totals.total)}`);
      lines.push("");
      lines.push("Datos del cliente:");
      lines.push(`Nombre: ${customer.name}`);
      lines.push(`Teléfono: ${customer.phone}`);
      lines.push(`Zona/Dirección: ${customer.zone}`);
      lines.push(`Referencia: ${customer.reference}`);
      lines.push(`Método de pago: ${customer.payment}`);
      if (customer.comment) lines.push(`Comentario: ${customer.comment}`);

      return lines.join("\n");
    }

    function sendOrder() {
      if (!state.cart.length) {
        showToast("Tu carrito está vacío.", "⚠️");
        return;
      }

      const check = validateForm();
      if (!check.valid) {
        showToast("Revisa los campos marcados antes de enviar.", "❌");
        return;
      }

      const message = buildWhatsAppMessage(check.data);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener");
    }

    function handleScroll() {
      if (window.scrollY > 20) {
        refs.navbar.classList.add("scrolled");
      } else {
        refs.navbar.classList.remove("scrolled");
      }
    }

    function registerReveal(scope = document) {
      const selectors = ".reveal-up:not([data-reveal]), .reveal-scale:not([data-reveal])";
      scope.querySelectorAll(selectors).forEach(node => {
        node.dataset.reveal = "1";
        if (reduceMotion.matches) {
          node.classList.add("visible");
        } else if (revealObserver) {
          revealObserver.observe(node);
        }
      });
    }

    function bindEvents() {
      refs.categoryTabs.addEventListener("click", event => {
        const target = event.target.closest("button[data-category]");
        if (!target) return;
        state.category = target.dataset.category;
        renderCategoryTabs();
        renderProducts();
      });

      refs.productsGrid.addEventListener("click", event => {
        const btn = event.target.closest("button[data-action='add']");
        if (!btn) return;
        addProduct(Number(btn.dataset.productId));
      });

      refs.cartItems.addEventListener("click", event => {
        const btn = event.target.closest("button[data-action]");
        if (!btn) return;
        const lineKey = decodeURIComponent(btn.dataset.lineKey || "");
        if (btn.dataset.action === "inc") updateLineQuantity(lineKey, 1);
        if (btn.dataset.action === "dec") updateLineQuantity(lineKey, -1);
        if (btn.dataset.action === "remove") removeLine(lineKey);
      });

      [refs.navCartBtn, refs.cartFab, refs.heroOrderBtn, refs.ctaOrderBtn].forEach(button => {
        button.addEventListener("click", openCart);
      });

      refs.heroMenuBtn.addEventListener("click", () => {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      refs.closeCartBtn.addEventListener("click", closeCart);
      refs.cartOverlay.addEventListener("click", closeCart);
      refs.clearCartBtn.addEventListener("click", clearCart);
      refs.sendOrderBtn.addEventListener("click", sendOrder);

      refs.orderForm.addEventListener("input", event => {
        const field = event.target.name;
        if (field) clearFieldError(field);
      });

      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && refs.cartPanel.classList.contains("open")) {
          closeCart();
        }
      });

      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    function init() {
      loadCart();
      renderCategoryTabs();
      renderProducts();
      renderCartItems();
      updateCartBadges();
      handleScroll();

      if (!reduceMotion.matches) {
        revealObserver = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          });
        }, { threshold: 0.15 });
      }

      registerReveal(document);
      bindEvents();
    }

    init();
  })();