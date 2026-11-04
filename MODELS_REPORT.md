# Mongoose Models Implementation Report

## Overview

Successfully created all 9 Mongoose models for the Fashion House e-commerce website. All models follow the project's existing architecture and use ES Modules (compatible with `"type": "module"` in backend package.json).

## Created Model Files

| # | Model File | Size |
|---|-----------|------|
| 1 | `User.js` | 2,376 bytes |
| 2 | `Category.js` | 736 bytes |
| 3 | `Product.js` | 4,027 bytes |
| 4 | `Cart.js` | 2,963 bytes |
| 5 | `Order.js` | 4,688 bytes |
| 6 | `Payment.js` | 1,611 bytes |
| 7 | `Shipment.js` | 2,876 bytes |
| 8 | `Review.js` | 1,679 bytes |
| 9 | `Wishlist.js` | 808 bytes |

## Model Details

### 1. User Model (`User.js`)

- **Fields**: username (required, unique, trimmed, lowercase), email (required, unique, lowercase, trimmed), passwordHash (required, select: false), phone, role (enum: customer/admin, default: customer), addresses (embedded schema with recipientName, phone, address, township, city, isDefault), isActive (default: true)
- **Timestamps**: Enabled
- **Indexes**: Unique index on username, unique index on email
- **Methods**: 
  - `toJSON()` - excludes passwordHash from query results
  - `isEmailTaken()` - static method to check email duplication
  - `isUsernameTaken()` - static method to check username duplication
- **Validation**: Prevents duplicate emails and usernames

### 2. Category Model (`Category.js`)

- **Fields**: categoryName (required, trimmed), slug (required, unique, lowercase), description, imageUrl, status (enum: active/inactive, default: active)
- **Timestamps**: Enabled
- **Indexes**: Unique index on slug
- **Validation**: Lowercase slug normalization, enum validation for status

### 3. Product Model (`Product.js`)

- **Fields**: categoryId (ObjectId, ref: Category, required), productName (required, trimmed), slug (required, unique, lowercase), description (required), brand, price (Decimal128, required, min 0), variants (embedded array with sku, size, color, stock, additionalPrice), images (embedded array with url, isPrimary, displayOrder), status (enum: active/inactive/out_of_stock, default: active), isFeatured (default: false)
- **Timestamps**: Enabled
- **Indexes**: Unique index on slug, index on categoryId, index on status + createdAt, index on variants.sku
- **Methods**:
  - `getVariantsBySize()` - filter variants by size
  - `getVariantsByColor()` - filter variants by color
  - `isSKUExists()` - static check for duplicate SKU within product
  - `findFeatured()` - find featured products
  - `findByCategory()` - find products by category
  - `searchProducts()` - search by name/description
- **Validation**: 
  - Only one primary image allowed per product
  - Variant SKU uniqueness within same product
  - Decimal128 for monetary values

### 4. Cart Model (`Cart.js`)

- **Fields**: userId (ObjectId, ref: User, unique: true), items (embedded array with productId, variantId, quantity, price), totalAmount (Decimal128, default 0)
- **Timestamps**: Enabled
- **Indexes**: Unique index on userId (ensures one cart per user)
- **Methods**:
  - `addItem()` - add item or increase quantity
  - `removeItem()` - remove item from cart
  - `updateQuantity()` - update item quantity
  - `getItem()` - get cart item by product/variant
- **Validation**: Minimum quantity 1, price validation

### 5. Order Model (`Order.js`)

- **Fields**: userId (ObjectId, ref: User, required), orderNumber (required, unique), items (embedded array with productId, variantId, productName, sku, size, color, price, quantity, subtotal), shippingAddress (embedded snapshot with recipientName, phone, address, township, city), subtotal, deliveryFee, discount, totalAmount, orderStatus (enum), paymentStatus (enum), notes
- **Timestamps**: Enabled
- **Indexes**: Unique index on orderNumber, index on userId, index on orderStatus, compound index on userId + createdAt
- **Methods**:
  - `calculateTotals()` - calculate subtotal, delivery fee, discount, total
  - `updateStatus()` - update order status with validation
  - `updatePaymentStatus()` - update payment status with validation
- **Static Methods**:
  - `findByUser()` - find orders by user
  - `findByStatus()` - find orders by status
  - `findByOrderNumber()` - find order by order number
- **Key Design**: Stores historical snapshots of product names, SKU, size, color, and price so previous orders are not affected by future product price changes

### 6. Payment Model (`Payment.js`)

- **Fields**: orderId (ObjectId, ref: Order, required), paymentMethod (enum: cod/bank_transfer/mobile_wallet, required), amount (Decimal128, required, min 0), paymentStatus (enum: pending/paid/failed/refunded, default: pending), transactionReference (unique), paidAt
- **Timestamps**: Enabled
- **Indexes**: Index on orderId
- **Methods**:
  - `markAsPaid()` - mark payment as paid with timestamp
  - `markAsFailed()` - mark payment as failed
  - `markAsRefunded()` - mark payment as refunded
