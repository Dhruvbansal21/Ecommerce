// // Universal search functionality for all pages
// (function() {
//   'use strict';

//   // Search modal HTML
//   const searchModalHTML = `
//     <div id="search-modal" class="search-modal" style="display: none;">
//       <div class="search-modal-content">
//         <div class="search-header">
//           <input type="text" id="search-input" placeholder="Search products..." autocomplete="off">
//           <button id="search-close" class="search-close">&times;</button>
//         </div>
//         <div class="search-results" id="search-results">
//           <div class="search-placeholder">
//             <i class='bx bx-search'></i>
//             <p>Start typing to search products...</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   `;

//   // Search modal CSS
//   const searchModalCSS = `
//     .search-modal {
//       position: fixed;
//       top: 0;
//       left: 0;
//       width: 100%;
//       height: 100%;
//       background: rgba(0, 0, 0, 0.8);
//       backdrop-filter: blur(5px);
//       z-index: 10000;
//       display: flex;
//       align-items: flex-start;
//       justify-content: center;
//       padding-top: 100px;
//     }

//     .search-modal-content {
//       background: white;
//       border-radius: 12px;
//       width: 90%;
//       max-width: 600px;
//       max-height: 70vh;
//       overflow: hidden;
//       box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
//       animation: slideDown 0.3s ease;
//     }

//     @keyframes slideDown {
//       from {
//         opacity: 0;
//         transform: translateY(-20px);
//       }
//       to {
//         opacity: 1;
//         transform: translateY(0);
//       }
//     }

//     .search-header {
//       display: flex;
//       align-items: center;
//       padding: 20px;
//       border-bottom: 1px solid #eee;
//       background: #f8f9fa;
//     }

//     #search-input {
//       flex: 1;
//       border: none;
//       outline: none;
//       font-size: 18px;
//       padding: 12px 16px;
//       border-radius: 8px;
//       background: white;
//       border: 2px solid #e1e5e9;
//       transition: border-color 0.3s;
//     }

//     #search-input:focus {
//       border-color: #FF416C;
//     }

//     .search-close {
//       background: none;
//       border: none;
//       font-size: 24px;
//       color: #666;
//       cursor: pointer;
//       padding: 8px;
//       margin-left: 10px;
//       border-radius: 50%;
//       transition: background 0.3s;
//     }

//     .search-close:hover {
//       background: #f0f0f0;
//     }

//     .search-results {
//       max-height: 400px;
//       overflow-y: auto;
//       padding: 0;
//     }

//     .search-placeholder {
//       text-align: center;
//       padding: 40px 20px;
//       color: #666;
//     }

//     .search-placeholder i {
//       font-size: 48px;
//       color: #ddd;
//       margin-bottom: 16px;
//     }

//     .search-item {
//       display: flex;
//       align-items: center;
//       padding: 16px 20px;
//       border-bottom: 1px solid #f0f0f0;
//       cursor: pointer;
//       transition: background 0.2s;
//     }

//     .search-item:hover {
//       background: #f8f9fa;
//     }

//     .search-item img {
//       width: 60px;
//       height: 60px;
//       object-fit: cover;
//       border-radius: 8px;
//       margin-right: 16px;
//     }

//     .search-item-info {
//       flex: 1;
//     }

//     .search-item-title {
//       font-weight: 600;
//       color: #333;
//       margin-bottom: 4px;
//     }

//     .search-item-price {
//       color: #FF416C;
//       font-weight: 600;
//     }

//     .search-item-brand {
//       color: #666;
//       font-size: 14px;
//     }

//     .no-results {
//       text-align: center;
//       padding: 40px 20px;
//       color: #666;
//     }

//     .no-results i {
//       font-size: 48px;
//       color: #ddd;
//       margin-bottom: 16px;
//     }
//   `;

//   // Add CSS to head
//   function addSearchCSS() {
//     if (document.getElementById('search-modal-css')) return;
//     const style = document.createElement('style');
//     style.id = 'search-modal-css';
//     style.textContent = searchModalCSS;
//     document.head.appendChild(style);
//   }

//   // Add modal to body
//   function addSearchModal() {
//     if (document.getElementById('search-modal')) return;
//     document.body.insertAdjacentHTML('beforeend', searchModalHTML);
//   }

