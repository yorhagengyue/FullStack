import { queryWithRAG } from '../services/ragService.js';

/**
 * RAG 问答接口
 */
export const queryRAG = async (req, res) => {
  try {
    const { question, subjectId, documentIds } = req.body || {};

    console.log('[RAG Controller] ========== RAG QUERY ==========');
    console.log('[RAG Controller] Question:', question);
    console.log('[RAG Controller] SubjectId:', subjectId);
    console.log('[RAG Controller] DocumentIds:', documentIds);
    console.log('[RAG Controller] DocumentIds type:', typeof documentIds);
    console.log('[RAG Controller] DocumentIds is array:', Array.isArray(documentIds));
    console.log('[RAG Controller] ===============================');

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    // subjectId 可选，但优先使用
    const resolvedSubjectId = subjectId || req.body?.subjectId || req.query?.subjectId;

    const result = await queryWithRAG({
      question,
      subjectId: resolvedSubjectId,
      documentIds: Array.isArray(documentIds) ? documentIds : []
    });

    console.log('[RAG Controller] Result meta:', result.meta);
    console.log('[RAG Controller] Sources count:', result.sources?.length || 0);

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[RAG Controller] Query error:', error);
    return res.status(500).json({
      success: false,
      error: 'RAG query failed',
      message: error.message
    });
  }
};

