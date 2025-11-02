<template>
  <div class="sweets-container">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">🍭 Our Sweet Collection</h1>
        <p class="page-subtitle">Discover our delicious range of sweets and treats</p>
      </div>

      <div class="header-actions">
        <!-- Cart Indicator -->
        <div class="cart-indicator" @click="viewCart">🛒 Cart ({{ cartItemCount }})</div>

        <!-- Navigation Back to Home -->
        <router-link to="/" class="back-btn"> ← Back to Dashboard </router-link>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="controls-section">
      <div class="search-filters">
        <!-- Search Bar -->
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search sweets by name..."
            class="search-input"
          />
          <div class="search-icon">🔍</div>
        </div>

        <!-- Category Filter -->
        <div class="filter-group">
          <select v-model="selectedCategory" class="filter-select">
            <option value="">All Categories</option>
            <option value="chocolates">Chocolates</option>
            <option value="candies">Candies</option>
            <option value="gummies">Gummies</option>
            <option value="cookies">Cookies</option>
            <option value="cakes">Cakes</option>
            <option value="traditional">Traditional</option>
          </select>
        </div>

        <!-- Price Range Filter -->
        <div class="filter-group">
          <select v-model="priceRange" class="filter-select">
            <option value="">All Prices</option>
            <option value="0-50">₹0 - ₹50</option>
            <option value="51-100">₹51 - ₹100</option>
            <option value="101-200">₹101 - ₹200</option>
            <option value="201-500">₹201 - ₹500</option>
            <option value="500+">₹500+</option>
          </select>
        </div>

        <!-- Stock Filter -->
        <div class="filter-group">
          <select v-model="stockFilter" class="filter-select">
            <option value="">All Items</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="low-stock">Low Stock (≤5)</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>

      <!-- Results Summary -->
      <div class="results-summary">
        <p>Showing {{ filteredSweets.length }} of {{ sweets.length }} sweets</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>Loading delicious sweets...</p>
    </div>

    <!-- Sweets Grid -->
    <div v-else class="sweets-grid">
      <div
        v-for="sweet in filteredSweets"
        :key="sweet.id"
        class="sweet-card"
        :class="{ 'out-of-stock': sweet.quantity === 0 }"
      >
        <!-- Sweet Image -->
        <div class="sweet-image">
          <img :src="sweet.image" :alt="sweet.name" />
          <div v-if="sweet.quantity === 0" class="out-of-stock-overlay">Out of Stock</div>
          <div v-else-if="sweet.quantity <= 5" class="low-stock-badge">Low Stock</div>
        </div>

        <!-- Sweet Info -->
        <div class="sweet-info">
          <h3 class="sweet-name">{{ sweet.name }}</h3>
          <p class="sweet-description">{{ sweet.description }}</p>

          <div class="sweet-details">
            <span class="sweet-category">{{ sweet.category }}</span>
            <span class="sweet-weight">{{ sweet.weight }}</span>
          </div>

          <div class="sweet-pricing">
            <span class="sweet-price">₹{{ sweet.price }}</span>
            <span class="sweet-quantity" :class="getQuantityClass(sweet.quantity)">
              {{ sweet.quantity }} left
            </span>
          </div>

          <!-- Purchase Section -->
          <div class="purchase-section">
            <div class="quantity-selector">
              <button
                @click="decreaseQuantity(sweet.id)"
                :disabled="sweet.quantity === 0 || getSelectedQuantity(sweet.id) <= 1"
                class="qty-btn"
              >
                -
              </button>
              <span class="selected-qty">{{ getSelectedQuantity(sweet.id) }}</span>
              <button
                @click="increaseQuantity(sweet.id)"
                :disabled="sweet.quantity === 0 || getSelectedQuantity(sweet.id) >= sweet.quantity"
                class="qty-btn"
              >
                +
              </button>
            </div>

            <button
              @click="purchaseSweet(sweet)"
              :disabled="sweet.quantity === 0"
              class="purchase-btn"
              :class="{ disabled: sweet.quantity === 0 }"
            >
              {{ sweet.quantity === 0 ? 'Out of Stock' : 'Add to Cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="!isLoading && filteredSweets.length === 0" class="no-results">
      <div class="no-results-icon">🔍</div>
      <h3>No sweets found</h3>
      <p>Try adjusting your search or filter criteria</p>
      <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
    </div>

    <!-- Purchase Modal -->
    <div v-if="showPurchaseModal" class="modal-overlay" @click="closePurchaseModal">
      <div class="modal-content" @click.stop>
        <h3>Item Added to Cart!</h3>
        <div class="modal-sweet-info">
          <img :src="selectedSweet.image" :alt="selectedSweet.name" class="modal-sweet-image" />
          <div>
            <h4>{{ selectedSweet.name }}</h4>
            <p>Quantity: {{ selectedQuantities[selectedSweet.id] }}</p>
            <p>Total: ₹{{ selectedSweet.price * selectedQuantities[selectedSweet.id] }}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="continueShopping" class="continue-btn">Continue Shopping</button>
          <button @click="viewCart" class="cart-btn">View Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart.js'

const router = useRouter()
const { addToCart, cartItemCount } = useCart()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const priceRange = ref('')
const stockFilter = ref('')
const isLoading = ref(true)
const showPurchaseModal = ref(false)
const selectedSweet = ref(null)
const selectedQuantities = reactive({})

// Sample sweets data
const sweets = ref([])

// Initialize selected quantities
onMounted(() => {
  loadSweets()

  // Simulate loading
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

const loadSweets = () => {
  // Load from localStorage if exists, otherwise use default data
  const savedSweets = localStorage.getItem('sweetShopSweets')
  if (savedSweets) {
    sweets.value = JSON.parse(savedSweets)
  } else {
    // Initialize with default sweets data
    sweets.value = [
      {
        id: 1,
        name: 'Dark Chocolate Truffles',
        description: 'Rich and creamy dark chocolate truffles with a velvety smooth center',
        price: 299,
        quantity: 15,
        category: 'chocolates',
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=300&h=200&fit=crop',
      },
      {
        id: 2,
        name: 'Rainbow Gummy Bears',
        description: 'Colorful and chewy gummy bears in assorted fruit flavors',
        price: 89,
        quantity: 0,
        category: 'gummies',
        weight: '200g',
        image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=300&h=200&fit=crop',
      },
      {
        id: 3,
        name: 'Gulab Jamun',
        description: 'Traditional Indian milk solid dumplings in sugar syrup',
        price: 159,
        quantity: 8,
        category: 'traditional',
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1606471962783-4d0b6b2ad6b6?w=300&h=200&fit=crop',
      },
      {
        id: 4,
        name: 'Chocolate Chip Cookies',
        description: 'Freshly baked cookies loaded with chocolate chips',
        price: 129,
        quantity: 25,
        category: 'cookies',
        weight: '300g',
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=200&fit=crop',
      },
      {
        id: 5,
        name: 'Strawberry Cake',
        description: 'Moist vanilla cake with fresh strawberry cream and berries',
        price: 549,
        quantity: 3,
        category: 'cakes',
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop',
      },
      {
        id: 6,
        name: 'Assorted Lollipops',
        description: 'Colorful handcrafted lollipops in various fruit flavors',
        price: 45,
        quantity: 50,
        category: 'candies',
        weight: '150g',
        image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&h=200&fit=crop',
      },
      {
        id: 7,
        name: 'Milk Chocolate Bar',
        description: 'Smooth and creamy milk chocolate bar made with finest cocoa',
        price: 75,
        quantity: 20,
        category: 'chocolates',
        weight: '100g',
        image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=200&fit=crop',
      },
      {
        id: 8,
        name: 'Rasgulla',
        description: 'Soft and spongy cottage cheese balls in sugar syrup',
        price: 139,
        quantity: 12,
        category: 'traditional',
        weight: '400g',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=200&fit=crop',
      },
      {
        id: 9,
        name: 'Fruit Jellies',
        description: 'Assorted fruit-flavored jellies with natural fruit extracts',
        price: 99,
        quantity: 0,
        category: 'gummies',
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1583779962037-b6b22e51d8fe?w=300&h=200&fit=crop',
      },
      {
        id: 10,
        name: 'Vanilla Cupcakes',
        description: 'Fluffy vanilla cupcakes topped with cream cheese frosting',
        price: 199,
        quantity: 18,
        category: 'cakes',
        weight: '6 pieces',
        image: 'https://images.unsplash.com/photo-1587736477849-d90e4b088f66?w=300&h=200&fit=crop',
      },
    ]
    localStorage.setItem('sweetShopSweets', JSON.stringify(sweets.value))
  }

  // Initialize selected quantities
  sweets.value.forEach((sweet) => {
    selectedQuantities[sweet.id] = 1
  })
} // Computed properties
const filteredSweets = computed(() => {
  let filtered = sweets.value

  // Search filter
  if (searchQuery.value) {
    filtered = filtered.filter(
      (sweet) =>
        sweet.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        sweet.description.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter((sweet) => sweet.category === selectedCategory.value)
  }

  // Price range filter
  if (priceRange.value) {
    filtered = filtered.filter((sweet) => {
      const price = sweet.price
      switch (priceRange.value) {
        case '0-50':
          return price <= 50
        case '51-100':
          return price >= 51 && price <= 100
        case '101-200':
          return price >= 101 && price <= 200
        case '201-500':
          return price >= 201 && price <= 500
        case '500+':
          return price > 500
        default:
          return true
      }
    })
  }

  // Stock filter
  if (stockFilter.value) {
    filtered = filtered.filter((sweet) => {
      switch (stockFilter.value) {
        case 'in-stock':
          return sweet.quantity > 0
        case 'out-of-stock':
          return sweet.quantity === 0
        case 'low-stock':
          return sweet.quantity > 0 && sweet.quantity <= 5
        default:
          return true
      }
    })
  }

  return filtered
})

// Methods
const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  priceRange.value = ''
  stockFilter.value = ''
}

const getQuantityClass = (quantity) => {
  if (quantity === 0) return 'out-of-stock'
  if (quantity <= 5) return 'low-stock'
  return 'in-stock'
}

const getSelectedQuantity = (sweetId) => {
  return selectedQuantities[sweetId] || 1
}

const increaseQuantity = (sweetId) => {
  const sweet = sweets.value.find((s) => s.id === sweetId)
  if (selectedQuantities[sweetId] < sweet.quantity) {
    selectedQuantities[sweetId]++
  }
}

const decreaseQuantity = (sweetId) => {
  if (selectedQuantities[sweetId] > 1) {
    selectedQuantities[sweetId]--
  }
}

const purchaseSweet = (sweet) => {
  if (sweet.quantity === 0) return

  const quantity = selectedQuantities[sweet.id] || 1
  addToCart(sweet, quantity)

  selectedSweet.value = sweet
  showPurchaseModal.value = true

  console.log(`Added ${quantity} x ${sweet.name} to cart`)
}

const closePurchaseModal = () => {
  showPurchaseModal.value = false
  selectedSweet.value = null
}

const continueShopping = () => {
  closePurchaseModal()
}

const viewCart = () => {
  closePurchaseModal()
  // In a real app, navigate to cart page
  alert('Cart functionality will be implemented in the next phase!')
}
</script>

<style scoped>
.sweets-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.dashboard-container {
  padding: 40px;
  font-family: 'Poppins', sans-serif;
  background-color: #f9fafb;
  min-height: 100vh;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.header-content p {
  color: #666;
  font-size: 16px;
}

.back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.controls-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.search-filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 16px;
  margin-bottom: 16px;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 45px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.clear-filters-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.clear-filters-btn:hover {
  background: #dc2626;
}

.results-summary {
  color: #666;
  font-size: 14px;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.sweets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.sweet-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.sweet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.sweet-card.out-of-stock {
  opacity: 0.7;
}

.sweet-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.sweet-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.out-of-stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.low-stock-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #f59e0b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.sweet-info {
  padding: 20px;
}

.sweet-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.sweet-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.sweet-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sweet-category {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.sweet-weight {
  color: #666;
  font-size: 14px;
}

.sweet-pricing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sweet-price {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.sweet-quantity {
  font-size: 14px;
  font-weight: 600;
}

.sweet-quantity.in-stock {
  color: #10b981;
}

.sweet-quantity.low-stock {
  color: #f59e0b;
}

.sweet-quantity.out-of-stock {
  color: #ef4444;
}

.purchase-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  padding: 4px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected-qty {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.purchase-btn {
  flex: 1;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.purchase-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.purchase-btn.disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-results-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-results h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-sweet-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  text-align: left;
}

.modal-sweet-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.continue-btn {
  flex: 1;
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.cart-btn {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-header {
    display: flex;
    flex-wrap: wrap; /* allows wrapping on smaller screens */
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    gap: 16px; /* spacing between items */
  }

  .search-filters {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .sweets-grid {
    grid-template-columns: 1fr;
  }

  .modal-sweet-info {
    flex-direction: column;
    text-align: center;
  }

  .modal-actions {
    flex-direction: column;
  }
}

.cart-indicator {
  background: #f3f4f6;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cart-indicator:hover {
  background: #e5e7eb;
}
</style>
