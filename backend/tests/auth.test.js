const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

// Override console.log to reduce test output
const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Auth Endpoints', () => {
  let server;
  let agent;

  beforeAll(async () => {
    // Connect to test database
    const mongoose = require('mongoose');
    const uri = 'mongodb://127.0.0.1:27017/fashion_test';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    server = app.listen(0);
    agent = request.agent(server);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    const User = mongoose.model('User');
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('testuser');
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    test('should return error for duplicate email', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        username: 'testuser2', email: 'duplicate@example.com', password: 'password123'
      });
      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser3', email: 'duplicate@example.com', password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('duplicate');
    });

    test('should return error for duplicate username', async () => {
      // First registration
      await request(app).post('/api/auth/register').send({
        username: 'testuser4', email: 'user4@example.com', password: 'password123'
      });
      // Second registration with same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser4', email: 'different@example.com', password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('duplicate');
    });

    test('should fail with missing required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ username: 'testuser' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      // First register
      await request(app).post('/api/auth/register').send({
        username: 'loginuser', email: 'login@example.com', password: 'password123'
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    test('should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('should fail with missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'login@example.com' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    test('should get user profile with valid token', async () => {
      // Register and login
      await request(app).post('/api/auth/register').send({
        username: 'meuser', email: 'me@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'me@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('meuser');
      // Password hash should not be exposed
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    test('should fail without authentication', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});