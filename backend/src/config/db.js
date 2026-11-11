const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion_house';

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connection established');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;