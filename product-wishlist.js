/**
 * Product Wishlist Integration
 * Handles adding products to wishlist from product pages
 */

class ProductWishlist {
    constructor() {
        this.wishlist = this.loadFromStorage();
        this.init();
    }

    /**
     * Initialize wishlist functionality
     */
    init() {
        this.bindWishlistEvents();
        this.updateWishlistIcons();
    }

    /**
     * Load wishlist from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('wishlist');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading wishlist from localStorage:', error);
            return [];
        }
    }

    /**
     * Save wishlist to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        } catch (error) {
            console.error('Error saving wishlist to localStorage:', error);
        }
    }

    /**
     * Generate unique ID for items
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Bind wishlist events to heart icons
     */
    bindWishlistEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.wishlist-icon')) {
                e.preventDefault();
                e.stopPropagation();
                
                const wishlistIcon = e.target.closest('.wishlist-icon');
                const productCard = wishlistIcon.closest('.product-card');
                
                if (productCard) {
                    this.toggleWishlistItem(productCard, wishlistIcon);
                }
            }
        });
    }

    /**
     * Toggle item in wishlist
     */
    toggleWishlistItem(productCard, wishlistIcon) {
        const productData = this.extractProductData(productCard);
        const existingItem = this.wishlist.find(item => 
            item.title === productData.title && item.link === productData.link
        );

        if (existingItem) {
            // Remove from wishlist
            this.removeFromWishlist(existingItem.id);
            this.updateWishlistIcon(wishlistIcon, false);
            this.showNotification('Removed from wishlist', 'remove');
        } else {
            // Add to wishlist
            this.addToWishlist(productData);
            this.updateWishlistIcon(wishlistIcon, true);
            this.showNotification('Added to wishlist! 💖', 'add');
        }
    }

    /**
     * Extract product data from product card
     */
    extractProductData(productCard) {
        const titleElement = productCard.querySelector('.product-info span');
        const priceElement = productCard.querySelector('.price-section');
        const imageElement = productCard.querySelector('.product-image');
        
        const title = titleElement ? titleElement.textContent.trim() : 'Unknown Product';
        const price = this.extractPrice(priceElement);
        const image = imageElement ? imageElement.src : '';
        const imageAlt = imageElement ? imageElement.alt : title;
        const link = window.location.href; // Current page as link
        
        return {
            title,
            price,
            image,
            imageAlt,
            link,
            note: `Added from ${document.title}`,
            purchased: false,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Extract price from price element
     */
    extractPrice(priceElement) {
        if (!priceElement) return null;
        
        const priceText = priceElement.textContent;
        const priceMatch = priceText.match(/₹(\d+(?:,\d+)?)/);
        
        if (priceMatch) {
            return parseFloat(priceMatch[1].replace(',', ''));
        }
        
        return null;
    }

    /**
     * Add item to wishlist
     */
    addToWishlist(productData) {
        const newItem = {
            id: this.generateId(),
            ...productData
        };
        
        this.wishlist.unshift(newItem);
        this.saveToStorage();
    }

    /**
     * Remove item from wishlist
     */
    removeFromWishlist(itemId) {
        this.wishlist = this.wishlist.filter(item => item.id !== itemId);
        this.saveToStorage();
    }

    /**
     * Update wishlist icon appearance
     */
    updateWishlistIcon(wishlistIcon, isInWishlist) {
        const svg = wishlistIcon.querySelector('svg path');
        
        if (isInWishlist) {
            wishlistIcon.style.borderColor = '#ff7300';
            wishlistIcon.style.color = '#ff7300';
            if (svg) {
                svg.setAttribute('fill', '#ff7300');
            }
        } else {
            wishlistIcon.style.borderColor = '#999';
            wishlistIcon.style.color = '#999';
            if (svg) {
                svg.setAttribute('fill', 'none');
            }
        }
    }

    /**
     * Update all wishlist icons based on current wishlist
     */
    updateWishlistIcons() {
        const wishlistIcons = document.querySelectorAll('.wishlist-icon');
        
        wishlistIcons.forEach(icon => {
            const productCard = icon.closest('.product-card');
            const productData = this.extractProductData(productCard);
            
            const isInWishlist = this.wishlist.some(item => 
                item.title === productData.title && item.link === productData.link
            );
            
            this.updateWishlistIcon(icon, isInWishlist);
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'add') {
        // Remove existing notification
        const existingNotification = document.querySelector('.wishlist-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'wishlist-notification';
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'add' ? '#27ae60' : '#e74c3c',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: '10000',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }

    /**
     * Check if product is in wishlist
     */
    isInWishlist(productData) {
        return this.wishlist.some(item => 
            item.title === productData.title && item.link === productData.link
        );
    }

    /**
     * Get wishlist count
     */
    getWishlistCount() {
        return this.wishlist.length;
    }

    /**
     * Clear wishlist
     */
    clearWishlist() {
        this.wishlist = [];
        this.saveToStorage();
        this.updateWishlistIcons();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productWishlist = new ProductWishlist();
});

// Add CSS for wishlist notifications
const style = document.createElement('style');
style.textContent = `
    .wishlist-notification {
        animation: slideInRight 0.3s ease;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
    
    .wishlist-icon {
        transition: all 0.3s ease;
    }
    
    .wishlist-icon:hover {
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);
