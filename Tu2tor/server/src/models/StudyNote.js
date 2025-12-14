import mongoose from 'mongoose';

const studyNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // 可选：与知识库一致的科目 ID（字符串）
  subjectId: {
    type: String,
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
  summary: {
    type: String,
    default: '',
    trim: true,
    maxlength: 500
  },
  highlights: [{
    type: String,
    trim: true,
    maxlength: 300
  }],
  // 知识库引用
  sources: [{
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeBase',
      index: true
    },
    title: String,
    pages: [Number]
  }],
  tags: [{
    type: String,
    trim: true
  }],
  conversationId: {
    type: String,
    index: true
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  // AI Restructured Content
  restructured: {
    enabled: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    intensity: { 
      type: String, 
      enum: ['light', 'medium', 'deep'],
      default: 'medium'
    },
    mainConcepts: [String],
    difficulty: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    estimatedReadTime: { type: Number, default: 5 },
    prerequisites: [String],
    structure: {
      introduction: String,
      sections: [{
        concept: String,
        definition: String,
        importance: String,
        usage: String,
        examples: [String],
        caveats: [String],
        related: [String]
      }],
      summary: String,
      practiceExercises: [String]
    },
    analysis: {
      mainTopic: String,
      learningObjectives: [String],
      knowledgeHierarchy: {
        parent: String,
        children: [String],
        related: [String]
      }
    },
    lastRestructured: Date
  },
  // Original conversation (for re-restructuring)
  originalMessages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'] },
    content: String,
    timestamp: Date
  }],
  metadata: {
    questionCount: { type: Number, default: 0 },
    codeBlocks: { type: Number, default: 0 },
    hasImages: { type: Boolean, default: false },
    lastSyncedAt: Date,
    isRestructured: { type: Boolean, default: false },
    restructureIntensity: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
studyNoteSchema.index({ userId: 1, subject: 1 });
studyNoteSchema.index({ userId: 1, subjectId: 1 });
studyNoteSchema.index({ userId: 1, createdAt: -1 });
studyNoteSchema.index({ userId: 1, tags: 1 });
studyNoteSchema.index({ userId: 1, 'sources.docId': 1 });
studyNoteSchema.index({ title: 'text', content: 'text' });

const StudyNote = mongoose.model('StudyNote', studyNoteSchema);

export default StudyNote;

