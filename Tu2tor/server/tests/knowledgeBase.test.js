import request from 'supertest';
import { describe, it, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './utils/testDb.js';
import KnowledgeBase from '../src/models/KnowledgeBase.js';
import User from '../src/models/User.js';

const { app } = createApp();

const buildUser = (overrides = {}) => ({
  username: 'kbUser',
  email: 'kb@example.com',
  password: 'Password123!',
  major: 'Computer Science',
  yearOfStudy: 2,
  ...overrides
});

const registerAndLogin = async () => {
  await request(app).post('/api/auth/register').send(buildUser());
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'kb@example.com', password: 'Password123!' });

  // Get userId from database
  const user = await User.findOne({ email: 'kb@example.com' });
  return { token: login.body.token, userId: user._id };
};

describe('Knowledge Base API', () => {
  beforeAll(connectTestDb);
  beforeEach(clearTestDb);
  afterAll(disconnectTestDb);

  describe('GET /api/knowledge-base', () => {
    it('returns empty list when no documents exist', async () => {
      const { token } = await registerAndLogin();

      const response = await request(app)
        .get('/api/knowledge-base')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.documents).toEqual([]);
    });

    it('returns user documents only', async () => {
      const { token, userId } = await registerAndLogin();

      // Create a mock document
      await KnowledgeBase.create({
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
        }
      });

      const response = await request(app)
        .get('/api/knowledge-base')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.documents.length).toBe(1);
      expect(response.body.documents[0].title).toBe('Test Document');
    });
  });

  describe('GET /api/knowledge-base/:id', () => {
    it('returns document by id', async () => {
      const { token, userId } = await registerAndLogin();

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
        }
      });

      const response = await request(app)
        .get(`/api/knowledge-base/${doc._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.knowledgeBase.title).toBe('Test Document');
    });

    it('returns 404 for non-existent document', async () => {
      const { token } = await registerAndLogin();

      const response = await request(app)
        .get('/api/knowledge-base/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
