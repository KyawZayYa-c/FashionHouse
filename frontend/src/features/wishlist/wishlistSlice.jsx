import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { wishlistApi, parsePrice, primaryImage } from '../../services/baseApi.jsx'
import { logoutThunk } from '../auth/authSlice.jsx'

const STORAGE_KEY = 'fh_wishlist'

const loadLocalWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const items = raw ? JSON.parse(raw) : []
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export const persistWishlist = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* storage unavailable — wishlist still works in memory */
  }
}

// Build a UI wishlist item from a catalog product.
export const makeWishlistItem = (product) => ({
  productId: String(product._id || product.id),
  name: product.productName || product.name || 'Product',
  slug: product.slug || '',
  image: primaryImage(product.images, product.image || ''),
  price: parsePrice(product.price),
})

// Server wishlist -> UI items. Backend returns [{ productId: <populated product>, ... }].
const normalizeServerWishlist = (list) =>
  (list || [])
    .map((entry) => {
      const p =
        entry.productId && typeof entry.productId === 'object'
          ? entry.productId
          : { _id: entry.productId }
      return {
        productId: String(p._id || entry.productId || ''),
        name: p.productName || 'Product',
        slug: p.slug || '',
        image: primaryImage(p.images),
        price: parsePrice(p.price),
      }
    })
    .filter((i) => i.productId && i.productId !== 'undefined')

const initialState = {
  items: loadLocalWishlist(),
  loading: false,
  error: null,
}

const isAuthed = (getState) => getState().auth.isAuthenticated

export const fetchWishlistThunk = createAsyncThunk(
  'wishlist/fetch',
  async (_, { getState, dispatch, rejectWithValue }) => {
    if (!isAuthed(getState)) {
      dispatch(setWishlistItems(loadLocalWishlist()))
      return
    }
    try {
      const data = await wishlistApi.get()
      dispatch(setWishlistItems(normalizeServerWishlist(data.wishlist)))
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load wishlist')
    }
  }
)

export const addToWishlistThunk = createAsyncThunk(
  'wishlist/add',
  async (product, { getState, dispatch, rejectWithValue }) => {
    const item = makeWishlistItem(product)
    dispatch(addWishlistLocal(item)) // optimistic
    if (!isAuthed(getState)) return item
    try {
      const data = await wishlistApi.add(item.productId)
      dispatch(setWishlistItems(normalizeServerWishlist(data.wishlist)))
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add to wishlist')
    }
    return item
  }
)

export const removeFromWishlistThunk = createAsyncThunk(
  'wishlist/remove',
  async (productId, { getState, dispatch, rejectWithValue }) => {
    dispatch(removeWishlistLocal(productId)) // optimistic
    if (!isAuthed(getState)) return
    try {
      const data = await wishlistApi.remove(productId)
      dispatch(setWishlistItems(normalizeServerWishlist(data.wishlist)))
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove from wishlist')
    }
  }
)

// Convenience: add if absent, remove if present. Returns { added }.
export const toggleWishlistThunk = createAsyncThunk(
  'wishlist/toggle',
  async (product, { getState, dispatch }) => {
    const id = String(product._id || product.id)
    const exists = getState().wishlist.items.some((i) => i.productId === id)
    if (exists) {
      await dispatch(removeFromWishlistThunk(id))
      return { added: false }
    }
    await dispatch(addToWishlistThunk(product))
    return { added: true }
  }
)

export const clearWishlistThunk = createAsyncThunk(
  'wishlist/clear',
  async (_, { getState, dispatch, rejectWithValue }) => {
    dispatch(clearWishlistLocal())
    if (!isAuthed(getState)) return
    try {
      await wishlistApi.clear()
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear wishlist')
    }
  }
)

// After login, push guest wishlist items to the server, then load the merged list.
export const syncGuestWishlistThunk = createAsyncThunk(
  'wishlist/syncGuest',
  async (_, { getState, dispatch }) => {
    const guestItems = getState().wishlist.items
    for (const item of guestItems) {
      try {
        await wishlistApi.add(item.productId)
      } catch {
        /* skip duplicates / unavailable products */
      }
    }
    try {
      const data = await wishlistApi.get()
      dispatch(setWishlistItems(normalizeServerWishlist(data.wishlist)))
    } catch {
      /* keep local */
    }
  }
)

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems: (state, action) => {
      state.items = action.payload || []
    },
    addWishlistLocal: (state, action) => {
      const item = action.payload
      if (!state.items.some((i) => i.productId === item.productId)) {
        state.items.push(item)
      }
    },
    removeWishlistLocal: (state, action) => {
      state.items = state.items.filter((i) => i.productId !== action.payload)
    },
    clearWishlistLocal: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWishlistThunk.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(fetchWishlistThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load wishlist'
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.items = []
        state.error = null
      })
  },
})

export const {
  setWishlistItems,
  addWishlistLocal,
  removeWishlistLocal,
  clearWishlistLocal,
} = wishlistSlice.actions

export const selectWishlistItems = (state) => state.wishlist.items
export const selectWishlistCount = (state) => state.wishlist.items.length
export const selectWishlistLoading = (state) => state.wishlist.loading
export const selectWishlistError = (state) => state.wishlist.error
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((i) => i.productId === String(productId))

export default wishlistSlice.reducer