# RAG System Documentation

Detailed documentation of the Retrieval-Augmented Generation (RAG) implementation in Tu2tor.

## Overview

The RAG system enables AI to answer questions based on user-uploaded study materials by retrieving relevant document chunks and using them as context for generation.

## Core Concepts

### What is RAG?

Retrieval-Augmented Generation combines two approaches:

1. **Retrieval**: Search and extract relevant information from a knowledge base
2. **Generation**: Use retrieved information as context for AI to generate accurate answers

Benefits:
- Reduces hallucinations (AI making up information)
- Provides source citations
- Enables domain-specific knowledge without fine-tuning
- Supports multi-document queries

### Tu2tor RAG Architecture

```
User Query
    │
    ├─► Retrieval Phase
    │   ├─► Keyword Extraction
    │   ├─► MongoDB Full-Text Search
    │   ├─► Chunk Ranking
    │   └─► Top-K Selection
    │
    └─► Generation Phase
        ├─► Context Assembly
        ├─► Prompt Construction
        ├─► Gemini API Call
        └─► Answer + Sources
```

## Document Processing Pipeline

### 1. Upload and Storage

**Entry Point**: `POST /api/knowledge-base`

```
User uploads file (PDF/PPTX/DOCX/Image)
    │
    ├─► Multer middleware saves to disk
    │       Path: server/uploads/knowledge-base/<filename>
    │
    └─► Create KnowledgeBase document
            status: 'pending'
            processingStatus.progress: 0%
```

### 2. Text Extraction

**Service**: `documentProcessor.js::processDocument()`

**PDF Extraction**:
```javascript
import pdfParse from 'pdf-parse';

const data = await pdfParse(buffer);
const fullText = data.text;
const pageCount = data.numpages;
```

**PPTX Extraction**:
```javascript
import officeParser from 'officeparser';

const data = await officeParser.parseOfficeAsync(filePath);
// Extract text from slides
```

**DOCX Extraction**:
```javascript
import mammoth from 'mammoth';

const result = await mammoth.extractRawText({ path: filePath });
const fullText = result.value;
```

**Image OCR**:
```javascript
import Tesseract from 'tesseract.js';

const { data: { text } } = await Tesseract.recognize(buffer, 'eng+chi_sim');
```

### 3. Text Chunking

**Algorithm**: Semantic Chunking with Overlap

**Chunking Strategy**:

```
Document (full text)
    │
    ├─► Split by paragraphs (double newline)
    │
    ├─► For each paragraph:
    │   ├─► If length > MAX_CHUNK_SIZE (1000 chars)
    │   │       └─► Further split by sentences
    │   │
    │   └─► Group paragraphs into semantic chunks
    │           Target: 500-1000 characters per chunk
    │           Overlap: 100 characters between chunks
    │
    └─► Generate metadata for each chunk:
            - chunkIndex (position in document)
            - tokenCount (estimated tokens)
            - charCount (character count)
            - chunkType ('semantic' | 'paragraph' | 'section')
            - pageNumber (if available)
```

**Implementation** (`ragService.js`):

```javascript
function chunkText(fullText, pageTexts = []) {
  const chunks = [];
  const paragraphs = fullText.split(/\n\s*\n/);
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > MAX_CHUNK_SIZE) {
      // Save current chunk
      if (currentChunk.trim()) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            chunkIndex: chunkIndex++,
            tokenCount: estimateTokens(currentChunk),
            charCount: currentChunk.length,
            chunkType: 'semantic'
          }
        });
      }
      // Start new chunk with overlap
      const words = currentChunk.split(' ');
      currentChunk = words.slice(-20).join(' ') + ' ' + para;
    } else {
      currentChunk += '\n\n' + para;
    }
  }
  
  // Save final chunk
  if (currentChunk.trim()) {
    chunks.push({...});
  }
  
  return chunks;
}
```

### 4. Embedding Generation (Future Enhancement)

**Current**: No embeddings, uses full-text search

**Planned**:
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

