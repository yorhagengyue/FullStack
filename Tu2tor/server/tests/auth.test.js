import request from 'supertest';
import { describe, it, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './utils/testDb.js';
import User from '../src/models/User.js';

const { app } = createApp();

const buildUser = (overrides = {}) => ({
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'Password123!',
  major: 'Computer Science',
  yearOfStudy: 2,
  ...overrides
});

describe('Auth API', () => {
  beforeAll(connectTestDb);
  beforeEach(() => {
    clearTestDb();
    vi.restoreAllMocks();
  });
  afterAll(disconnectTestDb);

  it('registers a new user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(buildUser());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('testuser@example.com');
  });

  it('rejects registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'missing@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });

  it('rejects duplicate registration', async () => {
    await request(app).post('/api/auth/register').send(buildUser());

    const res = await request(app)
      .post('/api/auth/register')
      .send(buildUser());

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('User already exists');
  });

  it('logs in an existing user', async () => {
    await request(app).post('/api/auth/register').send(buildUser());

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.username).toBe('testuser');
  });

  it('rejects invalid login credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'missing@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns profile for authenticated user', async () => {
    await request(app).post('/api/auth/register').send(buildUser());
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'Password123!' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('testuser@example.com');
  });

  it('handles getMe when user not found in database', async () => {
    const register = await request(app).post('/api/auth/register').send(buildUser());
    const user = await User.findOne({ email: 'testuser@example.com' });

    // Mock User.findById to succeed for auth middleware, then return null for getMe
    const findByIdSpy = vi.spyOn(User, 'findById')
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(user) // Auth middleware succeeds
      })
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(null) // getMe returns null
      });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');

    findByIdSpy.mockRestore();
  });

  it('handles getMe database errors', async () => {
    const register = await request(app).post('/api/auth/register').send(buildUser());
    const user = await User.findOne({ email: 'testuser@example.com' });

    // Mock User.findById to succeed for auth middleware, then throw error for getMe
    const findByIdSpy = vi.spyOn(User, 'findById')
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue(user) // Auth middleware succeeds
      })
      .mockReturnValueOnce({
        select: vi.fn().mockRejectedValue(new Error('Database error')) // getMe throws error
      });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch user');

    findByIdSpy.mockRestore();
  });

  it('updates profile fields and prevents username conflicts', async () => {
    const user1 = await request(app).post('/api/auth/register').send(buildUser());
    await request(app).post('/api/auth/register').send(buildUser({
      username: 'otheruser',
      email: 'other@example.com'
    }));

    const conflict = await request(app)
      .put('/api/auth/update-profile')
      .set('Authorization', `Bearer ${user1.body.token}`)
      .send({ username: 'otheruser' });

    expect(conflict.status).toBe(400);
    expect(conflict.body.error).toBe('Username taken');

    const ok = await request(app)
      .put('/api/auth/update-profile')
      .set('Authorization', `Bearer ${user1.body.token}`)
      .send({ bio: 'Updated bio' });

    expect(ok.status).toBe(200);
    expect(ok.body.user.bio).toBe('Updated bio');
  });

  it('changes password with validation', async () => {
    const register = await request(app).post('/api/auth/register').send(buildUser());

    const wrong = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${register.body.token}`)
      .send({ currentPassword: 'BadPass', newPassword: 'NewPass123!' });

    expect(wrong.status).toBe(401);

    const ok = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${register.body.token}`)
      .send({ currentPassword: 'Password123!', newPassword: 'NewPass123!' });

    expect(ok.status).toBe(200);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'NewPass123!' });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });

  it('rejects password change with missing fields', async () => {
    const register = await request(app).post('/api/auth/register').send(buildUser());

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${register.body.token}`)
      .send({ currentPassword: 'Password123!' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.message).toBe('Please provide current and new password');
  });

  it('rejects password change with short new password', async () => {
    const register = await request(app).post('/api/auth/register').send(buildUser());

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${register.body.token}`)
      .send({ currentPassword: 'Password123!', newPassword: '12345' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
    expect(res.body.message).toBe('New password must be at least 6 characters');
  });

  it('handles updateProfile database errors', async () => {
    const register = await request(app).post('/api/auth/register').send(buildUser());

    // Spy on User.findByIdAndUpdate to throw an error
    const updateSpy = vi.spyOn(User, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put('/api/auth/update-profile')
      .set('Authorization', `Bearer ${register.body.token}`)
      .send({ bio: 'New bio' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Update failed');

    updateSpy.mockRestore();
  });

  it('handles changePassword database errors', async () => {
    const register = await request(app).post('/api/auth/register').send(buildUser());

    // Spy on User.prototype.save to throw an error
    const saveSpy = vi.spyOn(User.prototype, 'save').mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${register.body.token}`)
      .send({ currentPassword: 'Password123!', newPassword: 'NewPass123!' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Password change failed');

    saveSpy.mockRestore();
  });
});
