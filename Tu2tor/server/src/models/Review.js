import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // References
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
  },
  tags: [{
    type: String,
    enum: [
      'Clear Explanations',
      'Patient',
      'Knowledgeable',
      'Engaging',
      'Helpful Materials',
      'Great Examples',
      'Responsive',
      'Flexible',
      'Well Prepared',
      'Encouraging',
    ],
  }],

  // Privacy
  isAnonymous: {
    type: Boolean,
    default: false,
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false, // Set to true after booking is completed
  },

  // Engagement
  helpfulCount: {
    type: Number,
    default: 0,
  },

  // Response from tutor
  tutorResponse: {
    type: String,
    maxlength: 500,
  },
  tutorResponseDate: {
    type: Date,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for efficient queries
reviewSchema.index({ tutorId: 1, createdAt: -1 });
reviewSchema.index({ studentId: 1, createdAt: -1 });
reviewSchema.index({ bookingId: 1 }, { unique: true }); // One review per booking

// Instance methods
reviewSchema.methods.markAsHelpful = function() {
  this.helpfulCount += 1;
  return this.save();
};

// Static methods
reviewSchema.statics.getAverageRatingForTutor = async function(tutorId) {
  const result = await this.aggregate([
    { $match: { tutorId: mongoose.Types.ObjectId(tutorId), isVerified: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

reviewSchema.statics.getTutorRatingBreakdown = async function(tutorId) {
  return await this.aggregate([
    { $match: { tutorId: mongoose.Types.ObjectId(tutorId), isVerified: true } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// Pre-save middleware
reviewSchema.pre('save', async function(next) {
  // If this is a new review, check if booking is completed
  if (this.isNew) {
    const Booking = mongoose.model('Booking');
    const booking = await Booking.findById(this.bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'completed') {
      throw new Error('Can only review completed sessions');
    }

    // Check if review already exists for this booking
    const existingReview = await this.constructor.findOne({ bookingId: this.bookingId });
    if (existingReview) {
      throw new Error('Review already exists for this booking');
    }

    // Verify the review is from the student of this booking
    if (!booking.studentId.equals(this.studentId)) {
      throw new Error('Only the student can review this session');
    }

    // Auto-verify since booking is completed
    this.isVerified = true;
  }

  next();
});

// Post-save middleware - update tutor stats
reviewSchema.post('save', async function(doc) {
  try {
    const Tutor = mongoose.model('Tutor');
    const User = mongoose.model('User');

    // Get updated rating stats
    const stats = await doc.constructor.getAverageRatingForTutor(doc.tutorId);

    // Find tutor profile by userId
    const userTutor = await User.findById(doc.tutorId);
    if (userTutor && userTutor.role === 'tutor') {
      await Tutor.findOneAndUpdate(
        { userId: doc.tutorId },
        {
          averageRating: Math.round(stats.averageRating * 100) / 100, // Round to 2 decimal places
          totalReviews: stats.totalReviews,
        }
      );
    }

    // Mark booking as reviewed
    const Booking = mongoose.model('Booking');
    await Booking.findByIdAndUpdate(doc.bookingId, { hasReview: true });
  } catch (error) {
    console.error('Error updating tutor stats after review:', error);
  }
});

// Post-delete middleware - update tutor stats
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const Tutor = mongoose.model('Tutor');
      const User = mongoose.model('User');
      const Booking = mongoose.model('Booking');

      // Get updated rating stats
      const stats = await doc.constructor.getAverageRatingForTutor(doc.tutorId);

      // Update tutor stats
      const userTutor = await User.findById(doc.tutorId);
      if (userTutor && userTutor.role === 'tutor') {
        await Tutor.findOneAndUpdate(
          { userId: doc.tutorId },
          {
            averageRating: Math.round(stats.averageRating * 100) / 100,
            totalReviews: stats.totalReviews,
          }
        );
      }

      // Mark booking as not reviewed
      await Booking.findByIdAndUpdate(doc.bookingId, { hasReview: false });
    } catch (error) {
      console.error('Error updating tutor stats after review deletion:', error);
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
