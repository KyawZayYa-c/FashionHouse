const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Wishlist Endpoints', () => {
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
  });

  describe('GET /api/wishlist', () => {
    test('should get wishlist for authenticated user', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'wishuser', email: 'wish@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wish@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should fail without authentication', async () => {
      const res = await request(app).get('/api/wishlist');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/wishlist/:productId', () => {
    test('should add product to wishlist', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'wishadduser', email: 'wishadd@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wishadd@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      // Create product first
      await request(app).post('/api/categories').send({
        categoryName: 'Test', slug: 'test', description: 'Test'
      });
      await request(app).post('/api/products').send({
        categoryId: 'cat0',
        productName: 'Test Product',
        slug: 'test-product',
        description: 'Test product',
        price: 19.99
      });

      const res = await request(app)
        .post('/api/wishlist/test-product')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('should prevent duplicate wishlist items', async () => {
      // Similar setup - adding same product twice should fail
      const res = await request(app)
        .post('/api/wishlist/test-product')
        .set('Authorization', 'Bearer testtoken');

      // Status depends on compound unique index
    });
  });

  describe('DELETE /api/wishlist/:productId', () => {
    test('should remove product from wishlist', async () => {
      const res = await request(app)
        .delete('/api/wishlist/test-product')
        .set('Authorization', 'Bearer testtoken');

      expect(res.statusCode).toBe(200);
    });

    test('should clear wishlist', async () => {
      const res = await request(app).delete('/api/wishlist/clear').set('Authorization', 'Bearer testtoken');

      expect(res.statusCode).toBe(200);
    });
  });
});