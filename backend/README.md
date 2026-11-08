# Fashion House - Backend API

## Project Introduction

Fashion House is a full-stack e-commerce website for selling clothing and fashion items. The backend is built with Node.js, Express.js, and MongoDB, providing a RESTful API for the frontend React application.

## Backend Architecture

The backend follows a **Model-View-Controller (MVC)** architecture pattern with a clear separation of concerns:

```
Routes → Controllers → Services → Models
         ↑              ↑              ↑
   HTTP Layer    Business Logic   MongoDB ODM
```

### Layer Responsibilities

- **Routes**: Express router that defines API endpoints, applies middleware (authentication, authorization, validation), and directs requests to controllers.
- **Controllers**: Handle HTTP requests, extract parameters, call services, and return formatted JSON responses. Import services only - never directly access Mongoose models.
- **Services**: Contains all business logic including order creation, payment processing, stock management, shipping calculations, review validation, and admin operations. Uses Mongoose models for database operations.
- **Models**: Mongoose schemas defining data structures for users, products, categories, orders, payments, shipments, reviews, and wishlists. Defines validation rules, indexes, and relationships.

### Request Flow

1. Client sends HTTP request to Express server
2. Middleware (CORS, helmet, rate limiting, mongoSanitize) processes the request
3. Authentication middleware validates JWT token if present
4. Route directs request to appropriate controller
5. Controller calls service layer with request parameters
6. Service interacts with MongoDB via Mongoose models
5. Response flows back through controller → middleware → client

## Technology Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM (Object Data Modeling)
- **MongoDB** - NoSQL database
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable loading
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **express-rate-limit** - Request throttling
- **express-mongo-sanitize** - NoSQL injection protection

## Folder Structure

```
backend/
├── src/
│   ├── app.js              # Express application entry point
│   ├── server.js           # Server initialization (imports app)
│   ├── config/
│   │   └── db.js           # MongoDB connection configuration
│   ├── models/             # Mongoose schemas (9 models)
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Payment.js
│   │   ├── Shipment.js
│   │   ├── Review.js
│   │   └── Wishlist.js
│   ├── services/           # Business logic (5 services)
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   ├── shipmentService.js
│   │   ├── reviewService.js
│   │   └── adminService.js
│   ├── controllers/        # API controllers (10 controllers)
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── wishlistController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── shipmentController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── routes/             # API routes (11 route files)
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── shipmentRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── adminRoutes.js
│   │   └── health.js
│   ├── utils/              # Utility modules
│   │   ├── catchAsync.js   # Async error handler wrapper
│   │   ├── responseHandler.js  # Consistent JSON response format
│   │   ├── errorHelper.js  # Custom error classes
│   │   └── jwtToken.js     # JWT generation and verification
│   └── middleware/           # Express middleware
│       ├── authMiddleware.js    # JWT authentication
│       ├── adminMiddleware.js   # Admin role verification
│       ├── validateObjectId.js # MongoDB ObjectId validation
│       └── validator.js        # Request validation schemas
│   └── index.js            # Module exports
├── routes/                 # Legacy routes (same as src/routes)
├── tests/                  # Jest test files (10 test files)
├── .env.example            # Environment variable examples
├── package.json            # Dependencies and scripts
└── .gitignore              # Git ignore rules
```

## Installation Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher) - local or cloud instance
- npm (v9 or higher)

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fashion-house
   ```

2. **Install dependencies**:
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration values
   ```

4. **Start the development server**:
   ```bash
   # From root directory
   npm run start:backend
   
   # Or from backend directory
   npm run dev
   ```

