const { app, request } = require('./helpers');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('registers a new customer and returns a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'thiri', email: 'thiri@example.com', password: 'Password123' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('thiri');
      expect(res.body.data.user.email).toBe('thiri@example.com');
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    test('sets an httpOnly session cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'cookieuser', email: 'cookie@example.com', password: 'Password123' });

      const cookies = res.headers['set-cookie'].join('; ');
      expect(cookies).toContain('token=');
      expect(cookies).toContain('HttpOnly');
    });

    test('rejects a duplicate email with 409', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'first', email: 'dup@example.com', password: 'Password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'second', email: 'dup@example.com', password: 'Password123' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email already registered');
    });

    test('rejects a duplicate username with 409', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'samehandle', email: 'a@example.com', password: 'Password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'samehandle', email: 'b@example.com', password: 'Password123' });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Username already taken');
    });

    test('rejects invalid payloads with 400 and field details', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: '123' }); // username missing

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    test('logs in with valid credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'loginuser', email: 'login@example.com', password: 'Password123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'Password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    test('rejects a wrong password with 401', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'wrongpw', email: 'wrongpw@example.com', password: 'Password123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrongpw@example.com', password: 'WrongPassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    test('rejects an unknown email with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'Password123' });

      expect(res.statusCode).toBe(401);
    });

    test('rejects malformed payloads with 400', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'bad-email' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    test('returns the profile for a valid bearer token', async () => {
      const { token, user } = await createUserHelper('meuser', 'me@example.com');

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.username).toBe(user.username);
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    test('returns 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    test('returns 401 for an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-jwt');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('updates username and phone', async () => {
      const { token } = await createUserHelper('oldname', 'profile@example.com');

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'newname', phone: '09770001122' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.username).toBe('newname');
      expect(res.body.data.user.phone).toBe('09770001122');
    });

    test('rejects a username shorter than 3 characters', async () => {
      const { token } = await createUserHelper('okname', 'short@example.com');

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'ab' });

      expect(res.statusCode).toBe(400);
    });

    test('requires authentication', async () => {
      const res = await request(app).put('/api/auth/profile').send({ username: 'x' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    test('changes the password and allows login with the new one', async () => {
      const { token } = await createUserHelper('chpw', 'chpw@example.com');

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'Password123', newPassword: 'NewPassword456' });

      expect(res.statusCode).toBe(200);

      const relogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'chpw@example.com', password: 'NewPassword456' });

      expect(relogin.statusCode).toBe(200);
      expect(relogin.body.data.token).toBeDefined();
    });

    test('rejects a wrong current password with 401', async () => {
      const { token } = await createUserHelper('chpw2', 'chpw2@example.com');

      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'NotMyPassword', newPassword: 'NewPassword456' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('clears the session cookie', async () => {
      const { token } = await createUserHelper('logout', 'logout@example.com');

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      const cookies = res.headers['set-cookie'].join('; ');
      expect(cookies).toContain('token=;');
    });
  });
});

// Small local wrapper so this file's tests read cleanly.
async function createUserHelper(username, email) {
  const { createUser } = require('./helpers');
  return createUser({ username, email });
}
