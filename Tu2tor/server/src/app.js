import express from 'express';
import cors from 'cors';

import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import studyNoteRoutes from './routes/studyNoteRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import knowledgeBaseRoutes from './routes/knowledgeBaseRoutes.js';
import ragRoutes from './routes/ragRoutes.js';

import { executeCode } from './services/codeExecution.js';

export const createApp = ({ status, websocketService } = {}) => {
  const app = express();
  const healthStatus = status || {
    dbConnected: false,
    aiInitialized: false,
    aiProvider: 'none'
  };

  const allowedOrigins = [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://tu2tor-frontend.onrender.com',
    'https://tu2tor.onrender.com',
    'https://tu2tor.com',
    'https://www.tu2tor.com',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV === 'production' && origin && origin.includes('.onrender.com')) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (websocketService) {
    app.get('/api/websocket/stats', (req, res) => {
      res.json(websocketService.getStats());
    });
  }

  app.get('/', (req, res) => {
    res.json({
      message: 'Tu2tor API Server',
      status: 'running',
      version: '1.0.0'
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: healthStatus.dbConnected ? 'healthy' : 'unhealthy',
      mongodb: healthStatus.dbConnected ? 'connected' : 'disconnected',
      ai: healthStatus.aiInitialized ? 'initialized' : 'unavailable',
      aiProvider: healthStatus.aiInitialized ? healthStatus.aiProvider : 'none',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/test', testRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/tutors', tutorRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/todos', todoRoutes);
  app.use('/api/study-notes', studyNoteRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/knowledge-base', knowledgeBaseRoutes);
  app.use('/api/rag', ragRoutes);

  app.post('/api/code/execute', async (req, res) => {
    try {
      const { language, code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'No code provided' });
      }

      const result = await executeCode(language, code);
      res.json(result);
    } catch (error) {
      console.error('Code execution error:', error);
      res.status(500).json({ error: 'Internal server error during code execution' });
    }
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Something went wrong!',
      message: err.message
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found'
    });
  });

  return { app, status: healthStatus };
};