async function generateEmbedding(text) {
  const model = genAI.getGenerativeModel({ 
    model: 'text-embedding-004' 
  });
  
  const result = await model.embedContent(text);
  return result.embedding.values; // Float32Array
}
```

### 5. Storage

**Schema**: `KnowledgeChunk` model

```javascript
{
  knowledgeBaseId: ObjectId,     // Reference to parent document
  content: String,                // Chunk text
  embedding: [Number],            // Vector (future)
  metadata: {
    pageNumber: Number,
    chunkIndex: Number,           // Sequential index
    tokenCount: Number,
    charCount: Number,
    chunkType: String,            // 'semantic' | 'paragraph'
    summary: String               // Optional AI summary
  },
  semanticScore: Number           // Quality metric (0-1)
}
```

**Indexes**:
```javascript
// Compound index for efficient querying
knowledgeChunkSchema.index({ 
  knowledgeBaseId: 1, 
  'metadata.chunkIndex': 1 
});

// Text index for full-text search (current approach)
knowledgeBaseSchema.index({
  title: 'text',
  description: 'text',
  'extractedContent.fullText': 'text'
});
```

## Retrieval Phase

### Query Processing

**Entry Point**: `POST /api/rag/query`

```javascript
{
  question: "What is the deadline for the project?",
  documentIds: ["doc1", "doc2"], // User-selected documents
  subjectId: "subject123"         // Optional filter
}
```

### Step 1: Keyword Extraction

**Current Implementation**: Direct MongoDB text search

```javascript
const query = {
  $text: { $search: userQuestion },
  knowledgeBaseId: { $in: documentIds }
};

const chunks = await KnowledgeChunk.find(query, {
  score: { $meta: 'textScore' }
}).sort({ score: { $meta: 'textScore' } });
```

**Future Enhancement**: Use NLP for better keyword extraction
- Remove stop words
- Extract named entities
- Query expansion with synonyms

### Step 2: Semantic Search (Future)

```javascript
// Generate query embedding
const queryEmbedding = await generateEmbedding(question);

// Vector similarity search (cosine similarity)
const chunks = await KnowledgeChunk.aggregate([
  {
    $addFields: {
      similarity: {
        $function: {
          body: cosineSimilarity,
          args: ['$embedding', queryEmbedding]
        }
      }
    }
  },
  { $match: { similarity: { $gte: 0.7 } } },
  { $sort: { similarity: -1 } },
  { $limit: 5 }
]);
```

### Step 3: Reranking

Sort chunks by relevance:

```javascript
function rankChunks(chunks, question) {
  return chunks.map(chunk => {
    let score = chunk.score || 0; // Text search score
    
    // Boost score if chunk contains exact question words
    const questionWords = question.toLowerCase().split(/\s+/);
    const matches = questionWords.filter(word => 
      chunk.content.toLowerCase().includes(word)
    );
    score += matches.length * 0.1;
    
    // Boost semantic chunks over paragraph chunks
    if (chunk.metadata.chunkType === 'semantic') {
      score += 0.2;
    }
    
    // Penalize very short or very long chunks
    if (chunk.metadata.charCount < 100 || chunk.metadata.charCount > 2000) {
      score -= 0.1;
    }
    
    return { ...chunk, finalScore: score };
  }).sort((a, b) => b.finalScore - a.finalScore);
}
```

## Generation Phase

### Context Assembly

**Select Top K Chunks** (K=5):

```javascript
const topChunks = rankedChunks.slice(0, 5);

const context = topChunks.map((chunk, idx) => {
  return `[Source ${idx + 1}: ${chunk.title}, Page ${chunk.pageNumber}]\n${chunk.content}`;
}).join('\n\n---\n\n');
```

### Prompt Construction

**System Prompt**:
```
You are an AI tutor assistant. Answer the user's question based ONLY on the provided source materials. If the answer is not in the sources, say so clearly. Always cite your sources using [Source X] notation.
```

**User Prompt**:
```
Context from study materials:
---
[Source 1: Lecture Notes Week 3, Page 5]
The project deadline is March 15, 2025...

