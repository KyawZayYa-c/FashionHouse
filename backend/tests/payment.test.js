const {
  app,
  request,
  createUser,
  createCategory,
  createProduct,
  addToCart,
  placeOrder,
} = require('./helpers');

describe('Payment Endpoints', () => {
  let adminToken;
  let customerToken;
  let otherToken;
  let category;
  let order;

  beforeEach(async () => {
    const admin = await createUser({
      username: 'payadmin',
      email: 'payadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'paycustomer',
      email: 'paycustomer@example.com',
    });
    const other = await createUser({
      username: 'payother',
      email: 'payother@example.com',
    });
    adminToken = admin.token;
    customerToken = customer.token;
    otherToken = other.token;

    category = await createCategory(admin.token, { slug: 'pay-category' });
    const product = await createProduct(admin.token, {
      categoryId: category._id,
      slug: 'pay-product',
    });
    await addToCart(customerToken, product._id, product.variants[0]._id, 2);
    order = await placeOrder(customerToken); // totalAmount 50000
  });

  describe('POST /api/payments', () => {
    test('creates a pending payment matching the order total', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: order._id,
          paymentMethod: 'cod',
          amount: 50000,
          transactionReference: 'TXN-001',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.payment.orderId).toBe(order._id);
      expect(res.body.data.payment.amount).toBe(50000);
      expect(res.body.data.payment.paymentStatus).toBe('pending');
    });

    test('rejects a mismatched amount with 400', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: order._id,
          paymentMethod: 'cod',
          amount: 12345,
          transactionReference: 'TXN-BAD',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('does not match order total');
    });

    test('rejects a duplicate transaction reference with 409', async () => {
      await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: order._id,
          paymentMethod: 'cod',
          amount: 50000,
          transactionReference: 'TXN-DUP',
        });

      // A second order so the amount-matching check passes for the retry.
      const secondProduct = await createProduct(adminToken, {
        categoryId: category._id,
        slug: 'pay-product-two',
        variants: [
          { sku: 'PP2-M', size: 'M', color: 'Blue', stock: 5, additionalPrice: 0 },
        ],
      });
      await addToCart(customerToken, secondProduct._id, secondProduct.variants[0]._id, 1);
      const secondOrder = await placeOrder(customerToken); // totalAmount 25000

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: secondOrder._id,
          paymentMethod: 'cod',
          amount: 25000,
          transactionReference: 'TXN-DUP',
        });

      expect(res.statusCode).toBe(409);
    });

    test('rejects a payment for another user’s order with 403', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          orderId: order._id,
          paymentMethod: 'cod',
          amount: 50000,
          transactionReference: 'TXN-STEAL',
        });

      expect(res.statusCode).toBe(403);
    });

    test('rejects a missing order id with 400', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ paymentMethod: 'cod', amount: 50000 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/payments/order/:orderId', () => {
    test('returns null before a payment exists', async () => {
      const res = await request(app)
        .get(`/api/payments/order/${order._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.payment).toBeNull();
    });

    test('returns the payment once created', async () => {
      await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: order._id,
          paymentMethod: 'cod',
          amount: 50000,
          transactionReference: 'TXN-GET',
        });

      const res = await request(app)
        .get(`/api/payments/order/${order._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.payment.transactionReference).toBe('TXN-GET');
    });

    test('rejects another user with 403', async () => {
      const res = await request(app)
        .get(`/api/payments/order/${order._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/payments/:id', () => {
    test('returns a payment by id', async () => {
      const created = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: order._id,
          paymentMethod: 'cod',
          amount: 50000,
          transactionReference: 'TXN-BY-ID',
        });
      const paymentId = created.body.data.payment._id;

      const res = await request(app)
        .get(`/api/payments/${paymentId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.payment._id).toBe(paymentId);
    });

    test('returns 404 for an unknown payment', async () => {
      const res = await request(app)
        .get('/api/payments/aaaaaaaaaaaaaaaaaaaaaaaa')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/payments/:id/verify', () => {
    let paymentId;

    beforeEach(async () => {
      const created = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: order._id,
          paymentMethod: 'cod',
          amount: 50000,
          transactionReference: 'TXN-VERIFY',
        });
      paymentId = created.body.data.payment._id;
    });

    test('admin verifies the payment as paid', async () => {
      const res = await request(app)
        .put(`/api/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'paid' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.payment.paymentStatus).toBe('paid');
      expect(res.body.data.payment.paidAt).toBeDefined();
    });

    test('a customer gets 403', async () => {
      const res = await request(app)
        .put(`/api/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'paid' });

      expect(res.statusCode).toBe(403);
    });

    test('rejects an invalid transition (paid → failed) with 400', async () => {
      await request(app)
        .put(`/api/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'paid' });

      const res = await request(app)
        .put(`/api/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'failed' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid status transition');
    });

    test('requires a status', async () => {
      const res = await request(app)
        .put(`/api/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });
});
