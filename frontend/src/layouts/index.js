import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Public Header - shown on public pages
const PublicHeader = () => {
  const navigate = useNavigate()

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            Fashion House
          </Link>
          <nav>
            <ul className="flex gap-6">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

// Admin Header - shown on admin pages
const AdminHeader = () => {
  const navigate = useNavigate()

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-primary">Fashion House</span>
        </div>
        <nav>
          <ul className="flex gap-6">
            <li>
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <button
                onClick={() => navigate('/admin/login')}
                className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

// Public Layout wrapper
const PublicLayout = ({ children }) => {
  return (
    <div>
      <PublicHeader />
      <main className="py-8">
        {children}
      </main>
    </div>
  )
}

// Admin Layout wrapper
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <AdminHeader />
      <main className="container py-6">
        {children}
      </main>
    </div>
  )
}

export { PublicLayout, AdminHeader, AdminLayout }