import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import './i18n'
import './index.css'

import { store } from './app/store'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { RootProvider } from './app/provider'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/routes/ProtectedRoute'

import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'

// Storefront pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Account from './pages/Account'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import NotFound from './pages/NotFound'

// Admin pages
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminUsers from './pages/AdminUsers'
import AdminSettings from './pages/AdminSettings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootProvider />,
    children: [
      // Storefront (navbar + footer)
      {
        element: <UserLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'shop', element: <Shop /> },
          { path: 'product/:slug', element: <ProductDetail /> },
          { path: 'about', element: <About /> },
          { path: 'contact', element: <Contact /> },
          { path: 'wishlist', element: <Wishlist /> },
          { path: 'cart', element: <Cart /> },
          { path: 'login', element: <GuestRoute><Login /></GuestRoute> },
          { path: 'checkout', element: <ProtectedRoute><Checkout /></ProtectedRoute> },
          { path: 'account', element: <ProtectedRoute><Account /></ProtectedRoute> },
          { path: 'orders', element: <ProtectedRoute><Orders /></ProtectedRoute> },
          { path: 'orders/:id', element: <ProtectedRoute><OrderDetail /></ProtectedRoute> },
          { path: '*', element: <NotFound /> },
        ],
      },
      // Admin area (sidebar layout, admin-only)
      {
        path: 'admin',
        element: <AdminRoute><AdminLayout /></AdminRoute>,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'products', element: <AdminProducts /> },
          { path: 'orders', element: <AdminOrders /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'settings', element: <AdminSettings /> },
        ],
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)