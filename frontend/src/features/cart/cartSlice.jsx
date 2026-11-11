import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartApi, parsePrice, primaryImage } from '../../services/baseApi.jsx'
import { logoutThunk } from '../auth/authSlice.jsx'

const STORAGE_KEY = 'fh_cart'

const recalc = (state) => {
  state.totalAmount = state.items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0)
  state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
}

const loadLocalCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const items = raw ? JSON.parse(raw) : []
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export const persistCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* storage may be unavailable (private mode) — cart still works in memory */
  }
}

// Build a UI cart item from a catalog product + chosen variant.
export const makeCartItem = (product, variant, quantity = 1) => ({
  productId: String(product._id || product.id),
  variantId: String(variant?._id || product._id || product.id),
  name: product.productName || product.name || 'Product',
  slug: product.slug || '',
  image: primaryImage(product.images, product.image || ''),
  price: parsePrice(variant?.additionalPrice
    ? parsePrice(product.price) + parsePrice(variant.additionalPrice)
    : product.price),
  size: variant?.size || '',
  color: variant?.color || '',
  sku: variant?.sku || '',
  quantity,
})

// Server cart -> UI items (backend populates productId with product fields).
const normalizeServerCart = (cart) =>
  (cart?.items || []).map((it) => {
    const p = it.productId && typeof it.productId === 'object' ? it.productId : { _id: it.productId }
    const variant = (p.variants || []).find((v) => String(v._id) === String(it.variantId)) || {}
    return {
      productId: String(p._id || it.productId),
      variantId: String(it.variantId),
      name: p.productName || 'Product',
      slug: p.slug || '',
      image: primaryImage(p.images),
      price: parsePrice(it.price),
      size: variant.size || '',
      color: variant.color || '',
      sku: variant.sku || '',
      quantity: it.quantity || 1,
    }
  })

const initialState = {
  items: loadLocalCart(),
  totalAmount: 0,
  totalItems: 0,
  loading: false,
  error: null,
}
// compute totals for the persisted initial items
initialState.totalAmount = initialState.items.reduce((s, i) => s + parsePrice(i.price) * i.quantity, 0)
initialState.totalItems = initialState.items.reduce((s, i) => s + i.quantity, 0)

const isAuthed = (getState) => getState().auth.isAuthenticated

// Fetch the authoritative cart: server when logged in, local storage when guest.
export const fetchCartThunk = createAsyncThunk(
  'cart/fetch',
  async (_, { getState, dispatch, rejectWithValue }) => {
    if (!isAuthed(getState)) {
      dispatch(setCartItems(loadLocalCart()))
      return
    }
    try {
      const data = await cartApi.get()
      dispatch(setCartItems(normalizeServerCart(data.cart)))
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load cart')
    }
  }
)

export const addToCartThunk = createAsyncThunk(
  'cart/add',
  async ({ product, variant, quantity = 1 }, { getState, dispatch, rejectWithValue }) => {
    const item = makeCartItem(product, variant, quantity)
    dispatch(addItemLocal(item)) // optimistic — works instantly for guests too

    if (!isAuthed(getState)) return item

    let errorMessage = null
    try {
      await cartApi.add({ productId: item.productId, variantId: item.variantId, quantity })
    } catch (error) {
      errorMessage = error.message || 'Failed to add to cart'
    }
    // Reconcile with the server (also reverts the optimistic add if it failed).
    try {
      const data = await cartApi.get()
      dispatch(setCartItems(normalizeServerCart(data.cart)))
    } catch {
      /* keep optimistic local state if the server is unreachable */
    }
    if (errorMessage) return rejectWithValue(errorMessage)
    return item
  }
)

export const updateQuantityThunk = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, variantId, quantity }, { getState, dispatch, rejectWithValue }) => {
    dispatch(updateQuantityLocal({ productId, variantId, quantity }))
    if (!isAuthed(getState)) return
    let errorMessage = null
    try {
      await cartApi.update({ productId, variantId, quantity })
    } catch (error) {
      errorMessage = error.message || 'Failed to update quantity'
    }
    try {
      const data = await cartApi.get()
      dispatch(setCartItems(normalizeServerCart(data.cart)))
    } catch {
      /* keep local */
    }
    if (errorMessage) return rejectWithValue(errorMessage)
  }
)

export const removeItemThunk = createAsyncThunk(
  'cart/remove',
  async ({ productId, variantId }, { getState, dispatch, rejectWithValue }) => {
    dispatch(removeItemLocal({ productId, variantId }))
    if (!isAuthed(getState)) return
    try {
      await cartApi.remove({ productId, variantId })
      const data = await cartApi.get()
      dispatch(setCartItems(normalizeServerCart(data.cart)))
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove item')
    }
  }
)

export const clearCartThunk = createAsyncThunk(
  'cart/clear',
  async (_, { getState, dispatch, rejectWithValue }) => {
    dispatch(clearCartLocal())
    if (!isAuthed(getState)) return
    try {
      await cartApi.clear()
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear cart')
    }
  }
)

// After login, push any guest cart items to the server, then load the merged cart.
export const syncGuestCartThunk = createAsyncThunk(
  'cart/syncGuest',
  async (_, { getState, dispatch }) => {
    const guestItems = getState().cart.items
    for (const item of guestItems) {
      try {
        await cartApi.add({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })
      } catch {
        /* skip items that can't be added (e.g. out of stock) */
      }
    }
    try {
      const data = await cartApi.get()
      dispatch(setCartItems(normalizeServerCart(data.cart)))
    } catch {
      /* keep local */
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload || []
      recalc(state)
    },
    addItemLocal: (state, action) => {
      const item = action.payload
      const idx = state.items.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      )
      if (idx >= 0) {
        state.items[idx].quantity += item.quantity || 1
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 })
      }
      recalc(state)
    },
    updateQuantityLocal: (state, action) => {
      const { productId, variantId, quantity } = action.payload
      const idx = state.items.findIndex(
        (i) => i.productId === productId && i.variantId === variantId
      )
      if (idx >= 0) {
        state.items[idx].quantity = Math.max(1, quantity)
      }
      recalc(state)
    },
    removeItemLocal: (state, action) => {
      const { productId, variantId } = action.payload
      state.items = state.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      )
      recalc(state)
    },
    clearCartLocal: (state) => {
      state.items = []
      state.totalAmount = 0
      state.totalItems = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCartThunk.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load cart'
      })
      .addCase(addToCartThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add to cart'
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.items = []
        state.totalAmount = 0
        state.totalItems = 0
        state.error = null
      })
  },
})

export const {
  setCartItems,
  addItemLocal,
  updateQuantityLocal,
  removeItemLocal,
  clearCartLocal,
} = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartTotalAmount = (state) => state.cart.totalAmount
export const selectCartTotalItems = (state) => state.cart.totalItems
export const selectCartLoading = (state) => state.cart.loading
export const selectCartError = (state) => state.cart.error

export default cartSlice.reducer