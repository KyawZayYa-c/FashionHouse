const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Category Endpoints', () => {
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
    const Category = mongoose.model('Category');
    await Category.deleteMany({});
  });

  describe('POST /api/categories', () => {
    test('should create a category with valid data', async () => {
      const res = await request(app).post('/api/categories').send({
        categoryName: 'Men\'s Clothing',
        slug: 'mens-clothing',
        description: 'Men clothing category'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.categoryName).toBe('Men\'s Clothing');
      expect(res.body.data.category.slug).toBe('mens-clothing');
    });

    test('should fail with duplicate slug', async () => {
      await request(app).post('/api/categories').send({
        categoryName: 'Test',
        slug: 'test-slug',
        description: 'First'
      });
      const res = await request(app)
        .post('/api/categories')
        .send({ categoryName: 'Test2', slug: 'test-slug', description: 'Second' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('should fail without categoryName', async () => {
      const res = await request(app).post('/api/categories').send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/categories', () => {
    test('should get all categories', async () => {
      await request(app).post('/api/categories').send({
        categoryName: 'Test1', slug: 'test1', description: '1'
      });
      await request(app).post('/api/categories').send({
        categoryName: 'Test2', slug: 'test2', description: '2'
      });

      const res = await request(app).get('/api/categories');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories.length).toBe(2);
    });
  });

  describe('GET /api/categories/:id', () => {
    test('should get category by ID', async () => {
      const createRes = await request(app).post('/api/categories').send({
        categoryName: 'TestCategory', slug: 'test-category', description: 'Test'
      });
      const categoryId = createRes.body.data.category._id;

      const res = await request(app).get(`/api/categories/${categoryId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.categoryName).toBe('TestCategory');
    });

    test('should fail with invalid category ID', async () => {
      const res = await request(app).get('/api/categories/invalid-id');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/categories/:id', () => {
    test('should update category', async () => {
      const createRes = await request(app).post('/api/categories').send({
        categoryName: 'OldName', slug: 'old-slug', description: 'Old'
      });
      const categoryId = createRes.body.data.category._id;

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .send({ categoryName: 'NewName', slug: 'new-slug', description: 'New' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.categoryName).toBe('NewName');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    test('should delete category', async () => {
      const createRes = await request(app).post('/api/categories').send({
        categoryName: 'ToDelete', slug: 'todelete', description: 'Delete me'
      });
      const categoryId = createRes.body.data.category._id;

      const res = await request(app).delete(`/api/categories/${categoryId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});