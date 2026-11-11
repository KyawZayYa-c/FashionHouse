const {
  app,
  request,
  createUser,
  createCategory,
  createProduct,
  addToCart,
  placeOrder,
} = require('./helpers');

describe('Shipment Endpoints', () => {
  let adminToken;
  let customerToken;
  let order;
  let shipment;

  beforeEach(async () => {
    const admin = await createUser({
      username: 'shipadmin',
      email: 'shipadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'shipcustomer',
      email: 'shipcustomer@example.com',
    });
    adminToken = admin.token;
    customerToken = customer.token;

    const category = await createCategory(admin.token, { slug: 'ship-category' });
    const product = await createProduct(admin.token, {
      categoryId: category._id,
      slug: 'ship-product',
    });
    await addToCart(customerToken, product._id, product.variants[0]._id, 1);
    order = await placeOrder(customerToken);

    const created = await request(app)
      .post('/api/shipments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orderId: order._id, courierName: 'Myanmar Post', trackingNumber: 'TH-001' });
    shipment = created.body.data.shipment;
  });

  describe('POST /api/shipments', () => {
    test('admin creates a shipment and the order becomes shipped', async () => {
      // The beforeEach shipment already exists for a different order, so place
      // a fresh order here.
      const category = await createCategory(adminToken, {
        categoryName: 'Ship Two',
        slug: 'ship-cat-2',
      });
      const product = await createProduct(adminToken, {
        categoryId: category._id,
        slug: 'ship-product-2',
        variants: [
          { sku: 'SP2-M', size: 'M', color: 'Blue', stock: 5, additionalPrice: 0 },
        ],
      });
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);
      const freshOrder = await placeOrder(customerToken);

      const res = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: freshOrder._id,
          courierName: 'Express Go',
          trackingNumber: 'TH-002',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.shipment.trackingNumber).toBe('TH-002');
      expect(res.body.data.shipment.shipmentStatus).toBe('preparing');

      const fetched = await request(app)
        .get(`/api/orders/my-orders/${freshOrder._id}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(fetched.body.data.order.orderStatus).toBe('shipped');
    });

    test('generates a tracking number when none is provided', async () => {
      const category = await createCategory(adminToken, {
        categoryName: 'Ship Three',
        slug: 'ship-cat-3',
      });
      const product = await createProduct(adminToken, {
        categoryId: category._id,
        slug: 'ship-product-3',
        variants: [
          { sku: 'SP3-M', size: 'M', color: 'Green', stock: 5, additionalPrice: 0 },
        ],
      });
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);
      const freshOrder = await placeOrder(customerToken);

      const res = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderId: freshOrder._id, courierName: 'Express Go' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.shipment.trackingNumber).toBeTruthy();
    });

    test('rejects a customer with 403', async () => {
      const res = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: order._id, courierName: 'Nope' });

      expect(res.statusCode).toBe(403);
    });

    test('rejects a duplicate tracking number with 409', async () => {
      // Use a fresh pending order — the beforeEach order already ships, and a
      // shipped order with a shipment is rejected earlier with a different error.
      const freshCategory = await createCategory(adminToken, {
        categoryName: 'Ship Dup',
        slug: 'ship-cat-dup',
      });
      const freshProduct = await createProduct(adminToken, {
        categoryId: freshCategory._id,
        slug: 'ship-product-dup',
        variants: [
          { sku: 'SPD-M', size: 'M', color: 'Yellow', stock: 5, additionalPrice: 0 },
        ],
      });
      await addToCart(customerToken, freshProduct._id, freshProduct.variants[0]._id, 1);
      const freshOrder = await placeOrder(customerToken);

      const res = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ orderId: freshOrder._id, courierName: 'Again', trackingNumber: 'TH-001' });

      expect(res.statusCode).toBe(409);
    });

    test('returns 404 for an unknown order', async () => {
      const res = await request(app)
        .post('/api/shipments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          orderId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          courierName: 'Ghost',
          trackingNumber: 'TH-GHOST',
        });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/shipments/track/:trackingNumber', () => {
    test('tracks a shipment by tracking number', async () => {
      const res = await request(app)
        .get('/api/shipments/track/TH-001')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.shipment.trackingNumber).toBe('TH-001');
    });

    test('returns 404 for an unknown tracking number', async () => {
      const res = await request(app)
        .get('/api/shipments/track/UNKNOWN-999')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/shipments/order/:orderId', () => {
    test('returns the shipment for the order owner', async () => {
      const res = await request(app)
        .get(`/api/shipments/order/${order._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.shipment._id).toBe(shipment._id);
    });

    test('rejects another user with 403', async () => {
      const other = await createUser({
        username: 'shipintruder',
        email: 'intruder@example.com',
      });

      const res = await request(app)
        .get(`/api/shipments/order/${order._id}`)
        .set('Authorization', `Bearer ${other.token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /api/shipments/:id', () => {
    test('advances the shipment status and appends tracking history', async () => {
      const res = await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_transit', location: 'Yangon hub', description: 'Left the hub' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.shipment.shipmentStatus).toBe('in_transit');
      expect(res.body.data.shipment.trackingHistory).toHaveLength(1);
      expect(res.body.data.shipment.trackingHistory[0].location).toBe('Yangon hub');
    });

    test('rejects a backwards status move with 400', async () => {
      await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_transit' });

      const res = await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'preparing' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('backwards');
    });

    test('rejects an invalid status with 400', async () => {
      const res = await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'flying' });

      expect(res.statusCode).toBe(400);
    });

    test('marking delivered also marks the order delivered', async () => {
      await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_transit' });
      await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'out_for_delivery' });

      const res = await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered' });

      expect(res.statusCode).toBe(200);

      const fetched = await request(app)
        .get(`/api/orders/my-orders/${order._id}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect(fetched.body.data.order.orderStatus).toBe('delivered');
    });

    test('a customer gets 403', async () => {
      const res = await request(app)
        .put(`/api/shipments/${shipment._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'delivered' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/shipments/:id/tracking', () => {
    test('appends a tracking history entry', async () => {
      const res = await request(app)
        .post(`/api/shipments/${shipment._id}/tracking`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'preparing',
          location: 'Warehouse',
          description: 'Packing the parcel',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.shipment.trackingHistory).toHaveLength(1);
      expect(res.body.data.shipment.trackingHistory[0].description).toBe(
        'Packing the parcel'
      );
    });
  });
});
