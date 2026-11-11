const { app, request, createUser } = require('./helpers');

describe('Category Endpoints', () => {
  let adminToken;
  let customerToken;

  beforeEach(async () => {
    const admin = await createUser({
      username: 'catadmin',
      email: 'catadmin@example.com',
      role: 'admin',
    });
    const customer = await createUser({
      username: 'catcustomer',
      email: 'catcustomer@example.com',
    });
    adminToken = admin.token;
    customerToken = customer.token;
  });

  describe('POST /api/categories', () => {
    test('creates a category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          categoryName: "Men's Clothing",
          slug: 'mens-clothing',
          description: 'Men clothing category',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.categoryName).toBe("Men's Clothing");
      expect(res.body.data.category.slug).toBe('mens-clothing');
      expect(res.body.data.category.status).toBe('active');
    });

    test('lowercases the slug', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Outerwear', slug: 'Outerwear-Collection' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.category.slug).toBe('outerwear-collection');
    });

    test('rejects a missing name with 400', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'no-name' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Category name is required');
    });

    test('rejects a duplicate slug with 409', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'First', slug: 'dup-slug' });

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Second', slug: 'dup-slug' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('rejects a duplicate name (case-insensitive) with 409', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Dresses', slug: 'dresses-one' });

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'DRESSES', slug: 'dresses-two' });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Category name already exists');
    });

    test('requires authentication', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ categoryName: 'NoAuth', slug: 'no-auth' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/categories', () => {
    test('lists categories publicly', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Test1', slug: 'test1' });
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Test2', slug: 'test2' });

      const res = await request(app).get('/api/categories');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toHaveLength(2);
    });

    test('supports the status filter', async () => {
      const created = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Archived', slug: 'archived' });
      await request(app)
        .put(`/api/categories/${created.body.data.category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' });

      const res = await request(app).get('/api/categories?status=active');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.categories).toHaveLength(0);
    });
  });

  describe('GET /api/categories/:id', () => {
    test('returns a category by id', async () => {
      const created = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'TestCategory', slug: 'test-category' });
      const id = created.body.data.category._id;

      const res = await request(app)
        .get(`/api/categories/${id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.category.categoryName).toBe('TestCategory');
    });

    test('requires authentication', async () => {
      const created = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Secret', slug: 'secret' });

      const res = await request(app).get(`/api/categories/${created.body.data.category._id}`);
      expect(res.statusCode).toBe(401);
    });

    test('rejects a malformed id with 400', async () => {
      const res = await request(app)
        .get('/api/categories/not-an-objectid')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(400);
    });

    test('returns 404 for an unknown but well-formed id', async () => {
      const res = await request(app)
        .get('/api/categories/aaaaaaaaaaaaaaaaaaaaaaaa')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/categories/:id', () => {
    test('updates name and description', async () => {
      const created = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'OldName', slug: 'old-slug' });
      const id = created.body.data.category._id;

      const res = await request(app)
        .put(`/api/categories/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'NewName', description: 'Updated' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.category.categoryName).toBe('NewName');
      expect(res.body.data.category.slug).toBe('old-slug'); // untouched
    });

    test('rejects renaming to an existing slug with 409', async () => {
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'One', slug: 'slug-one' });
      const two = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Two', slug: 'slug-two' });

      const res = await request(app)
        .put(`/api/categories/${two.body.data.category._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'slug-one' });

      expect(res.statusCode).toBe(409);
    });

    test('returns 404 for an unknown id', async () => {
      const res = await request(app)
        .put('/api/categories/aaaaaaaaaaaaaaaaaaaaaaaa')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'Ghost' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    test('deletes a category', async () => {
      const created = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryName: 'ToDelete', slug: 'todelete' });
      const id = created.body.data.category._id;

      const res = await request(app)
        .delete(`/api/categories/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.categoryId).toBe(id);

      const list = await request(app).get('/api/categories');
      expect(list.body.data.categories).toHaveLength(0);
    });

    test('returns 404 when the category is already gone', async () => {
      const res = await request(app)
        .delete('/api/categories/aaaaaaaaaaaaaaaaaaaaaaaa')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
