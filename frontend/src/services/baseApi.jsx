// Central API client for Fashion House.
//
// Every request is a same-origin `/api/...` call. In development the Vite proxy
// (vite.config.js) forwards `/api` to the Express backend on :5000, so the browser
// receives JSON — never the SPA index.html fallback. VITE_API_BASE_URL is empty for
// local dev and only set to a full origin when the build is hosted elsewhere.
//
// The backend wraps every payload in `{ success, message, data }`. `apiFetch`
// unwraps `data` on success and throws an `ApiError` (with the server message) on
// failure, so callers never have to think about the envelope.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

let authToken = null

// Auth uses an httpOnly cookie, but we also attach a Bearer token when we have one
// so requests still authenticate if third-party cookies are blocked.
export const setAuthToken = (token) => {
  authToken = token || null
}

export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const buildQuery = (params = {}) => {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      usp.append(key, value)
    }
  })
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, params, headers = {}, signal } = options

  const url = `${BASE_URL}${path}${buildQuery(params)}`
  const finalHeaders = { Accept: 'application/json', ...headers }

  let payload
  if (body !== undefined && body !== null) {
    finalHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  if (authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      credentials: 'include',
      signal,
    })
  } catch (networkError) {
    throw new ApiError(
      'Cannot reach the server. Make sure the backend is running on http://localhost:5000.',
      0
    )
  }

  // Read as text first so an HTML fallback produces a helpful error instead of a
  // cryptic "Unexpected token '<'" JSON parse crash.
  const text = await response.text()
  let json
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new ApiError(
      'The server returned a non-JSON response. Check that the backend is running and the /api proxy is configured.',
      response.status
    )
  }

  if (!response.ok || json.success === false) {
    throw new ApiError(
      json.message || `Request failed (${response.status})`,
      response.status,
      json.errors || []
    )
  }

  return json.data !== undefined ? json.data : json
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  register: (data) => apiFetch('/api/auth/register', { method: 'POST', body: data }),
  login: (data) => apiFetch('/api/auth/login', { method: 'POST', body: data }),
  me: () => apiFetch('/api/auth/me'),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  updateProfile: (data) => apiFetch('/api/auth/profile', { method: 'PUT', body: data }),
  changePassword: (data) => apiFetch('/api/auth/change-password', { method: 'PUT', body: data }),
}

// ---------------------------------------------------------------------------
// Catalog (public)
// ---------------------------------------------------------------------------
export const catalogApi = {
  getProducts: (params) => apiFetch('/api/products', { params }),
  getFeatured: (limit = 8) => apiFetch('/api/products/featured', { params: { limit } }),
  search: (query) => apiFetch('/api/products/search', { params: { query } }),
  getBySlug: (slug) => apiFetch(`/api/products/slug/${slug}`),
  getById: (id) => apiFetch(`/api/products/${id}`),
  getCategories: () => apiFetch('/api/categories'),
  // Admin mutations
  create: (data) => apiFetch('/api/products', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/api/products/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiFetch(`/api/products/${id}`, { method: 'DELETE' }),
}

export const categoryApi = {
  list: () => apiFetch('/api/categories'),
  create: (data) => apiFetch('/api/categories', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/api/categories/${id}`, { method: 'PUT', body: data }),
  remove: (id) => apiFetch(`/api/categories/${id}`, { method: 'DELETE' }),
}

// ---------------------------------------------------------------------------
// Cart (authenticated). Backend routes: /api/cart/items[/:itemId], /api/cart/clear
// ---------------------------------------------------------------------------
export const cartApi = {
  get: () => apiFetch('/api/cart'),
  add: ({ productId, variantId, quantity = 1 }) =>
    apiFetch('/api/cart/items', { method: 'POST', body: { productId, variantId, quantity } }),
  update: ({ productId, variantId, quantity }) =>
    apiFetch(`/api/cart/items/${variantId}`, {
      method: 'PUT',
      body: { productId, variantId, quantity },
    }),
  remove: ({ productId, variantId }) =>
    apiFetch(`/api/cart/items/${variantId}`, {
      method: 'DELETE',
      body: { productId, variantId },
    }),
  clear: () => apiFetch('/api/cart/clear', { method: 'DELETE' }),
}

// ---------------------------------------------------------------------------
// Wishlist (authenticated)
// ---------------------------------------------------------------------------
export const wishlistApi = {
  get: () => apiFetch('/api/wishlist'),
  add: (productId) => apiFetch(`/api/wishlist/${productId}`, { method: 'POST' }),
  remove: (productId) => apiFetch(`/api/wishlist/${productId}`, { method: 'DELETE' }),
  clear: () => apiFetch('/api/wishlist/clear', { method: 'DELETE' }),
}

// ---------------------------------------------------------------------------
// Orders (authenticated)
// ---------------------------------------------------------------------------
export const orderApi = {
  create: (data) => apiFetch('/api/orders', { method: 'POST', body: data }),
  myOrders: (params) => apiFetch('/api/orders/my-orders', { params }),
  myOrderById: (id) => apiFetch(`/api/orders/my-orders/${id}`),
  cancel: (id, reason) =>
    apiFetch(`/api/orders/${id}/cancel`, { method: 'PUT', body: { reason } }),
  // Admin
  allOrders: (params) => apiFetch('/api/orders/admin/all', { params }),
  updateStatus: (id, status) =>
    apiFetch(`/api/orders/admin/${id}/status`, { method: 'PUT', body: { status } }),
}

// ---------------------------------------------------------------------------
// Admin (authenticated + admin role)
// ---------------------------------------------------------------------------
export const adminApi = {
  dashboard: () => apiFetch('/api/admin/dashboard'),
  recentOrders: () => apiFetch('/api/admin/recent-orders'),
  lowStock: () => apiFetch('/api/admin/low-stock'),
  customers: () => apiFetch('/api/admin/customers'),
  sales: () => apiFetch('/api/admin/sales'),
  bestSelling: () => apiFetch('/api/admin/best-selling'),
}

// ---------------------------------------------------------------------------
// Helpers shared by slices/pages
// ---------------------------------------------------------------------------

// Prices are stored as Decimal128 and may arrive as a number, a numeric string,
// or a `{ $numberDecimal: "..." }` object. Normalise all of them to a Number.
export const parsePrice = (value) => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value.$numberDecimal !== undefined) {
    return Number(value.$numberDecimal)
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export const primaryImage = (images, fallback = '') => {
  if (!Array.isArray(images) || images.length === 0) return fallback
  const primary = images.find((img) => img.isPrimary)
  return (primary || images[0]).url || fallback
}

export const formatKyat = (value) =>
  `${Math.round(parsePrice(value)).toLocaleString('en-US')} Ks`