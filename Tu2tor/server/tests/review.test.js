import request from 'supertest';
import { describe, it, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './utils/testDb.js';
import Booking from '../src/models/Booking.js';
import Tutor from '../src/models/Tutor.js';
import Review from '../src/models/Review.js';
import User from '../src/models/User.js';

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
    .send({
      email: userOverrides.email || 'student@example.com',
      password: 'Password123!'
    });
  return { token: login.body.token, userId: login.body.user.id };
};

describe('Review API', () => {
  beforeAll(connectTestDb);
  beforeEach(clearTestDb);
  afterAll(disconnectTestDb);

  it('creates a review for completed booking', async () => {
    // Create student and tutor
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    // Create tutor profile
    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    // Create completed booking
    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Excellent tutor, very helpful and patient!',
        tags: ['Patient', 'Knowledgeable']
      });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.comment).toContain('Excellent tutor');
  });

  it('creates review with default tags and isAnonymous', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Great tutor, very helpful!'
        // No tags or isAnonymous provided - should use defaults
      });

    expect(res.status).toBe(201);
    expect(res.body.tags).toEqual([]);
    expect(res.body.isAnonymous).toBe(false);
  });

  it('creates anonymous review with custom tags', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!',
        tags: ['Patient', 'Knowledgeable'],
        isAnonymous: true
      });

    expect(res.status).toBe(201);
    expect(res.body.tags).toEqual(['Patient', 'Knowledgeable']);
    expect(res.body.isAnonymous).toBe(true);
  });

  it('rejects review with missing fields', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Please provide all required fields');
  });

  it('rejects review with invalid rating', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookingId: '507f1f77bcf86cd799439011',
        tutorId: '507f1f77bcf86cd799439012',
        rating: 6,
        comment: 'Great tutor!'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Rating must be between 1 and 5');
  });

  it('rejects review with short comment', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookingId: '507f1f77bcf86cd799439011',
        tutorId: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Good'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Comment must be at least 10 characters');
  });

  it('rejects review for non-existent booking', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bookingId: '507f1f77bcf86cd799439011',
        tutorId: '507f1f77bcf86cd799439012',
        rating: 5,
        comment: 'Great tutor, very helpful!'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Booking not found');
  });

  it('rejects review for non-completed booking', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'confirmed'
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Great tutor, very helpful!'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Can only review completed sessions');
  });

  it('gets reviews for a tutor', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Excellent tutor, very helpful!'
      });

    const res = await request(app).get(`/api/reviews/tutor/${tutorId}`);

    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
    expect(res.body.stats.averageRating).toBe(5);
  });

  it('gets review for a specific booking', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, would recommend!'
      });

    const res = await request(app)
      .get(`/api/reviews/booking/${booking._id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(4);
  });

  it('returns 404 for non-existent booking review', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .get('/api/reviews/booking/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Review not found');
  });

  it('handles getTutorReviews database errors', async () => {
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    // Mock Review.find to return a rejected promise
    const findSpy = vi.spyOn(Review, 'find').mockReturnValue({
      sort: vi.fn().mockReturnValue({
        skip: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      })
    });

    const res = await request(app).get(`/api/reviews/tutor/${tutorId}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error fetching reviews');

    findSpy.mockRestore();
  });

  it('handles getBookingReview database errors', async () => {
    const { token } = await registerAndLogin();

    // Mock Review.findOne to return a rejected promise
    const findOneSpy = vi.spyOn(Review, 'findOne').mockReturnValue({
      populate: vi.fn().mockReturnValue({
        populate: vi.fn().mockRejectedValue(new Error('Database error'))
      })
    });

    const res = await request(app)
      .get('/api/reviews/booking/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error fetching review');

    findOneSpy.mockRestore();
  });

  it('rejects review when user is not the booking student', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { token: otherToken, userId: otherStudentId } = await registerAndLogin({
      username: 'otherstudent',
      email: 'otherstudent@example.com'
    });
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Great tutor, very helpful!'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You can only review your own bookings');
  });

  it('rejects duplicate review for same booking', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    // Create first review
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Great tutor, very helpful!'
      });

    // Try to create duplicate review
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Another review for same booking'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('You have already reviewed this session');
  });

  it('gets reviews by student', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Great tutor, very helpful!'
      });

    const res = await request(app)
      .get(`/api/reviews/student/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].rating).toBe(5);
  });

  it('rejects unauthorized access to student reviews', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { token: otherToken } = await registerAndLogin({
      username: 'other',
      email: 'other@example.com'
    });

    const res = await request(app)
      .get(`/api/reviews/student/${studentId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Not authorized to access these reviews');
  });

  it('updates a review successfully', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        rating: 5,
        comment: 'Excellent tutor, very helpful and patient!'
      });

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(5);
    expect(res.body.comment).toContain('Excellent tutor');
  });

  it('rejects update with invalid rating', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        rating: 6
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Rating must be between 1 and 5');
  });

  it('rejects update with short comment', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        comment: 'Short'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Comment must be at least 10 characters');
  });

  it('rejects update by non-author', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { token: otherToken } = await registerAndLogin({
      username: 'other',
      email: 'other@example.com'
    });
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        rating: 1,
        comment: 'Trying to hack this review'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You can only update your own reviews');
  });

  it('returns 404 when updating non-existent review', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .put('/api/reviews/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({
        rating: 5,
        comment: 'Updated comment'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Review not found');
  });

  it('updates only tags without changing rating or comment', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!',
        tags: ['Patient']
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        tags: ['Patient', 'Knowledgeable']
      });

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(4); // unchanged
    expect(res.body.comment).toContain('Good tutor'); // unchanged
    expect(res.body.tags).toEqual(['Patient', 'Knowledgeable']);
  });

  it('updates only isAnonymous without changing other fields', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!',
        isAnonymous: false
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        isAnonymous: true
      });

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(4); // unchanged
    expect(res.body.isAnonymous).toBe(true);
  });

  it('marks review as helpful', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Great tutor, very helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .post(`/api/reviews/${reviewId}/helpful`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Marked as helpful');
    expect(res.body.helpfulCount).toBe(1);
  });

  it('returns 404 when marking non-existent review as helpful', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439011/helpful')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Review not found');
  });

  it('allows tutor to add response to review', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { token: tutorToken, userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, but could improve on time management'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .post(`/api/reviews/${reviewId}/response`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        response: 'Thank you for your feedback! I will work on improving my time management.'
      });

    expect(res.status).toBe(200);
    expect(res.body.tutorResponse).toContain('Thank you for your feedback');
    expect(res.body.tutorResponseDate).toBeDefined();
  });

  it('rejects tutor response that is too short', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { token: tutorToken, userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .post(`/api/reviews/${reviewId}/response`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        response: 'Thanks'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Response must be at least 10 characters');
  });

  it('rejects tutor response that is too long', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { token: tutorToken, userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .post(`/api/reviews/${reviewId}/response`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({
        response: 'a'.repeat(501)
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Response must be less than 500 characters');
  });

  it('rejects tutor response from non-tutor', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { token: otherToken } = await registerAndLogin({
      username: 'other',
      email: 'other@example.com'
    });
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 4,
        comment: 'Good tutor, helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .post(`/api/reviews/${reviewId}/response`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        response: 'Trying to respond as someone else'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('You can only respond to your own reviews');
  });

  it('returns 404 when adding response to non-existent review', async () => {
    const { token } = await registerAndLogin();

    const res = await request(app)
      .post('/api/reviews/507f1f77bcf86cd799439011/response')
      .set('Authorization', `Bearer ${token}`)
      .send({
        response: 'Thank you for your feedback!'
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Review not found');
  });

  it('allows admin to delete review', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    // Create admin user
    const { token: adminToken } = await registerAndLogin({
      username: 'admin',
      email: 'admin@example.com'
    });

    // Manually set admin role (in real app, this would be done through proper admin creation)
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    adminUser.role = 'admin';
    await adminUser.save();

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 1,
        comment: 'Inappropriate review content'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Review deleted successfully');
  });

  it('rejects delete by non-admin', async () => {
    const { token: studentToken, userId: studentId } = await registerAndLogin();
    const { userId: tutorId } = await registerAndLogin({
      username: 'tutor',
      email: 'tutor@example.com'
    });

    await Tutor.create({
      userId: tutorId,
      bio: 'Test tutor',
      subjects: [{ code: 'MATH101', name: 'Math' }],
      hourlyRate: 30
    });

    const booking = await Booking.create({
      studentId,
      tutorId,
      subject: 'Math',
      date: new Date(),
      timeSlot: '10:00-11:00',
      location: 'Library',
      cost: 30,
      status: 'completed'
    });

    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        bookingId: booking._id,
        tutorId,
        rating: 5,
        comment: 'Great tutor, very helpful!'
      });

    const reviewId = createRes.body._id;

    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Only admins can delete reviews');
  });

  it('returns 404 when deleting non-existent review', async () => {
    // Create admin user
    const { token: adminToken } = await registerAndLogin({
      username: 'admin',
      email: 'admin@example.com'
    });

    const adminUser = await User.findOne({ email: 'admin@example.com' });
    adminUser.role = 'admin';
    await adminUser.save();

    const res = await request(app)
      .delete('/api/reviews/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Review not found');
  });
});
