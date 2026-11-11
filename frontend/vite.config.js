import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The frontend talks to the backend through same-origin `/api/...` requests.
// In development Vite forwards those to the Express server on port 5000 so the
// browser never receives the SPA `index.html` fallback for an API call (which
// was the cause of: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`).
// VITE_API_BASE_URL stays empty for local dev; set it to a full backend origin
// only when the built frontend is served from a different host.
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})