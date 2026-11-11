// Shared helpers for the API test suite. Every request goes through supertest
// against the real Express app (require('../src/app')), exercising the actual
// middleware stack: cookies, JWT auth, validation, error handling.
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

// A complete shipping address satisfying order validation.
const shippingAddress = {
  recipientName: 'Kyaw Zay Ya',
  phone: '09771122334',
  address: 'No. 12, Bogyoke Road',
  township: 'Bahan',
  city: 'Yangon',
};

// Register a customer (the register endpoint always creates customers and
// returns a token), or seed an admin directly since self-registration cannot
// grant the admin role. Returns { user, token }.
const createUser = async ({
  username,
  email,
  password = 'Password123',
  role = 'customer',
} = {}) => {
  if (role === 'admin') {
    const admin = await User.create({
      username,
      email,
      passwordHash: password, // hashed by the pre-save hook
      role: 'admin',
    });
    const res = await request(app).post('/api/auth/login').send({ email, password });
    if (res.status !== 200) {
      throw new Error(`Admin login failed: ${res.status} ${JSON.stringify(res.body)}`);
    }
    return { user: res.body.data.user, token: res.body.data.token };
  }

  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, email, password });
  if (res.status !== 201) {
    throw new Error(`Register failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { user: res.body.data.user, token: res.body.data.token };
};

// Create a category (requires an authenticated user; route is not admin-gated).
const createCategory = async (token, overrides = {}) => {
  const payload = {
    categoryName: 'Tops',
    slug: 'tops',
    description: 'Test category',
    ...overrides,
  };
  const res = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
  if (res.status !== 201) {
    throw new Error(`Category creation failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.category;
};

// Create an active product with two variants (the first gets 20 in stock).
// Returns the product document as JSON, including variant _ids.
const createProduct = async (adminToken, overrides = {}) => {
  const payload = {
    categoryId: overrides.categoryId,
    productName: 'Merino Crew Sweater',
    slug: 'merino-crew-sweater',
    description: 'Soft merino wool sweater',
    brand: 'Fashion House',
    price: 25000,
    variants: [
      { sku: 'MCS-M-RED', size: 'M', color: 'Red', stock: 20, additionalPrice: 0 },
      { sku: 'MCS-L-RED', size: 'L', color: 'Red', stock: 10, additionalPrice: 2000 },
    ],
    images: [{ url: 'https://example.com/sweater.jpg', isPrimary: true }],
    status: 'active',
    ...overrides,
  };
  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(payload);
  if (res.status !== 201) {
    throw new Error(`Product creation failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.product;
};

// Add a product variant to a user's cart. Returns the cart.
const addToCart = async (token, productId, variantId, quantity = 1) => {
  const res = await request(app)
    .post('/api/cart/items')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId, variantId, quantity });
  if (res.status !== 201) {
    throw new Error(`Add to cart failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.cart;
};

// Place an order from the user's current cart.
const placeOrder = async (token, overrides = {}) => {
  const res = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ shippingAddress, ...overrides });
  if (res.status !== 201) {
    throw new Error(`Order creation failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.order;
};

module.exports = {
  app,
  request,
  shippingAddress,
  createUser,
  createCategory,
  createProduct,
  addToCart,
  placeOrder,
};
