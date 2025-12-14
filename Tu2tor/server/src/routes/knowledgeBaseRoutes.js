import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import * as knowledgeBaseController from '../controllers/knowledgeBaseController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/knowledge-base');
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${uniqueSuffix}-${nameWithoutExt}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}. 支持的类型: PDF, PPT, PPTX, DOC, DOCX, JPG, PNG`));
    }
  }
});

// 所有路由都需要认证
router.use(protect);

// 文档管理
router.post('/', upload.single('file'), knowledgeBaseController.uploadDocument);
router.get('/', knowledgeBaseController.getDocuments);
router.get('/search', knowledgeBaseController.searchDocuments);
router.get('/tags', knowledgeBaseController.getTags);
router.get('/:id', knowledgeBaseController.getDocument);
router.put('/:id', knowledgeBaseController.updateDocument);
router.delete('/:id', knowledgeBaseController.deleteDocument);

// 文档内容和状态
router.get('/:id/status', knowledgeBaseController.getProcessingStatus);
router.get('/:id/content', knowledgeBaseController.getDocumentContent);

// 科目相关
router.get('/subject/:subjectId/stats', knowledgeBaseController.getSubjectStats);

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'File size must not exceed 50MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: error.message
    });
  }
  
  if (error.message.includes('不支持的文件类型')) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported file type',
      message: error.message
    });
  }
  
  next(error);
});

export default router;

