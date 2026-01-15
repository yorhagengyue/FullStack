
# Tu2tor 项目：向量 RAG 系统升级计划

这是一个非常棒的决定！将 RAG 系统从关键词搜索升级到向量搜索，将使你的 AI 功能产生质的飞跃。本计划将详细说明每一步的实施细节，确保平滑、高效地完成升级。

---

## 总体目标

将现有的基于关键词匹配的 RAG 系统，升级为基于 **MongoDB Atlas Vector Search** 的语义搜索 RAG 系统。

## 核心技术栈

| 类别 | 技术选型 | 备注 |
| :--- | :--- | :--- |
| **数据库** | MongoDB Atlas | 你现有的数据库，无需更换 |
| **向量搜索** | Atlas Vector Search | MongoDB 内置功能 |
| **嵌入模型** | OpenAI `text-embedding-3-small` | 性价比最高的嵌入模型 |
| **分块策略** | AI 智能语义分块 | 使用 GPT-4o-mini 进行语义分割，基于 Token 计数 |

---

## 实施计划：五大阶段

### 阶段 0：环境准备 (15 分钟)

**目标**：安装必要的依赖，配置环境变量。

1.  **安装 OpenAI 依赖**：
    ```bash
    cd /home/ubuntu/FullStack/Tu2tor/server
    npm install openai
    ```

2.  **配置 OpenAI API Key**：
    -   在 `server/.env` 文件中添加：
        ```
        OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
        ```

3.  **创建 OpenAI 配置文件**：
    -   在 `server/src/config/` 目录下创建 `openai.js`：
        ```javascript
        // server/src/config/openai.js
        import OpenAI from 'openai';
        import dotenv from 'dotenv';

        dotenv.config();

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        export default openai;
        ```

### 阶段 1：数据模型层 (30 分钟)

**目标**：创建用于存储文本块和向量的新数据模型。

1.  **创建 `KnowledgeChunk.js` 模型**：
    -   在 `server/src/models/` 目录下创建 `KnowledgeChunk.js`。
    -   **代码**：
        ```javascript
        import mongoose from 'mongoose';

        const knowledgeChunkSchema = new mongoose.Schema({
          knowledgeBaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeBase', required: true, index: true },
          content: { type: String, required: true },
          embedding: { type: [Number], required: true },

          // 元数据
          metadata: {
            pageNumber: Number,
            chunkIndex: Number,
            tokenCount: Number,        // Token 数量
            charCount: Number,         // 字符数量
            chunkType: String,         // 块类型：'paragraph', 'section', 'semantic'
            summary: String,           // AI 生成的块摘要（可选）
          },

          // 质量指标
          semanticScore: Number,       // 语义完整性评分 (0-1)
        }, { timestamps: true });

        const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
        export default KnowledgeChunk;
        ```

### 阶段 2：文档处理层 (2 小时)

**目标**：修改 `documentProcessor.js`，使用 AI 智能分块和 Token 计数，生成高质量的文本块。

1.  **引入新依赖**：
    -   在 `server/src/services/documentProcessor.js` 顶部引入：
        ```javascript
        import KnowledgeChunk from '../models/KnowledgeChunk.js';
        import openai from '../config/openai.js';
        import { encoding_for_model } from 'tiktoken';
        ```

    -   安装 tiktoken（OpenAI 的 Token 计数库）：
        ```bash
        npm install tiktoken
        ```

2.  **创建 Token 计数工具**：
    -   在 `DocumentProcessor` 类中添加 Token 计数方法：
        ```javascript
        // 初始化 tiktoken encoder（类的顶部）
        static encoder = encoding_for_model('gpt-4o');

        // Token 计数方法
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

        // 清理资源
        static cleanup() {
          if (this.encoder) {
            this.encoder.free();
          }
        }
        ```

3.  **创建 AI 智能分块函数**：
    -   使用 GPT-4o-mini 进行语义分割，基于 Token 限制：
        ```javascript
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

        // 降级分块方案
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
        ```

4.  **修改 `processDocument` 方法**：
    -   找到 `processDocument` 方法的末尾，在 `await kb.updateProcessingStatus('completed', ...)` **之前**，添加新的处理逻辑：
        ```javascript
        // ... 在提取完 extractedContent 之后 ...

        // 1. 整合所有文本
        const fullText = extractedContent.pageTexts.map(p => p.content).join('\n\n');
        console.log('[Document Processing] Full text length:', fullText.length);
        console.log('[Document Processing] Estimated tokens:', this.countTokens(fullText));

        // 2. AI 智能分块
        const aiChunks = await this.aiChunkText(fullText, {
          minTokens: 300,
          maxTokens: 600,
          targetTokens: 450
        });

        console.log('[Document Processing] AI chunking complete:', aiChunks.length, 'chunks');

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
          pageCount: extractedContent.pageCount,
          totalChunks: chunksToInsert.length,
          avgTokensPerChunk: chunksToInsert.reduce((sum, c) => sum + c.metadata.tokenCount, 0) / chunksToInsert.length,
        };
        await kb.save();

        // ... 然后再更新状态为 completed
        ```

