import express from 'express';
import { protect } from '../middleware/auth.js';
import { queryRAG } from '../controllers/ragController.js';

const router = express.Router();

// 所有 RAG 路由均需认证
router.use(protect);

// RAG 问答
router.post('/query', queryRAG);

export default router;

