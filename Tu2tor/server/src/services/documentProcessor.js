import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';
import KnowledgeBase from '../models/KnowledgeBase.js';

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
}

export default DocumentProcessor;

