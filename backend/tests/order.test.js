const {
  app,
  request,
  createUser,
  createCategory,
  createProduct,
  addToCart,
  shippingAddress,
} = require('./helpers');

describe('Order Endpoints', () => {
  let adminToken;
  let customerToken;
  let otherToken;
  let product;

  beforeEach(async () => {
    const admin = await createUser({
      username: 'orderadmin',
      email: 'orderadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'ordercustomer',
      email: 'ordercustomer@example.com',
    });
    const other = await createUser({
      username: 'orderother',
      email: 'orderother@example.com',
    });
    adminToken = admin.token;
    customerToken = customer.token;
    otherToken = other.token;

    const category = await createCategory(admin.token, { slug: 'order-category' });
    product = await createProduct(admin.token, {
      categoryId: category._id,
      slug: 'order-product',
    });
  });

  describe('POST /api/orders', () => {
    test('creates an order from the cart and clears it', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 2);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress, deliveryFee: 2000, discount: 1000 });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      const order = res.body.data.order;
      expect(order.orderNumber).toMatch(/^ORD-\d{4}-/);
      expect(order.subtotal).toBe(50000); // 2 x 25000
      expect(order.totalAmount).toBe(51000); // 50000 + 2000 - 1000
      expect(order.orderStatus).toBe('pending');
      expect(order.paymentStatus).toBe('unpaid');
      expect(order.shippingAddress.recipientName).toBe(shippingAddress.recipientName);

      // The cart is emptied after checkout.
      const cart = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(cart.body.data.cart.items).toEqual([]);
    });

    test('decrements variant stock', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 2);
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress });

      const fetched = await request(app)
        .get(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(fetched.body.data.product.variants[0].stock).toBe(18); // 20 - 2
    });

    test('rejects a missing shipping address with 400', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress: { city: 'Yangon' } });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('A complete shipping address is required');
    });

    test('rejects an empty cart with 400', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Your cart is empty');
    });

    test('requires authentication', async () => {
      const res = await request(app).post('/api/orders').send({ shippingAddress });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/orders/my-orders', () => {
    test('lists only the user’s own orders with item counts', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress });

      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.orders).toHaveLength(1);
      expect(res.body.data.orders[0].itemCount).toBe(1);
      expect(res.body.data.totalOrders).toBe(1);

      // The other user sees none.
      const otherRes = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${otherToken}`);
      expect(otherRes.body.data.orders).toHaveLength(0);
    });
  });

  describe('GET /api/orders/my-orders/:id', () => {
    test('returns full order details for the owner', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);
      const order = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress });
      const id = order.body.data.order._id;

      const res = await request(app)
        .get(`/api/orders/my-orders/${id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.order.orderNumber).toMatch(/^ORD-/);
      expect(res.body.data.order.items).toHaveLength(1);
      expect(res.body.data.order.items[0].productName).toBe('Merino Crew Sweater');
    });

    test('rejects another user with 403', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);
      const order = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress });
      const id = order.body.data.order._id;

      const res = await request(app)
        .get(`/api/orders/my-orders/${id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    test('returns 404 for an unknown order', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders/aaaaaaaaaaaaaaaaaaaaaaaa')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    test('cancels a pending order and restores stock', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 2);
      const order = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress });
      const id = order.body.data.order._id;

      const res = await request(app)
        .put(`/api/orders/${id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Changed my mind' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.order.orderStatus).toBe('cancelled');
      expect(res.body.data.order.notes).toContain('Changed my mind');

      const fetched = await request(app)
        .get(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(fetched.body.data.product.variants[0].stock).toBe(20); // restored
    });

    test('refuses to cancel a shipped order with 400', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);
      const order = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress });
      const id = order.body.data.order._id;

      await request(app)
        .put(`/api/orders/admin/${id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' });

      const res = await request(app)
        .put(`/api/orders/${id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'too late' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('shipped or delivered');
    });
  });

  describe('Admin order management', () => {
    let orderId;

    beforeEach(async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);
      const order = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ shippingAddress });
      orderId = order.body.data.order._id;
    });

    test('admin lists all orders', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.orders).toHaveLength(1);
      expect(res.body.data.orders[0].userId.username).toBe('ordercustomer');
      expect(res.body.data.total).toBe(1);
    });

    test('a customer gets 403 on the admin list', async () => {
      const res = await request(app)
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(403);
    });

    test('admin updates the order status', async () => {
      const res = await request(app)
        .put(`/api/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.order.orderStatus).toBe('confirmed');
    });

    test('admin cannot set an invalid status', async () => {
      const res = await request(app)
        .put(`/api/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'teleported' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid order status');
    });

    test('status filter narrows the admin list', async () => {
      await request(app)
        .put(`/api/orders/admin/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      const res = await request(app)
        .get('/api/orders/admin/all?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.orders).toHaveLength(0);
    });
  });
});
