import KnowledgeBase from '../models/KnowledgeBase.js';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import DocumentProcessor from '../services/documentProcessor.js';
import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromFile } from 'file-type';

/**
 * 上传文档
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    const { title, description, subjectId, tags, visibility } = req.body;
    
    // 验证必填字段
    if (!subjectId) {
      // 删除已上传的文件
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Subject ID is required'
      });
    }
    
    // 文件类型二次校验（魔数）
    const detected = await fileTypeFromFile(req.file.path);
    const allowedMime = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    const candidateMime = detected?.mime || req.file.mimetype;

    if (!candidateMime || !allowedMime.includes(candidateMime)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type',
        message: detected ? `Detected: ${detected.mime}` : `Received: ${req.file.mimetype || 'unknown'}`
      });
    }

    // 确定文件类型（基于检测到的 mime）
    const fileType = getFileType(candidateMime);
    
    // 创建知识库记录
    const kb = await KnowledgeBase.create({
      userId: req.user._id,
      subjectId,
      title: title || req.file.originalname,
      description: description || '',
      type: fileType,
      originalFileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      visibility: visibility || 'private',
      processingStatus: {
        status: 'pending',
        progress: 0,
        startedAt: new Date()
      }
    });
    
    console.log(`[KB Controller] Document uploaded: ${kb._id}`);
    
    // 异步处理文档
    setImmediate(() => {
      DocumentProcessor.enqueue(kb._id);
    });
    
    res.status(201).json({
      success: true,
      knowledgeBase: kb
    });
    
  } catch (error) {
    console.error('[KB Controller] Upload error:', error);
    
    // 清理上传的文件
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('[KB Controller] Failed to delete uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
      message: error.message
    });
  }
};

/**
 * 获取文档列表
 */
export const getDocuments = async (req, res) => {
  try {
    const {
      subjectId,
      type,
      status,
      visibility,
      search,
      page = 1,
      limit = 20
    } = req.query;
    
    // 构建查询条件
    const query = {
      isActive: true,
      $or: [
        { userId: req.user._id }, // 自己的文档
        { visibility: 'public' }, // 公开文档
        { visibility: 'subject' }, // 科目内文档（需要验证用户是否选修）
        { sharedWith: req.user._id } // 共享给自己的
      ]
    };
    
    if (subjectId) query.subjectId = subjectId;
    if (type) query.type = type;
    if (status) query['processingStatus.status'] = status;
    if (visibility) query.visibility = visibility;
    
    // 文本搜索
    if (search) {
      query.$text = { $search: search };
    }
    
    // 分页
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询
    const documents = await KnowledgeBase.find(query)
      .select('-extractedContent.fullText -extractedContent.pageTexts') // 不返回完整文本
      .populate('userId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await KnowledgeBase.countDocuments(query);
    
    res.json({
      success: true,
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('[KB Controller] Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      message: error.message
    });
  }
};

/**
 * 获取单个文档详情
 */
export const getDocument = async (req, res) => {
  try {
    const kb = await KnowledgeBase.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!kb) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // 检查访问权限
    if (!kb.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // 增加查看次数
    await kb.incrementViewCount();
    
    res.json({
      success: true,
      knowledgeBase: kb
    });
    
  } catch (error) {
    console.error('[KB Controller] Get document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document',
      message: error.message
    });
  }
};

/**
 * 获取处理状态
 */
export const getProcessingStatus = async (req, res) => {
  try {
    const kb = await KnowledgeBase.findById(req.params.id)
      .select('processingStatus title type');
    
    if (!kb) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // 检查访问权限
    if (!kb.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      processingStatus: kb.processingStatus
    });
    
  } catch (error) {
    console.error('[KB Controller] Get status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processing status',
      message: error.message
    });
  }
};

/**
 * 获取文档内容
 */
export const getDocumentContent = async (req, res) => {
  try {
    const kb = await KnowledgeBase.findById(req.params.id)
      .select('title type extractedContent processingStatus metadata');
    
    if (!kb) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // 检查访问权限
    if (!kb.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // 检查处理状态
    if (kb.processingStatus.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Document is still being processed',
        processingStatus: kb.processingStatus
      });
    }
    
    // 分页返回 pageTexts，避免大文档一次性返回
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '5', 10);
    const includeFullText = req.query.includeFullText === 'true';

    const pages = kb.extractedContent?.pageTexts || [];
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const slicedPages = pages.slice(start, end);

    res.json({
      success: true,
      content: {
        title: kb.title,
        type: kb.type,
        wordCount: kb.extractedContent?.wordCount || 0,
        language: kb.extractedContent?.language || 'unknown',
        metadata: kb.metadata || {},
        page: {
          page,
          pageSize,
          totalPages: Math.ceil(pages.length / pageSize) || 0,
          totalItems: pages.length
        },
        pageTexts: slicedPages,
        fullText: includeFullText ? kb.extractedContent?.fullText : undefined
      }
    });
    
  } catch (error) {
    console.error('[KB Controller] Get content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document content',
      message: error.message
    });
  }
};

