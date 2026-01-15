import mongoose from 'mongoose';
import KnowledgeBase from '../models/KnowledgeBase.js';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import openai from '../config/openai.js';
import aiService from '../ai/services/AIService.js';

/**
 * 简单关键词提取（中英文混合）
 */
function extractKeywords(text = '') {
  const matches = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
  // 去重并限制数量，防止搜索过长
  const seen = new Set();
  const keywords = [];
  for (const m of matches) {
    const lower = m.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      keywords.push(m);
    }
    if (keywords.length >= 8) break;
  }
  return keywords;
}

/**
 * 判断段落是否相关：匹配到至少2个关键词（或全部关键词较少时匹配50%）
 */
function isRelevant(content = '', keywords = []) {
  if (!content || keywords.length === 0) return false;
  const lower = content.toLowerCase();
  const hits = keywords.filter(kw => lower.includes(kw.toLowerCase()));
  if (keywords.length <= 2) {
    return hits.length >= 1; // 关键词很少时，匹配1个即可
  }
  return hits.length >= 2 || hits.length / keywords.length >= 0.5;
}

/**
 * 基于 MongoDB 全文搜索获取相关段落
 */
async function findRelevantChunks({ question, subjectId, documentIds = [], topDocs = 3, maxChunks = 5 }) {
  const keywords = extractKeywords(question);
  
  console.log('[RAG Service] ========== SEARCHING CHUNKS ==========');
  console.log('[RAG Service] Question:', question);
  console.log('[RAG Service] Keywords:', keywords);
  console.log('[RAG Service] DocumentIds:', documentIds);
  console.log('[RAG Service] SubjectId:', subjectId);
  
  const query = {
    'processingStatus.status': 'completed' // 只搜索已完成处理的文档
  };

  // 如果指定了文档ID，只搜索这些文档
  if (documentIds.length > 0) {
    // 转换字符串 ID 为 ObjectId
    const objectIds = documentIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (e) {
        console.error(`[RAG Service] Invalid ObjectId: ${id}`, e);
        return null;
      }
    }).filter(Boolean);
    
    query._id = { $in: objectIds };
    console.log('[RAG Service] Filtering by document IDs (converted to ObjectIds):', objectIds);
  }

  // 如果有学科ID，也过滤
  if (subjectId) {
    query.subjectId = subjectId;
  }

  // 添加全文搜索条件
  // 注意：如果已经指定了 documentIds，就不使用全文搜索（用户已明确选择文档）
  if (keywords.length > 0 && documentIds.length === 0) {
    query.$text = { $search: keywords.join(' ') };
  }

  console.log('[RAG Service] MongoDB Query:', JSON.stringify(query, null, 2));

  // 先测试：直接用 ObjectId 查找，不加任何其他条件
  if (documentIds.length > 0) {
    const objectIds = documentIds.map(id => new mongoose.Types.ObjectId(id));
    const testDoc = await KnowledgeBase.findById(objectIds[0]).lean();
    console.log('[RAG Service] 🧪 TEST: Direct findById result:', {
      found: !!testDoc,
      id: testDoc?._id,
      title: testDoc?.title,
      status: testDoc?.processingStatus?.status,
      hasExtractedContent: !!testDoc?.extractedContent,
      pageCount: testDoc?.extractedContent?.pageTexts?.length || 0
    });
  }

  // 搜索相关文档
  const hasTextSearch = keywords.length > 0 && documentIds.length === 0;
  
  // 构建 projection（不能包含 undefined 值）
  const projection = {
    title: 1,
    extractedContent: 1,
    metadata: 1,
    subjectId: 1
  };
  if (hasTextSearch) {
    projection.score = { $meta: 'textScore' };
  }
  
  const docs = await KnowledgeBase.find(query, projection)
    .sort(hasTextSearch ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
    .limit(topDocs)
    .lean();

  console.log('[RAG Service] Documents found:', docs.length);
  if (docs.length > 0) {
    console.log('[RAG Service] Document titles:', docs.map(d => d.title));
  }

  const chunks = [];

  for (const doc of docs) {
    const pages = doc.extractedContent?.pageTexts || [];
    console.log(`[RAG Service] Processing doc "${doc.title}" with ${pages.length} pages`);
    
    // 如果用户已选择特定文档，返回所有页面（不做关键词过滤）
    // 否则只返回与关键词相关的页面
    const skipRelevanceCheck = documentIds.length > 0;
    
    for (const page of pages) {
      if (chunks.length >= maxChunks) break;
      
      const content = page.content || '';
      const hasContent = content.trim().length > 50; // 至少有实质内容
      const relevant = skipRelevanceCheck || keywords.length === 0 || isRelevant(content, keywords);
      
      if (relevant && content.trim().length > 50) { // 至少有实质内容
        chunks.push({
          documentId: doc._id,
          title: doc.title,
          pageNumber: page.pageNumber,
          content: content.slice(0, 1500) // 增加到 1500 字符
        });
        console.log(`[RAG Service] Added chunk from "${doc.title}" page ${page.pageNumber}`);
      }
    }
    if (chunks.length >= maxChunks) break;
  }

  console.log('[RAG Service] Total chunks extracted:', chunks.length);
  console.log('[RAG Service] ==========================================');

  return {
    chunks,
    keywords,
    documentsFound: docs.length,
    searchMethod: 'keyword' // 标注：使用关键词搜索（降级方案）
  };
}

