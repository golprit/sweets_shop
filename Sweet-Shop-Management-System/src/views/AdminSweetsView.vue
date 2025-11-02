<template>
  <div class="admin-container">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">🍬 Sweet Management</h1>
        <p class="page-subtitle">Add, update, and manage your sweet inventory</p>
      </div>

      <!-- Navigation and Actions -->
      <div class="header-actions">
        <button @click="showAddModal = true" class="add-btn">+ Add New Sweet</button>
        <router-link to="/" class="back-btn"> ← Back to Dashboard </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">🍭</div>
        <div class="stat-info">
          <h3>{{ totalSweets }}</h3>
          <p>Total Sweets</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>{{ inStockSweets }}</h3>
          <p>In Stock</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <h3>{{ outOfStockSweets }}</h3>
          <p>Out of Stock</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info">
          <h3>{{ lowStockSweets }}</h3>
          <p>Low Stock</p>
        </div>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="controls-section">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search sweets..."
          class="search-input"
        />
        <div class="search-icon">🔍</div>
      </div>

      <select v-model="selectedCategory" class="filter-select">
        <option value="">All Categories</option>
        <option value="chocolates">Chocolates</option>
        <option value="candies">Candies</option>
        <option value="gummies">Gummies</option>
        <option value="cookies">Cookies</option>
        <option value="cakes">Cakes</option>
        <option value="traditional">Traditional</option>
      </select>

      <select v-model="stockFilter" class="filter-select">
        <option value="">All Stock Levels</option>
        <option value="in-stock">In Stock</option>
        <option value="out-of-stock">Out of Stock</option>
        <option value="low-stock">Low Stock</option>
      </select>
    </div>

    <!-- Sweets Management Table -->
    <div class="table-section">
      <div class="table-container">
        <table class="sweets-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Weight</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sweet in filteredSweets" :key="sweet.id" class="sweet-row">
              <td>
                <img :src="sweet.image" :alt="sweet.name" class="sweet-thumbnail" />
              </td>
              <td>
                <div class="sweet-name-cell">
                  <strong>{{ sweet.name }}</strong>
                  <p class="sweet-description">{{ sweet.description }}</p>
                </div>
              </td>
              <td>
                <span class="category-badge" :class="sweet.category">
                  {{ formatCategory(sweet.category) }}
                </span>
              </td>
              <td class="price-cell">₹{{ sweet.price }}</td>
              <td>
                <span class="stock-badge" :class="getStockClass(sweet.quantity)">
                  {{ sweet.quantity }}
                </span>
              </td>
              <td>{{ sweet.weight }}</td>
              <td>
                <span class="status-badge" :class="sweet.quantity > 0 ? 'active' : 'inactive'">
                  {{ sweet.quantity > 0 ? 'Available' : 'Out of Stock' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="editSweet(sweet)" class="action-btn edit-btn" title="Edit Sweet">
                    ✏️
                  </button>
                  <button
                    @click="confirmDelete(sweet)"
                    class="action-btn delete-btn"
                    title="Delete Sweet"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Sweet Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? 'Edit Sweet' : 'Add New Sweet' }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>

        <form @submit.prevent="submitForm" class="sweet-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Sweet Name *</label>
              <input
                type="text"
                v-model="formData.name"
                placeholder="Enter sweet name"
                class="form-input"
                :class="{ error: errors.name }"
                required
              />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Category *</label>
              <select
                v-model="formData.category"
                class="form-select"
                :class="{ error: errors.category }"
                required
              >
                <option value="">Select Category</option>
                <option value="chocolates">Chocolates</option>
                <option value="candies">Candies</option>
                <option value="gummies">Gummies</option>
                <option value="cookies">Cookies</option>
                <option value="cakes">Cakes</option>
                <option value="traditional">Traditional</option>
              </select>
              <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea
              v-model="formData.description"
              placeholder="Enter sweet description"
              class="form-textarea"
              :class="{ error: errors.description }"
              rows="3"
              required
            ></textarea>
            <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Price (₹) *</label>
              <input
                type="number"
                v-model.number="formData.price"
                placeholder="0.00"
                class="form-input"
                :class="{ error: errors.price }"
                min="0"
                step="0.01"
                required
              />
              <span v-if="errors.price" class="error-message">{{ errors.price }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Stock Quantity *</label>
              <input
                type="number"
                v-model.number="formData.quantity"
                placeholder="0"
                class="form-input"
                :class="{ error: errors.quantity }"
                min="0"
                required
              />
              <span v-if="errors.quantity" class="error-message">{{ errors.quantity }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Weight *</label>
              <input
                type="text"
                v-model="formData.weight"
                placeholder="e.g., 250g, 1kg, 6 pieces"
                class="form-input"
                :class="{ error: errors.weight }"
                required
              />
              <span v-if="errors.weight" class="error-message">{{ errors.weight }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Image URL *</label>
            <input
              type="url"
              v-model="formData.image"
              placeholder="https://example.com/image.jpg"
              class="form-input"
              :class="{ error: errors.image }"
              required
            />
            <span v-if="errors.image" class="error-message">{{ errors.image }}</span>
            <div v-if="formData.image" class="image-preview">
              <img :src="formData.image" alt="Preview" @error="imageError = true" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : showEditModal ? 'Update Sweet' : 'Add Sweet' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete <strong>{{ sweetToDelete?.name }}</strong
            >?
          </p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="cancel-btn">Cancel</button>
          <button @click="deleteSweet" class="delete-confirm-btn">Delete Sweet</button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-toast">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const stockFilter = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const sweetToDelete = ref(null)
const isSubmitting = ref(false)
const successMessage = ref('')
const imageError = ref(false)

// Form data
const formData = reactive({
  id: null,
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  category: '',
  weight: '',
  image: '',
})

const errors = reactive({
  name: '',
  description: '',
  price: '',
  quantity: '',
  category: '',
  weight: '',
  image: '',
})

// Get initial sweets data from localStorage or use default
const sweets = ref([])

onMounted(() => {
  loadSweets()
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
      // Add more default sweets as needed
    ]
    saveSweets()
  }
}

const saveSweets = () => {
  localStorage.setItem('sweetShopSweets', JSON.stringify(sweets.value))
}

// Computed properties
const filteredSweets = computed(() => {
  let filtered = sweets.value

  if (searchQuery.value) {
    filtered = filtered.filter(
      (sweet) =>
        sweet.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        sweet.description.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((sweet) => sweet.category === selectedCategory.value)
  }

  if (stockFilter.value) {
    filtered = filtered.filter((sweet) => {
      switch (stockFilter.value) {
        case 'in-stock':
          return sweet.quantity > 5
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

const totalSweets = computed(() => sweets.value.length)
const inStockSweets = computed(() => sweets.value.filter((s) => s.quantity > 0).length)
const outOfStockSweets = computed(() => sweets.value.filter((s) => s.quantity === 0).length)
const lowStockSweets = computed(
  () => sweets.value.filter((s) => s.quantity > 0 && s.quantity <= 5).length,
)

// Methods
const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

const getStockClass = (quantity) => {
  if (quantity === 0) return 'out-of-stock'
  if (quantity <= 5) return 'low-stock'
  return 'in-stock'
}

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    if (key === 'price' || key === 'quantity') {
      formData[key] = 0
    } else {
      formData[key] = key === 'id' ? null : ''
    }
  })

  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

const validateForm = () => {
  let isValid = true

  // Reset errors
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  if (!formData.name.trim()) {
    errors.name = 'Sweet name is required'
    isValid = false
  }

  if (!formData.description.trim()) {
    errors.description = 'Description is required'
    isValid = false
  }

  if (!formData.category) {
    errors.category = 'Category is required'
    isValid = false
  }

  if (formData.price <= 0) {
    errors.price = 'Price must be greater than 0'
    isValid = false
  }

  if (formData.quantity < 0) {
    errors.quantity = 'Quantity cannot be negative'
    isValid = false
  }

  if (!formData.weight.trim()) {
    errors.weight = 'Weight is required'
    isValid = false
  }

  if (!formData.image.trim()) {
    errors.image = 'Image URL is required'
    isValid = false
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    if (showEditModal.value) {
      // Update existing sweet
      const index = sweets.value.findIndex((s) => s.id === formData.id)
      if (index !== -1) {
        sweets.value[index] = { ...formData }
        showSuccessMessage('Sweet updated successfully!')
      }
    } else {
      // Add new sweet
      const newSweet = {
        ...formData,
        id: Date.now(), // Simple ID generation
      }
      sweets.value.push(newSweet)
      showSuccessMessage('Sweet added successfully!')
    }

    saveSweets()
    closeModal()
  } catch (error) {
    console.error('Error saving sweet:', error)
    alert('Error saving sweet. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const editSweet = (sweet) => {
  Object.keys(formData).forEach((key) => {
    formData[key] = sweet[key]
  })
  showEditModal.value = true
}

const confirmDelete = (sweet) => {
  sweetToDelete.value = sweet
  showDeleteModal.value = true
}

const deleteSweet = async () => {
  try {
    const index = sweets.value.findIndex((s) => s.id === sweetToDelete.value.id)
    if (index !== -1) {
      sweets.value.splice(index, 1)
      saveSweets()
      showSuccessMessage('Sweet deleted successfully!')
    }
  } catch (error) {
    console.error('Error deleting sweet:', error)
    alert('Error deleting sweet. Please try again.')
  } finally {
    showDeleteModal.value = false
    sweetToDelete.value = null
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}
</script>

<style scoped>
.admin-container {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.add-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
}

.stat-info h3 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-info p {
  color: #666;
  font-size: 14px;
}

.controls-section {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 30px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
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

.table-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.sweets-table {
  width: 100%;
  border-collapse: collapse;
}

.sweets-table th {
  background: #f8fafc;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.sweets-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.sweet-row:hover {
  background: #f9fafb;
}

.sweet-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.sweet-name-cell strong {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.sweet-description {
  color: #666;
  font-size: 14px;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  background: #e5e7eb;
  color: #374151;
}

.price-cell {
  font-weight: 600;
  color: #059669;
}

.stock-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stock-badge.in-stock {
  background: #d1fae5;
  color: #065f46;
}

.stock-badge.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.stock-badge.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #dbeafe;
  color: #1d4ed8;
}

.edit-btn:hover {
  background: #bfdbfe;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
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
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sweet-form {
  padding: 0 24px 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.image-preview {
  margin-top: 12px;
}

.image-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e1e5e9;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background: #4b5563;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.delete-modal {
  max-width: 400px;
}

.modal-body {
  padding: 0 24px;
}

.delete-warning {
  color: #ef4444;
  font-weight: 500;
  margin-top: 8px;
}

.delete-confirm-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.delete-confirm-btn:hover {
  background: #dc2626;
}

.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .controls-section {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .stats-section {
    grid-template-columns: 1fr 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .table-container {
    font-size: 14px;
  }

  .sweets-table th,
  .sweets-table td {
    padding: 8px;
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
