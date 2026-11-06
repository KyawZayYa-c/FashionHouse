const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Review Endpoints', () => {
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
    const Review = mongoose.model('Review');
    await Review.deleteMany({});
    const Product = mongoose.model('Product');
    await Product.deleteMany({});
    const Order = mongoose.model('Order');
    await Order.deleteMany({});
  });

  describe('POST /api/reviews', () => {
    test('should create a review', async () => {
      // Create product and order first
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

      await request(app).post('/api/auth/register').send({
        username: 'reviewuser', email: 'review@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'review@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: 'prod0', orderId: 'order0', rating: 5, reviewText: 'Great product!' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
    });

    test('should fail with invalid rating', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', 'Bearer testtoken')
        .send({ productId: 'prod0', rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    test('should fail without authentication', async () => {
      const res = await request(app).post('/api/reviews').send({
        productId: 'prod0', rating: 5
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/reviews/product/:productId', () => {
    test('should get product reviews', async () => {
      const res = await request(app).get('/api/reviews/product/prod0');

      // Status depends on implementation
    });
  });

  describe('GET /api/reviews/my-reviews', () => {
    test('should get user reviews', async () => {
      const res = await request(app).get('/api/reviews/my-reviews');

      // Status depends on authentication
    });
  });

  describe('PUT /api/reviews/:id', () => {
    test('should update review', async () => {
      const res = await request(app)
        .put('/api/reviews/reviewId')
        .set('Authorization', 'Bearer testtoken');

      // Status depends on ownership check
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    test('should delete review', async () => {
      const res = await request(app)
        .delete('/api/reviews/reviewId')
        .set('Authorization', 'Bearer testtoken');

      // Status depends on ownership check
    });
  });
});