//   // Get all products from current page using enhanced extraction
//   function getProductsFromPage() {
//     const products = [];
    
//     // Check for different card types
//     const cardSelectors = ['.card', '.pro', '.product-card'];
//     let cards = [];
    
//     for (const selector of cardSelectors) {
//       cards = document.querySelectorAll(selector);
//       if (cards.length > 0) break;
//     }

//     cards.forEach((card, index) => {
//       const product = {
//         id: card.dataset.pid || `product-${index}`,
//         title: '',
//         price: 0,
//         image: '',
//         brand: '',
//         description: '',
//         element: card,
//         searchText: '' // Will be populated with searchable text
//       };

//       // Extract title
//       const titleSelectors = ['.card-title', '.des h5', '.product-info h3', '.product-info span'];
//       for (const selector of titleSelectors) {
//         const titleEl = card.querySelector(selector);
//         if (titleEl) {
//           product.title = titleEl.textContent.trim();
//           break;
//         }
//       }

//       // Extract price
//       const priceSelectors = ['.card-price', '.des h4', '.price-section'];
//       for (const selector of priceSelectors) {
//         const priceEl = card.querySelector(selector);
//         if (priceEl) {
//           const priceText = priceEl.textContent;
//           const priceMatch = priceText.match(/(?:₹|Rs\.?\s*)?([0-9,]+(?:\.[0-9]+)?)/);
//           if (priceMatch) {
//             product.price = Number(priceMatch[1].replace(/,/g, ''));
//           }
//           break;
//         }
//       }

//       // Extract image
//       const img = card.querySelector('img');
//       if (img) {
//         product.image = img.src;
//       }

//       // Extract brand
//       const brandSelectors = ['.des span', '.brand', '.product-info .brand'];
//       for (const selector of brandSelectors) {
//         const brandEl = card.querySelector(selector);
//         if (brandEl) {
//           product.brand = brandEl.textContent.trim();
//           break;
//         }
//       }

//       // Extract description from data attributes or alt text
//       product.description = card.getAttribute('data-description') || 
//                            card.getAttribute('data-design') || 
//                            card.getAttribute('data-fabric') || 
//                            (img ? img.alt : '') || 
//                            '';

//       // Build comprehensive search text (similar to filter.js)
//       const badges = Array.from(card.querySelectorAll('.badge')).map(b => b.textContent).join(' ');
//       const extras = card.getAttribute('data-search-extra') || '';
      
//       product.searchText = normalizeText([
//         product.title,
//         product.brand,
//         product.description,
//         img ? img.alt : '',
//         badges,
//         extras
//       ].join(' '));

//       if (product.title) {
//         products.push(product);
//       }
//     });

//     return products;
//   }

//   // Search products using the same logic as filter.js
//   function searchProducts(query, products) {
//     if (!query.trim()) return products;

//     const searchTerm = normalizeText(query);
//     const tokens = searchTerm.split(/\s+/).filter(Boolean);
    
//     return products.filter(product => {
//       // Use the pre-built searchText for better performance
//       const searchableText = product.searchText || normalizeText([
//         product.title,
//         product.brand,
//         product.id,
//         product.description || ''
//       ].join(' '));

//       // Use the same token-based matching as filter.js
//       return tokens.every(token => searchableText.includes(token));
//     });
//   }

//   // Normalize text function from filter.js
//   function normalizeText(s) {
//     return String(s || '').replace(/\s+/g, ' ').trim()
//       .toLowerCase()
//       .normalize('NFD')
//       .replace(/[\u0300-\u036f]/g, '');
//   }

//   // Render search results
//   function renderSearchResults(results, query) {
//     const resultsContainer = document.getElementById('search-results');
    
//     if (results.length === 0) {
//       resultsContainer.innerHTML = `
//         <div class="no-results">
//           <i class='bx bx-search-alt'></i>
//           <p>No products found for "${query}"</p>
//           <small>Try different keywords or check spelling</small>
//         </div>
//       `;
//       return;
//     }

//     const resultsHTML = results.map(product => `
//       <div class="search-item" data-product-id="${product.id}">
//         <img src="${product.image}" alt="${product.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEOUQ5RDkiLz4KPC9zdmc+Cg=='">
//         <div class="search-item-info">
//           <div class="search-item-title">${product.title}</div>
//           <div class="search-item-brand">${product.brand || 'Brand'}</div>
//           <div class="search-item-price">₹${product.price.toLocaleString('en-IN')}</div>
//         </div>
//       </div>
//     `).join('');

