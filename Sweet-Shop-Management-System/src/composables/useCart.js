import { ref, reactive, computed, readonly } from 'vue'

// Global state for the shopping cart
const cartItems = ref([])
const isCartOpen = ref(false)

// Cart functionality composable
export function useCart() {
  // Add item to cart
  const addToCart = (sweet, quantity = 1) => {
    const existingItem = cartItems.value.find((item) => item.id === sweet.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartItems.value.push({
        id: sweet.id,
        name: sweet.name,
        price: sweet.price,
        image: sweet.image,
        quantity: quantity,
        maxQuantity: sweet.quantity,
      })
    }

    // Store in localStorage for persistence
    localStorage.setItem('sweetShopCart', JSON.stringify(cartItems.value))
  }

  // Remove item from cart
  const removeFromCart = (sweetId) => {
    const index = cartItems.value.findIndex((item) => item.id === sweetId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      localStorage.setItem('sweetShopCart', JSON.stringify(cartItems.value))
    }
  }

  // Update item quantity in cart
  const updateCartItemQuantity = (sweetId, quantity) => {
    const item = cartItems.value.find((item) => item.id === sweetId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(sweetId)
      } else {
        item.quantity = Math.min(quantity, item.maxQuantity)
        localStorage.setItem('sweetShopCart', JSON.stringify(cartItems.value))
      }
    }
  }

  // Clear entire cart
  const clearCart = () => {
    cartItems.value = []
    localStorage.removeItem('sweetShopCart')
  }

  // Load cart from localStorage
  const loadCart = () => {
    const savedCart = localStorage.getItem('sweetShopCart')
    if (savedCart) {
      cartItems.value = JSON.parse(savedCart)
    }
  }

  // Computed properties
  const cartItemCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  const isCartEmpty = computed(() => cartItems.value.length === 0)

  // Cart UI controls
  const openCart = () => {
    isCartOpen.value = true
  }

  const closeCart = () => {
    isCartOpen.value = false
  }

  const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
  }

  return {
    // State
    cartItems: readonly(cartItems),
    isCartOpen: readonly(isCartOpen),

    // Actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loadCart,
    openCart,
    closeCart,
    toggleCart,

    // Computed
    cartItemCount,
    cartTotal,
    isCartEmpty,
  }
}

// For backward compatibility with the existing implementation
export const useShoppingCart = useCart
