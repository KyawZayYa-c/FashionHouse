import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { store } from './app/store'
import { authApi } from '../services/baseApi'
import { loginThunk, restoreSessionThunk, setAuthState, clearAuthState } from './features/auth/authSlice'
import { useAppDispatch, useAppSelector } from './hooks/useAppSelector'
import { themeSlice } from './features/theme/themeSlice'
import { languageSlice } from './features/language/languageSlice'

// Custom hook for dispatch
export const useAppDispatch = useAppDispatch
export const useAppSelector = useAppSelector

// Root Provider component
export const RootProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch()

  // Authentication initialization
  useEffect(() => {
    // Initialize session restoration
    dispatch(restoreSessionThunk()).unwrap()
      .then(() => {
        // After session restoration, fetch user cart and wishlist
        dispatch(fetchCartThunk()).unwrap()
        dispatch(fetchWishlistThunk()).unwrap()
      })
      .catch((error) => {
        console.error('Auth initialization error:', error)
        // Even if restoration fails, continue
        dispatch(clearAuthState())
      })
  }, [dispatch])

  // Sync theme from Redux to CSS class
  useEffect(() => {
    const isDark = dispatch(themeSlice.actions.setTheme({ isDark: false })) || dispatch(themeSlice.actions.toggleTheme())
    // The setTheme action above doesn't return value, so let's just manually handle it
    const isDarkRedux = localStorage.getItem('theme') === 'dark'
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (isDarkRedux) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [dispatch])

  // Sync language from Redux
  useEffect(() => {
    const lang = localStorage.getItem('language')
    if (lang) {
      i18n.changeLanguage(lang)
    }
  }, [dispatch])

  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}