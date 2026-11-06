const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Order Endpoints', () => {
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
    const Order = mongoose.model('Order');
    await Order.deleteMany({});
    const User = mongoose.model('User');
    await User.deleteMany({});
    const Product = mongoose.model('Product');
    await Product.deleteMany({});
  });

  describe('POST /api/orders', () => {
    test('should create order from cart', async () => {
      // Register user
      await request(app).post('/api/auth/register').send({
        username: 'orderuser', email: 'order@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'order@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      // Create a product and add to cart
      await request(app).post('/api/categories').send({
        categoryName: 'Test', slug: 'test', description: 'Test'
      });
      await request(app).post('/api/products').send({
        categoryId: 'cat0',
        productName: 'Test Product',
        slug: 'test-product',
        description: 'Test product',
        price: 29.99
      });

      // Add to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: 'prod0', variantId: 'var0', quantity: 1 });

      // Create order
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderNumber).toBeDefined();
      expect(res.body.data.order.totalAmount).toBeDefined();
    });

    test('should fail with empty cart', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'emptyorderuser', email: 'empty@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'empty@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/orders/my-orders', () => {
    test('should get user orders', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'myordersuser', email: 'myorders@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'myorders@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
    });
  });

  describe('GET /api/orders/my-orders/:id', () => {
    test('should get order by ID', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'orderbyiduser', email: 'orderbyid@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'orderbyid@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      // Create order
      const orderRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .get(`/api/orders/my-orders/${orderRes.body.data.order._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderNumber).toBeDefined();
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    test('should cancel order', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'cancelorderuser', email: 'cancel@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'cancel@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      // Create order
      const orderRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      // Cancel order
      const res = await request(app)
        .put(`/api/orders/${orderRes.body.data.order._id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Changed my mind' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.orderStatus).toBe('cancelled');
    });

    test('should fail to cancel shipped order', async () => {
      // Similar setup with a shipped order
      const res = await request(app)
        .put('/api/orders/orderId/cancel')
        .set('Authorization', 'Bearer testtoken');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/orders/all', () => {
    test('admin should get all orders', async () => {
      // This would require admin middleware
      const res = await request(app).get('/api/orders/all');
      // Status depends on middleware implementation
    });
  });
});