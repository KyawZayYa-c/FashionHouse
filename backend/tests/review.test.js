const {
  app,
  request,
  createUser,
  createCategory,
  createProduct,
  addToCart,
  placeOrder,
} = require('./helpers');

describe('Review Endpoints', () => {
  let adminToken;
  let customerToken;
  let otherToken;
  let product;
  let order;

  // Reviews are tied to a delivered purchase: the signed-in user must own an
  // order that contains the product.
  beforeEach(async () => {
    const admin = await createUser({
      username: 'revadmin',
      email: 'revadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'revcustomer',
      email: 'revcustomer@example.com',
    });
    const other = await createUser({
      username: 'revother',
      email: 'revother@example.com',
    });
    adminToken = admin.token;
    customerToken = customer.token;
    otherToken = other.token;

    const category = await createCategory(admin.token, { slug: 'rev-category' });
    product = await createProduct(admin.token, {
      categoryId: category._id,
      slug: 'rev-product',
    });
    await addToCart(customerToken, product._id, product.variants[0]._id, 1);
    order = await placeOrder(customerToken);
  });

  describe('POST /api/reviews', () => {
    test('creates a review for a purchased product', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: product._id,
          orderId: order._id,
          rating: 5,
          reviewText: 'Excellent quality fabric',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.review.rating).toBe(5);
      expect(res.body.data.review.reviewText).toBe('Excellent quality fabric');
    });

    test('rejects a rating outside 1-5 with 400', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 6 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Rating must be between 1 and 5');
    });

    test('rejects a missing productId with 400', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ orderId: order._id, rating: 4 });

      expect(res.statusCode).toBe(400);
    });

    test('rejects a product that is not in the order with 400', async () => {
      const unbought = await createProduct(adminToken, {
        categoryId: (
          await createCategory(adminToken, { categoryName: 'Unbought', slug: 'rev-cat-unbought' })
        )._id,
        slug: 'rev-product-unbought',
      });

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: unbought._id,
          orderId: order._id,
          rating: 4,
          reviewText: 'Never bought this',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('was not purchased');
    });

    test('rejects a review of someone else’s order with 403', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 4 });

      expect(res.statusCode).toBe(403);
    });

    test('rejects a duplicate review with 409', async () => {
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 5, reviewText: 'First' });

      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 2, reviewText: 'Second' });

      expect(res.statusCode).toBe(409);
    });

    test('requires authentication', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .send({ productId: product._id, orderId: order._id, rating: 5 });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/reviews/product/:productId', () => {
    test('lists reviews publicly with the reviewer username', async () => {
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 4, reviewText: 'Nice' });

      const res = await request(app).get(`/api/reviews/product/${product._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalReviews).toBe(1);
      expect(res.body.data.reviews[0].rating).toBe(4);
      expect(res.body.data.reviews[0].user.username).toBe('revcustomer');
      expect(res.body.data.reviews[0].user.email).toBeUndefined(); // privacy
    });

    test('filters by rating', async () => {
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 4 });

      const res = await request(app).get(`/api/reviews/product/${product._id}?rating=5`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalReviews).toBe(0);
    });
  });

  describe('GET /api/reviews/my-reviews', () => {
    test('lists the user’s own reviews with product names', async () => {
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 3, reviewText: 'OK' });

      const res = await request(app)
        .get('/api/reviews/my-reviews')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalReviews).toBe(1);
      expect(res.body.data.reviews[0].product.productName).toBe(product.productName);
    });
  });

  describe('PUT /api/reviews/:id', () => {
    test('the owner updates rating and text', async () => {
      const created = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 3, reviewText: 'OK' });
      const reviewId = created.body.data.review._id;

      const res = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ rating: 5, reviewText: 'Grew on me' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.review.rating).toBe(5);
      expect(res.body.data.review.reviewText).toBe('Grew on me');
    });

    test('another user gets 403', async () => {
      const created = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 3 });
      const reviewId = created.body.data.review._id;

      const res = await request(app)
        .put(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ rating: 1 });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    test('the owner deletes their review', async () => {
      const created = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 2 });
      const reviewId = created.body.data.review._id;

      const res = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.reviewId).toBe(reviewId);

      const list = await request(app).get(`/api/reviews/product/${product._id}`);
      expect(list.body.data.totalReviews).toBe(0);
    });

    test('another user gets 403', async () => {
      const created = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, orderId: order._id, rating: 2 });
      const reviewId = created.body.data.review._id;

      const res = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
