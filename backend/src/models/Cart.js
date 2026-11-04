const mongoose = require('mongoose')
const { Schema } = mongoose

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        variantId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
          default: 1,
        },
        price: {
          type: Schema.Types.Decimal128,
          required: true,
          min: [0, 'Price must be at least 0'],
        },
      },
    ],
    totalAmount: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Method to add item to cart
cartSchema.methods.addItem = async function (productId, variantId, price) {
  const items = this.items

  // Check if item already exists in cart
  const existingItemIndex = items.findIndex(
    (item) => item.productId.equals(productId) && item.variantId.equals(variantId)
  )

  if (existingItemIndex >= 0) {
    // Increase quantity if item exists
    items[existingItemIndex].quantity += 1
  } else {
    // Add new item
    items.push({ productId, variantId, quantity: 1, price })
  }

  // Recalculate total
  let total = 0
  for (const item of items) {
    const quantity = item.quantity || 1
    const itemPrice = item.price || 0
    total += quantity * itemPrice
  }
  this.totalAmount = total

  return this.save()
}

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId, variantId) {
  const items = this.items.filter(
    (item) => !item.productId.equals(productId) || !item.variantId.equals(variantId)
  )
  this.items = items

  // Recalculate total
  let total = 0
  for (const item of this.items) {
    const quantity = item.quantity || 1
    const itemPrice = item.price || 0
    total += quantity * itemPrice
  }
  this.totalAmount = total

  return this.save()
}

// Method to update item quantity
cartSchema.methods.updateQuantity = function (productId, variantId, quantity) {
  const item = this.items.find(
    (item) => item.productId.equals(productId) && item.variantId.equals(variantId)
  )

  if (item) {
    item.quantity = Math.max(1, quantity)
  }

  // Recalculate total
  let total = 0
  for (const item of this.items) {
    const qty = item.quantity || 1
    const price = item.price || 0
    total += qty * price
  }
  this.totalAmount = total

  return this.save()
}

// Helper method to get cart item by product and variant
cartSchema.methods.getItem = function (productId, variantId) {
  return this.items.find(
    (item) => item.productId.equals(productId) && item.variantId.equals(variantId)
  )
}

const Cart = mongoose.model('Cart', cartSchema)

module.exports = Cart