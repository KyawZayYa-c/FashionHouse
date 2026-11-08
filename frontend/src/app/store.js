import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/cart/cartSlice'
import wishlistReducer from '../features/wishlist/wishlistSlice'
import themeReducer from '../features/theme/themeSlice'
import languageReducer from '../features/language/languageSlice'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from '../features/auth/authApi'
import { cartApi } from '../features/cart/cartApi'
import { wishlistApi } from '../features/wishlist/wishlistApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    theme: themeReducer,
    language: languageReducer,
    [authApi.reducerPath]: authApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware, cartApi.middleware, wishlistApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Initialize RTK Query listeners for cache refetching on focus, etc.
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch