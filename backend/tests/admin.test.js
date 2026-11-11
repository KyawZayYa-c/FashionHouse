const {
  app,
  request,
  createUser,
  createCategory,
  createProduct,
  addToCart,
  placeOrder,
} = require('./helpers');

describe('Admin Endpoints', () => {
  let adminToken;
  let customerToken;
  let otherToken;

  beforeEach(async () => {
    const admin = await createUser({
      username: 'dashadmin',
      email: 'dashadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'dashcustomer',
      email: 'dashcustomer@example.com',
    });
    const other = await createUser({
      username: 'dashother',
      email: 'dashother@example.com',
    });
    adminToken = admin.token;
    customerToken = customer.token;
    otherToken = other.token;
  });

  // Seed one category, one product (stock 20) and one order (qty 2, total 50000).
  const seedPurchase = async () => {
    const category = await createCategory(adminToken, { slug: 'dash-category' });
    const product = await createProduct(adminToken, {
      categoryId: category._id,
      slug: 'dash-product',
    });
    await addToCart(customerToken, product._id, product.variants[0]._id, 2);
    const order = await placeOrder(customerToken);
    return { product, order };
  };

  describe('Access control', () => {
    test('rejects an unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.statusCode).toBe(401);
    });

    test('rejects a customer with 403 on every admin route', async () => {
      const routes = [
        '/api/admin/dashboard',
        '/api/admin/sales?startDate=2026-01-01&endDate=2026-12-31',
        '/api/admin/customers',
        '/api/admin/low-stock',
        '/api/admin/best-selling',
        '/api/admin/recent-orders',
      ];
      for (const route of routes) {
        const res = await request(app)
          .get(route)
          .set('Authorization', `Bearer ${customerToken}`);
        expect(res.statusCode).toBe(403);
      }
    });
  });

  describe('GET /api/admin/dashboard', () => {
    test('aggregates order, product, category and customer stats', async () => {
      const { order } = await seedPurchase();

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderStats.totalOrders).toBe(1);
      expect(res.body.data.orderStats.totalSales).toBe(50000);
      expect(res.body.data.orderStats.pendingOrders).toBe(1);
      expect(res.body.data.productStats.totalProducts).toBe(1);
      expect(res.body.data.productStats.activeProducts).toBe(1);
      expect(res.body.data.categoryStats.totalCategories).toBe(1);
      // Two customers seeded (the admin does not count).
      expect(res.body.data.totalCustomers).toBe(2);
    });

    test('reports zeroed stats on an empty store', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.orderStats.totalOrders).toBe(0);
      expect(res.body.data.orderStats.totalSales).toBe(0);
      // Only the two seeded customers count; the admin is not a customer.
      expect(res.body.data.totalCustomers).toBe(2);
    });
  });

  describe('GET /api/admin/sales', () => {
    test('requires a date range', async () => {
      const res = await request(app)
        .get('/api/admin/sales')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Start and end dates are required');
    });

    test('returns the report shape for a date range', async () => {
      const res = await request(app)
        .get('/api/admin/sales?startDate=2026-01-01&endDate=2026-12-31')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.startDate).toBe('2026-01-01');
      expect(res.body.data.endDate).toBe('2026-12-31');
      expect(Array.isArray(res.body.data.sales)).toBe(true);
    });
  });

  describe('GET /api/admin/customers', () => {
    test('lists customers without password data', async () => {
      const res = await request(app)
        .get('/api/admin/customers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.customers).toHaveLength(3);
      const row = res.body.data.customers[0];
      expect(row.username).toBeDefined();
      expect(row.email).toBeDefined();
      expect(row.passwordHash).toBeUndefined();
    });

    test('filters by role', async () => {
      const res = await request(app)
        .get('/api/admin/customers?role=customer')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.customers.every((c) => c.role === 'customer')).toBe(true);
    });
  });

  describe('GET /api/admin/low-stock', () => {
    test('returns products whose variant stock is at or below the threshold', async () => {
      const category = await createCategory(adminToken, { slug: 'low-stock-cat' });
      await createProduct(adminToken, {
        categoryId: category._id,
        slug: 'low-stock-product',
        variants: [
          { sku: 'LS-S', size: 'S', color: 'Red', stock: 3, additionalPrice: 0 },
        ],
      });
      await createProduct(adminToken, {
        categoryId: category._id,
        slug: 'healthy-stock-product',
        variants: [
          { sku: 'HS-S', size: 'S', color: 'Red', stock: 50, additionalPrice: 0 },
        ],
      });

      const res = await request(app)
        .get('/api/admin/low-stock?threshold=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      const slugs = res.body.data.products.map((p) => p.slug);
      expect(slugs).toContain('low-stock-product');
      expect(slugs).not.toContain('healthy-stock-product');
    });
  });

  describe('GET /api/admin/best-selling', () => {
    test('ranks products by units sold', async () => {
      const { product } = await seedPurchase();

      const res = await request(app)
        .get('/api/admin/best-selling')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.products[0].productId).toBe(product._id);
      expect(res.body.data.products[0].totalSold).toBe(2);
    });
  });

  describe('GET /api/admin/recent-orders', () => {
    test('returns the newest orders with customer info', async () => {
      const { order } = await seedPurchase();

      const res = await request(app)
        .get('/api/admin/recent-orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.orders).toHaveLength(1);
      expect(res.body.data.orders[0]._id).toBe(order._id);
      expect(res.body.data.orders[0].userId.username).toBe('dashcustomer');
    });
  });
});