[Source 2: Project Specification, Page 2]
All submissions must be completed by...
---

Question: What is the deadline for the project?

Answer based on the context above, citing specific sources.
```

### Gemini API Call

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const result = await model.generateContent([
  { role: 'user', parts: [{ text: systemPrompt }] },
  { role: 'model', parts: [{ text: 'Understood.' }] },
  { role: 'user', parts: [{ text: constructedPrompt }] }
]);

const answer = result.response.text();
```

### Source Parsing

Extract source citations from answer:

```javascript
function parseSourceCitations(answer, chunks) {
  const citations = [];
  const sourceRegex = /\[Source (\d+)\]/g;
  let match;
  
  while ((match = sourceRegex.exec(answer)) !== null) {
    const sourceIndex = parseInt(match[1]) - 1;
    if (sourceIndex < chunks.length) {
      citations.push({
        docId: chunks[sourceIndex].knowledgeBaseId,
        title: chunks[sourceIndex].title,
        pageNumber: chunks[sourceIndex].metadata.pageNumber,
        chunkId: chunks[sourceIndex]._id
      });
    }
  }
  
  return citations;
}
```

## Response Format

```json
{
  "success": true,
  "answer": "According to [Source 1], the project deadline is March 15, 2025. This is confirmed in [Source 2] which states all submissions must be completed by this date.",
  "sources": [
    {
      "docId": "doc123",
      "title": "Lecture Notes Week 3",
      "pageNumber": 5,
      "chunkId": "chunk456",
      "similarity": 0.92
    },
    {
      "docId": "doc789",
      "title": "Project Specification",
      "pageNumber": 2,
      "chunkId": "chunk101",
      "similarity": 0.87
    }
  ],
  "chunksUsed": 5,
  "model": "gemini-2.5-flash"
}
```

## Optimization Strategies

### Current Approach

**Strengths**:
- Simple implementation using MongoDB built-in text search
- No additional infrastructure required
- Fast for keyword-based queries

**Limitations**:
- Cannot understand semantic similarity
- May miss relevant chunks with different wording
- Ranking based on keyword frequency, not meaning

### Future Enhancements

#### 1. Vector Search with MongoDB Atlas

Enable Atlas Search for vector similarity:

```javascript
// Create vector search index
db.knowledgechunks.createSearchIndex({
  name: 'vector_index',
  type: 'vectorSearch',
  definition: {
    fields: [{
      type: 'vector',
      path: 'embedding',
      numDimensions: 768,
      similarity: 'cosine'
    }]
  }
});

// Vector search query
const results = await KnowledgeChunk.aggregate([
  {
    $vectorSearch: {
      index: 'vector_index',
      path: 'embedding',
      queryVector: queryEmbedding,
      numCandidates: 100,
      limit: 10
    }
  }
]);
```

#### 2. Hybrid Search

Combine keyword and semantic search:

```javascript
async function hybridSearch(question, documentIds) {
  // Get results from both methods
  const keywordResults = await textSearch(question, documentIds);
  const semanticResults = await vectorSearch(question, documentIds);
  
  // Merge with weighted scoring
  const combined = mergeResults(keywordResults, semanticResults, {
    keywordWeight: 0.3,
    semanticWeight: 0.7
  });
  
  return combined.slice(0, 5);
}
```

#### 3. Query Expansion

Improve retrieval by expanding user queries:

```javascript
async function expandQuery(question) {
  // Use AI to generate related questions
  const expanded = await gemini.generate(
    `Generate 3 related questions for: "${question}"`
  );
  
  // Combine original + expanded queries
  return [question, ...expanded];
}
```

#### 4. Chunk Summarization

Pre-generate summaries for faster retrieval:

```javascript
async function summarizeChunk(content) {
  const summary = await gemini.generate(
    `Summarize in one sentence: ${content}`
  );
  
  return summary;
}

// Store in chunk metadata
chunk.metadata.summary = await summarizeChunk(chunk.content);
```

