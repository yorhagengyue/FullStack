import { describe, it, beforeEach, expect, vi } from 'vitest';

const hoisted = vi.hoisted(() => {
  const requestHandlers = [];
  const responseHandlers = [];

  const apiMock = {
    interceptors: {
      request: {
        use: (fulfilled, rejected) => {
          requestHandlers.push({ fulfilled, rejected });
        }
      },
      response: {
        use: (fulfilled, rejected) => {
          responseHandlers.push({ fulfilled, rejected });
        }
      }
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  };

  return { apiMock, requestHandlers, responseHandlers };
});

vi.mock('axios', () => ({
  default: {
    create: () => hoisted.apiMock
  }
}));

import {
  authAPI,
  tutorsAPI,
  bookingsAPI,
  knowledgeBaseAPI,
  ragAPI,
  notificationsAPI,
  todosAPI,
  studyNotesAPI,
  testAPI
} from '../services/api';

describe('API client', () => {
  beforeEach(() => {
    hoisted.apiMock.get.mockReset();
    hoisted.apiMock.post.mockReset();
    hoisted.apiMock.put.mockReset();
    hoisted.apiMock.delete.mockReset();
    hoisted.apiMock.patch.mockReset();
    localStorage.clear();
  });

  it('adds auth token to request headers when present', () => {
    localStorage.setItem('token', 'abc123');
    const config = { headers: {} };
    const result = hoisted.requestHandlers[0].fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer abc123');
  });

  it('handles auth errors without redirect for login/register', async () => {
    localStorage.setItem('token', 'token');

    await expect(
      hoisted.responseHandlers[0].rejected({
        response: {
          status: 401,
          data: { message: 'Invalid' },
          config: { url: '/auth/login' }
        }
      })
    ).rejects.toMatchObject({ message: 'Invalid' });

    expect(localStorage.getItem('token')).toBe('token');
  });

  it('clears tokens and redirects on unauthorized non-auth request', async () => {
    localStorage.setItem('token', 'token');
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });

    await expect(
      hoisted.responseHandlers[0].rejected({
        response: {
          status: 401,
          data: { message: 'Expired' },
          config: { url: '/tutors' }
        }
      })
    ).rejects.toMatchObject({ message: 'Expired' });

    expect(localStorage.getItem('token')).toBe(null);
    expect(window.location.href).toBe('/login');
  });

  it('calls key API helpers with expected endpoints', async () => {
    hoisted.apiMock.post.mockResolvedValueOnce({ data: { token: 't', user: {} } });
    await authAPI.login({ email: 'a@b.com', password: 'pass' });
    expect(hoisted.apiMock.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });

    hoisted.apiMock.get.mockResolvedValueOnce({ data: { success: true } });
    await tutorsAPI.getTutors({ subject: 'Math' });
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/tutors', { params: { subject: 'Math' } });

    hoisted.apiMock.post.mockResolvedValueOnce({ data: { success: true } });
    await bookingsAPI.createBooking({ tutorId: '1' });
    expect(hoisted.apiMock.post).toHaveBeenCalledWith('/bookings', { tutorId: '1' });

    hoisted.apiMock.put.mockResolvedValueOnce({ data: { success: true } });
    await notificationsAPI.markAllAsRead();
    expect(hoisted.apiMock.put).toHaveBeenCalledWith('/notifications/read-all');

    hoisted.apiMock.patch.mockResolvedValueOnce({ data: { success: true } });
    await todosAPI.toggleTodo('todo1');
    expect(hoisted.apiMock.patch).toHaveBeenCalledWith('/todos/todo1/toggle');

    hoisted.apiMock.get.mockResolvedValueOnce({ data: [] });
    await studyNotesAPI.getTags();
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/study-notes/tags/list');

    hoisted.apiMock.get.mockResolvedValueOnce({ data: [] });
    await testAPI.getUsers();
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/test/users');

    // Knowledge Base API tests
    hoisted.apiMock.get.mockResolvedValueOnce({ data: { success: true, documents: [] } });
    await knowledgeBaseAPI.list({ subjectId: 'cs' });
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/knowledge-base', { params: { subjectId: 'cs' } });

    hoisted.apiMock.get.mockResolvedValueOnce({ data: { success: true, processingStatus: {} } });
    await knowledgeBaseAPI.getStatus('doc1');
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/knowledge-base/doc1/status');

    hoisted.apiMock.get.mockResolvedValueOnce({ data: { success: true, knowledgeBase: {} } });
    await knowledgeBaseAPI.getDocument('doc1');
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/knowledge-base/doc1');

    hoisted.apiMock.get.mockResolvedValueOnce({ data: { success: true, content: {} } });
    await knowledgeBaseAPI.getContent('doc1');
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/knowledge-base/doc1/content');

    hoisted.apiMock.put.mockResolvedValueOnce({ data: { success: true } });
    await knowledgeBaseAPI.update('doc1', { title: 'New Title' });
    expect(hoisted.apiMock.put).toHaveBeenCalledWith('/knowledge-base/doc1', { title: 'New Title' });

    hoisted.apiMock.get.mockResolvedValueOnce({ data: { success: true, documents: [] } });
    await knowledgeBaseAPI.search({ query: 'test' });
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/knowledge-base/search', { params: { query: 'test' } });

    hoisted.apiMock.get.mockResolvedValueOnce({ data: { success: true, tags: [] } });
    await knowledgeBaseAPI.getTags();
    expect(hoisted.apiMock.get).toHaveBeenCalledWith('/knowledge-base/tags');

    // RAG API tests
    hoisted.apiMock.post.mockResolvedValueOnce({ data: { success: true, answer: 'test answer' } });
    await ragAPI.query({ question: 'What is this?', documentIds: ['doc1'] });
    expect(hoisted.apiMock.post).toHaveBeenCalledWith('/rag/query', {
      question: 'What is this?',
      subjectId: undefined,
      documentIds: ['doc1']
    });
  });
});
