import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import connectDB from './config/db.js'

// Initialize Express
const app = express()

// Connect to MongoDB
connectDB()

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }))

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Security headers
app.use(helmet())

// Data sanitization against NoSQL injection
app.use(mongoSanitize())

// Rate limiting
const limiter = rateLimit({ max: 100, windowMs: 60 * 1000 })
app.use('/api/', limiter)

// CORS configuration - allow frontend origin
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
]
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      callback(new Error('Not allowed by CORS'))
    } else {
      callback(null, true)
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))

// Base API route prefix
import healthRouter from './routes/health.js'
app.use('/api', healthRouter)

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' })
})

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.stack || err.message)
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  res.status(statusCode).json({ success: false, message })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})

export default app