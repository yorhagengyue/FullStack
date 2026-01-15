import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApp } from '../src/app.js';

// Mock the code execution service
vi.mock('../src/services/codeExecution.js', () => ({
  executeCode: vi.fn()
}));

import { executeCode } from '../src/services/codeExecution.js';

describe('App Configuration', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Root endpoint', () => {
    it('returns API information', async () => {
      ({ app } = createApp());

      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Tu2tor API Server',
        status: 'running',
        version: '1.0.0'
      });
    });
  });

  describe('Health check endpoint', () => {
    it('returns unhealthy status when DB not connected', async () => {
      ({ app } = createApp({
        status: {
          dbConnected: false,
          aiInitialized: false,
          aiProvider: 'none'
        }
      }));

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('unhealthy');
      expect(res.body.mongodb).toBe('disconnected');
      expect(res.body.ai).toBe('unavailable');
      expect(res.body.aiProvider).toBe('none');
      expect(res.body.timestamp).toBeDefined();
    });

    it('returns healthy status when DB connected', async () => {
      ({ app } = createApp({
        status: {
          dbConnected: true,
          aiInitialized: false,
          aiProvider: 'none'
        }
      }));

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.mongodb).toBe('connected');
    });

    it('returns AI initialized status', async () => {
      ({ app } = createApp({
        status: {
          dbConnected: true,
          aiInitialized: true,
          aiProvider: 'gemini'
        }
      }));

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.ai).toBe('initialized');
      expect(res.body.aiProvider).toBe('gemini');
    });
  });

  describe('WebSocket stats endpoint', () => {
    it('returns stats when websocketService is provided', async () => {
      const mockWebsocketService = {
        getStats: vi.fn().mockReturnValue({
          connections: 5,
          rooms: 3
        })
      };

      ({ app } = createApp({ websocketService: mockWebsocketService }));

      const res = await request(app).get('/api/websocket/stats');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        connections: 5,
        rooms: 3
      });
      expect(mockWebsocketService.getStats).toHaveBeenCalled();
    });

    it('returns 404 when websocketService is not provided', async () => {
      ({ app } = createApp());

      const res = await request(app).get('/api/websocket/stats');

      expect(res.status).toBe(404);
    });
  });

  describe('Code execution endpoint', () => {
    beforeEach(() => {
      ({ app } = createApp());
    });

    it('executes code successfully', async () => {
      executeCode.mockResolvedValue({
        output: 'Hello World',
        error: null
      });

      const res = await request(app)
        .post('/api/code/execute')
        .send({
          language: 'javascript',
          code: 'console.log("Hello World")'
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        output: 'Hello World',
        error: null
      });
      expect(executeCode).toHaveBeenCalledWith('javascript', 'console.log("Hello World")');
    });

    it('returns 400 when no code provided', async () => {
      const res = await request(app)
        .post('/api/code/execute')
        .send({
          language: 'javascript'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No code provided');
      expect(executeCode).not.toHaveBeenCalled();
    });

    it('handles execution errors', async () => {
      executeCode.mockRejectedValue(new Error('Execution failed'));

      const res = await request(app)
        .post('/api/code/execute')
        .send({
          language: 'javascript',
          code: 'invalid code'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error during code execution');
    });
  });

  describe('404 handler', () => {
    it('returns 404 for unknown routes', async () => {
      ({ app } = createApp());

      const res = await request(app).get('/api/unknown-route');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Route not found');
    });
  });

  describe('CORS configuration', () => {
    it('allows requests without origin', async () => {
      ({ app } = createApp());

      const res = await request(app)
        .get('/')
        .set('Origin', '');

      expect(res.status).toBe(200);
    });

    it('allows requests from allowed origins', async () => {
      ({ app } = createApp());

      const res = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:5174');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5174');
    });

    it('allows production onrender.com origins', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      ({ app } = createApp());

      const res = await request(app)
        .get('/')
        .set('Origin', 'https://my-app.onrender.com');

      expect(res.status).toBe(200);

      process.env.NODE_ENV = originalEnv;
    });

    it('blocks requests from disallowed origins', async () => {
      ({ app } = createApp());

      const res = await request(app)
        .get('/')
        .set('Origin', 'https://malicious-site.com');

      expect(res.status).not.toBe(200);
    });
  });

  describe('Error handler middleware', () => {
    it('catches and handles errors', async () => {
      ({ app } = createApp());

      // Trigger an error by sending invalid JSON to code execution
      executeCode.mockRejectedValue(new Error('Test error'));

      const res = await request(app)
        .post('/api/code/execute')
        .send({ language: 'javascript', code: 'test' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
});
