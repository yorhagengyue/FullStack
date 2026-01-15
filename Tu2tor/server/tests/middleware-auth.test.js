import request from 'supertest';
import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './utils/testDb.js';
import User from '../src/models/User.js';

const { app } = createApp();

const buildUser = (overrides = {}) => ({
  username: 'authtest',
  email: 'authtest@example.com',
  password: 'Password123!',
  major: 'Computer Science',
  yearOfStudy: 2,
  role: 'student',
  ...overrides
});

describe('Auth Middleware', () => {
  beforeAll(connectTestDb);
  beforeEach(clearTestDb);
  afterAll(disconnectTestDb);

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Not authorized');
    expect(res.body.message).toBe('No token provided');
  });

  it('rejects request with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Not authorized');
    expect(res.body.message).toBe('Token verification failed');
  });

  it('rejects request with malformed authorization header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'NotBearer token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  it('rejects token for non-existent user', async () => {
    // Create a token with a fake user ID
    const fakeToken = jwt.sign(
      { id: '507f1f77bcf86cd799439011' }, // Valid ObjectId format but non-existent
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('User not found');
  });

  it('rejects expired token', async () => {
    // Register a user first
    await request(app).post('/api/auth/register').send(buildUser());

    // Create an expired token
    const user = await User.findOne({ email: 'authtest@example.com' });
    const expiredToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Expired 1 hour ago
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token verification failed');
  });

  it('accepts valid token and attaches user to request', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send(buildUser());

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('authtest@example.com');
  });
});

describe('Authorization Middleware', () => {
  beforeAll(connectTestDb);
  beforeEach(clearTestDb);
  afterAll(disconnectTestDb);

  it('rejects non-admin user from admin-only route', async () => {
    // Create a student user
    const student = await request(app)
      .post('/api/auth/register')
      .send(buildUser({ role: 'student' }));

    // Try to access admin-only route (delete booking)
    const res = await request(app)
      .delete('/api/bookings/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${student.body.token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
    expect(res.body.message).toContain('not authorized');
  });

  it('allows admin user to access admin-only route', async () => {
    // Create an admin user
    const admin = await request(app)
      .post('/api/auth/register')
      .send(buildUser({
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      }));

    // Try to access admin-only route (delete booking with non-existent ID)
    const res = await request(app)
      .delete('/api/bookings/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${admin.body.token}`);

    // Should not be 403 (might be 404 for non-existent booking, but not forbidden)
    expect(res.status).not.toBe(403);
  });
});
