import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Interface for cart state
export interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
  productName?: string
}

export interface CartState {
  items: CartItem[]
  totalAmount: number
  totalItems: number
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  isLoading: false,
  error: null,
}

// Async thunk for get cart
export const getCartThunk = createAsyncThunk(
  'cart/getCartThunk',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to get cart')
      }

      return data.items || []
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for add to cart
export const addToCartThunk = createAsyncThunk(
  'cart/addToCartThunk',
  async (cartData: { productId: string; variantId?: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartData),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to add to cart')
      }

      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for remove from cart
export const removeFromCartThunk = createAsyncThunk(
  'cart/removeFromCartThunk',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to remove from cart')
      }

      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  }
)

// Async thunk for clear cart
export const clearCartThunk = createAsyncThunk(
  'cart/clearCartThunk',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to clear cart')
      }

      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error')
    }
  )
)

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart reducer (for RTK Query cache)
    addItem: (state, action) => {
      const item = action.payload
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      )

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += item.quantity || 1
        state.items[existingIndex].price = item.price
      } else {
        state.items.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity || 1,
          price: item.price,
        })
      }

      // Recalculate total
      state.totalAmount = state.items.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      )
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      )
    },

    // Remove item reducer
    removeItem: (state, action) => {
      const productId = action.payload
      state.items = state.items.filter((item) => item.productId !== productId)
      state.totalAmount = state.items.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
      )
      state.totalItems = state.items.reduce(
        (total, item) => total + item.quantity,
        0
      )
    },

    // Clear cart reducer
    clearCart: (state) => {
      state.items = []
      state.totalAmount = 0
      state.totalItems = 0
    },

    // Set cart from API (for initialization)
    setCart: (state, action) => {
      state.items = action.payload.items || []
      state.totalAmount = action.payload.totalAmount || 0
      state.totalItems = action.payload.totalItems || 0
    },
  },
})

export const { addItem, removeItem, clearCart, setCart } = cartSlice.actions

export default cartSlice.reducer