/**
 * 基于向量搜索获取相关段落（新版本）
 */
async function findRelevantChunksWithVectorSearch({ question, subjectId, documentIds = [], topK = 5 }) {
  console.log('[RAG Service] ========== VECTOR SEARCH ==========');
  console.log('[RAG Service] Question:', question);
  console.log('[RAG Service] DocumentIds:', documentIds);
  console.log('[RAG Service] SubjectId:', subjectId);

  try {
    // 1. 将问题转换为向量
    console.log('[RAG Service] Generating embedding for question...');
    const queryResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });
    const queryVector = queryResponse.data[0].embedding;
    console.log('[RAG Service] Embedding generated, dimensions:', queryVector.length);

    // 2. 构建聚合管道
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index', // 使用在 MongoDB Atlas 中创建的索引名称
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 100,
          limit: topK,
        }
      },
      {
        $project: {
          _id: 1,
          knowledgeBaseId: 1,
          content: 1,
          'metadata.pageNumber': 1,
          'metadata.chunkIndex': 1,
          'metadata.tokenCount': 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    // 3. 如果指定了文档ID，添加过滤条件
    if (documentIds.length > 0) {
      const objectIds = documentIds.map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (e) {
          console.error(`[RAG Service] Invalid ObjectId: ${id}`, e);
          return null;
        }
      }).filter(Boolean);

      console.log('[RAG Service] Filtering by document IDs:', objectIds);

      // 在 $vectorSearch 之后添加 $match 阶段
      pipeline.splice(1, 0, {
        $match: {
          knowledgeBaseId: { $in: objectIds }
        }
      });
    }

    console.log('[RAG Service] Executing vector search pipeline...');

    // 4. 执行查询
    const chunks = await KnowledgeChunk.aggregate(pipeline);

    console.log('[RAG Service] Vector search results:', chunks.length, 'chunks found');

    // 5. 过滤低分结果并获取文档标题
    const relevantChunks = [];
    const documentTitles = new Map();

    for (const chunk of chunks) {
      // 只返回相似度分数 > 0.6 的结果（降低阈值以支持跨语言搜索）
      if (chunk.score > 0.6) {
        // 获取文档标题（如果还没有缓存）
        if (!documentTitles.has(chunk.knowledgeBaseId.toString())) {
          const kb = await KnowledgeBase.findById(chunk.knowledgeBaseId).select('title').lean();
          if (kb) {
            documentTitles.set(chunk.knowledgeBaseId.toString(), kb.title);
          }
        }

        relevantChunks.push({
          documentId: chunk.knowledgeBaseId,
          title: documentTitles.get(chunk.knowledgeBaseId.toString()) || 'Unknown Document',
          pageNumber: chunk.metadata?.pageNumber || chunk.metadata?.chunkIndex || 0,
          content: chunk.content,
          score: chunk.score
        });

        console.log(`[RAG Service] Added chunk with score ${chunk.score.toFixed(3)}`);
      }
    }

    console.log('[RAG Service] Filtered chunks (score > 0.6):', relevantChunks.length);
    console.log('[RAG Service] ==========================================');

    return {
      chunks: relevantChunks,
      keywords: [], // 向量搜索不需要关键词
      documentsFound: documentTitles.size,
      searchMethod: 'vector' // 标注：使用向量搜索
    };

  } catch (error) {
    console.error('[RAG Service] Vector search failed:', error);
    console.error('[RAG Service] Error details:', error.message);

    // ⚠️ 降级方案：使用旧的关键词搜索
    console.warn('[RAG Service] ⚠️  FALLBACK: Switching to keyword search due to vector search failure');
    return await findRelevantChunks({
      question,
      subjectId,
      documentIds,
      topDocs: 3,
      maxChunks: topK
    });
  }
}

