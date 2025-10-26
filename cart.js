/*
  Cart module for listing and cart pages (vanilla JS, localStorage persistence)

  Assumptions about HTML structure on product listing pages (e.g., Saree page):
  - Each product card uses class `.product`
  - Inside each `.product`:
      .product-name   -> element containing the product name (text)
      .product-price  -> element containing the product price (text, e.g., "₹1,499" or "1499")
      .product-image  -> <img> element with the product image src
      .add-to-cart    -> button to add this product to the cart

  Assumptions about HTML structure on the Shopping Cart page:
  - A container (div) with id `cart-items` where cart item rows will be rendered
  - An element (span/div) with id `cart-total` where the grand total will be shown

  Example minimal cart page body:
    <div id="cart-items"></div>
    <div class="cart-summary">
      <span>Total Cost:</span>
      <span id="cart-total"></span>
    </div>
*/

(function () {
  "use strict";

  // ---------- Configuration ----------
  var STORAGE_KEY = "cartItems"; // localStorage key

  // ---------- Utilities ----------
  function readCartFromStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCartToStorage(cartItems) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }

  function sanitizePriceText(text) {
    if (typeof text !== "string") return 0;
    // Remove currency symbols, commas, and spaces
    var cleaned = text.replace(/[^0-9.]/g, "");
    var value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
  }

  // Extract only the first currency-like amount from a text block (e.g., "₹1,169 ₹1,299")
  function extractFirstPrice(text) {
    if (typeof text !== "string") return 0;
    // Match formats like ₹1,169.50 or 1,169 or 699 or Rs. 699
    var match = text.match(/(?:₹|Rs\.?\s*)?([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/);
    if (!match) return 0;
    return sanitizePriceText(match[0]);
  }

  function formatCurrency(value) {
    // Formats as INR by default; fallback to plain number if Intl not available
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
    } catch (e) {
      return "₹" + (Math.round(value * 100) / 100).toFixed(2);
    }
  }

  function generateItemId(name, imageSrc) {
    // A stable key per product: name + image path
    return String(name || "").trim().toLowerCase() + "|" + String(imageSrc || "").trim().toLowerCase();
  }

  // ---------- Cart core operations ----------
  function addItemToCart(newItem) {
    var cart = readCartFromStorage();
    var existing = cart.find(function (it) { return it.id === newItem.id; });
    if (existing) {
      existing.quantity += newItem.quantity;
    } else {
      cart.push(newItem);
    }
    saveCartToStorage(cart);
    return cart;
  }

  function updateItemQuantity(itemId, newQuantity) {
    var cart = readCartFromStorage();
    var index = cart.findIndex(function (it) { return it.id === itemId; });
    if (index === -1) return cart;
    if (newQuantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = newQuantity;
    }
    saveCartToStorage(cart);
    return cart;
  }

  function removeItemFromCart(itemId) {
    var cart = readCartFromStorage();
    var next = cart.filter(function (it) { return it.id !== itemId; });
    saveCartToStorage(next);
    return next;
  }

  function calculateCartTotal(cart) {
    return cart.reduce(function (sum, it) { return sum + it.price * it.quantity; }, 0);
  }

  // ---------- Listing page: wire up Add to Cart buttons ----------
  function initializeListingAddToCartHandlers() {
    // Support multiple product card structures: `.product`, `.product-card`, `.card`, and `.pro`
    var productCards = document.querySelectorAll(".product, .product-card, .card, .pro");
    if (!productCards || productCards.length === 0) return;

    productCards.forEach(function (card) {
      // Look for various button class names
      var addBtn = card.querySelector(".add-to-cart, .card-btn, .cart-btn");
      if (!addBtn) return;

      addBtn.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default link behavior
        e.stopPropagation(); // Prevent event bubbling
        
        var nameEl = card.querySelector(".product-name, .card-title, .des h5");
        var priceEl = card.querySelector(".product-price, .card-price, .des h4");
        var imgEl = card.querySelector(".product-image, img");

        // Derive name: prefer specific name elements, else first span inside `.product-info`, else img alt
        var name = "";
        if (nameEl && nameEl.textContent) {
          name = nameEl.textContent.trim();
        } else {
          var infoSpan = card.querySelector(".product-info span");
          if (infoSpan && infoSpan.textContent) {
            name = infoSpan.textContent.trim();
          } else if (imgEl && imgEl.getAttribute("alt")) {
            name = imgEl.getAttribute("alt").trim();
          }
        }

        // Derive price: prefer specific price elements, else use FIRST amount in `.price-section` (ignores old-price)
        var priceText = "0";
        if (priceEl && priceEl.textContent) {
          priceText = priceEl.textContent.trim();
        } else {
          var priceContainer = card.querySelector(".price-section");
          if (priceContainer && priceContainer.textContent) {
            var first = extractFirstPrice(priceContainer.textContent.trim());
            priceText = String(first);
          }
        }
        var price = sanitizePriceText(priceText);
        var imageSrc = imgEl && imgEl.getAttribute("src") ? imgEl.getAttribute("src") : "";

        if (!name || !price) {
          // If essential fields are missing, do not add
          console.log("Missing required fields:", { name: name, price: price });
          return;
        }

        var id = generateItemId(name, imageSrc);
        addItemToCart({
          id: id,
          name: name,
          price: price,
          image: imageSrc,
          quantity: 1
        });

        // Show quantity feedback
        try {
          // Handle both button and anchor elements
          if (addBtn.tagName === 'BUTTON') {
            addBtn.disabled = true;
          } else {
            addBtn.style.pointerEvents = 'none';
            addBtn.style.opacity = '0.6';
          }
          
          var originalText = addBtn.textContent;
          
          // Get current cart to show proper quantity
          var currentCart = readCartFromStorage();
          var currentItem = currentCart.find(function (it) { return it.id === id; });
          var totalQuantity = currentItem ? currentItem.quantity : 1;
          
          if (totalQuantity === 1) {
            addBtn.textContent = "1 product added";
          } else {
            addBtn.textContent = totalQuantity + " products added";
          }
          
          setTimeout(function () {
            if (addBtn.tagName === 'BUTTON') {
              addBtn.disabled = false;
            } else {
              addBtn.style.pointerEvents = 'auto';
              addBtn.style.opacity = '1';
            }
            addBtn.textContent = originalText;
          }, 1500);
        } catch (e) {}
      });
    });
  }

  // ---------- Cart page: render and wire quantity controls ----------
  function renderCartPageIfPresent() {
    var itemsContainer = document.getElementById("cart-items");
    var totalEl = document.getElementById("cart-total");
    if (!itemsContainer || !totalEl) return; // Not on the cart page

    function render() {
      var cart = readCartFromStorage();
      
      // Debug: Log the cart data
      console.log("Cart data:", cart);

      // Clear container
      itemsContainer.innerHTML = "";

      if (cart.length === 0) {
        itemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
        totalEl.textContent = formatCurrency(0);
        return;
      }

      cart.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "cart-row";

        // Item image
        var img = document.createElement("img");
        img.className = "cart-item-image";
        img.alt = item.name;
        img.src = item.image || "";

        // Item name
        var nameDiv = document.createElement("div");
        nameDiv.className = "cart-item-name";
        nameDiv.textContent = item.name;

        // Unit price
        var priceDiv = document.createElement("div");
        priceDiv.className = "cart-item-price";
        priceDiv.textContent = formatCurrency(item.price);

        // Quantity controls
        var qtyWrapper = document.createElement("div");
        qtyWrapper.className = "cart-item-qty";

        var minusBtn = document.createElement("button");
        minusBtn.className = "qty-decrease";
        minusBtn.textContent = "-";
        minusBtn.type = "button";

        var qtySpan = document.createElement("span");
        qtySpan.className = "qty-value";
        qtySpan.textContent = String(item.quantity);
        
        // Debug: Log the quantity to see what's happening
        console.log("Rendering quantity for item:", item.name, "Quantity:", item.quantity);

        var plusBtn = document.createElement("button");
        plusBtn.className = "qty-increase";
        plusBtn.textContent = "+";
        plusBtn.type = "button";

        qtyWrapper.appendChild(minusBtn);
        qtyWrapper.appendChild(qtySpan);
        qtyWrapper.appendChild(plusBtn);

        // Per-item total
        var lineTotalDiv = document.createElement("div");
        lineTotalDiv.className = "cart-item-total";
        lineTotalDiv.textContent = formatCurrency(item.price * item.quantity);

        // Remove button (for convenience)
        var removeBtn = document.createElement("button");
        removeBtn.className = "cart-item-remove";
        removeBtn.textContent = "Remove";

        // Put together
        row.appendChild(img);
        row.appendChild(nameDiv);
        row.appendChild(priceDiv);
        row.appendChild(qtyWrapper);
        row.appendChild(lineTotalDiv);
        row.appendChild(removeBtn);

        // Wire events
        plusBtn.addEventListener("click", function () {
          var nextQty = item.quantity + 1;
          var updated = updateItemQuantity(item.id, nextQty);
          // Update UI immediately
          item.quantity = nextQty;
          qtySpan.textContent = String(item.quantity);
          lineTotalDiv.textContent = formatCurrency(item.price * item.quantity);
          totalEl.textContent = formatCurrency(calculateCartTotal(updated));
        });

        minusBtn.addEventListener("click", function () {
          var nextQty = item.quantity - 1;
          if (nextQty <= 0) {
            removeItemFromCart(item.id);
            row.remove();
            var cartAfterRemoval = readCartFromStorage();
            if (cartAfterRemoval.length === 0) {
              itemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
            }
            totalEl.textContent = formatCurrency(calculateCartTotal(cartAfterRemoval));
            return;
          }

          var updated = updateItemQuantity(item.id, nextQty);
          item.quantity = nextQty;
          qtySpan.textContent = String(item.quantity);
          lineTotalDiv.textContent = formatCurrency(item.price * item.quantity);
          totalEl.textContent = formatCurrency(calculateCartTotal(updated));
        });

        removeBtn.addEventListener("click", function () {
          removeItemFromCart(item.id);
          row.remove();
          var cartAfterRemoval = readCartFromStorage();
          if (cartAfterRemoval.length === 0) {
            itemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
          }
          totalEl.textContent = formatCurrency(calculateCartTotal(cartAfterRemoval));
        });

        itemsContainer.appendChild(row);
      });

      totalEl.textContent = formatCurrency(calculateCartTotal(readCartFromStorage()));
    }

    render();
  }

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", function () {
    initializeListingAddToCartHandlers();
    renderCartPageIfPresent();
  });
})();


