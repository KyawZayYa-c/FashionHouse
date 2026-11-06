const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Product Endpoints', () => {
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
    const Category = mongoose.model('Category');
    await Category.deleteMany({});
  });

  describe('POST /api/products', () => {
    test('should create a product with valid data', async () => {
      // First create a category
      const categoryRes = await request(app).post('/api/categories').send({
        categoryName: 'Test Category', slug: 'test-category', description: 'Test'
      });
      const categoryId = categoryRes.body.data.category._id;

      const res = await request(app).post('/api/products').send({
        categoryId,
        productName: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        brand: 'Test Brand',
        price: 29.99,
        status: 'active'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.productName).toBe('Test Product');
      expect(res.body.data.product.price).toBe(29.99);
    });

    test('should fail with missing required fields', async () => {
      const res = await request(app).post('/api/products').send({
        productName: 'Incomplete Product'
        // missing slug, price, etc.
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/products', () => {
    test('should get products with pagination', async () => {
      // Create multiple products
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/categories').send({
          categoryName: `Cat${i}`, slug: `cat${i}`, description: `Category ${i}`
        });
      }

      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/products').send({
          categoryId: 'cat0', // Will need valid category reference
          productName: `Product${i}`,
          slug: `product${i}`,
          description: `Product ${i}`,
          price: 10 + i
        });
      }

      const res = await request(app).get('/api/products?page=1&limit=3');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.totalProducts).toBe(5);
    });
  });

  describe('GET /api/products/featured', () => {
    test('should get featured products', async () => {
      // Create featured products
      for (let i = 0; i < 3; i++) {
        await request(app).post('/api/categories').send({
          categoryName: `Cat${i}`, slug: `cat${i}`, description: `Category ${i}`
        });
        await request(app).post('/api/products').send({
          categoryId: 'cat0',
          productName: `Featured${i}`,
          slug: `featured${i}`,
          description: `Featured product ${i}`,
          price: 10 + i,
          isFeatured: true
        });
      }

      const res = await request(app).get('/api/products/featured');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.products.length).toBe(3);
    });
  });

  describe('GET /api/products/search', () => {
    test('should search products', async () => {
      await request(app).post('/api/products').send({
        categoryId: 'cat0',
        productName: 'T-Shirt White',
        slug: 't-shirt-white',
        description: 'White t-shirt',
        price: 15.99
      });

      const res = await request(app).get('/api/products/search?query=T-Shirt');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should get product by ID', async () => {
      const createRes = await request(app).post('/api/products').send({
        categoryId: 'cat0',
        productName: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: 29.99
      });
      const productId = createRes.body.data.product._id;

      const res = await request(app).get(`/api/products/${productId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.productName).toBe('Test Product');
    });

    test('should fail with invalid product ID', async () => {
      const res = await request(app).get('/api/products/invalid-id');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update product', async () => {
      const createRes = await request(app).post('/api/products').send({
        categoryId: 'cat0',
        productName: 'Old Name',
        slug: 'old-slug',
        description: 'Old description',
        price: 19.99
      });
      const productId = createRes.body.data.product._id;

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send({ productName: 'New Name', price: 39.99 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.productName).toBe('New Name');
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete product (soft delete by status)', async () => {
      const createRes = await request(app).post('/api/products').send({
        categoryId: 'cat0',
        productName: 'ToDelete',
        slug: 'todelete',
        description: 'Delete me',
        status: 'active'
      });
      const productId = createRes.body.data.product._id;

      const res = await request(app).delete(`/api/products/${productId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});