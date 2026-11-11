import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAppSelector } from '../../hooks/useAppSelector'
import {
  selectIsInitializing,
  selectIsAuthenticated,
  selectUser,
} from '../../features/auth/authSlice.jsx'

// Full-screen boot loader shown while the session is being restored, so protected
// pages never flash a redirect before we know whether the visitor is logged in.
const AuthLoader = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-[#e8363c]" strokeWidth={2} />
  </div>
)

// Requires an authenticated user with one of the allowed roles.
export const ProtectedRoute = ({ children, allowedRoles = ['customer', 'admin'] }) => {
  const isInitializing = useAppSelector(selectIsInitializing)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const location = useLocation()

  if (isInitializing) return <AuthLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// Public-only pages (login/register). Logged-in users are sent to the shop, or
// back to the page they were trying to reach before being asked to sign in.
export const GuestRoute = ({ children }) => {
  const isInitializing = useAppSelector(selectIsInitializing)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()

  if (isInitializing) return <AuthLoader />

  if (isAuthenticated) {
    const target = location.state?.from?.pathname || '/shop'
    return <Navigate to={target} replace />
  }

  return children
}

// Admin-only area.
export const AdminRoute = ({ children }) => {
  const isInitializing = useAppSelector(selectIsInitializing)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const location = useLocation()

  if (isInitializing) return <AuthLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute