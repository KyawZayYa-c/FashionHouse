import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.jsx'
import cartReducer, { persistCart } from '../features/cart/cartSlice.jsx'
import wishlistReducer, { persistWishlist } from '../features/wishlist/wishlistSlice.jsx'

// A single, plain Redux store. Auth/cart/wishlist are the only state sources;
// theme lives in ThemeContext and language in i18next, so they are not duplicated here.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Cart/wishlist hold plain serialisable data, but keep this lenient so a
      // stray Date from the API never crashes dev tooling.
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
})

// Persist cart + wishlist to localStorage whenever they change so a guest's
// selections survive a refresh (and are synced to the server after login).
let prevCart = store.getState().cart.items
let prevWishlist = store.getState().wishlist.items
store.subscribe(() => {
  const state = store.getState()
  if (state.cart.items !== prevCart) {
    prevCart = state.cart.items
    persistCart(state.cart.items)
  }
  if (state.wishlist.items !== prevWishlist) {
    prevWishlist = state.wishlist.items
    persistWishlist(state.wishlist.items)
  }
})

export default store