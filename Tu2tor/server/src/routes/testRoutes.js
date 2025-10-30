import express from 'express';
import User from '../models/User.js';
import Tutor from '../models/Tutor.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Test database connection by counting documents
router.get('/db-status', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const tutorCount = await Tutor.countDocuments();
    const bookingCount = await Booking.countDocuments();

    res.json({
      status: 'connected',
      database: 'tu2tor',
      collections: {
        users: userCount,
        tutors: tutorCount,
        bookings: bookingCount
      },
      message: 'Database is connected and working!'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Create a test user
router.post('/create-test-user', async (req, res) => {
  try {
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      major: 'Information Technology',
      yearOfStudy: 2,
      role: 'student'
    });

    res.status(201).json({
      message: 'Test user created successfully',
      user: {
        id: testUser._id,
        username: testUser.username,
        email: testUser.email
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get all users (for testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
