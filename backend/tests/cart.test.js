const { app, request, createUser, createCategory, createProduct, addToCart } = require('./helpers');

describe('Cart Endpoints', () => {
  let customerToken;
  let otherToken;
  let product;

  beforeEach(async () => {
    const admin = await createUser({
      username: 'cartadmin',
      email: 'cartadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'cartcustomer',
      email: 'cartcustomer@example.com',
    });
    const other = await createUser({
      username: 'cartother',
      email: 'cartother@example.com',
    });
    customerToken = customer.token;
    otherToken = other.token;

    const category = await createCategory(admin.token, { slug: 'cart-category' });
    product = await createProduct(admin.token, { categoryId: category._id, slug: 'cart-product' });
  });

  describe('GET /api/cart', () => {
    test('returns an empty cart for a new user', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.cart.items).toEqual([]);
      expect(res.body.data.cart.totalAmount).toBe(0);
    });

    test('requires authentication', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/cart/items', () => {
    test('adds a variant to the cart with the effective unit price', async () => {
      const variant = product.variants[1]; // additionalPrice 2000
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, variantId: variant._id, quantity: 2 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.cart.items).toHaveLength(1);
      const item = res.body.data.cart.items[0];
      expect(item.quantity).toBe(2);
      // base 25000 + additional 2000 = 27000; 2 x 27000 = 54000
      expect(item.price).toBe(27000);
      expect(res.body.data.cart.totalAmount).toBe(54000);
    });

    test('merges repeated adds of the same variant', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, variantId: product.variants[0]._id, quantity: 2 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.cart.items).toHaveLength(1);
      expect(res.body.data.cart.items[0].quantity).toBe(3);
    });

    test('rejects quantities beyond stock with 400', async () => {
      const variant = product.variants[0]; // stock 20
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, variantId: variant._id, quantity: 21 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });

    test('returns 404 for an unknown product', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          variantId: product.variants[0]._id,
          quantity: 1,
        });

      expect(res.statusCode).toBe(404);
    });

    test('returns 404 for a variant that does not belong to the product', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, variantId: 'aaaaaaaaaaaaaaaaaaaaaaaa', quantity: 1 });

      expect(res.statusCode).toBe(404);
    });

    test('requires authentication', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .send({ productId: product._id, variantId: product.variants[0]._id, quantity: 1 });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/cart/items/:itemId', () => {
    test('updates the quantity and recalculates the total', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 1);

      const res = await request(app)
        .put('/api/cart/items/whatever')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, variantId: product.variants[0]._id, quantity: 4 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.cart.items[0].quantity).toBe(4);
      expect(res.body.data.cart.totalAmount).toBe(100000);
    });

    test('clamps a zero quantity to 1', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 3);

      const res = await request(app)
        .put('/api/cart/items/whatever')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, variantId: product.variants[0]._id, quantity: 0 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.cart.items[0].quantity).toBe(1);
    });

    test('returns 404 when the item is not in the cart', async () => {
      const res = await request(app)
        .put('/api/cart/items/whatever')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, variantId: product.variants[0]._id, quantity: 1 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/cart/items/:itemId', () => {
    test('removes a cart item', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 2);

      const res = await request(app)
        .delete('/api/cart/items/whatever')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: product._id, variantId: product.variants[0]._id });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.cart.items).toHaveLength(0);
      expect(res.body.data.cart.totalAmount).toBe(0);
    });
  });

  describe('DELETE /api/cart/clear', () => {
    test('clears the cart', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 2);

      const res = await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.cart.items).toEqual([]);
    });
  });

  describe('Cart isolation', () => {
    test('one user never sees another user’s cart', async () => {
      await addToCart(customerToken, product._id, product.variants[0]._id, 2);

      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.cart.items).toEqual([]);
    });
  });
});
