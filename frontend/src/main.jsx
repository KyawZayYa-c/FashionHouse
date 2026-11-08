import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Route } from 'react-router-dom'
import './i18n'
import './index.css'

import { ThemeProvider } from './contexts/ThemeContext'
import { RootProvider } from './app/provider'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/routes/ProtectedRoute'

import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Contact from './pages/Contact'
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootProvider />,
    children: [
      // Public routes - guest access (login page visible to all, including authenticated)
      <Route path="login" element={<Login />} />

      // Protected customer routes - need authentication
      <Route path="cart" element={
        <ProtectedRoute allowedRoles={['customer', 'admin']}>
          <h1>Cart Page</h1>
        </ProtectedRoute>}
      />

      // Admin routes - protected
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<h1>Manage Products</h1>} />
      </Route>,
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <h1>Manage Products</h1> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </RootProvider>
  </React.StrictMode>
)