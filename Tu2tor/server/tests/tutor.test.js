import request from 'supertest';
import { describe, it, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './utils/testDb.js';
import Tutor from '../src/models/Tutor.js';

const { app } = createApp();

const buildUser = (overrides = {}) => ({
  username: 'student',
  email: 'student@example.com',
  password: 'Password123!',
  major: 'Computer Science',
  yearOfStudy: 2,
  ...overrides
});

const registerAndLogin = async (userOverrides = {}) => {
  await request(app).post('/api/auth/register').send(buildUser(userOverrides));
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: userOverrides.email || 'student@example.com', password: 'Password123!' });
  return login.body.token;
};

describe('Tutor API', () => {
  beforeAll(connectTestDb);
  beforeEach(clearTestDb);
  afterAll(disconnectTestDb);

  it('creates a tutor profile and lists it', async () => {
    const token = await registerAndLogin();

    const create = await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Tutor bio',
        subjects: [{ code: 'MATH101', name: 'Math' }],
        hourlyRate: 30,
        preferredLocations: ['Library']
      });

    expect(create.status).toBe(201);
    expect(create.body.tutor.subjects[0].code).toBe('MATH101');

    const list = await request(app).get('/api/tutors');
    expect(list.status).toBe(200);
    expect(list.body.count).toBe(1);
  });

  it('validates tutor creation payload', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${token}`)
      .send({ hourlyRate: 20 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });

  it('rejects duplicate tutor registration', async () => {
    const token = await registerAndLogin();

    // Create first tutor profile
    await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Test tutor',
        subjects: [{ code: 'MATH101', name: 'Math' }],
        hourlyRate: 30
      });

    // Try to create second tutor profile
    const res = await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Another tutor profile',
        subjects: [{ code: 'CS101', name: 'CS' }],
        hourlyRate: 40
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Already a tutor');
  });

  it('rejects tutor creation without hourlyRate', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Test tutor',
        subjects: [{ code: 'MATH101', name: 'Math' }]
        // Missing hourlyRate
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });

  it('updates tutor profile only by owner', async () => {
    const ownerToken = await registerAndLogin();
    const otherToken = await registerAndLogin({
      username: 'other',
      email: 'other@example.com'
    });

    const create = await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        bio: 'Tutor bio',
        subjects: [{ code: 'PHY101', name: 'Physics' }],
        hourlyRate: 25
      });

    const tutorId = create.body.tutor.id;

    const forbidden = await request(app)
      .put(`/api/tutors/${tutorId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ bio: 'Hacked' });

    expect(forbidden.status).toBe(403);

    const ok = await request(app)
      .put(`/api/tutors/${tutorId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ bio: 'Updated bio', isAvailable: false });

    expect(ok.status).toBe(200);
    expect(ok.body.tutor.bio).toBe('Updated bio');
  });

  it('fetches tutor by id and user id', async () => {
    const token = await registerAndLogin();

    const create = await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${token}`)
      .send({
        subjects: [{ code: 'CS101', name: 'CS' }],
        hourlyRate: 40
      });

    const tutorId = create.body.tutor.id;
    const userId = create.body.tutor.userId;

    const byId = await request(app).get(`/api/tutors/${tutorId}`);
    expect(byId.status).toBe(200);
    expect(byId.body.tutor.userId).toBe(userId);

    const byUser = await request(app).get(`/api/tutors/user/${userId}`);
    expect(byUser.status).toBe(200);
    expect(byUser.body.tutor.id).toBe(tutorId);
  });

  it('returns 404 for non-existent tutor by id', async () => {
    const res = await request(app).get('/api/tutors/507f1f77bcf86cd799439011');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Tutor not found');
  });

  it('returns 404 for non-existent tutor by user id', async () => {
    const res = await request(app).get('/api/tutors/user/507f1f77bcf86cd799439011');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Tutor not found');
    expect(res.body.message).toBe('This user is not registered as a tutor');
  });

  it('handles updateTutor database errors', async () => {
    const token = await registerAndLogin();

    const create = await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Tutor bio',
        subjects: [{ code: 'MATH101', name: 'Math' }],
        hourlyRate: 30
      });

    const tutorId = create.body.tutor.id;

    // Mock Tutor.findByIdAndUpdate to throw an error
    const updateSpy = vi.spyOn(Tutor, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put(`/api/tutors/${tutorId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Updated bio' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to update tutor profile');

    updateSpy.mockRestore();
  });

  it('handles getTutorByUserId database errors', async () => {
    // Mock Tutor.findOne to throw an error
    const findOneSpy = vi.spyOn(Tutor, 'findOne').mockReturnValue({
      populate: vi.fn().mockRejectedValue(new Error('Database error'))
    });

    const res = await request(app).get('/api/tutors/user/507f1f77bcf86cd799439011');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch tutor');

    findOneSpy.mockRestore();
  });

  it('handles createTutor database errors', async () => {
    const token = await registerAndLogin();

    // Mock Tutor.create to throw an error
    const createSpy = vi.spyOn(Tutor, 'create').mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .post('/api/tutors')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bio: 'Test tutor',
        subjects: [{ code: 'MATH101', name: 'Math' }],
        hourlyRate: 30
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to create tutor profile');

    createSpy.mockRestore();
  });

  it('returns 404 when updating non-existent tutor', async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .put('/api/tutors/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Updated bio' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Tutor not found');
  });
});
