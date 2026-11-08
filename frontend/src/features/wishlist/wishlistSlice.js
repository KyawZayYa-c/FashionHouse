import { createSlice } from '@reduxjs/toolkit'

// Interface for wishlist item
export interface WishlistItem {
  productId: string
  productName?: string
  image?: string
  price?: number
}

// Interface for wishlist state
export interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
}

// Wishlist slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Add item to wishlist reducer
    addItem: (state, action) => {
      const product = action.payload
      const exists = state.items.some((item) => item.productId === product.productId)

      if (!exists) {
        state.items.push({
          productId: product.productId,
          productName: product.productName,
          image: product.image,
          price: product.price,
        })
      }
    },

    // Remove item from wishlist reducer
    removeItem: (state, action) => {
      const productId = action.payload
      state.items = state.items.filter((item) => item.productId !== productId)
    },

    // Clear wishlist reducer
    clearWishlist: (state) => {
      state.items = []
    },

    // Set wishlist from API (for initialization)
    setWishlist: (state, action) => {
      state.items = action.payload.items || []
    },
  },
})

export const { addItem, removeItem, clearWishlist, setWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer