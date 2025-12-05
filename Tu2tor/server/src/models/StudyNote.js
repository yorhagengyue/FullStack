import mongoose from 'mongoose';

const studyNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  conversationId: {
    type: String,
    index: true
  },
  metadata: {
    questionCount: { type: Number, default: 0 },
    codeBlocks: { type: Number, default: 0 },
    hasImages: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for efficient queries
studyNoteSchema.index({ userId: 1, subject: 1 });
studyNoteSchema.index({ userId: 1, createdAt: -1 });
studyNoteSchema.index({ userId: 1, tags: 1 });

const StudyNote = mongoose.model('StudyNote', studyNoteSchema);

export default StudyNote;

