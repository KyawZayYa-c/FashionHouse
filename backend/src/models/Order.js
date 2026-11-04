const mongoose = require('mongoose')
const { Schema } = mongoose

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
        productName: {
          type: String,
          required: true,
          trim: true,
        },
        sku: {
          type: String,
          trim: true,
        },
        size: {
          type: String,
          required: true,
          trim: true,
        },
        color: {
          type: String,
          required: true,
          trim: true,
        },
        price: {
          type: Schema.Types.Decimal128,
          required: true,
          min: [0, 'Price must be at least 0'],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        subtotal: {
          type: Schema.Types.Decimal128,
          required: true,
          min: [0, 'Subtotal must be at least 0'],
        },
      },
    ],
    shippingAddress: {
      recipientName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      township: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
    },
    subtotal: {
      type: Schema.Types.Decimal128,
      required: true,
      min: [0, 'Subtotal must be at least 0'],
    },
    deliveryFee: {
      type: Schema.Types.Decimal128,
      default: 0,
      min: [0, 'Delivery fee must be at least 0'],
    },
    discount: {
      type: Schema.Types.Decimal128,
      default: 0,
      min: [0, 'Discount must be at least 0'],
    },
    totalAmount: {
      type: Schema.Types.Decimal128,
      required: true,
      min: [0, 'Total amount must be at least 0'],
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true })
orderSchema.index({ userId: 1 })
orderSchema.index({ orderStatus: 1 })
orderSchema.index({ userId: 1, createdAt: -1 })

// Method to calculate order totals
orderSchema.methods.calculateTotals = function () {
  let subtotal = 0
  for (const item of this.items) {
    const price = item.price || 0
    const quantity = item.quantity || 1
    subtotal += price * quantity
  }

  const deliveryFee = this.deliveryFee || 0
  const discount = this.discount || 0

  this.subtotal = subtotal
  this.totalAmount = subtotal + deliveryFee - discount
}

// Method to update order status
orderSchema.methods.updateStatus = function (newStatus) {
  const validStatuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ]

  if (validStatuses.includes(newStatus)) {
    this.orderStatus = newStatus
    return this.save()
  }
  throw new Error('Invalid order status')
}

// Method to update payment status
orderSchema.methods.updatePaymentStatus = function (newStatus) {
  const validPaymentStatuses = ['unpaid', 'pending', 'paid', 'failed', 'refunded']

  if (validPaymentStatuses.includes(newStatus)) {
    this.paymentStatus = newStatus
    return this.save()
  }
  throw new Error('Invalid payment status')
}

// Static to find orders by user
orderSchema.statics.findByUser = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

// Static to find orders by status
orderSchema.statics.findByStatus = function (status) {
  return this.find({ orderStatus: status })
}

// Static to find order by order number
orderSchema.statics.findByOrderNumber = function (orderNumber) {
  return this.findOne({ orderNumber })
}

const Order = mongoose.model('Order', orderSchema)

module.exports = Order