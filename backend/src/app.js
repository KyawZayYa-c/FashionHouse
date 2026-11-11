require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();

// Serialize BSON Decimal128 (prices, totals) as plain JSON numbers instead of
// `{ "$numberDecimal": "..." }` objects, so the frontend can use them directly.
// JSON.stringify calls toJSON() first (yielding the $numberDecimal wrapper), then
// this replacer, so we normalise the wrapper here.
app.set('json replacer', (key, value) => {
  if (value && typeof value === 'object') {
    if (value.$numberDecimal !== undefined) return Number(value.$numberDecimal);
    if (value._bsontype === 'Decimal128') return Number(value.toString());
  }
  return value;
});

// Parse JSON / URL-encoded bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Security headers
app.use(helmet());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Rate limiting — skipped for the automated test environment (jest sets
// NODE_ENV=test), where the whole suite would otherwise exhaust the 300
// requests/minute window in a couple of test files and start failing with 429s.
if (config.env !== 'test') {
  const limiter = rateLimit({
    max: 300,
    windowMs: 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
}

// CORS configuration - allow the frontend origin (with credentials for cookies)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  config.clientUrl,
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Mount all API routers
const authRoutes = require('../routes/authRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const productRoutes = require('../routes/productRoutes');
const cartRoutes = require('../routes/cartRoutes');
const wishlistRoutes = require('../routes/wishlistRoutes');
const orderRoutes = require('../routes/orderRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const shipmentRoutes = require('../routes/shipmentRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const adminRoutes = require('../routes/adminRoutes');
const healthRouter = require('../routes/health');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint with database status
app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState;
  const dbStatus =
    state === 1 ? 'connected' : state === 2 ? 'connecting' : state === 3 ? 'disconnecting' : 'disconnected';
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: { status: dbStatus },
  });
});
app.use('/api', healthRouter);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error-handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  // Mongoose validation
  if (err.name === 'ValidationError' && !err.statusCode) {
    statusCode = 400;
    message = Object.values(err.errors || {}).map((e) => e.message).join(', ') || message;
  }

  if (config.env !== 'production') {
    console.error('Error:', err.stack || err.message);
  }

  const payload = { success: false, message };
  if (err.details) payload.errors = err.details;
  res.status(statusCode).json(payload);
});

module.exports = app;
// Compatibility for tests that import `.default`
module.exports.default = app;