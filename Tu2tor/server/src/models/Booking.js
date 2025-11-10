import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 60 // Duration in minutes
  },
  cost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  hasReview: {
    type: Boolean,
    default: false
  },

  // Session fields
  sessionType: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  meetingRoomId: {
    type: String,
    // Auto-generate meeting room ID when booking is created
    default: function() {
      return `tu2tor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  actualDuration: {
    type: Number // in minutes
  },
  sessionNotes: {
    type: String,
    maxlength: 2000
  }
}, {
  timestamps: true
});

// Indexes for queries
bookingSchema.index({ studentId: 1, status: 1 });
bookingSchema.index({ tutorId: 1, status: 1 });
bookingSchema.index({ date: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
