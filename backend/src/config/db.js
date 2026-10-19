import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_house'

    console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_house'}`)

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully')
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected')
    })

    await conn
    console.log('MongoDB connection established')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

export default connectDB