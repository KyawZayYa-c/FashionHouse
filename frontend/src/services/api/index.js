import axios from 'axios'

// Create Axios instance with base URL from environment variable
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Add request interceptor for authentication tokens etc.
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if available
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific error status codes
      console.error('API Error:', error.response.status, error.response.data)
    } else {
      console.error('API Error:', error.message)
    }
    return Promise.reject(error)
  }
)

// API services
export const api = {
  // Public endpoints
  products: {
    list: (params = {}) => apiClient.get('/products', { params }),
    detail: (id) => apiClient.get(`/products/${id}`),
  },
  categories: {
    list: (params = {}) => apiClient.get('/categories', { params }),
  },
  cart: {
    add: (item) => apiClient.post('/cart', item),
    remove: (id) => apiClient.delete(`/cart/${id}`),
  },
  // Admin endpoints
  admin: {
    auth: {
      login: (credentials) => apiClient.post('/admin/auth/login', credentials),
      logout: () => apiClient.post('/admin/auth/logout'),
    },
    products: {
      list: (params = {}) => apiClient.get('/admin/products', { params }),
      create: (productData) => apiClient.post('/admin/products', productData),
      update: (id, productData) => apiClient.put(`/admin/products/${id}`, productData),
      delete: (id) => apiClient.delete(`/admin/products/${id}`),
    },
    categories: {
      list: (params = {}) => apiClient.get('/admin/categories', { params }),
      create: (categoryData) => apiClient.post('/admin/categories', categoryData),
      update: (id, categoryData) => apiClient.put(`/admin/categories/${id}`, categoryData),
      delete: (id) => apiClient.delete(`/admin/categories/${id}`),
    },
    orders: {
      list: (params = {}) => apiClient.get('/admin/orders', { params }),
      update: (id, status) => apiClient.put(`/admin/orders/${id}/status`, { status }),
    },
    dashboard: {
      stats: () => apiClient.get('/admin/dashboard/stats'),
    },
  },
}

export default apiClient