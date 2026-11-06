// Jest setup file
// Suppress deprecation warnings
process.env.NODE_OPTIONS = '--no-deprecation';

// Mock mongoose connect/disconnect for tests
beforeAll(async () => {
  const mongoose = require('mongoose');
  // Connect to test database
  await mongoose.connect('mongodb://127.0.0.1:27017/fashion_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  const mongoose = require('mongoose');
  // Drop database and close connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Mock Supertest server setup
beforeEach(async () => {
  // Clear all collections before each test
  const mongoose = require('mongoose');
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});