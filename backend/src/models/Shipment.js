const mongoose = require('mongoose')
const { Schema } = mongoose

const trackingHistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

// Method to add tracking history entry
trackingHistorySchema.methods.addEntry = function (status, location, description) {
  this.status = status
  this.location = location
  this.description = description
  this.timestamp = new Date()
  return this.save()
}

const shipmentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    courierName: {
      type: String,
      trim: true,
    },
    trackingNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    shipmentStatus: {
      type: String,
      enum: [
        'preparing',
        'shipped',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'failed',
        'returned',
      ],
      default: 'preparing',
    },
    trackingHistory: [trackingHistorySchema],
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index for orderId and trackingNumber
shipmentSchema.index({ orderId: 1 })
shipmentSchema.index({ trackingNumber: 1 }, { unique: true })

// Method to add tracking history
shipmentSchema.methods.addTracking = function (status, location, description) {
  const entry = new TrackingEntry({
    status,
    location,
    description,
  })
  this.trackingHistory.push(entry)
  return this.save()
}

// Method to update shipment status
shipmentSchema.methods.updateStatus = function (newStatus) {
  const validStatuses = [
    'preparing',
    'shipped',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
    'returned',
  ]

  if (validStatuses.includes(newStatus)) {
    this.shipmentStatus = newStatus
    return this.save()
  }
  throw new Error('Invalid shipment status')
}

// Static to find shipment by order
shipmentSchema.statics.findByOrder = function (orderId) {
  return this.findOne({ orderId })
}

// Static to find by tracking number
shipmentSchema.statics.findByTrackingNumber = function (trackingNumber) {
  return this.findOne({ trackingNumber })
}

// Track entry sub-schema as nested model
const TrackingEntry = shipmentSchema.trackingHistory.constructor

// Helper to get tracking history sorted by timestamp
shipmentSchema.methods.getSortedTracking = function () {
  return this.trackingHistory.sort(
    (a, b) => a.timestamp - b.timestamp
  )
}

const Shipment = mongoose.model('Shipment', shipmentSchema)

module.exports = Shipment