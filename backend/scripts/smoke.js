/* eslint-disable no-console */
// End-to-end API smoke test against a running backend (default :5000).
//   node scripts/smoke.js
// Exercises the real secured flow: auth -> catalog -> cart -> wishlist -> order
// -> admin, asserting the envelope, numeric prices and the route-order fixes.
const BASE = process.env.API_BASE || 'http://localhost:5000';

let pass = 0;
let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) {
    pass += 1;
    console.log(`  PASS  ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL  ${name} ${extra}`);
  }
};

const call = async (method, path, { token, body } = {}) => {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _nonJson: text.slice(0, 80) };
  }
  return { status: res.status, json };
};

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

const run = async () => {
  console.log(`Smoke testing ${BASE}\n`);

  // Health
  const health = await call('GET', '/api/health');
  check('health returns JSON', health.status === 200 && health.json.success === true, JSON.stringify(health.json).slice(0, 80));

  // Catalog
  const products = await call('GET', '/api/products?limit=50');
  const list = products.json?.data?.products || [];
  check('products list non-empty', Array.isArray(list) && list.length > 0, `len=${list.length}`);
  check('product price is a number', list.length > 0 && isNum(list[0].price), `price=${JSON.stringify(list[0]?.price)}`);
  check('product has variants+images', list.length > 0 && Array.isArray(list[0].variants) && Array.isArray(list[0].images));

  const featured = await call('GET', '/api/products/featured');
  check('featured products', (featured.json?.data?.products || []).length > 0);

  const cats = await call('GET', '/api/categories');
  check('categories', (cats.json?.data?.categories || []).length === 6, `len=${(cats.json?.data?.categories || []).length}`);

  const sample = list[0];
  const bySlug = await call('GET', `/api/products/slug/${sample.slug}`);
  check('product by slug (public)', bySlug.status === 200 && bySlug.json?.data?.product?.slug === sample.slug);

  // Auth (customer)
  const login = await call('POST', '/api/auth/login', { body: { email: 'demo@fashionhouse.com', password: 'Demo@12345' } });
  const token = login.json?.data?.token;
  check('customer login returns token', login.status === 200 && !!token, JSON.stringify(login.json).slice(0, 100));

  const me = await call('GET', '/api/auth/me', { token });
  check('auth/me returns user', me.status === 200 && me.json?.data?.email === 'demo@fashionhouse.com');

  // Reset cart for a deterministic run
  await call('DELETE', '/api/cart/clear', { token });
  await call('DELETE', '/api/wishlist/clear', { token });

  // Cart
  const variant = sample.variants.find((v) => v.stock > 0) || sample.variants[0];
  const add = await call('POST', '/api/cart/items', { token, body: { productId: sample._id, variantId: variant._id, quantity: 2 } });
  const cart = add.json?.data?.cart;
  check('add to cart 201', add.status === 201, `status=${add.status} ${JSON.stringify(add.json).slice(0, 100)}`);
  check('cart total is a finite number', cart && isNum(cart.totalAmount), `total=${JSON.stringify(cart?.totalAmount)}`);
  check('cart item price numeric', cart && isNum(cart.items?.[0]?.price), `price=${JSON.stringify(cart?.items?.[0]?.price)}`);
  check('cart populated with images+variants', cart && Array.isArray(cart.items?.[0]?.productId?.images) && Array.isArray(cart.items?.[0]?.productId?.variants));

  const getCart = await call('GET', '/api/cart', { token });
  check('get cart has 1 line', (getCart.json?.data?.cart?.items || []).length === 1);

  const upd = await call('PUT', `/api/cart/items/${variant._id}`, { token, body: { productId: sample._id, variantId: variant._id, quantity: 3 } });
  check('update qty -> 3', upd.json?.data?.cart?.items?.[0]?.quantity === 3, `qty=${upd.json?.data?.cart?.items?.[0]?.quantity}`);

  // Wishlist
  const wAdd = await call('POST', `/api/wishlist/${sample._id}`, { token });
  check('wishlist add 201', wAdd.status === 201, `status=${wAdd.status} ${JSON.stringify(wAdd.json).slice(0, 100)}`);
  check('wishlist populated product', (wAdd.json?.data?.wishlist || []).length === 1 && !!wAdd.json.data.wishlist[0].productId?.productName);

  const wGet = await call('GET', '/api/wishlist', { token });
  check('wishlist get has 1', (wGet.json?.data?.wishlist || []).length === 1);

  const wClear = await call('DELETE', '/api/wishlist/clear', { token });
  check('wishlist /clear not shadowed', wClear.status === 200 && (wClear.json?.data?.wishlist || []).length === 0, `status=${wClear.status}`);

  // Order
  const order = await call('POST', '/api/orders', {
    token,
    body: {
      shippingAddress: { recipientName: 'Demo Customer', phone: '095551212', address: 'No. 123, 96th Street', township: 'Mayangone', city: 'Yangon' },
      deliveryFee: 3000,
      discount: 0,
      notes: 'Smoke test order',
    },
  });
  const ord = order.json?.data?.order;
  check('create order 201', order.status === 201, `status=${order.status} ${JSON.stringify(order.json).slice(0, 120)}`);
  check('order total numeric', ord && isNum(ord.totalAmount), `total=${JSON.stringify(ord?.totalAmount)}`);
  check('order subtotal numeric', ord && isNum(ord.subtotal), `subtotal=${JSON.stringify(ord?.subtotal)}`);
  check('order has 1 item qty 3', ord && ord.items?.length === 1 && ord.items[0].quantity === 3);

  const myOrders = await call('GET', '/api/orders/my-orders', { token });
  check('my-orders list', (myOrders.json?.data?.orders || []).length >= 1);

  const cartAfter = await call('GET', '/api/cart', { token });
  check('cart cleared after order', (cartAfter.json?.data?.cart?.items || []).length === 0);

  // Order without address should fail validation (not 500)
  await call('POST', '/api/cart/items', { token, body: { productId: sample._id, variantId: variant._id, quantity: 1 } });
  const badOrder = await call('POST', '/api/orders', { token, body: { deliveryFee: 0 } });
  check('order without address -> 400', badOrder.status === 400, `status=${badOrder.status}`);
  await call('DELETE', '/api/cart/clear', { token });

  // Admin
  const adminLogin = await call('POST', '/api/auth/login', { body: { email: 'admin@fashionhouse.com', password: 'Admin@12345' } });
  const adminToken = adminLogin.json?.data?.token;
  check('admin login', adminLogin.status === 200 && adminLogin.json?.data?.user?.role === 'admin');

  const dash = await call('GET', '/api/admin/dashboard', { token: adminToken });
  check('admin dashboard stats', dash.status === 200 && dash.json?.data?.orderStats?.totalOrders >= 1, `status=${dash.status}`);
  check('dashboard totalSales numeric', dash.json?.data?.orderStats && isNum(dash.json.data.orderStats.totalSales), `sales=${JSON.stringify(dash.json?.data?.orderStats?.totalSales)}`);

  const recent = await call('GET', '/api/admin/recent-orders', { token: adminToken });
  check('admin recent orders', (recent.json?.data?.orders || []).length >= 1);

  const low = await call('GET', '/api/admin/low-stock', { token: adminToken });
  check('admin low stock', low.status === 200 && Array.isArray(low.json?.data?.products));

  const customers = await call('GET', '/api/admin/customers', { token: adminToken });
  check('admin customers', (customers.json?.data?.customers || []).length >= 1);

  // Customer cannot access admin
  const forbidden = await call('GET', '/api/admin/dashboard', { token });
  check('customer blocked from admin (403)', forbidden.status === 403, `status=${forbidden.status}`);

  // Unauthenticated cart -> 401 (not HTML)
  const noAuth = await call('GET', '/api/cart');
  check('unauthenticated cart -> 401 JSON', noAuth.status === 401 && noAuth.json.success === false);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error('Smoke test crashed:', err.message);
  process.exit(1);
});