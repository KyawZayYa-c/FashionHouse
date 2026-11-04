const mongoose = require('mongoose')
const { Schema } = mongoose

const paymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cod', 'bank_transfer', 'mobile_wallet'],
    },
    amount: {
      type: Schema.Types.Decimal128,
      required: true,
      min: [0, 'Amount must be at least 0'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionReference: {
      type: String,
      trim: true,
      unique: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index for orderId
paymentSchema.index({ orderId: 1 })

// Method to mark payment as paid
paymentSchema.methods.markAsPaid = function () {
  this.paymentStatus = 'paid'
  this.paidAt = new Date()
  return this.save()
}

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function () {
  this.paymentStatus = 'failed'
  return this.save()
}

// Method to mark payment as refunded
paymentSchema.methods.markAsRefunded = function () {
  this.paymentStatus = 'refunded'
  return this.save()
}

// Static to find payment by order
paymentSchema.statics.findByOrder = function (orderId) {
  return this.find({ orderId })
}

// Static to find pending payment
paymentSchema.statics.findPending = function () {
  return this.find({ paymentStatus: 'pending' })
}

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment