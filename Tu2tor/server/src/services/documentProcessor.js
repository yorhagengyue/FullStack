import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import KnowledgeChunk from '../models/KnowledgeChunk.js';
import openai from '../config/openai.js';
import { encoding_for_model } from 'tiktoken';
import crypto from 'crypto';

// CommonJS modules - use dynamic import
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mammoth = require('mammoth');
const officeParser = require('officeparser');

/**
 * 文档处理服务
 */
class DocumentProcessor {
  static queue = [];
  static activeCount = 0;
  static MAX_CONCURRENT = parseInt(process.env.KB_MAX_CONCURRENT || '2', 10);

  // 初始化 tiktoken encoder
  static encoder = encoding_for_model('gpt-4o');

  // 分块缓存
  static chunkCache = new Map();

  /**
   * 计算内容哈希（用于缓存键）
   */
  static getContentHash(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Token 计数方法
   */
  static countTokens(text) {
    try {
      const tokens = this.encoder.encode(text);
      return tokens.length;
    } catch (error) {
      console.error('[Token Count Error]', error);
      // 降级方案：粗略估算（1 token ≈ 4 字符）
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * 清理资源
   */
  static cleanup() {
    if (this.encoder) {
      this.encoder.free();
    }
  }

  /**
   * AI 智能分块
   */
  static async aiChunkText(text, options = {}) {
    const {
      minTokens = 300,      // 最小 Token 数
      maxTokens = 600,      // 最大 Token 数
      targetTokens = 450,   // 目标 Token 数
    } = options;

    console.log('[AI Chunking] Starting...', {
      textLength: text.length,
      estimatedTokens: this.countTokens(text)
    });

    try {
      // 构建 AI 分块 Prompt
      const prompt = `你是一个专业的文本处理专家。请将以下文本分割成多个语义连贯的块。

要求：
1. 每个块应该围绕一个核心主题或概念
2. 每个块的 Token 数量应在 ${minTokens} 到 ${maxTokens} 之间，目标为 ${targetTokens} tokens
3. 保持语义完整性，不要在句子中间切断
4. 如果遇到标题、列表、代码块等结构化内容，尽量保持完整
5. 返回 JSON 数组格式：[{"content": "块1内容", "summary": "块1摘要"}, ...]

文本内容：
${text}

请直接返回 JSON 数组，不要添加任何其他说明。`;

      // 调用 GPT-4o-mini 进行分块
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是一个文本分块专家，擅长将长文本分割成语义连贯的块。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      // 解析响应
      const result = JSON.parse(response.choices[0].message.content);
      const chunks = result.chunks || result;

      console.log('[AI Chunking] Success:', {
        chunksCount: chunks.length,
        avgTokens: chunks.reduce((sum, c) => sum + this.countTokens(c.content), 0) / chunks.length
      });

      return chunks;

    } catch (error) {
      console.error('[AI Chunking] Failed:', error);
      // 降级方案：使用简单的段落分割
      return this.fallbackChunking(text, targetTokens);
    }
  }

  /**
   * AI 智能分块（带缓存）
   */
  static async aiChunkTextWithCache(text, options = {}) {
    const hash = this.getContentHash(text);

    // 检查缓存
    if (this.chunkCache.has(hash)) {
      console.log('[AI Chunking] Cache hit! Skipping AI call.');
      return this.chunkCache.get(hash);
    }

    console.log('[AI Chunking] Cache miss. Calling AI...');

    // 调用 AI 分块
    const chunks = await this.aiChunkText(text, options);

    // 存入缓存
    this.chunkCache.set(hash, chunks);
    console.log('[AI Chunking] Result cached. Cache size:', this.chunkCache.size);

    return chunks;
  }

  /**
   * 成本追踪
   */
  static trackChunkingCost(text, chunksCount) {
    const estimatedInputTokens = this.countTokens(text);
    const estimatedCost = (estimatedInputTokens / 1000000) * 0.15; // GPT-4o-mini 价格

    console.log('[Cost Tracking]', {
      inputTokens: estimatedInputTokens,
      outputChunks: chunksCount,
      estimatedCost: `$${estimatedCost.toFixed(4)}`
    });

    return {
      inputTokens: estimatedInputTokens,
      outputChunks: chunksCount,
      estimatedCost
    };
  }

  /**
   * 降级分块方案
   */
  static fallbackChunking(text, targetTokens = 450) {
    const paragraphs = text.split(/\n\n+/);
    const chunks = [];
    let currentChunk = '';
    let currentTokens = 0;

    for (const para of paragraphs) {
      const paraTokens = this.countTokens(para);

      if (currentTokens + paraTokens > targetTokens * 1.2 && currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          summary: null
        });
        currentChunk = para;
        currentTokens = paraTokens;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
        currentTokens += paraTokens;
      }
    }

    if (currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        summary: null
      });
    }

