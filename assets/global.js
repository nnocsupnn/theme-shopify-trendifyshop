// TrendifyShop Theme Global JavaScript

class Theme {
  constructor() {
    this.init();
  }

  init() {
    this.handleMobileMenu();
    this.handleCartDrawer();
    this.handleProductVariants();
    this.handleQuantityButtons();
    this.handleScrollEffects();
  }

  handleMobileMenu() {
    const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-open');
        mobileMenuButton.setAttribute('aria-expanded', 
          mobileMenuButton.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
      });
    }
  }

  handleCartDrawer() {
    // Cart drawer functionality will be added here
    console.log('Cart drawer initialized');
  }

  handleProductVariants() {
    const variantSelectors = document.querySelectorAll('[data-variant-selector]');
    
    variantSelectors.forEach(selector => {
      selector.addEventListener('change', this.updateProductVariant.bind(this));
    });
  }

  updateProductVariant(event) {
    const form = event.target.closest('form');
    const formData = new FormData(form);
    const variants = JSON.parse(form.dataset.productVariants || '[]');
    
    // Find matching variant
    const selectedOptions = Array.from(formData.entries())
      .filter(([key]) => key.startsWith('options['))
      .map(([, value]) => value);
    
    const matchingVariant = variants.find(variant => 
      variant.options.every((option, index) => option === selectedOptions[index])
    );

    if (matchingVariant) {
      this.updatePrice(matchingVariant.price, matchingVariant.compare_at_price);
      this.updateAvailability(matchingVariant.available);
    }
  }

  updatePrice(price, comparePrice) {
    const priceElement = document.querySelector('[data-product-price]');
    const comparePriceElement = document.querySelector('[data-product-compare-price]');
    
    if (priceElement) {
      priceElement.textContent = this.formatMoney(price);
    }
    
    if (comparePriceElement) {
      if (comparePrice && comparePrice > price) {
        comparePriceElement.textContent = this.formatMoney(comparePrice);
        comparePriceElement.style.display = 'inline';
      } else {
        comparePriceElement.style.display = 'none';
      }
    }
  }

  updateAvailability(available) {
    const addToCartButton = document.querySelector('[data-add-to-cart]');
    
    if (addToCartButton) {
      addToCartButton.disabled = !available;
      addToCartButton.textContent = available ? 
        window.variantStrings.addToCart : 
        window.variantStrings.soldOut;
    }
  }

  handleQuantityButtons() {
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-quantity-button]')) {
        const input = event.target.parentNode.querySelector('input[type="number"]');
        const action = event.target.dataset.quantityButton;
        const currentValue = parseInt(input.value) || 0;
        
        if (action === 'increase') {
          input.value = currentValue + 1;
        } else if (action === 'decrease' && currentValue > 1) {
          input.value = currentValue - 1;
        }
        
        input.dispatchEvent(new Event('change'));
      }
    });
  }

  handleScrollEffects() {
    const header = document.querySelector('.header');
    
    if (header) {
      let lastScrollY = window.scrollY;
      
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
        
        lastScrollY = currentScrollY;
      });
    }
  }

  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }
}

// Cart functionality
class Cart {
  constructor() {
    this.items = [];
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-add-to-cart]')) {
        event.preventDefault();
        this.addItem(event.target);
      }
    });
  }

  async addItem(button) {
    const form = button.closest('form');
    const formData = new FormData(form);
    
    try {
      const response = await fetch(window.routes.cart_add_url, {
        method: 'POST',
        body: formData
      });
      
      const item = await response.json();
      
      if (response.ok) {
        this.onItemAdded(item);
      } else {
        this.onError(item);
      }
    } catch (error) {
      console.error('Cart error:', error);
    }
  }

  onItemAdded(item) {
    // Show success message or update cart UI
    console.log('Item added to cart:', item);
    this.updateCartCount();
  }

  onError(error) {
    console.error('Failed to add item to cart:', error);
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      const cartCount = document.querySelector('[data-cart-count]');
      
      if (cartCount) {
        cartCount.textContent = cart.item_count;
      }
    } catch (error) {
      console.error('Failed to update cart count:', error);
    }
  }
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Theme();
  new Cart();
});

// Utility functions
window.theme = {
  formatMoney: function(cents) {
    return '$' + (cents / 100).toFixed(2);
  },
  
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};