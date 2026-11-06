const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Cart Endpoints', () => {
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
    const Product = mongoose.model('Product');
    await Product.deleteMany({});
    const User = mongoose.model('User');
    await User.deleteMany({});
  });

  describe('GET /api/cart', () => {
    test('should get cart for authenticated user', async () => {
      // Register and login
      await request(app).post('/api/auth/register').send({
        username: 'cartuser', email: 'cart@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'cart@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart).toBeDefined();
    });

    test('should fail without authentication', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/cart/items', () => {
    test('should add item to cart', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'cartitemuser', email: 'cartitem@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'cartitem@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      // First create a product
      await request(app).post('/api/categories').send({
        categoryName: 'Test', slug: 'test', description: 'Test'
      });
      const productRes = await request(app).post('/api/products').send({
        categoryId: 'cat0', // This will need proper setup
        productName: 'Test Product',
        slug: 'test-product',
        description: 'Test product',
        price: 10.99
      });

      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: 'prod0', variantId: 'var0', quantity: 2 });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/cart/items/:itemId', () => {
    test('should update cart item quantity', async () => {
      // Similar setup as above
      const res = await request(app)
        .put('/api/cart/items/item0')
        .set('Authorization', 'Bearer testtoken')
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/cart/items/:itemId', () => {
    test('should remove cart item', async () => {
      const res = await request(app)
        .delete('/api/cart/items/item0')
        .set('Authorization', 'Bearer testtoken');

      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/cart/clear', () => {
    test('should clear cart', async () => {
      const res = await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', 'Bearer testtoken');

      expect(res.statusCode).toBe(200);
    });
  });
});