### 阶段 3：数据库索引层 (15 分钟)

**目标**：在 MongoDB Atlas 中为新集合创建向量搜索索引。

1.  **登录 MongoDB Atlas**。
2.  进入 `Tu2tor` 数据库，找到 `knowledgechunks` 集合。
3.  点击 “Search” 标签页，然后 “Create Search Index”。
4.  选择 “Atlas Vector Search”，然后 “JSON Editor”。
5.  **粘贴以下配置**（支持向量搜索 + 元数据过滤）：
    ```json
    {
      "fields": [
        {
          "type": "vector",
          "path": "embedding",
          "numDimensions": 1536,
          "similarity": "cosine"
        },
        {
          "type": "filter",
          "path": "metadata.tokenCount"
        },
        {
          "type": "filter",
          "path": "metadata.chunkType"
        },
        {
          "type": "filter",
          "path": "semanticScore"
        }
      ]
    }
    ```
6.  点击“创建”，等待索引构建完成（几分钟）。

### 阶段 4：查询服务层 (1 小时)

**目标**：重构 `ragService.js`，用 `$vectorSearch` 替换关键词搜索。

1.  **删除旧逻辑**：
    -   可以删除或注释掉 `findRelevantChunks` 函数中的大部分内容（关键词提取、文档搜索、循环遍历页面等）。

2.  **实现新的向量搜索逻辑**：
    -   **代码**：
        ```javascript
        import KnowledgeChunk from '../models/KnowledgeChunk.js';
        import openai from '../config/openai.js';

        async function findRelevantChunksWithVectorSearch({ question, subjectId, documentIds = [], topK = 5 }) {
          // 1. 将问题转换为向量
          const queryResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: question,
          });
          const queryVector = queryResponse.data[0].embedding;

          // 2. 构建聚合管道
          const pipeline = [
            {
              $vectorSearch: {
                index: 'default', // 索引名
                path: 'embedding',
                queryVector: queryVector,
                numCandidates: 100,
                limit: topK,
                // **混合查询**：如果指定了文档，就在这些文档中搜索
                filter: documentIds.length > 0 ? { knowledgeBaseId: { $in: documentIds.map(id => new mongoose.Types.ObjectId(id)) } } : {}
              }
            },
            {
              $project: {
                _id: 0,
                content: 1,
                pageNumber: 1,
                score: { $meta: 'vectorSearchScore' }
              }
            }
          ];

          // 3. 执行查询
          const chunks = await KnowledgeChunk.aggregate(pipeline);

          // 4. 格式化返回结果
          return {
            chunks: chunks.filter(c => c.score > 0.75), // 只返回高分结果
            keywords: [], // 不再需要
            documentsFound: chunks.length
          };
        }
        ```

3.  **更新 `aiController.js`**：
    -   确保 `aiController.js` 调用的是新的 `findRelevantChunksWithVectorSearch` 函数。

### 阶段 5：性能优化与监控 (可选)

**目标**：优化 AI 分块性能，添加监控和成本控制。

**5.1 添加分块缓存**：
对于相同的文档内容，避免重复调用 AI 分块：
```javascript
// 使用内容哈希作为缓存键
import crypto from 'crypto';

static getContentHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

static chunkCache = new Map();

static async aiChunkTextWithCache(text, options = {}) {
  const hash = this.getContentHash(text);

  if (this.chunkCache.has(hash)) {
    console.log('[AI Chunking] Cache hit');
    return this.chunkCache.get(hash);
  }

  const chunks = await this.aiChunkText(text, options);
  this.chunkCache.set(hash, chunks);

  return chunks;
}
```

**5.2 添加成本追踪**：
```javascript
static async trackChunkingCost(textLength, chunksCount) {
  const estimatedInputTokens = this.countTokens(text);
  const estimatedCost = (estimatedInputTokens / 1000000) * 0.15; // GPT-4o-mini 价格

  console.log('[Cost Tracking]', {
    inputTokens: estimatedInputTokens,
    outputChunks: chunksCount,
    estimatedCost: `$${estimatedCost.toFixed(4)}`
  });

  // 可以保存到数据库进行长期追踪
}
```

**5.3 并行处理优化**：
对于多个文档，可以并行处理以提高速度：
```javascript
static async processMultipleDocuments(documentIds) {
  const results = await Promise.allSettled(
    documentIds.map(id => this.processDocument(id))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`[Batch Processing] Success: ${successful}, Failed: ${failed}`);
  return results;
}
```

---

## 风险与回滚计划

-   **风险**：OpenAI API 延迟或失败。
    -   **缓解**：在 `documentProcessor.js` 中添加重试逻辑和错误处理。
-   **回滚**：
    -   保留旧的 `findRelevantChunks` 函数，并添加一个环境变量 `USE_VECTOR_SEARCH=true/false`。
    -   根据环境变量决定调用哪个函数，方便快速切换回旧版。

## 总结

这个计划将引导你一步步地将 RAG 系统升级到工业级水准。建议按照阶段顺序执行，每完成一个阶段都进行测试。祝你升级顺利！