- **Static Methods**:
  - `findByOrder()` - find payment by order ID
  - `findPending()` - find pending payments

### 7. Shipment Model (`Shipment.js`)

- **Fields**: orderId (ObjectId, ref: Order, required), courierName, trackingNumber (required, unique), shipmentStatus (enum: preparing/shipped/in_transit/out_for_delivery/delivered/failed/returned, default: preparing), trackingHistory (embedded array with status, location, description, timestamp), shippedAt, deliveredAt
- **Timestamps**: Enabled
- **Indexes**: Index on orderId, unique index on trackingNumber
- **Methods**:
  - `addTracking()` - add tracking history entry
  - `updateStatus()` - update shipment status with validation
- **Static Methods**:
  - `findByOrder()` - find shipment by order ID
  - `findByTrackingNumber()` - find shipment by tracking number
- **Design**: Tracking history entries sorted chronologically when retrieved; each entry has its own ObjectId

### 8. Review Model (`Review.js`)

- **Fields**: userId (ObjectId, ref: User, required), productId (ObjectId, ref: Product, required), orderId (ObjectId, ref: Order, required), rating (required, min 1, max 5), reviewText (trimmed)
- **Timestamps**: Enabled
- **Indexes**: Index on userId, index on productId, compound index on productId + createdAt (descending)
- **Unique Constraint**: Compound unique index on (userId, productId) prevents duplicate reviews
- **Static Methods**:
  - `findByProduct()` - find reviews by product
  - `findByUser()` - find reviews by user
  - `findVerifiedPurchases()` - find reviews with associated orderId
- **Validation**: Rating constrained between 1 and 5

### 9. Wishlist Model (`Wishlist.js`)

- **Fields**: userId (ObjectId, ref: User, required), productId (ObjectId, ref: Product, required)
- **Timestamps**: Enabled
- **Indexes**: Compound unique index on (userId, productId) prevents adding same product twice
- **Static Methods**:
  - `isProductInWishlist()` - check if product already in wishlist
- **Design**: Ensures each user can only have one entry per product

## Relationships Summary

| Model | References | Embedded Documents |
|-------|-----------|-------------------|
| User | - | addresses |
| Category | - | - |
| Product | categoryId → Category | variants, images |
| Cart | userId → User | items |
| Order | userId → Order items | shippingAddress snapshot |
| Payment | orderId → Order | - |
| Shipment | orderId → Order | trackingHistory |
| Review | userId → User, productId → Product, orderId → Order | - |
| Wishlist | userId → User, productId → Product | - |

## Database Configuration

- **Connection**: Reuses existing MongoDB connection from `backend/src/config/db.js`
- **URI**: `mongodb://127.0.0.1:27017/fashion_house` (from `.env.example`)
- **No new database configuration created** - existing connection reused as instructed
- **All models** use `mongoose.model()` which integrates with the existing connection

## Indexes Summary

| Model | Indexes |
|-------|---------|
| User | { username: 1 } unique, { email: 1 } unique |
| Category | { slug: 1 } unique |
| Product | { slug: 1 } unique, { categoryId: 1 }, { status: 1, createdAt: -1 }, { 'variants.sku': 1 } |
| Cart | { userId: 1 } unique |
| Order | { orderNumber: 1 } unique, { userId: 1 }, { orderStatus: 1 }, { userId: 1, createdAt: -1 } |
| Payment | { orderId: 1 }, { transactionReference: 1 } unique |
| Shipment | { orderId: 1 }, { trackingNumber: 1 } unique |
| Review | { userId: 1 }, { productId: 1 }, { productId: 1, createdAt: -1 }, { userId: 1, productId: 1 } unique |
| Wishlist | { userId: 1, productId: 1 } unique |

## Important Notes

1. **No TypeScript files** created - all models use plain JavaScript
2. **Decimal128** used for all monetary values (price, subtotal, deliveryFee, discount, totalAmount, amount)
3. **Embedded documents** used for addresses, variants, images, cart items, order items, shipping address snapshots, and tracking history
4. **References** using ObjectId for: User→Category, Product→Category, Cart→User, Order→User, Payment→Order, Shipment→Order, Review→User/Product/Order, Wishlist→User/Product
5. **Unique constraints** prevent duplicates using both single-field and compound indexes
6. **Timestamps** enabled on all models (createdAt, updatedAt)
7. **No real credentials** hardcoded - all sensitive values in `.env.example`
8. **Existing database connection** unchanged - models integrate with existing Mongoose instance
9. **Model recompilation protection**: Models can be re-imported without causing duplicate model errors when already registered

## Files Created

```
backend/models/
├── User.js
├── Category.js
├── Product.js
├── Cart.js
├── Order.js
├── Payment.js
├── Shipment.js
├── Review.js
└── Wishlist.js
```