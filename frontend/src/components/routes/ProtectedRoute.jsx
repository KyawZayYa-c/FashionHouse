import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useRouteError } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { selectIsInitializing, selectIsAuthenticated, selectUser } from '../features/auth/authSlice'
import { logoutThunk } from '../features/auth/authSlice'
import { useToast } from '../hooks/useToast'

// Protected route component
export const ProtectedRoute = ({ children, allowedRoles = ['customer', 'admin'] }) => {
  const dispatch = useAppDispatch()
  const isInitializing = useAppSelector(selectIsInitializing)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const location = useLocation()

  // If still initializing, don't redirect yet
  if (isInitializing) {
    return null // Render nothing while initializing
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Check role permissions
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

// Guest route component - for public pages
export const GuestRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state: any) => state.auth.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/shop" replace />
  }

  return children
}

// Admin route component
export const AdminRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state: any) => state.auth.isAuthenticated)
  const userRole = useAppSelector((state: any) => state.auth.user?.role)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (userRole !== 'admin') {
    return <Navigate to="/shop" replace />
  }

  return children
}

// Authentication status component - shows loading state
export const AuthStatus = () => {
  const dispatch = useAppDispatch()
  const { isInitializing, isAuthenticated, user, error } = useAppSelector((state: any) => state.auth)

  useEffect(() => {
    // If initialization completes and user is restored, fetch cart/wishlist
    if (!isInitializing && isAuthenticated && user) {
      dispatch(fetchCartThunk()).unwrap()
      dispatch(fetchWishlistThunk()).unwrap()
    }
  }, [isInitializing, isAuthenticated, user, dispatch])

  if (isInitializing) {
    return null // Render nothing during initialization
  }

  if (error) {
    return <p className="text-red-500">Authentication error: {error}</p>
  }

  return null
}