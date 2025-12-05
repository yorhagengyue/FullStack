import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import User from '../models/User.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Student only)
export const createReview = async (req, res) => {
  try {
    const { bookingId, tutorId, rating, comment, tags, isAnonymous } = req.body;

    // Validation
    if (!bookingId || !tutorId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (comment.length < 10) {
      return res.status(400).json({ message: 'Comment must be at least 10 characters' });
    }

    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed sessions' });
    }

    // Verify user is the student of this booking
    if (booking.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only review your own bookings' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this session' });
    }

    // Create review
    const review = await Review.create({
      bookingId,
      tutorId,
      studentId: req.user._id,
      rating,
      comment,
      tags: tags || [],
      isAnonymous: isAnonymous || false,
      isVerified: true,
    });

    // Populate student info (if not anonymous)
    await review.populate('studentId', 'username profilePicture');
    await review.populate('tutorId', 'username');

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message || 'Error creating review' });
  }
};

// @desc    Get all reviews for a tutor
// @route   GET /api/reviews/tutor/:tutorId
// @access  Public
export const getTutorReviews = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    console.log('[getTutorReviews] Fetching reviews for tutorId:', tutorId);

    const reviews = await Review.find({ tutorId, isVerified: true })
      .populate('studentId', 'username profilePicture')
      .populate('bookingId', 'subject date')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('[getTutorReviews] Found reviews count:', reviews.length);

    const total = await Review.countDocuments({ tutorId, isVerified: true });

    // Get rating breakdown
    const ratingBreakdown = await Review.getTutorRatingBreakdown(tutorId);
    console.log('[getTutorReviews] Rating breakdown:', ratingBreakdown);

    // Get average rating
    const stats = await Review.getAverageRatingForTutor(tutorId);
    console.log('[getTutorReviews] Stats:', stats);

    res.json({
      reviews,
      stats: {
        ...stats,
        ratingBreakdown,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tutor reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// @desc    Get review for a specific booking
// @route   GET /api/reviews/booking/:bookingId
// @access  Private
export const getBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const review = await Review.findOne({ bookingId })
      .populate('studentId', 'username profilePicture')
      .populate('tutorId', 'username');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Get booking review error:', error);
    res.status(500).json({ message: 'Error fetching review' });
  }
};

// @desc    Get all reviews by a student
// @route   GET /api/reviews/student/:studentId
// @access  Private
export const getStudentReviews = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify user can access these reviews
    if (req.user._id.toString() !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access these reviews' });
    }

    const reviews = await Review.find({ studentId })
      .populate('tutorId', 'username profilePicture')
      .populate('bookingId', 'subject date')
      .sort('-createdAt');

    res.json(reviews);
  } catch (error) {
    console.error('Get student reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review author only)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, tags, isAnonymous } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify user is the author
    if (review.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      if (comment.length < 10) {
        return res.status(400).json({ message: 'Comment must be at least 10 characters' });
      }
      review.comment = comment;
    }

    if (tags !== undefined) review.tags = tags;
    if (isAnonymous !== undefined) review.isAnonymous = isAnonymous;

    await review.save();

    await review.populate('studentId', 'username profilePicture');
    await review.populate('tutorId', 'username');

    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Error updating review' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin only)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only admin can delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete reviews' });
    }

    await Review.findByIdAndDelete(id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markReviewAsHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.markAsHelpful();

    res.json({ message: 'Marked as helpful', helpfulCount: review.helpfulCount });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: 'Error marking review as helpful' });
  }
};

// @desc    Tutor response to review
// @route   POST /api/reviews/:id/response
// @access  Private (Tutor only)
export const addTutorResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || response.length < 10) {
      return res.status(400).json({ message: 'Response must be at least 10 characters' });
    }

    if (response.length > 500) {
      return res.status(400).json({ message: 'Response must be less than 500 characters' });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify user is the tutor
    if (review.tutorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only respond to your own reviews' });
    }

    review.tutorResponse = response;
    review.tutorResponseDate = new Date();

    await review.save();

    res.json(review);
  } catch (error) {
    console.error('Add tutor response error:', error);
    res.status(500).json({ message: 'Error adding tutor response' });
  }
};

export default {
  createReview,
  getTutorReviews,
  getBookingReview,
  getStudentReviews,
  updateReview,
  deleteReview,
  markReviewAsHelpful,
  addTutorResponse,
};
