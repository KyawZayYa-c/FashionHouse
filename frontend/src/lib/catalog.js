import { parsePrice, primaryImage } from '../services/baseApi.jsx'

// Store-wide commerce rules shared by the cart, checkout and order summaries.
export const FREE_SHIPPING_THRESHOLD = 80000
export const DELIVERY_FEE = 3000
export const deliveryFeeFor = (subtotal) =>
  subtotal >= FREE_SHIPPING_THRESHOLD || subtotal <= 0 ? 0 : DELIVERY_FEE

// A branded, self-contained placeholder so a missing/offline remote image never
// renders as a broken icon. Keeps the storefront coherent without network access.
export const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='750' viewBox='0 0 600 750'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23efe9df'/%3E%3Cstop offset='1' stop-color='%23e2d9ca'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='750' fill='url(%23g)'/%3E%3Cg fill='none' stroke='%23b0161d' stroke-width='6' opacity='0.55'%3E%3Cpath d='M230 250l70-40 70 40 50 30-30 50-30-18v180H240V312l-30 18-30-50z'/%3E%3C/g%3E%3Ctext x='300' y='560' font-family='Georgia,serif' font-size='34' fill='%230d0d0f' opacity='0.5' text-anchor='middle'%3EFashion House%3C/text%3E%3C/svg%3E"

export const totalStock = (product) =>
  (product?.variants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0)

export const firstAvailableVariant = (product) =>
  (product?.variants || []).find((v) => Number(v.stock) > 0) ||
  (product?.variants || [])[0] ||
  null

export const effectivePrice = (product, variant) =>
  parsePrice(product?.price) + parsePrice(variant?.additionalPrice)

export const productImage = (product) => primaryImage(product?.images, FALLBACK_IMAGE)

export const productHref = (product) => `/product/${product?.slug || product?._id || ''}`

// Distinct sizes / colours for filter chips and selectors.
export const uniqueValues = (variants, key) => [
  ...new Set((variants || []).map((v) => v[key]).filter(Boolean)),
]

// Approximate a CSS colour from a fashion colour name so selectors can show a
// real swatch. Compound names ("Gold/Brown") use the first token. Unknown names
// fall back to a neutral taupe rather than an invisible dot.
const COLOR_MAP = {
  black: '#1a1a1a', white: '#f5f5f0', ivory: '#f3ecd9', oat: '#e4d8c3',
  sand: '#d8c3a0', camel: '#c19a6b', tan: '#c8a06a', cognac: '#9a5b34',
  charcoal: '#3a3a3e', slate: '#5a6472', grey: '#9a9a9a', gray: '#9a9a9a',
  silver: '#c7ccd1', steel: '#8b95a1', navy: '#1f2a44', indigo: '#3b4a6b',
  blue: '#2f5bff', 'sky blue': '#9cc4e4', sky: '#9cc4e4', forest: '#2f5d3a',
  green: '#3f7d4f', red: '#c0392b', rosewood: '#8c4a4a', champagne: '#e7d4b5',
  gold: '#d4af37', brown: '#6b4a2b', washed: '#3a3a3e',
}

export const colorSwatch = (name = '') => {
  const key = String(name).toLowerCase().split('/')[0].trim()
  if (COLOR_MAP[key]) return COLOR_MAP[key]
  const found = Object.keys(COLOR_MAP).find((k) => key.includes(k))
  return found ? COLOR_MAP[found] : '#b8a98f'
}

// True when a name reads as a light colour (used to pick a readable check mark).
export const isLightColor = (name = '') => {
  const hex = colorSwatch(name).replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}