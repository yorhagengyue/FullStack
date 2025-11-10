import express from 'express';
import {
  createReview,
  getTutorReviews,
  getBookingReview,
  getStudentReviews,
  updateReview,
  deleteReview,
  markReviewAsHelpful,
  addTutorResponse,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/tutor/:tutorId', getTutorReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/booking/:bookingId', protect, getBookingReview);
router.get('/student/:studentId', protect, getStudentReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markReviewAsHelpful);
router.post('/:id/response', protect, addTutorResponse);

export default router;