/**
 * 更新文档元数据
 */
export const updateDocument = async (req, res) => {
  try {
    const kb = await KnowledgeBase.findById(req.params.id);
    
    if (!kb) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // 只有所有者可以更新
    if (!kb.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can update this document'
      });
    }
    
    // 允许更新的字段
    const { title, description, tags, visibility } = req.body;
    
    if (title) kb.title = title;
    if (description !== undefined) kb.description = description;
    if (tags) kb.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (visibility) kb.visibility = visibility;
    
    await kb.save();
    
    res.json({
      success: true,
      knowledgeBase: kb
    });
    
  } catch (error) {
    console.error('[KB Controller] Update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document',
      message: error.message
    });
  }
};

/**
 * 删除文档
 */
export const deleteDocument = async (req, res) => {
  try {
    const kb = await KnowledgeBase.findById(req.params.id);
    
    if (!kb) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // 只有所有者可以删除
    if (!kb.userId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can delete this document'
      });
    }
    
    // 软删除
    kb.isActive = false;
    await kb.save();
    
    // 可选：删除文件
    try {
      await fs.unlink(kb.fileUrl);
    } catch (unlinkError) {
      console.error('[KB Controller] Failed to delete file:', unlinkError);
    }
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('[KB Controller] Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
      message: error.message
    });
  }
};

/**
 * 搜索文档
 */
export const searchDocuments = async (req, res) => {
  try {
    const { query, subjectId, page = 1, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const searchQuery = {
      isActive: true,
      $text: { $search: query },
      $or: [
        { userId: req.user._id },
        { visibility: 'public' },
        { visibility: 'subject' },
        { sharedWith: req.user._id }
      ]
    };
    
    if (subjectId) searchQuery.subjectId = subjectId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const documents = await KnowledgeBase.find(searchQuery, {
      score: { $meta: 'textScore' }
    })
      .select('-extractedContent.fullText -extractedContent.pageTexts')
      .populate('userId', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await KnowledgeBase.countDocuments(searchQuery);
    
    res.json({
      success: true,
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('[KB Controller] Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
};

/**
 * 获取科目统计信息
 */
export const getSubjectStats = async (req, res) => {
  try {
    const stats = await KnowledgeBase.getSubjectStats(req.params.subjectId);
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('[KB Controller] Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
};

/**
 * 获取所有标签
 */
export const getTags = async (req, res) => {
  try {
    const tags = await KnowledgeBase.distinct('tags', {
      userId: req.user._id,
      isActive: true
    });
    
    res.json({
      success: true,
      tags
    });
    
  } catch (error) {
    console.error('[KB Controller] Get tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags',
      message: error.message
    });
  }
};

/**
 * 获取文档的所有 chunks（用于可视化）
 */
export const getDocumentChunks = async (req, res) => {
  try {
    const kb = await KnowledgeBase.findById(req.params.id);

    if (!kb) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // 检查访问权限
    if (!kb.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // 检查处理状态
    if (kb.processingStatus.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Document is still being processed',
        processingStatus: kb.processingStatus
      });
    }

    // 获取所有 chunks（不包含 embedding 向量）
    const chunks = await KnowledgeChunk.find({ knowledgeBaseId: kb._id })
      .select('-embedding') // 排除 embedding 字段（太大）
      .sort({ 'metadata.chunkIndex': 1 }) // 按索引排序
      .lean();

    res.json({
      success: true,
      chunks,
      stats: {
        totalChunks: chunks.length,
        avgTokens: chunks.length > 0
          ? chunks.reduce((sum, c) => sum + c.metadata.tokenCount, 0) / chunks.length
          : 0,
        totalTokens: chunks.reduce((sum, c) => sum + c.metadata.tokenCount, 0)
      }
    });

  } catch (error) {
    console.error('[KB Controller] Get chunks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chunks',
      message: error.message
    });
  }
};

// 辅助函数：确定文件类型
function getFileType(mimeType) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('presentation')) return 'pptx';
  if (mimeType.includes('wordprocessing') || mimeType.includes('msword')) return 'docx';
  if (mimeType.startsWith('image/')) return 'image';
  return 'unknown';
}

