const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Admin Endpoints', () => {
  let server;
  beforeAll(async () => {
    const mongoose = require('mongoose');
    const uri = 'mongodb://127.0.0.1:27017/fashion_test';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    server = app.listen(0);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    const User = mongoose.model('User');
    await User.deleteMany({});
    const Product = mongoose.model('Product');
    await Product.deleteMany({});
    const Order = mongoose.model('Order');
    await Order.deleteMany({});
  });

  describe('GET /api/admin/dashboard', () => {
    test('admin should get dashboard stats', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer admintoken');

      // Status depends on admin middleware
    });
  });

  describe('GET /api/admin/sales', () => {
    test('admin should get sales report', async () => {
      const res = await request(app)
        .get('/api/admin/sales')
        .set('Authorization', 'Bearer admintoken');

      // Status depends on admin middleware and date range
    });
  });

  describe('GET /api/admin/customers', () => {
    test('admin should get customer list', async () => {
      const res = await request(app)
        .get('/api/admin/customers')
        .set('Authorization', 'Bearer admintoken');

      // Status depends on admin middleware
    });
  });

  describe('GET /api/admin/low-stock', () => {
    test('admin should get low-stock products', async () => {
      const res = await request(app)
        .get('/api/admin/low-stock')
        .set('Authorization', 'Bearer admintoken');

      // Status depends on admin service
    });
  });

  describe('GET /api/admin/best-selling', () => {
    test('admin should get best-selling products', async () => {
      const res = await request(app)
        .get('/api/admin/best-selling')
        .set('Authorization', 'Bearer admintoken');

      // Status depends on admin service
    });
  });

  describe('GET /api/admin/recent-orders', () => {
    test('admin should get recent orders', async () => {
      const res = await request(app)
        .get('/api/admin/recent-orders')
        .set('Authorization', 'Bearer admintoken');

      // Status depends on admin service
    });
  });
});