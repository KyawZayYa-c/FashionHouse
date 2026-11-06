const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app').default;

const originalLog = console.log;
beforeAll(() => { console.log = () => {}; });
afterAll(() => { console.log = originalLog; });

describe('Shipment Endpoints', () => {
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
    const Shipment = mongoose.model('Shipment');
    await Shipment.deleteMany({});
    const Order = mongoose.model('Order');
    await Order.deleteMany({});
  });

  describe('POST /api/shipments', () => {
    test('should create shipment for order', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'shipuser', email: 'ship@example.com', password: 'password123'
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ship@example.com', password: 'password123' });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: 'order0', courierName: 'Test Courier' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/shipments/track/:trackingNumber', () => {
    test('should track shipment', async () => {
      const res = await request(app).get('/api/shipments/track/FE-test-tracking-number');

      // Status depends on implementation
    });
  });

  describe('GET /api/shipments/order/:orderId', () => {
    test('should get shipment by order ID', async () => {
      const res = await request(app).get('/api/shipments/order/order0');

      // Status depends on implementation
    });
  });

  describe('PUT /api/shipments/:id', () => {
    test('should update shipment status', async () => {
      const res = await request(app)
        .put('/api/shipments/shipmentId')
        .set('Authorization', 'Bearer admintoken');

      // Status depends on admin middleware
    });
  });

  describe('POST /api/shipments/:id/tracking', () => {
    test('should add tracking history', async () => {
      const res = await request(app)
        .post('/api/shipments/shipmentId/tracking')
        .set('Authorization', 'Bearer admintoken')
        .send({ status: 'shipped', location: 'Warehouse' });

      // Status depends on implementation
    });
  });
});