/**
 * 构建 RAG Prompt
 */
function buildPrompt(question, chunks) {
  if (!chunks.length) {
    return `Student Question: ${question}

No relevant materials found in the knowledge base. Please inform the student that you cannot answer based on the uploaded materials and provide brief suggestions.`;
  }

  const context = chunks
    .map((c, idx) => `[Source ${idx + 1}] "${c.title}" - Page ${c.pageNumber}:\n${c.content}`)
    .join('\n\n---\n\n');

  return `You are a helpful AI teaching assistant. The student has selected some learning materials and wants to discuss them with you.

📚 **Available Materials**:
${context}

❓ **Student's Message**: ${question}

💡 **Your Task**:
1. **Understand the student's intent**: 
   - If they ask to "read", "summarize", or "tell me about" the document, provide an overview of the key content
   - If they ask a specific question, find and explain the relevant information
   - If they want clarification, explain the concepts clearly

2. **Always use the materials provided above** to inform your response

3. **Cite your sources**: Always reference [Source X, Page Y] when you mention specific information

4. **Be conversational and helpful**: Don't say "not mentioned" unless the student asks something truly unrelated. Use the available content creatively to help them understand.

Now, respond to the student naturally and helpfully:`;
}

/**
 * 对外暴露的 RAG 查询
 */
export async function queryWithRAG({ question, subjectId, documentIds = [] }) {
  console.log('[RAG Service] ========== QUERY WITH RAG ==========');
  console.log('[RAG Service] Question:', question);
  console.log('[RAG Service] DocumentIds:', documentIds);

  // 使用新的向量搜索
  const searchResult = await findRelevantChunksWithVectorSearch({
    question,
    subjectId,
    documentIds,
    topK: documentIds.length > 0 ? 10 : 5 // 用户选择文档时，返回更多 chunks
  });

  console.log('[RAG Service] Search result:', {
    keywords: searchResult.keywords,
    documentsFound: searchResult.documentsFound,
    chunksFound: searchResult.chunks.length
  });

  if (searchResult.chunks.length === 0) {
    console.log('[RAG Service] WARNING: NO CHUNKS FOUND! Returning fallback message.');
  }

  const prompt = buildPrompt(question, searchResult.chunks);
  
  console.log('[RAG Service] Prompt length:', prompt.length, 'chars');
  console.log('[RAG Service] Calling AI service...');

  const aiResult = await aiService.generateContent(prompt, {
    temperature: 0.3
  });

  console.log('[RAG Service] AI response received:', {
    contentLength: aiResult.content?.length || 0,
    hasContent: !!aiResult.content
  });

  const result = {
    answer: aiResult.content || '',
    sources: searchResult.chunks.map(c => ({
      documentId: c.documentId,
      title: c.title,
      pageNumber: c.pageNumber
    })),
    usage: {
      tokens: aiResult.tokens || 0,
      cost: aiResult.cost || 0
    },
    meta: {
      keywords: searchResult.keywords,
      documentsFound: searchResult.documentsFound,
      chunksFound: searchResult.chunks.length,
      searchMethod: searchResult.searchMethod // 标注：vector 或 keyword
    }
  };

  console.log('[RAG Service] Final result:', {
    answerLength: result.answer.length,
    sourcesCount: result.sources.length,
    meta: result.meta
  });
  console.log('[RAG Service] ==========================================');

  return result;
}

export default {
  queryWithRAG
};