## Advanced Features

### Multi-Document Queries

Query across multiple documents simultaneously:

```javascript
POST /api/rag/query
{
  "question": "Compare the requirements in both specifications",
  "documentIds": ["spec1", "spec2", "spec3"]
}
```

RAG service:
1. Searches all specified documents
2. Groups results by document
3. Provides comparative analysis

### Conversational RAG

Maintain conversation context:

```javascript
{
  "question": "What about the testing requirements?",
  "documentIds": ["doc1"],
  "conversationHistory": [
    { "role": "user", "content": "What is the project about?" },
    { "role": "assistant", "content": "..." }
  ]
}
```

System resolves "the testing requirements" using conversation context.

### Citation Granularity

Sources include:
- Document title
- Page number
- Specific chunk content
- Similarity score

Frontend displays:
```
References:
- Project Specification, p.5
- Lecture Notes Week 3, p.12-14
- Assignment Guidelines, p.2
```

## Performance Metrics

### Chunking Performance

**Tested with**:
- 50-page PDF: ~2 seconds
- 30-slide PPTX: ~1 second  
- 20-page DOCX: ~1 second
- Image with text: ~5 seconds (OCR)

**Chunk Characteristics**:
- Average chunks per document: 30-100
- Average tokens per chunk: 200-400
- Average character count: 500-1000

### Query Performance

**Full-Text Search** (Current):
- Query time: 50-200ms
- Scales linearly with document count
- Efficient for <10,000 chunks

**Vector Search** (Future):
- Query time: 10-50ms (with proper indexing)
- Sub-linear scaling with approximate nearest neighbor (ANN)
- Efficient for millions of chunks

### Generation Performance

**Gemini API**:
- Time-to-first-token: ~500ms
- Streaming speed: ~50 tokens/second
- Total query time: 2-5 seconds

## Quality Assurance

### Chunk Quality Metrics

```javascript
semanticScore = 
  (contentDiversity * 0.3) +
  (informationDensity * 0.4) +
  (contextCompleteness * 0.3)
```

- **Content Diversity**: Vocabulary richness
- **Information Density**: Key terms per 100 words
- **Context Completeness**: Standalone readability

### Answer Quality

Evaluated by:
- **Relevance**: Does answer address the question?
- **Accuracy**: Is information from sources correct?
- **Completeness**: Are all aspects covered?
- **Citation Quality**: Are sources properly attributed?

## Error Handling

### Scenarios

**No Documents Selected**:
```json
{
  "success": false,
  "error": "Please select at least one document",
  "code": "NO_DOCUMENTS"
}
```

**No Relevant Chunks Found**:
```json
{
  "success": true,
  "answer": "I couldn't find relevant information in the selected documents to answer your question. Please try rephrasing or selecting different materials.",
  "sources": []
}
```

**Processing Not Complete**:
```json
{
  "success": false,
  "error": "Document is still processing. Please wait.",
  "code": "PROCESSING_INCOMPLETE"
}
```

**AI Generation Failed**:
```json
{
  "success": false,
  "error": "Failed to generate answer. Please try again.",
  "code": "GENERATION_FAILED",
  "details": "API quota exceeded"
}
```

## Frontend Integration

### Knowledge Base Mode

**UI Component**: `AIChat.jsx` with `mode === 'kb'`

```javascript
// 1. User selects documents
const [selectedDocIds, setSelectedDocIds] = useState([]);

// 2. User asks question
const handleSendMessage = async () => {
  const response = await ragAPI.query({
    question: inputMessage,
    documentIds: selectedDocIds
  });
  
  // 3. Display answer with sources
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: response.answer,
    sources: response.sources
  }]);
};
```

### Chunk Visualization

**UI Component**: `ChunkVisualization.jsx`

Displays how a document was split:
- Timeline layout with vertical line
- Each chunk as a card
- Metadata (token count, char count, type)
- Expandable content
- Summary (if available)

## Configuration

### Environment Variables

