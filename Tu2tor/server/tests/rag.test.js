import request from 'supertest';
import { describe, it, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './utils/testDb.js';
import KnowledgeBase from '../src/models/KnowledgeBase.js';
import KnowledgeChunk from '../src/models/KnowledgeChunk.js';
import User from '../src/models/User.js';

const { app } = createApp();

const buildUser = (overrides = {}) => ({
  username: 'ragUser',
  email: 'rag@example.com',
  password: 'Password123!',
  major: 'Computer Science',
  yearOfStudy: 2,
  ...overrides
});

const registerAndLogin = async () => {
  await request(app).post('/api/auth/register').send(buildUser());
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'rag@example.com', password: 'Password123!' });

  // Get userId from database
  const user = await User.findOne({ email: 'rag@example.com' });
  return { token: login.body.token, userId: user._id };
};

describe('RAG API', () => {
  beforeAll(connectTestDb);
  beforeEach(clearTestDb);
  afterAll(disconnectTestDb);

  describe('POST /api/rag/query', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/rag/query')
        .send({ question: 'Test question' });

      expect(response.status).toBe(401);
    });

    it('validates required fields', async () => {
      const { token } = await registerAndLogin();

      const response = await request(app)
        .post('/api/rag/query')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('returns answer with metadata including searchMethod', async () => {
      const { token, userId } = await registerAndLogin();

      // Create a test document
      const doc = await KnowledgeBase.create({
        userId,
        subjectId: 'computer-science',
        title: 'Test Document',
        type: 'pdf',
        originalFileName: 'test.pdf',
        fileUrl: '/uploads/test.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        processingStatus: {
          status: 'completed',
          progress: 100
        },
        extractedContent: {
          pageTexts: [
            {
              pageNumber: 1,
              content: 'This is a test document about machine learning and artificial intelligence.'
            }
          ]
        }
      });

      // Create test chunks with embeddings
      await KnowledgeChunk.create({
        knowledgeBaseId: doc._id,
        content: 'This is a test document about machine learning and artificial intelligence.',
        embedding: new Array(1536).fill(0.1), // Mock embedding
        metadata: {
          chunkIndex: 0,
          tokenCount: 15,
          charCount: 75,
          chunkType: 'semantic'
        },
        semanticScore: 1.0
      });

      const response = await request(app)
        .post('/api/rag/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          question: 'What is this document about?',
          documentIds: [doc._id.toString()]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.answer).toBeDefined();
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.searchMethod).toBeDefined();
      expect(['vector', 'keyword']).toContain(response.body.meta.searchMethod);
    });
  });
});
