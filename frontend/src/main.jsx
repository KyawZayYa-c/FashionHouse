import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import App from './App.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <h1>Home Page</h1> },
      { path: '/admin/login', element: <h1>Admin Login Page</h1> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router router={router} />
  </React.StrictMode>
)