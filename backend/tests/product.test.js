const { app, request, createUser, createCategory } = require('./helpers');

describe('Product Endpoints', () => {
  let adminToken;
  let customerToken;
  let category;

  beforeEach(async () => {
    const admin = await createUser({
      username: 'prodadmin',
      email: 'prodadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'prodcustomer',
      email: 'prodcustomer@example.com',
    });
    adminToken = admin.token;
    customerToken = customer.token;
    category = await createCategory(adminToken, { slug: 'tops-prod' });
  });

  describe('POST /api/products', () => {
    test('creates a product with variants (admin)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Merino Crew Sweater',
          slug: 'merino-crew-sweater',
          description: 'Soft merino wool sweater',
          brand: 'Fashion House',
          price: 25000,
          variants: [
            { sku: 'MCS-M-RED', size: 'M', color: 'Red', stock: 20, additionalPrice: 0 },
          ],
          images: [{ url: 'https://example.com/sweater.jpg', isPrimary: true }],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.productName).toBe('Merino Crew Sweater');
      expect(res.body.data.product.price).toBe(25000);
      expect(res.body.data.product.status).toBe('active');
      expect(res.body.data.product.variants).toHaveLength(1);
      expect(res.body.data.product.variants[0]._id).toBeDefined();
    });

    test('rejects a customer with 403', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          categoryId: category._id,
          productName: 'Forbidden Product',
          slug: 'forbidden-product',
          description: 'nope',
          price: 100,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Not authorized as an admin');
    });

    test('rejects an unauthenticated request with 401', async () => {
      const res = await request(app).post('/api/products').send({ productName: 'x' });
      expect(res.statusCode).toBe(401);
    });

    test('rejects missing required fields with 400', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productName: 'No slug or price' });

      expect(res.statusCode).toBe(400);
    });

    test('rejects a missing description with 400 (schema requires it)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'No Description',
          slug: 'no-description',
          price: 5000,
        });

      expect(res.statusCode).toBe(400);
    });

    test('rejects a duplicate slug with 409', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'First',
          slug: 'dup-slug-product',
          description: 'first',
          price: 100,
        });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Second',
          slug: 'dup-slug-product',
          description: 'second',
          price: 200,
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Product slug already exists');
    });

    test('rejects an unknown categoryId with 400', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          productName: 'Orphan',
          slug: 'orphan-product',
          description: 'orphan',
          price: 100,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid category ID');
    });
  });

  describe('GET /api/products', () => {
    test('lists products publicly with pagination', async () => {
      for (let i = 1; i <= 5; i += 1) {
        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            categoryId: category._id,
            productName: `Product ${i}`,
            slug: `product-${i}`,
            description: `Product ${i} description`,
            price: 1000 + i,
          });
      }

      const res = await request(app).get('/api/products?page=1&limit=3');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.products).toHaveLength(3);
      expect(res.body.data.totalProducts).toBe(5);
      expect(res.body.data.totalPages).toBe(2);
      expect(res.body.data.page).toBe(1);
    });

    test('sorts descending by price when requested', async () => {
      for (let i = 1; i <= 3; i += 1) {
        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            categoryId: category._id,
            productName: `Priced ${i}`,
            slug: `priced-${i}`,
            description: 'priced',
            price: i * 1000,
          });
      }

      const res = await request(app).get('/api/products?sort=price:desc');

      expect(res.statusCode).toBe(200);
      const prices = res.body.data.products.map((p) => p.price);
      expect(prices).toEqual([3000, 2000, 1000]);
    });

    test('filters by status', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Inactive one',
          slug: 'inactive-one',
          description: 'inactive',
          price: 100,
          status: 'inactive',
        });

      const res = await request(app).get('/api/products?status=active');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalProducts).toBe(0);
    });
  });

  describe('GET /api/products/featured', () => {
    test('returns only active featured products', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Featured One',
          slug: 'featured-one',
          description: 'featured',
          price: 1000,
          isFeatured: true,
        });
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Not Featured',
          slug: 'not-featured',
          description: 'plain',
          price: 2000,
        });

      const res = await request(app).get('/api/products/featured');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.products[0].slug).toBe('featured-one');
    });
  });

  describe('GET /api/products/search', () => {
    test('searches by product name and description', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'T-Shirt White',
          slug: 't-shirt-white',
          description: 'plain white tee',
          price: 5000,
        });
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Linen Pants',
          slug: 'linen-pants',
          description: 't-shirt style drawstring waist',
          price: 7000,
        });

      const res = await request(app).get('/api/products/search?query=T-Shirt');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalResults).toBe(2);
    });

    test('requires the query parameter', async () => {
      const res = await request(app).get('/api/products/search');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/products/slug/:slug', () => {
    test('returns a product by slug publicly', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'By Slug',
          slug: 'by-slug',
          description: 'slug lookup',
          price: 3000,
        });

      const res = await request(app).get('/api/products/slug/by-slug');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.product.productName).toBe('By Slug');
    });

    test('returns 404 for an unknown slug', async () => {
      const res = await request(app).get('/api/products/slug/does-not-exist');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/products/:id', () => {
    test('returns a populated product for an authenticated user', async () => {
      const created = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'With Category',
          slug: 'with-category',
          description: 'populated',
          price: 4000,
        });
      const id = created.body.data.product._id;

      const res = await request(app)
        .get(`/api/products/${id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.product.productName).toBe('With Category');
      expect(res.body.data.product.categoryId.categoryName).toBe('Tops');
    });

    test('requires authentication', async () => {
      const created = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Needs Auth',
          slug: 'needs-auth',
          description: 'auth',
          price: 4000,
        });

      const res = await request(app).get(`/api/products/${created.body.data.product._id}`);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/products/:id', () => {
    test('updates price and name', async () => {
      const created = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Old Name',
          slug: 'old-name',
          description: 'old',
          price: 19999,
        });
      const id = created.body.data.product._id;

      const res = await request(app)
        .put(`/api/products/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ productName: 'New Name', price: 39999 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.product.productName).toBe('New Name');
      expect(res.body.data.product.price).toBe(39999);
    });

    test('rejects a slug collision with 409', async () => {
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Taken',
          slug: 'taken-slug',
          description: 'taken',
          price: 100,
        });
      const second = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Renamer',
          slug: 'renamer',
          description: 'renamer',
          price: 100,
        });

      const res = await request(app)
        .put(`/api/products/${second.body.data.product._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'taken-slug' });

      expect(res.statusCode).toBe(409);
    });

    test('rejects a customer with 403', async () => {
      const created = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Locked',
          slug: 'locked',
          description: 'locked',
          price: 100,
        });

      const res = await request(app)
        .put(`/api/products/${created.body.data.product._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ price: 1 });

      expect(res.statusCode).toBe(403);
    });

    test('returns 404 for an unknown id', async () => {
      const res = await request(app)
        .put('/api/products/aaaaaaaaaaaaaaaaaaaaaaaa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 1 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('soft-deletes by setting status to inactive', async () => {
      const created = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'ToDelete',
          slug: 'todelete',
          description: 'delete me',
          price: 100,
        });
      const id = created.body.data.product._id;

      const res = await request(app)
        .delete(`/api/products/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);

      const fetched = await request(app)
        .get(`/api/products/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(fetched.body.data.product.status).toBe('inactive');
    });

    test('rejects a customer with 403', async () => {
      const created = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryId: category._id,
          productName: 'Customer Delete',
          slug: 'customer-delete',
          description: 'no',
          price: 100,
        });

      const res = await request(app)
        .delete(`/api/products/${created.body.data.product._id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
