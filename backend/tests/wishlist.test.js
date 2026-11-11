const { app, request, createUser, createCategory, createProduct } = require('./helpers');

describe('Wishlist Endpoints', () => {
  let customerToken;
  let otherToken;
  let product;

  beforeEach(async () => {
    const admin = await createUser({
      username: 'wishadmin',
      email: 'wishadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'wishcustomer',
      email: 'wishcustomer@example.com',
    });
    const other = await createUser({
      username: 'wishother',
      email: 'wishother@example.com',
    });
    customerToken = customer.token;
    otherToken = other.token;

    const category = await createCategory(admin.token, { slug: 'wish-category' });
    product = await createProduct(admin.token, {
      categoryId: category._id,
      slug: 'wish-product',
    });
  });

  describe('GET /api/wishlist', () => {
    test('returns an empty wishlist for a new user', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.wishlist).toEqual([]);
    });

    test('requires authentication', async () => {
      const res = await request(app).get('/api/wishlist');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/wishlist/:productId', () => {
    test('adds a product with populated product data', async () => {
      const res = await request(app)
        .post(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.wishlist).toHaveLength(1);
      expect(res.body.data.wishlist[0].productId._id).toBe(product._id);
      expect(res.body.data.wishlist[0].productId.productName).toBe(product.productName);
    });

    test('is idempotent — re-adding does not duplicate', async () => {
      await request(app)
        .post(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const res = await request(app)
        .post(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.wishlist).toHaveLength(1);
    });

    test('returns 404 for an unknown product', async () => {
      const res = await request(app)
        .post('/api/wishlist/aaaaaaaaaaaaaaaaaaaaaaaa')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/wishlist/:productId', () => {
    test('removes a product from the wishlist', async () => {
      await request(app)
        .post(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const res = await request(app)
        .delete(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.wishlist).toEqual([]);
    });
  });

  describe('DELETE /api/wishlist/clear', () => {
    test('clears the whole wishlist', async () => {
      await request(app)
        .post(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const res = await request(app)
        .delete('/api/wishlist/clear')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.wishlist).toEqual([]);
    });
  });

  describe('Wishlist isolation', () => {
    test('one user never sees another user’s wishlist', async () => {
      await request(app)
        .post(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.wishlist).toEqual([]);
    });
  });
});