```bash
# RAG Configuration
KB_MAX_CONCURRENT=3              # Max concurrent processing jobs
CHUNK_SIZE_MIN=300               # Minimum chunk size (chars)
CHUNK_SIZE_MAX=1000              # Maximum chunk size (chars)
CHUNK_OVERLAP=100                # Overlap between chunks (chars)
RAG_TOP_K=5                      # Number of chunks to retrieve
RAG_SIMILARITY_THRESHOLD=0.7     # Minimum similarity for vector search
```

### Model Selection

Different models for different tasks:

```javascript
const modelConfig = {
  embedding: 'text-embedding-004',      // Generate embeddings
  summarization: 'gemini-2.5-flash',    # Chunk summaries
  rag: 'gemini-2.5-flash',              # Answer generation
  thinking: 'gemini-2.5-pro'            # Deep analysis
};
```

## Testing and Validation

### Unit Tests

```javascript
describe('RAG Service', () => {
  test('chunks document correctly', () => {
    const text = 'Lorem ipsum...';
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].metadata.tokenCount).toBeLessThan(500);
  });
  
  test('retrieves relevant chunks', async () => {
    const results = await retrieveChunks('test question', ['doc1']);
    expect(results).toHaveLength(5);
    expect(results[0].score).toBeGreaterThan(0);
  });
});
```

### Integration Tests

Test complete RAG pipeline:

```javascript
test('RAG query returns answer with sources', async () => {
  const response = await request(app)
    .post('/api/rag/query')
    .send({
      question: 'What is the main topic?',
      documentIds: [testDocId]
    })
    .set('Authorization', `Bearer ${token}`);
    
  expect(response.status).toBe(200);
  expect(response.body.answer).toBeDefined();
  expect(response.body.sources).toBeInstanceOf(Array);
});
```

## Best Practices

### For Users

1. **Upload quality documents**: Clear, well-formatted PDFs work best
2. **Use descriptive titles**: Helps AI understand document context
3. **Add relevant tags**: Improves retrieval accuracy
4. **Select appropriate documents**: Choose materials related to your question
5. **Ask specific questions**: Better than vague or multi-part questions

### For Developers

1. **Chunk size balance**: Too small = fragmented context, Too large = irrelevant info
2. **Overlap is crucial**: Prevents information loss at chunk boundaries
3. **Monitor token usage**: Each RAG query costs tokens (context + generation)
4. **Cache embeddings**: Generate once, reuse for all queries
5. **Handle edge cases**: Empty documents, non-text PDFs, corrupted files

## Limitations and Tradeoffs

### Current System

**Limitations**:
- Full-text search may miss semantically similar content
- No cross-document reasoning
- Limited to text content (images in PDFs ignored except via OCR)
- OCR accuracy depends on image quality

**Tradeoffs**:
- Simplicity vs. Accuracy: Chose simple text search for MVP
- Speed vs. Quality: Faster retrieval, potentially lower precision
- Cost vs. Features: No embedding API calls = lower cost

### Scalability Limits

- **MongoDB text search**: Efficient up to ~10,000 chunks
- **In-memory ranking**: Feasible for ~1,000 results
- **File storage**: Disk space limited by hosting plan

## Future Roadmap

1. **Phase 1** (Current): Text extraction + Full-text search + Basic RAG
2. **Phase 2**: Vector embeddings + Semantic search + Hybrid retrieval
3. **Phase 3**: Query expansion + Chunk summarization + Reranking
4. **Phase 4**: Multi-modal RAG (images, tables, charts)
5. **Phase 5**: Graph-based knowledge representation

## References

- [RAG Paper](https://arxiv.org/abs/2005.11401) - Original RAG research
- [Yjs Documentation](https://docs.yjs.dev/) - CRDT library
- [MongoDB Text Search](https://www.mongodb.com/docs/manual/text-search/) - Full-text indexing
- [Gemini API](https://ai.google.dev/docs) - Google AI documentation
- [LangChain](https://js.langchain.com/) - RAG framework (inspiration)
