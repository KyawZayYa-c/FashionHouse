import React, { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppDispatch } from '../hooks/useAppSelector'
import { restoreSessionThunk } from '../features/auth/authSlice.jsx'
import { fetchCartThunk } from '../features/cart/cartSlice.jsx'
import { fetchWishlistThunk } from '../features/wishlist/wishlistSlice.jsx'

// RootProvider is the router's root layout. It boots the session once, then
// hydrates the cart and wishlist (from the server when logged in, otherwise from
// localStorage). Every page renders through <Outlet />. The Redux <Provider>,
// ThemeProvider and ToastProvider wrap the router in main.jsx.
export const RootProvider = () => {
  const dispatch = useAppDispatch()
  const booted = useRef(false)

  useEffect(() => {
    if (booted.current) return
    booted.current = true

    // Restore the session from the httpOnly cookie. A rejection just means the
    // visitor is a guest — it is not an app error, so we never log it as one.
    dispatch(restoreSessionThunk())
      .unwrap()
      .catch(() => {})
      .finally(() => {
        dispatch(fetchCartThunk())
        dispatch(fetchWishlistThunk())
      })
  }, [dispatch])

  return <Outlet />
}

export default RootProvider