import React from 'react'
import { Outlet } from 'react-router-dom'
import './styles/global.css'

// Global CSS import for foundational styles
import '@fontsource/react-inter' // Will be installed as a dependency

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Outlet />
    </div>
  )
}

export default App