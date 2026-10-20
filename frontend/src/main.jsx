import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './i18n'
import './index.css' 

import { ThemeProvider } from './contexts/ThemeContext'

import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Contact from './pages/Contact'
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard'

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <h1>Shop Page</h1> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
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
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)