//     resultsContainer.innerHTML = resultsHTML;
//   }

//   // Open search modal
//   function openSearchModal() {
//     const modal = document.getElementById('search-modal');
//     const input = document.getElementById('search-input');
    
//     modal.style.display = 'flex';
//     input.focus();
    
//     // Load products and show all initially
//     const products = getProductsFromPage();
//     renderSearchResults(products, '');
//   }

//   // Close search modal
//   function closeSearchModal() {
//     const modal = document.getElementById('search-modal');
//     const input = document.getElementById('search-input');
    
//     modal.style.display = 'none';
//     input.value = '';
//   }

//   // Handle search input
//   function handleSearchInput() {
//     const input = document.getElementById('search-input');
//     const query = input.value;
//     const products = getProductsFromPage();
//     const results = searchProducts(query, products);
    
//     renderSearchResults(results, query);
//   }

//   // Handle product click
//   function handleProductClick(event) {
//     const searchItem = event.target.closest('.search-item');
//     if (!searchItem) return;

//     const productId = searchItem.dataset.productId;
//     const product = getProductsFromPage().find(p => p.id === productId);
    
//     if (product && product.element) {
//       // Build snapshot for product detail page
//       const snapshot = {
//         id: product.id,
//         title: product.title,
//         price: product.price,
//         image: product.image,
//         description: 'No extended description available. Click to view details.',
//         rating: 4.2,
//         reviews: []
//       };

//       // Store in session storage
//       try {
//         sessionStorage.setItem('lastProduct_' + product.id, JSON.stringify(snapshot));
//       } catch (err) {
//         console.warn('Could not store product data:', err);
//       }

//       // Navigate to product page
//       const currentPath = window.location.pathname;
//       const isHomepage = currentPath.includes('homepage.html');
//       const productPagePath = isHomepage ? '../product.html' : 'product.html';
      
//       window.location.href = `${productPagePath}?id=${encodeURIComponent(product.id)}`;
//     }
//   }

//   // Initialize search functionality
//   function initSearch() {
//     addSearchCSS();
//     addSearchModal();

//     // Bind search icon clicks
//     const searchIcons = document.querySelectorAll('.navicons .bx-search');
//     searchIcons.forEach(icon => {
//       icon.addEventListener('click', openSearchModal);
//     });

//     // Bind modal events
//     const modal = document.getElementById('search-modal');
//     const input = document.getElementById('search-input');
//     const closeBtn = document.getElementById('search-close');
//     const resultsContainer = document.getElementById('search-results');

//     // Close modal events
//     closeBtn.addEventListener('click', closeSearchModal);
//     modal.addEventListener('click', (e) => {
//       if (e.target === modal) closeSearchModal();
//     });

//     // Search input events
//     input.addEventListener('input', handleSearchInput);
//     input.addEventListener('keydown', (e) => {
//       if (e.key === 'Escape') {
//         closeSearchModal();
//       }
//     });

//     // Product click events
//     resultsContainer.addEventListener('click', handleProductClick);

//     // Keyboard navigation
//     input.addEventListener('keydown', (e) => {
//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         const firstItem = resultsContainer.querySelector('.search-item');
//         if (firstItem) firstItem.focus();
//       }
//     });

//     // Focus management for search items
//     resultsContainer.addEventListener('keydown', (e) => {
//       if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
//         e.preventDefault();
//         const items = Array.from(resultsContainer.querySelectorAll('.search-item'));
//         const currentIndex = items.indexOf(document.activeElement);
//         let nextIndex;

//         if (e.key === 'ArrowDown') {
//           nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
//         } else {
//           nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
//         }

//         if (items[nextIndex]) {
//           items[nextIndex].focus();
//         }
//       } else if (e.key === 'Enter') {
//         e.preventDefault();
//         const focusedItem = document.activeElement;
//         if (focusedItem.classList.contains('search-item')) {
//           focusedItem.click();
//         }
//       }
//     });
//   }

//   // Initialize when DOM is ready
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initSearch);
//   } else {
//     initSearch();
//   }

// })();
