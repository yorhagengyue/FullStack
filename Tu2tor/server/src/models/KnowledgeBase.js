import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema({
  // 基本信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subjectId: {
    type: String, // 前端使用的科目ID（来自 mockSubjects 或实际科目ID）
    required: true,
    index: true
  },
  
  // 文档信息
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['pdf', 'pptx', 'docx', 'image'],
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // 提取的文本内容
  extractedContent: {
    fullText: {
      type: String,
      default: ''
    },
    pageTexts: [{
      pageNumber: Number,
      content: String,
      images: [{
        url: String,
        ocrText: String,
        confidence: Number
      }]
    }],
    wordCount: {
      type: Number,
      default: 0
    },
    language: {
      type: String,
      enum: ['zh', 'en', 'mixed', 'none'],
      default: 'none'
    }
  },
  
  // 文档元数据
  metadata: {
    pageCount: {
      type: Number,
      default: 0
    },
    author: String,
    createdDate: Date,
    modifiedDate: Date
  },
  
  // 处理状态
  processingStatus: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentStep: {
      type: String,
      enum: ['uploading', 'extracting', 'ocr', 'saving', 'completed', 'failed'],
      default: 'uploading'
    },
    message: {
      type: String,
      default: ''
    },
    startedAt: Date,
    completedAt: Date,
    error: String
  },
  
  // 使用统计
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    lastAccessedAt: Date
  },
  
  // 访问控制
  visibility: {
    type: String,
    enum: ['private', 'subject', 'public'],
    default: 'private'
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // 标签
  tags: [{
    type: String,
    trim: true
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 创建文本索引用于搜索
knowledgeBaseSchema.index({
  title: 'text',
  description: 'text',
  'extractedContent.fullText': 'text'
});

// 复合索引
knowledgeBaseSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });
knowledgeBaseSchema.index({ subjectId: 1, visibility: 1 });

// 实例方法：更新处理状态
knowledgeBaseSchema.methods.updateProcessingStatus = function(status, progress, currentStep, message = '', error = '') {
  this.processingStatus.status = status;
  this.processingStatus.progress = progress;
  if (currentStep) this.processingStatus.currentStep = currentStep;
  if (message) this.processingStatus.message = message;
  if (error) this.processingStatus.error = error;
  
  if (status === 'processing' && !this.processingStatus.startedAt) {
    this.processingStatus.startedAt = new Date();
  }
  
  if (status === 'completed' || status === 'failed') {
    this.processingStatus.completedAt = new Date();
  }
  
  return this.save();
};

// 实例方法：增加查看次数
knowledgeBaseSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  this.stats.lastAccessedAt = new Date();
  return this.save();
};

// 实例方法：检查用户访问权限
knowledgeBaseSchema.methods.canAccess = function(userId) {
  // 验证 userId 参数
  if (!userId) return false;

  // 所有者
  if (this.userId && this.userId.equals(userId)) return true;

  // 公开文档
  if (this.visibility === 'public') return true;

  // 明确共享
  if (this.sharedWith && Array.isArray(this.sharedWith)) {
    if (this.sharedWith.some(id => id && id.equals && id.equals(userId))) return true;
  }

  // 科目内文档需要在 controller 层检查用户是否选修该科目
  return false;
};

// 静态方法：获取科目统计信息
knowledgeBaseSchema.statics.getSubjectStats = async function(subjectId) {
  const stats = await this.aggregate([
    {
      $match: {
        subjectId: mongoose.Types.ObjectId(subjectId),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        documentCount: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        byType: {
          $push: {
            type: '$type',
            count: 1
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    documentCount: 0,
    totalSize: 0,
    byType: []
  };
};

const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

export default KnowledgeBase;

