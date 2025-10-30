import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subjects: [{
    code: String,
    name: String,
    grade: String
  }],
  hourlyRate: {
    type: Number,
    default: 10,
    min: 1
  },
  preferredLocations: [{
    type: String
  }],
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  availableSlotsDisplay: [{
    type: String
  }],
  totalSessions: {
    type: Number,
    default: 0
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: Number,
    default: 120 // Average response time in minutes
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  bio: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for searching
tutorSchema.index({ 'subjects.code': 1 });
tutorSchema.index({ averageRating: -1 });
tutorSchema.index({ hourlyRate: 1 });

const Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;
