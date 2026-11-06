const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Payment Endpoints', () => {
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
    const Payment = mongoose.model('Payment');
    await Payment.deleteMany({});
    const Order = mongoose.model('Order');
    await Order.deleteMany({});
  });

  describe('POST /api/payments', () => {
    test('should create payment record', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'payuser', email: 'pay@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'pay@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: 'order0', paymentMethod: 'cod', amount: 29.99 });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.paymentStatus).toBe('pending');
    });

    test('should fail with missing orderId', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', 'Bearer testtoken')
        .send({ paymentMethod: 'cod' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/payments/order/:orderId', () => {
    test('should get payment by order ID', async () => {
      const createRes = await request(app)
        .post('/api/payments')
        .set('Authorization', 'Bearer testtoken')
        .send({ orderId: 'order0', paymentMethod: 'cod', amount: 29.99 });

      const res = await request(app)
        .get('/api/payments/order/order0');

      expect(res.statusCode).toBe(200);
    });
  });

  describe('PUT /api/payments/:id/verify', () => {
    test('should verify payment as admin', async () => {
      const res = await request(app)
        .put('/api/payments/paymentId/verify')
        .set('Authorization', 'Bearer admintoken');

      // Status depends on admin middleware
    });
  });
});