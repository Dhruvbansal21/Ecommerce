// product.js - lightweight product detail renderer
(function(){
  'use strict';

  // Small product dataset fallback: if user clicked from listing we store the product details in sessionStorage
  function getQueryParam(name){
    var m = location.search.match(new RegExp('[?&]'+name+'=([^&]+)'));
    return m?decodeURIComponent(m[1]):null;
  }

  function readSessionProduct(id){
    try{ var raw = sessionStorage.getItem('lastProduct_'+id); return raw?JSON.parse(raw):null;}catch(e){return null}
  }

  function formatCurrency(v){ try{return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(v);}catch(e){return '₹'+v}}

  function render(product){
    if(!product) return;
    var img = document.getElementById('p-image');
    var title = document.getElementById('p-title');
    var price = document.getElementById('p-price');
    var old = document.getElementById('p-old');
    var desc = document.getElementById('p-desc');
    var ratings = document.getElementById('p-ratings');
    var reviews = document.getElementById('reviews-list');

    img.src = product.image || product.img || '';
    img.alt = product.title || product.name || '';
    title.textContent = product.title || product.name || '';
    price.firstChild && price.firstChild.nodeValue && (price.firstChild.nodeValue = '');
    price.innerHTML = formatCurrency(product.price || 0) + (product.oldPrice?(' <span id="p-old" class="old">'+formatCurrency(product.oldPrice)+'</span>'):'');
    desc.textContent = product.description || product.desc || 'No description available.';
    
    // Format rating as stars
    function formatRatingStars(rating) {
      if (!rating || isNaN(rating)) return '<div class="star-rating">☆☆☆☆☆</div><span class="rating-number">N/A</span>';
      const fullStars = Math.floor(rating);
      const decimal = rating - fullStars;
      let stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
      return `<div class="star-rating">${stars}</div><span class="rating-number">(${rating})</span>`;
    }
    
    ratings.innerHTML = formatRatingStars(product.rating);

    // Reviews: merge catalog reviews with saved reviews in localStorage
    var storageKey = 'product_reviews_' + (product.id || ('prod_' + (product.title||'').replace(/\s+/g,'_')));
    function loadSavedReviews(){
      try{ var raw = localStorage.getItem(storageKey); return raw?JSON.parse(raw):[]; }catch(e){return []}
    }

    function saveReviewToStorage(review){
      try{ var arr = loadSavedReviews(); arr.unshift(review); localStorage.setItem(storageKey, JSON.stringify(arr)); return true;}catch(e){return false}
    }

    function renderReviews(){
      var saved = loadSavedReviews();
      var combined = (product.reviews || []).slice().concat(saved);
      if(combined.length === 0){ reviews.textContent = 'No reviews yet.'; return; }
      reviews.innerHTML = combined.map(function(r){ return '<div style="margin-bottom:8px"><strong>'+ (r.user||'User') +'</strong> <span style="color:#ff7e00">'+ (r.rating?(' — '+r.rating+'★'):'') +'</span><div>'+ (r.text||'') +'</div></div>'; }).join('');
    }

    renderReviews();

    // variant controls (sizes only)
    var sizeButtons = document.getElementById('size-buttons');
    var stockInfo = document.getElementById('stock-info');
    var selectedSize = null;

    function populateSizeButtons(){
      sizeButtons.innerHTML = '';
      var sizes = (product.variants && product.variants.sizes) || ['S','M','L','XL','XXL'];
      sizes.forEach(function(sz){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        btn.style.cssText = 'padding:8px 12px;border:1px solid #ccc;border-radius:6px;background:#fff;font-weight:700';
        btn.textContent = sz;
        btn.dataset.size = sz;
        btn.addEventListener('click', function(){
          // toggle active style
          Array.prototype.slice.call(sizeButtons.querySelectorAll('button')).forEach(function(b){ b.style.background = '#fff'; b.style.color=''; });
          btn.style.background = '#ff6b00'; btn.style.color = '#fff';
          selectedSize = sz;
          updateStockDisplay();
        });
        sizeButtons.appendChild(btn);
      });
      // preselect first size
      var first = sizeButtons.querySelector('button');
      if(first){ first.click(); }
    }

    function updateStockDisplay(){
      var s = selectedSize || ((product.variants && product.variants.sizes && product.variants.sizes[0]) || 'S');
      var key = s;
      var stock = (product.variants && product.variants.stock && (product.variants.stock[key] || 0)) || 0;
      
      if(stock > 0){
        stockInfo.style.display = '';
        stockInfo.textContent = 'In stock: ' + stock;
      } else {
        stockInfo.style.display = '';
        stockInfo.textContent = 'Out of stock';
      }
      // Don't disable the cart button - let the add to cart function handle it
      return stock;
    }

    // hook buttons
    var wishBtn = document.getElementById('btn-wish');

    populateSizeButtons();

    if(wishBtn){
      wishBtn.addEventListener('click', function(){
        try{
          var chosenSize = selectedSize || (product.variants && product.variants.sizes && product.variants.sizes[0]) || 'S';
          var id = (product.id || (product.name||product.title)) + '|' + chosenSize;
          var list = JSON.parse(localStorage.getItem('wishlist')||'[]');
          if(!list.find(function(it){return it.id===id})){ 
            list.push({
              id:id,
              title:product.title||product.name,
              price:product.price||0,
              image:product.image||product.img,
              variant:{size:chosenSize},
              createdAt:new Date().toISOString()
            }); 
            localStorage.setItem('wishlist',JSON.stringify(list)); 
            wishBtn.textContent='Saved'; 
            setTimeout(function(){wishBtn.textContent='Add to wishlist'},800); 
          }
        }catch(e){console.error(e)}
      });
    }

    // --- Review form handling ---
    var reviewName = document.getElementById('review-name');
    var reviewRating = document.getElementById('review-rating');
    var reviewText = document.getElementById('review-text');
    var reviewSubmit = document.getElementById('review-submit');
    var reviewFeedback = document.getElementById('review-feedback');

    if(reviewSubmit){
      reviewSubmit.addEventListener('click', function(){
        var name = (reviewName && reviewName.value.trim()) || 'Anonymous';
        var rating = Number((reviewRating && reviewRating.value) || 5);
        var text = (reviewText && reviewText.value.trim()) || '';
        if(!text){ alert('Please enter a short review.'); return; }
        var rv = { user: name, rating: rating, text: text, createdAt: new Date().toISOString() };
        var ok = saveReviewToStorage(rv);
        if(ok){
          // clear form and re-render
          if(reviewText) reviewText.value = '';
          if(reviewName) reviewName.value = '';
          if(reviewFeedback){ reviewFeedback.style.display = 'inline'; setTimeout(function(){ reviewFeedback.style.display='none'; },1200); }
          renderReviews();
        } else {
          alert('Could not save your review.');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var id = getQueryParam('id');
    var product = null;
    // Prefer catalog entry when available (supports deep link)
    if(id && window.PRODUCTS && window.PRODUCTS[id]){
      product = window.PRODUCTS[id];
    } else if(id){
      product = readSessionProduct(id);
    }
    // Fallback: if nothing in sessionStorage, try to derive from URL hash (e.g., name) or show placeholder
    if(!product){
      product = {
        id: id || 'unknown',
        title: 'Product details not available',
        price: 0,
        description: 'Product information was not found. Please open the product from the listing page so details are passed through.'
      };
    }
    
    render(product);
    setupSimpleAddToCart(product);
  });
  
  // Simple add to cart function that mimics listing page behavior
  function setupSimpleAddToCart(product){
    var cartBtn = document.getElementById('btn-addcart');
    
    if(!cartBtn) return;
    
    // Enable the button (it might be disabled by stock check)
    cartBtn.disabled = false;
    
    cartBtn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      
      try {
        var name = String(product.title || product.name || '').trim();
        var imageSrc = String(product.image || product.img || '').trim();
        var price = product.price || 0;
        
        // Generate ID exactly like cart.js does
        var id = name.toLowerCase() + '|' + imageSrc.toLowerCase();
        
        // Read cart
        var cart = [];
        try {
          var raw = localStorage.getItem('cartItems');
          if (raw) {
            cart = JSON.parse(raw);
          }
        } catch(e) {
          cart = [];
        }
        
        // Find existing item
        var existing = cart.find(function(it) { return it.id === id; });
        
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            id: id,
            name: name,
            price: price,
            image: imageSrc,
            quantity: 1
          });
        }
        
        // Save cart
        localStorage.setItem('cartItems', JSON.stringify(cart));
        
        // Show feedback
        var originalText = cartBtn.textContent;
        var currentItem = cart.find(function(it) { return it.id === id; });
        var totalQuantity = currentItem ? currentItem.quantity : 1;
        
        cartBtn.disabled = true;
        if (totalQuantity === 1) {
          cartBtn.textContent = '1 product added';
        } else {
          cartBtn.textContent = totalQuantity + ' products added';
        }
        
        setTimeout(function() {
          cartBtn.disabled = false;
          cartBtn.textContent = originalText;
        }, 1500);
        
      } catch(e) {
        console.error('Error in add to cart:', e);
        alert('Error adding to cart: ' + e.message);
      }
    });
  }

})();