    return chunks;
  }

  /**
   * 入队处理，带并发控制
   */
  static enqueue(knowledgeBaseId) {
    this.queue.push(knowledgeBaseId);
    this.runQueue();
  }

  static runQueue() {
    if (this.activeCount >= this.MAX_CONCURRENT) return;
    const next = this.queue.shift();
    if (!next) return;

    this.activeCount += 1;
    this.processDocument(next)
      .catch((err) => {
        console.error('[DocProcessor] Queue item failed:', err);
      })
      .finally(() => {
        this.activeCount -= 1;
        // 轻量延迟，避免饥饿
        setImmediate(() => this.runQueue());
      });
  }
  
  /**
   * 处理上传的文档
   */
  static async processDocument(knowledgeBaseId) {
    try {
      const kb = await KnowledgeBase.findById(knowledgeBaseId);
      if (!kb) {
        throw new Error('Knowledge base document not found');
      }
      
      console.log(`[DocProcessor] Starting processing: ${kb._id} (${kb.type})`);
      
      // 更新状态：开始处理
      await kb.updateProcessingStatus('processing', 10, 'extracting', 'Extracting text from document...');
      
      // 根据文件类型提取文本
      let extractedContent;
      
      switch (kb.type) {
        case 'pdf':
          extractedContent = await this.extractPdfText(kb.fileUrl);
          break;
        case 'pptx':
          extractedContent = await this.extractPptxText(kb.fileUrl);
          break;
        case 'docx':
          extractedContent = await this.extractDocxText(kb.fileUrl);
          break;
        case 'image':
          extractedContent = await this.extractImageText(kb.fileUrl);
          break;
        default:
          throw new Error(`Unsupported file type: ${kb.type}`);
      }
      
      await kb.updateProcessingStatus('processing', 60, 'ocr', 'Processing images with OCR...');
      
      // OCR 处理图片（如果有）
      if (extractedContent.pageTexts) {
        for (let i = 0; i < extractedContent.pageTexts.length; i++) {
          const page = extractedContent.pageTexts[i];
          if (page.images && page.images.length > 0) {
            for (let j = 0; j < page.images.length; j++) {
              const img = page.images[j];
              if (img.needsOcr) {
                try {
                  const ocrResult = await this.performOCR(img.url);
                  img.ocrText = ocrResult.text;
                  img.confidence = ocrResult.confidence;
                } catch (error) {
                  console.error(`[DocProcessor] OCR failed for image ${img.url}:`, error.message);
                  img.ocrText = '';
                  img.confidence = 0;
                }
              }
            }
            
            // 更新进度
            const ocrProgress = 60 + ((i + 1) / extractedContent.pageTexts.length) * 20;
            await kb.updateProcessingStatus('processing', Math.round(ocrProgress), 'ocr');
          }
        }
      }
      
      await kb.updateProcessingStatus('processing', 90, 'saving', 'Saving extracted content...');
      
      // 计算统计信息
      const fullTextParts = [extractedContent.fullText || ''];
      if (extractedContent.pageTexts) {
        fullTextParts.push(...extractedContent.pageTexts.map(p => p.content || ''));
        extractedContent.pageTexts.forEach(page => {
          if (page.images) {
            fullTextParts.push(...page.images.map(img => img.ocrText || '').filter(Boolean));
          }
        });
      }
      
      const fullText = fullTextParts.join(' ').trim();
      const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;
      const language = this.detectLanguage(fullText);
      
      // 保存提取的内容
      kb.extractedContent = {
        ...extractedContent,
        fullText,
        wordCount,
        language
      };

      // ========== 向量 RAG 处理 ==========
      console.log('[Document Processing] Starting vector RAG processing...');
      console.log('[Document Processing] Full text length:', fullText.length);
      console.log('[Document Processing] Estimated tokens:', this.countTokens(fullText));

      // 1. 整合所有文本
      const fullTextForChunking = extractedContent.pageTexts
        ? extractedContent.pageTexts.map(p => p.content).join('\n\n')
        : fullText;

      // 2. AI 智能分块（使用缓存版本）
      const aiChunks = await this.aiChunkTextWithCache(fullTextForChunking, {
        minTokens: 300,
        maxTokens: 600,
        targetTokens: 450
      });

      console.log('[Document Processing] AI chunking complete:', aiChunks.length, 'chunks');

      // 追踪 AI 分块成本
      this.trackChunkingCost(fullTextForChunking, aiChunks.length);

      // 3. 批量生成嵌入（分批处理，避免超过 API 限制）
      const BATCH_SIZE = 100;
      const chunksToInsert = [];

      for (let i = 0; i < aiChunks.length; i += BATCH_SIZE) {
        const batch = aiChunks.slice(i, i + BATCH_SIZE);
        const batchContents = batch.map(c => c.content);

        console.log(`[Document Processing] Generating embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batchContents,
        });

        // 4. 构建要插入的文档
        batch.forEach((chunk, batchIndex) => {
          const globalIndex = i + batchIndex;
          const tokenCount = this.countTokens(chunk.content);

          chunksToInsert.push({
            knowledgeBaseId: kb._id,
            content: chunk.content,
            embedding: embeddingResponse.data[batchIndex].embedding,
            metadata: {
              chunkIndex: globalIndex,
              tokenCount: tokenCount,
              charCount: chunk.content.length,
              chunkType: 'semantic',
              summary: chunk.summary || null,
            },
            semanticScore: 1.0, // AI 分块默认高质量
          });
        });
      }

      // 5. 批量插入到新集合
      if (chunksToInsert.length > 0) {
        await KnowledgeChunk.insertMany(chunksToInsert);
        console.log('[Document Processing] Inserted', chunksToInsert.length, 'chunks to database');
      }

      // 6. 清理旧的 extractedContent（节省存储空间）
      kb.extractedContent = {
        pageCount: extractedContent.pageCount || extractedContent.metadata?.pageCount || 0,
        totalChunks: chunksToInsert.length,
        avgTokensPerChunk: chunksToInsert.length > 0
          ? chunksToInsert.reduce((sum, c) => sum + c.metadata.tokenCount, 0) / chunksToInsert.length
          : 0,
      };
      await kb.save();

      console.log('[Document Processing] Vector RAG processing completed');

      await kb.updateProcessingStatus('completed', 100, 'completed', 'Processing completed successfully');
      
      console.log(`[DocProcessor] Processing completed: ${kb._id} (${wordCount} words, ${language})`);
      
      return kb;
      
    } catch (error) {
      console.error(`[DocProcessor] Processing failed for ${knowledgeBaseId}:`);
      console.error(`[DocProcessor] Error name: ${error.name}`);
      console.error(`[DocProcessor] Error message: ${error.message}`);
      console.error(`[DocProcessor] Error stack:`, error.stack);
      
      const kb = await KnowledgeBase.findById(knowledgeBaseId);
      if (kb) {
        const errorDetail = `${error.name}: ${error.message}`;
        await kb.updateProcessingStatus('failed', 0, 'failed', 'Processing failed', errorDetail);
      }
      
      throw error;
    }
  }
  
  /**
   * 提取 PDF 文本
   */
  static async extractPdfText(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      
      // 使用 PDFParse 类
      const parser = new PDFParse({ data: dataBuffer });
      const textResult = await parser.getText();
      const infoResult = await parser.getInfo();
      
      // 清理资源
      await parser.destroy();
      
      return {
        fullText: textResult.text,
        pageTexts: textResult.pages.map((page) => ({
          pageNumber: page.num,
          content: page.text.trim(),
          images: []
        })),
        metadata: {
          pageCount: textResult.total,
          author: infoResult.info?.Author,
          createdDate: infoResult.info?.CreationDate ? new Date(infoResult.info.CreationDate) : null,
          modifiedDate: infoResult.info?.ModDate ? new Date(infoResult.info.ModDate) : null
        }
      };
    } catch (error) {
      console.error('[DocProcessor] PDF extraction error:', error);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }
  
  /**
   * 提取 PPTX 文本
   */
  static async extractPptxText(filePath) {
    try {
      const text = await officeParser.parseOfficeAsync(filePath);
      
      // 按双换行分割幻灯片
      const slides = text.split('\n\n\n').filter(s => s.trim());
      
      // 如果没有三个换行符，尝试用双换行分割
      const pages = slides.length > 1 ? slides : text.split('\n\n').filter(s => s.trim());
      
      return {
        fullText: text,
        pageTexts: pages.map((content, index) => ({
          pageNumber: index + 1,
          content: content.trim(),
          images: []
        })),
        metadata: {
          pageCount: pages.length
        }
      };
    } catch (error) {
      console.error('[DocProcessor] PPTX extraction error:', error);
      throw new Error(`Failed to extract PPTX text: ${error.message}`);
    }
  }
  
  /**
   * 提取 DOCX 文本
   */
  static async extractDocxText(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;
      
      // 按段落分割（保留空行）
      const paragraphs = text.split('\n').filter(p => p.trim());
      
      return {
        fullText: text,
        pageTexts: paragraphs.map((content, index) => ({
          pageNumber: index + 1,
          content: content.trim(),
          images: []
        })),
        metadata: {
          pageCount: paragraphs.length
        }
      };
    } catch (error) {
      console.error('[DocProcessor] DOCX extraction error:', error);
      throw new Error(`Failed to extract DOCX text: ${error.message}`);
    }
  }
  
  /**
   * 提取图片文本（OCR）
   */
  static async extractImageText(filePath) {
    try {
      const result = await this.performOCR(filePath);
      
      return {
        fullText: result.text,
        pageTexts: [{
          pageNumber: 1,
          content: result.text,
          images: [{
            url: filePath,
            ocrText: result.text,
            confidence: result.confidence
          }]
        }],
        metadata: {
          pageCount: 1
        }
      };
    } catch (error) {
      console.error('[DocProcessor] Image OCR error:', error);
      throw new Error(`Failed to extract image text: ${error.message}`);
    }
  }
  
  /**
   * 执行 OCR
   */
  static async performOCR(imagePath) {
    try {
      console.log(`[DocProcessor] Performing OCR on: ${imagePath}`);
      
      const result = await Tesseract.recognize(
        imagePath,
        'chi_sim+eng', // 支持中英文
        {
          logger: info => {
            if (info.status === 'recognizing text') {
              console.log(`[OCR] Progress: ${Math.round(info.progress * 100)}%`);
            }
          }
        }
      );
      
      return {
        text: result.data.text,
        confidence: result.data.confidence
      };
    } catch (error) {
      console.error('[DocProcessor] OCR error:', error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  }
  
  /**
   * 检测语言
   */
  static detectLanguage(text) {
    if (!text || text.trim().length === 0) {
      return 'none';
    }
    
    // 统计中文字符
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    // 统计英文单词
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    
    const totalChars = text.length;
    const chineseRatio = chineseChars / totalChars;
    const englishRatio = englishWords * 5 / totalChars; // 假设平均单词长度为 5
    
    if (chineseRatio > 0.3) {
      if (englishRatio > 0.2) {
        return 'mixed';
      }
      return 'zh';
    }
    
    if (englishRatio > 0.3) {
      return 'en';
    }
    
    return 'none';
  }

  /**
   * 并行处理多个文档
   */
  static async processMultipleDocuments(documentIds) {
    console.log(`[DocProcessor] Starting batch processing for ${documentIds.length} documents...`);

    const results = await Promise.allSettled(
      documentIds.map(id => this.processDocument(id))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`[Batch Processing] Completed: Success: ${successful}, Failed: ${failed}`);

    return {
      total: documentIds.length,
      successful,
      failed,
      results
    };
  }
}

export default DocumentProcessor;

