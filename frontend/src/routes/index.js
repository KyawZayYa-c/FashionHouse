import { createBrowserRouter, createRoutesFromElement } from 'react-router-dom'
import publicRoutes from './pages/public'
import adminRoutes from './pages/admin'

export const router = createBrowserRouter([
  {
    path: '/',
    element: null,
    children: [
      ...publicRoutes,
      ...adminRoutes,
    ],
  },
])