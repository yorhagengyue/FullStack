import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema({
  knowledgeBaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase',
    required: true,
    index: true
  },

  content: {
    type: String,
    required: true
  },

  embedding: {
    type: [Number],
    required: true
  },

  // 元数据
  metadata: {
    pageNumber: {
      type: Number
    },
    chunkIndex: {
      type: Number,
      required: true
    },
    tokenCount: {
      type: Number,
      required: true
    },
    charCount: {
      type: Number,
      required: true
    },
    chunkType: {
      type: String,
      enum: ['paragraph', 'section', 'semantic'],
      default: 'semantic'
    },
    summary: {
      type: String
    }
  },

  // 质量指标
  semanticScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0
  }
}, {
  timestamps: true
});

// 创建索引
knowledgeChunkSchema.index({ knowledgeBaseId: 1, 'metadata.chunkIndex': 1 });
knowledgeChunkSchema.index({ 'metadata.tokenCount': 1 });
knowledgeChunkSchema.index({ 'metadata.chunkType': 1 });
knowledgeChunkSchema.index({ semanticScore: 1 });

const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);

export default KnowledgeChunk;