5. **Start the frontend** (separate terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

### Development vs Production

- **Development**: `npm run start:backend` uses `NODE_ENV=development`
- **Production**: Set `NODE_ENV=production` and ensure proper SSL/configuration

## Required Dependencies

The following packages are required (defined in `backend/package.json`):

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| mongoose | ^7.5.0 | MongoDB ODM |
| dotenv | ^16.3.1 | Environment variables |
| cors | ^2.8.5 | CORS middleware |
| helmet | ^7.0.0 | Security headers |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.0 | JWT authentication |
| multer | ^1.4.5-lts.1 | File upload handling |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| jest | ^29.0.0 | Testing framework |
| supertest | ^2.0.0 | HTTP testing library |
| mongodb | ^6.0.0 | MongoDB driver (for tests) |
| ts-node | ^9.0.0 | TypeScript node runner (if needed) |
| @types/jest | ^29.0.0 | Jest TypeScript types |
| @types/supertest | ^2.0.0 | SuperTest TypeScript types |

## Environment Configuration

### .env.example (Backend)

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Client Configuration
CLIENT_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/fashion_house

# Security
BCRYPT_SALT_ROUNDS=10
JWT_SECRET_KEY=change-this-to-a-secure-random-string
JWT_EXPIRES_IN=7d

# File Upload Configuration
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Important Notes

- **Never commit** the `.env` file to version control - it contains sensitive values
- The `.env.example` file is tracked and contains **safe placeholder values only**
- The `JWT_SECRET_KEY` should be a long, random string in production
- The `MONGODB_URI` can be a local MongoDB URI or a MongoDB Atlas connection string
- The `CLIENT_URL` should match the frontend development server URL

### MongoDB Setup

#### Local Development

1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. The database `fashion_house` will be created automatically
4. Use `mongodb://127.0.0.1:27017/fashion_house` as the connection URI

#### MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a new cluster
3. Whitelist your IP address in the cluster security settings
4. Create a database user with readWrite permissions
5. Use the connection string provided by Atlas

#### Database Collections

The backend automatically creates collections based on the Mongoose models:

- `users` - User accounts and profiles
- `categories` - Product categories
- `products` - Product catalog
- `carts` - User shopping carts
- `orders` - Order records
- `payments` - Payment records
- `shipments` - Shipment tracking
- `reviews` - Product reviews
- `wishlists` - User wishlists

## How to Start Development Server

### Option 1: From Root Directory (Recommended)

```bash
cd fashion-house
npm install          # Install all dependencies (frontend + backend)
npm run start:all    # Start both frontend and backend concurrently
```

This will start:
- Frontend: Vite dev server at http://localhost:5173
- Backend: Express server at http://localhost:5000

### Option 2: Separate Servers

```bash
# Start backend only
cd backend
npm install
npm run start:backend  # or: node src/server.js

# Start frontend only  
cd frontend
npm install
npm run dev          # Vite dev server at http://localhost:5173
```

### Option 3: Development with nodemon

```bash
cd backend
npm run dev          # nodemon watch mode (auto-restart on file changes)
```

## How to Run Tests

### Prerequisites

- Jest supertest mongodb installed

### Running Tests

```bash
# From backend directory
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.js

# Run tests with verbose output
npm test -- --verbose
```

### Test Database

Tests use a separate database `mongodb://127.0.0.1:27017/fashion_test` which is:
- Cleared before each test
- Dropped after all tests complete
- Isolated from production and development databases

### Test Output

Tests report:
- Number of passed/failed tests
- Error messages for failures
- Execution time

### Test Coverage

All major API endpoints are tested:
- Authentication (register, login, profile)
- Categories (CRUD operations)
- Products (CRUD, search, featured)
- Cart (add, update, remove, clear)
- Orders (create, cancel, get my orders)
- Payments (create, verify)
- Shipments (create, track, update)
- Reviews (create, get, update, delete)
- Wishlist (add, remove, clear)
- Admin (dashboard, sales, customers, low-stock, best-selling, recent orders)

## Authentication Explanation

### JWT Authentication Flow

1. **User Registration/Login**
   - User provides username, email, and password
   - Password is hashed using bcryptjs with 10 salt rounds
   - JWT access token is generated using jsonwebtoken
   - Token includes user ID and role

2. **Token Usage**
   - Token is sent in `Authorization: Bearer <token>` header
   - Middleware verifies the token and attaches `req.user` with user data
   - Token expires after `JWT_EXPIRES_IN` (7 days by default)

3. **Token Refresh**
   - Access tokens expire; long-lived refresh tokens can be implemented
   - Currently, users must re-authenticate after expiration

4. **Role-Based Access**

   - **Customer role**: Can access customer endpoints (profile, cart, orders, payments, reviews)
   - **Admin role**: Can access admin-only endpoints (dashboard, sales, customer lists, product management)
   - Middleware checks `req.user.role` to authorize requests

5. **Public Endpoints** (no authentication required)
   - Product browsing (`GET /api/products`)
   - Category browsing (`GET /api/categories`)
   - Product reviews viewing (`GET /api/reviews/product/:productId`)
   - Public shipment tracking (`GET /api/shipments/track/:trackingNumber`)

6. **Authentication Endpoints**
   - `POST /api/auth/register` - Public (no token required)
   - `POST /api/auth/login` - Public (no token required)
   - `GET /api/auth/me` - Protected (requires valid token)
   - `PUT /api/auth/profile` - Protected
   - `PUT /api/auth/change-password` - Protected

### Admin Role Explanation

- **Admin users** have `role: 'admin'` in their user document
- Admin middleware checks `req.user.role === 'admin'` before granting access
- Admin endpoints include:
  - Dashboard statistics
  - Sales reports
  - Customer management
  - Product management
  - Order management
  - Payment verification
  - Shipment management
  - Stock management

- **Non-admin users** attempting admin endpoints receive a 403 Forbidden error
- Admin users can be created during registration or by an existing admin

### Password Security

- Passwords are **never stored in plain text**
- bcryptjs hashes passwords with 10 salt rounds
- Password hash is stored in `passwordHash` field (select: false in queries)
- Passwords are **never exposed** in API responses
- The `passwordHash` field is excluded from `toJSON()` output

## Error Handling Explanation

### Error Response Format

All API errors follow a consistent JSON format:

```json
{
  "success": false,
  "message": "Error message description",
  "errors": []  // Optional array of validation errors
}
```

### Error Types

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| **ValidationError** | 400 | Missing or invalid request parameters/body |
| **AuthError** | 401 | Not authenticated, invalid/expired token |
| **ForbiddenError** | 403 | authenticated but not authorized (admin only) |
| **NotFoundError** | 404 | Requested resource not found |
| **ConflictError** | 409 | Duplicate resource (email, username, slug, etc.) |
| **RateLimitError** | 429 | Too many requests (rate limit exceeded) |

### Error Middleware

Express's global error handler is the last middleware in the stack:

```javascript
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack || err.message);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});
```

### Common Error Scenarios

| Scenario | Error | Status |
|----------|-------|--------|
| Missing required field | ValidationError | 400 |
| Invalid JWT token | AuthError | 401 |
| Admin access by customer | ForbiddenError | 403 |
| Product not found | NotFoundError | 404 |
| Duplicate email | ConflictError | 409 |
| 100 requests/minute exceeded | RateLimitError | 429 |
| Unexpected server error | Internal Error | 500 |

### Error Propagation

- `catchAsync` wrapper catches async errors and passes them to Express error middleware
- Custom error classes (`AppError`, `ValidationError`, `AuthError`, etc.) set `statusCode` and `isOperational` properties
- Operational errors (expected) propagate to error middleware with appropriate status
- Programming errors (bugs) may result in 500 Internal Server Error

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### 1. Authentication

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | /api/auth/register | No | No | Register new user |
| POST | /api/auth/login | No | No | Login and get JWT token |
| GET | /api/auth/me | Yes | No | Get current user profile |
| PUT | /api/auth/profile | Yes | No | Update user profile |
| PUT | /api/auth/change-password | Yes | No | Change user password |
| POST | /api/auth/addresses | Yes | No | Add shipping address |
| PUT | /api/auth/addresses/:addressId | Yes | No | Update shipping address |
| DELETE | /api/auth/addresses/:addressId | Yes | No | Delete shipping address |

### 2. Categories

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | /api/categories | Yes | No | Create category |
| GET | /api/categories | Yes | No | Get all categories |
| GET | /api/categories/:id | Yes | No | Get category by ID |
| PUT | /api/categories/:id | Yes | No | Update category |
| DELETE | /api/categories/:id | Yes | No | Delete category |
| POST | /api/categories/admin | Yes | Yes | Admin create category |
| PUT | /api/categories/admin/:id | Yes | Yes | Admin update category |
| DELETE | /api/categories/admin/:id | Yes | Yes | Admin delete category |

### 3. Products

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | /api/products | Yes | No | Create product |
| GET | /api/products | Yes | No | Get all products with pagination |
| GET | /api/products/featured | Yes | No | Get featured products |
| GET | /api/products/search | Yes | No | Search products by query |
| GET | /api/products/:id | Yes | No | Get product by ID |
| GET | /api/products/slug/:slug | Yes | No | Get product by slug |
| POST | /api/products | Yes | No | Create product (duplicate) |
| PUT | /api/products/:id | Yes | No | Update product |
| DELETE | /api/products/:id | Yes | No | Delete product (soft) |

### 3. Cart

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | /api/cart | Yes | No | Get current user's cart |
| POST | /api/cart/items | Yes | No | Add item to cart |
| PUT | /api/cart/items/:itemId | Yes | No | Update cart item quantity |
| DELETE | /api/cart/items/:itemId | Yes | No | Remove cart item |
| DELETE | /api/cart/clear | Yes | No | Clear cart |

### 4. Wishlist

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | /api/wishlist | Yes | No | Get user's wishlist |
| POST | /api/wishlist/:productId | Yes | No | Add product to wishlist |
| DELETE | /api/wishlist/:productId | Yes | No | Remove product from wishlist |
| DELETE | /api/wishlist/clear | Yes | No | Clear wishlist |

### 4. Orders

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | /api/orders | Yes | No | Create order from cart |
| GET | /api/orders/my-orders | Yes | No | Get current user's orders |
| GET | /api/orders/my-orders/:id | Yes | No | Get specific order |
| GET | /api/orders/:id | Yes | No | Get order by ID |
| PUT | /api/orders/:id/cancel | Yes | No | Cancel order |
| GET | /api/orders/admin/all | Yes | Yes | Admin: get all orders |
| PUT | /api/orders/admin/:id/status | Yes | Yes | Admin: update order status |

### 5. Payments

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | /api/payments | Yes | No | Create payment record |
| GET | /api/payments/order/:orderId | Yes | No | Get payment by order |
| GET | /api/payments/:id | Yes | No | Get payment by ID |
| PUT | /api/payments/:id/verify | Yes | Yes | Admin verify payment |

### 6. Shipments

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | /api/shipments | Yes | Yes | Create shipment |
| GET | /api/shipments/track/:trackingNumber | Yes | No | Track shipment |
| GET | /api/shipments/order/:orderId | Yes | No | Get shipment by order |
| POST | /api/shipments | Yes | Yes | Admin create shipment |
| PUT | /api/shipments/:id | Yes | Yes | Admin update shipment |
| POST | /api/shipments/:id/tracking | Yes | Yes | Admin add tracking history |

### 7. Reviews

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | /api/reviews | Yes | No | Create product review |
| GET | /api/reviews/product/:productId | Yes | No | Get product reviews |
| GET | /api/reviews/my-reviews | Yes | No | Get user's reviews |
| PUT | /api/reviews/:id | Yes | No | Update review (ownership) |
| DELETE | /api/reviews/:id | Yes | No | Delete review (ownership) |

### 8. Admin Dashboard

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | /api/admin/dashboard | Yes | Yes | Get dashboard statistics |
| GET | /api/admin/sales | Yes | Yes | Get sales report |
| GET | /api/admin/customers | Yes | Yes | Get customer list |
| GET | /api/admin/low-stock | Yes | Yes | Get low-stock products |
| GET | /api/admin/best-selling | Yes | Yes | Get best-selling products |
| GET | /api/admin/recent-orders | Yes | Yes | Get recent orders |

## Postman Collection

### Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:5000/api` | Base API URL |
| `auth_token` | JWT token | Authentication token (login response) |
| `client_url` | `http://localhost:5173` | Frontend URL |

### Customer API Requests

#### 1. Register

```
POST http://localhost:5000/api/auth/register
Body: { "username": "user", "email": "user@example.com", "password": "password123" }
```

#### 2. Login

```
POST http://localhost:5000/api/auth/login
Body: { "email": "user@example.com", "password": "password123" }
Header: Authorization: Bearer <token> (login response)
```

#### 3. Get Profile

```
GET http://localhost:5000/api/auth/me
Header: Authorization: Bearer <token>
```

#### 4. Add to Cart

```
POST http://localhost:5000/api/cart/items
Header: Authorization: Bearer <token>
Body: { "productId": "prodId", "variantId": "varId", "quantity": 2 }
```

#### 5. Create Order

```
POST http://localhost:5000/api/orders
Header: Authorization: Bearer <token>
Body: { "deliveryFee": 0, "discount": 0 }
```

#### 6. Track Shipment

```
GET http://localhost:5000/api/shipments/track/FE123456789
```

#### 7. Verify Payment

```
PUT http://localhost:5000/api/payments/paymentId/verify
Header: Authorization: Bearer <token> (admin)
```

### Admin API Requests

#### 1. Dashboard Stats

```
GET http://localhost:5000/api/admin/dashboard
Header: Authorization: Bearer <admin_token>
```

#### 2. Sales Report

```
GET http://localhost:5000/api/admin/sales?startDate=2024-01-01&endDate=2024-12-31
Header: Authorization: Bearer <admin_token>
```

#### 3. Customer List

```
GET http://localhost:5000/api/admin/customers?page=1&limit=10
Header: Authorization: Bearer <admin_token>
```

#### 3. Low Stock Products

```
GET http://localhost:5000/api/admin/low-stock?threshold=10
Header: Authorization: Bearer <admin_token>
```

### Product Management Requests

#### 1. Create Product

```
POST http://localhost:5000/api/products
Header: Authorization: Bearer <token>
Body: { "categoryId": "catId", "productName": "Product Name", "slug": "product-name", "description": "Description", "brand": "Brand", "price": 29.99, "variants": [...], "images": [...] }
```

#### 2. Update Product

```
PUT http://localhost:5000/api/products/productId
Header: Authorization: Bearer <token>
Body: { "productName": "New Name", "price": 39.99 }
```

#### 3. Search Products

```
GET http://localhost:5000/api/products/search?query=T-Shirt
```

#### 4. Get Featured Products

```
GET http://localhost:5000/api/products/featured?limit=8
```

### Cart and Checkout Requests

#### 1. Add to Cart

```
POST http://localhost:5000/api/cart/items
Header: Authorization: Bearer <token>
Body: { "productId": "prod_65xyz", "variantId": "var_abc", "quantity": 1 }
```

#### 2. Update Cart Quantity

```
PUT http://localhost:5000/api/cart/items/itemId
Header: Authorization: Bearer <token>
Body: { "quantity": 3 }
```

#### 3. Place Order

```
POST http://localhost:5000/api/orders
Header: Authorization: Bearer <token>
Body: { "deliveryFee": 5.99, "discount": 0 }
```

### Order and Shipment Tracking Requests

#### 1. Get Order by ID

```
GET http://localhost:5000/api/orders/orderId
Header: Authorization: Bearer <token>
```

#### 2. Track Shipment

```
GET http://localhost:5000/api/shipments/track/FE123456789
```

#### 3. Get Shipment by Order

```
GET http://localhost:5000/api/shipments/order/orderId
Header: Authorization: Bearer <token>
```

### Payment and Review Requests

#### 1. Create Payment

```
POST http://localhost:5000/api/payments
Header: Authorization: Bearer <token>
Body: { "orderId": "orderId", "paymentMethod": "cod", "amount": 29.99 }
```

#### 2. Create Review

```
POST http://localhost:5000/api/reviews
Header: Authorization: Bearer <token>
Body: { "productId": "prodId", "orderId": "orderId", "rating": 5, "reviewText": "Great product!" }
```

#### 3. Update Review

```
PUT http://localhost:5000/api/reviews/reviewId
Header: Authorization: Bearer <token>
Body: { "rating": 4, "reviewText": "Updated review text" }
```

## General Rules

### Request Validation

All request parameters and bodies are validated using custom validators. Invalid requests return 400 Bad Request with error details.

### Authentication State

- **Unauthenticated**: Can access public endpoints only
- **Authenticated customer**: Can access customer endpoints with valid JWT
- **Authenticated admin**: Can access both customer and admin endpoints

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful request |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded, no response body |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthenticated - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Unexpected error |

## Installation & Setup Summary

### Quick Start

```bash
# 1. Install
cd fashion-house
npm install

# 2. Environment
cd backend
cp .env.example .env
# Edit .env with your values

# 3. Start
npm run start:all

# 4. Access
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api
# Health: GET http://localhost:5000/api/health
```

### Development Workflow

```bash
# Frontend (separate terminal)
cd frontend
npm run dev       # Vite dev server

# Backend (separate terminal)  
cd backend
npm run start:dev   # nodemon watch mode

# Run tests
cd backend
npm test            # Run all tests
npm run test:watch  # Watch mode
```

### Production Deployment

```bash
# Set production environment
export NODE_ENV=production

# Use process managers like PM2
pm2 start src/server.js

# Ensure SSL/HTTPS for production
# Configure domain, DNS, and firewall rules
```

## Security Checklist

- [ ] JWT secrets are random and not committed to repository
- [ ] bcrypt salt rounds are appropriate (10 is recommended)
- [ ] CORS is restricted to known origins
- [ ] Rate limiting prevents abuse
- [ ] mongoSanitize prevents NoSQL injection
- [ ] Helmet adds security headers
- [ ] Passwords are hashed, never plain text
- [ ] Environment variables are used for all secrets
- [ ] .env file is gitignored
- [ ] Error messages don't expose internal details
- [ ] Admin endpoints require admin role verification
- [ ] ObjectId validation prevents injection
- [ ] Body parsing limits prevent abuse