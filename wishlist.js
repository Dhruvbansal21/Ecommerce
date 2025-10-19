/**
 * Wishlist Application - Pure Vanilla JavaScript
 * Features: CRUD operations, localStorage persistence, search, sort, animations
 */

class WishlistApp {
    constructor() {
        this.wishlist = this.loadFromStorage();
        this.currentEditId = null;
        this.searchTerm = '';
        this.sortBy = 'newest';
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
        this.loadPreferences();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Add item button
        document.getElementById('addItemBtn').addEventListener('click', () => this.openModal());
        
        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('itemForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });
        
        // Sort functionality
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.savePreferences();
            this.render();
        });
        
        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => this.confirmClearAll());
        
        // Confirmation modal
        document.getElementById('confirmCancel').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirmDelete').addEventListener('click', () => this.handleConfirmDelete());
        
        // Close modals when clicking outside
        document.getElementById('itemModal').addEventListener('click', (e) => {
            if (e.target.id === 'itemModal') this.closeModal();
        });
        
        document.getElementById('confirmModal').addEventListener('click', (e) => {
            if (e.target.id === 'confirmModal') this.closeConfirmModal();
        });
    }

    /**
     * Generate unique ID for items
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Load wishlist from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('wishlist');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
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
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        try {
            const sortPref = localStorage.getItem('wishlist_sort');
            if (sortPref) {
                this.sortBy = sortPref;
                document.getElementById('sortSelect').value = sortPref;
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem('wishlist_sort', this.sortBy);
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    /**
     * Open modal for adding/editing items
     */
    openModal(item = null) {
        const modal = document.getElementById('itemModal');
        const form = document.getElementById('itemForm');
        const title = document.getElementById('modalTitle');
        
        if (item) {
            // Edit mode
            this.currentEditId = item.id;
            title.textContent = 'Edit Item';
            document.getElementById('itemTitle').value = item.title;
            document.getElementById('itemLink').value = item.link || '';
            document.getElementById('itemPrice').value = item.price || '';
            document.getElementById('itemImage').value = item.image || '';
            document.getElementById('itemNote').value = item.note || '';
        } else {
            // Add mode
            this.currentEditId = null;
            title.textContent = 'Add New Item';
            form.reset();
        }
        
        modal.classList.add('show');
        document.getElementById('itemTitle').focus();
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('itemModal');
        modal.classList.remove('show');
        this.currentEditId = null;
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const itemData = {
            title: formData.get('title').trim(),
            link: formData.get('link').trim(),
            price: formData.get('price') ? parseFloat(formData.get('price')) : null,
            image: formData.get('image').trim(),
            note: formData.get('note').trim()
        };

        // Validate required fields
        if (!itemData.title) {
            alert('Item name is required!');
            return;
        }

        if (this.currentEditId) {
            // Update existing item
            this.updateItem(this.currentEditId, itemData);
        } else {
            // Add new item
            this.addItem(itemData);
        }
        
        this.closeModal();
    }

    /**
     * Add new item to wishlist
     */
    addItem(itemData) {
        const newItem = {
            id: this.generateId(),
            ...itemData,
            purchased: false,
            createdAt: new Date().toISOString()
        };
        
        this.wishlist.unshift(newItem); // Add to beginning
        this.saveToStorage();
        this.render();
        this.updateStats();
        this.showSuccessAnimation();
    }

    /**
     * Update existing item
     */
    updateItem(id, itemData) {
        const index = this.wishlist.findIndex(item => item.id === id);
        if (index !== -1) {
            this.wishlist[index] = { ...this.wishlist[index], ...itemData };
            this.saveToStorage();
            this.render();
        }
    }

    /**
     * Delete item with confirmation
     */
    deleteItem(id) {
        this.pendingDeleteId = id;
        this.showConfirmModal(
            'Delete Item',
            'Are you sure you want to delete this item? This action cannot be undone.',
            'Delete'
        );
    }

    /**
     * Toggle purchased status
     */
    togglePurchased(id) {
        const item = this.wishlist.find(item => item.id === id);
        if (item) {
            item.purchased = !item.purchased;
            this.saveToStorage();
            this.render();
            this.updateStats();
        }
    }

    /**
     * Show confirmation modal
     */
    showConfirmModal(title, message, confirmText) {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmDelete').textContent = confirmText;
        modal.classList.add('show');
    }

    /**
     * Close confirmation modal
     */
    closeConfirmModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('show');
        this.pendingDeleteId = null;
    }

    /**
     * Handle confirmed deletion
     */
    handleConfirmDelete() {
        if (this.pendingDeleteId) {
            this.wishlist = this.wishlist.filter(item => item.id !== this.pendingDeleteId);
            this.saveToStorage();
            this.render();
            this.updateStats();
        }
        this.closeConfirmModal();
    }

    /**
     * Confirm clear all items
     */
    confirmClearAll() {
        if (this.wishlist.length === 0) return;
        
        this.showConfirmModal(
            'Clear Wishlist',
            `Are you sure you want to delete all ${this.wishlist.length} items? This action cannot be undone.`,
            'Clear All'
        );
        
        // Override the confirm delete handler for clear all
        const originalHandler = this.handleConfirmDelete;
        this.handleConfirmDelete = () => {
            this.wishlist = [];
            this.saveToStorage();
            this.render();
            this.updateStats();
            this.closeConfirmModal();
            this.handleConfirmDelete = originalHandler; // Restore original handler
        };
    }

    /**
     * Filter and sort items
     */
    getFilteredAndSortedItems() {
        let filtered = this.wishlist;
        
        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(this.searchTerm) ||
                (item.note && item.note.toLowerCase().includes(this.searchTerm))
            );
        }
        
        // Apply sorting
        switch (this.sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'price-low':
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'name':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        return filtered;
    }

    /**
     * Render wishlist items
     */
    render() {
        const container = document.getElementById('wishlistContainer');
        const emptyState = document.getElementById('emptyState');
        const clearSection = document.getElementById('clearSection');
        
        const items = this.getFilteredAndSortedItems();
        
        if (items.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = this.wishlist.length === 0 ? 'block' : 'none';
            clearSection.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        clearSection.style.display = this.wishlist.length > 0 ? 'block' : 'none';
        
        container.innerHTML = items.map(item => this.createItemCard(item)).join('');
        
        // Bind event listeners for item actions
        this.bindItemEvents();
    }

    /**
     * Create HTML for item card
     */
    createItemCard(item) {
        const priceDisplay = item.price ? `₹${item.price.toFixed(2)}` : '';
        const linkDisplay = item.link ? `<a href="${item.link}" target="_blank" class="item-link">${this.truncateUrl(item.link)}</a>` : '';
        const noteDisplay = item.note ? `<div class="item-note">${this.escapeHtml(item.note)}</div>` : '';
        const purchasedLabel = item.purchased ? '<div class="purchased-label">✅ Purchased</div>' : '';
        
        // Add product image if available
        const imageDisplay = item.image ? `
            <div class="item-image-container">
                <img src="${item.image}" alt="${item.imageAlt || item.title}" class="item-image" />
            </div>
        ` : '';
        
        return `
            <div class="item-card ${item.purchased ? 'purchased' : ''}" data-id="${item.id}">
                ${purchasedLabel}
                ${imageDisplay}
                <div class="item-content">
                    <div class="item-title">${this.escapeHtml(item.title)}</div>
                    ${linkDisplay}
                    ${priceDisplay ? `<div class="item-price">${priceDisplay}</div>` : ''}
                    ${noteDisplay}
                    <div class="item-actions">
                        <button class="btn edit-btn" data-action="edit" data-id="${item.id}">
                            ✏️ Edit
                        </button>
                        <button class="btn ${item.purchased ? 'purchase-btn' : 'purchase-btn'}" data-action="toggle" data-id="${item.id}">
                            ${item.purchased ? '↩️ Undo' : '✅ Mark Purchased'}
                        </button>
                        <button class="btn delete-btn" data-action="delete" data-id="${item.id}">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind event listeners for item actions
     */
    bindItemEvents() {
        const container = document.getElementById('wishlistContainer');
        
        container.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const id = e.target.dataset.id;
            
            // Handle image clicks
            if (e.target.classList.contains('item-image')) {
                this.showImageModal(e.target.src, e.target.alt);
                return;
            }
            
            if (!action || !id) return;
            
            switch (action) {
                case 'edit':
                    const item = this.wishlist.find(item => item.id === id);
                    if (item) this.openModal(item);
                    break;
                case 'delete':
                    this.deleteItem(id);
                    break;
                case 'toggle':
                    this.togglePurchased(id);
                    break;
            }
        });
    }

    /**
     * Show image in modal
     */
    showImageModal(imageSrc, imageAlt) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="image-close-btn">&times;</button>
                <img src="${imageSrc}" alt="${imageAlt}" class="modal-image" />
            </div>
        `;
        
        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = modal.querySelector('.image-modal-content');
        content.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        `;
        
        const closeBtn = modal.querySelector('.image-close-btn');
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        `;
        
        const img = modal.querySelector('.modal-image');
        img.style.cssText = `
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
        `;
        
        document.body.appendChild(modal);
        
        // Close handlers
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    /**
     * Update statistics
     */
    updateStats() {
        const totalItems = this.wishlist.length;
        const purchasedItems = this.wishlist.filter(item => item.purchased).length;
        
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('purchasedItems').textContent = purchasedItems;
    }

    /**
     * Show success animation
     */
    showSuccessAnimation() {
        const animation = document.getElementById('successAnimation');
        animation.classList.add('show');
        
        setTimeout(() => {
            animation.classList.remove('show');
        }, 2000);
    }

    /**
     * Utility function to escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Utility function to truncate URLs
     */
    truncateUrl(url, maxLength = 50) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WishlistApp();
});

// Add some CSS for smooth transitions
const style = document.createElement('style');
style.textContent = `
    .item-card {
        animation: slideInUp 0.3s ease;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .item-card.removing {
        animation: slideOutDown 0.3s ease forwards;
    }
    
    @keyframes slideOutDown {
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
`;
document.head.appendChild(style);
