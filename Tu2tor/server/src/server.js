import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import connectDB from './config/database.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from multiple possible locations
const envPaths = [
  path.resolve(__dirname, '../.env'),      // server/.env
  path.resolve(__dirname, '../../.env'),   // Tu2tor/.env
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server for collaborative editing
const wss = new WebSocketServer({ server });

// Middleware - CORS configuration
const allowedOrigins = [
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://tu2tor.pages.dev',
  'https://3fbd1b0d.tu2tor.pages.dev',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, allow any *.pages.dev domain for flexibility
    if (process.env.NODE_ENV === 'production' && origin && origin.includes('.pages.dev')) {
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
// Increase body size limit for AI chat with long message history
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import AI service
import aiService from './ai/services/AIService.js';

// Connect to MongoDB (wait for connection before starting server)
let dbConnected = false;
let aiInitialized = false;

const initDB = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log('[DB] Database connection established');
  } catch (error) {
    console.error('[DB] Failed to connect to database:', error.message);
    dbConnected = false;
  }
};

const initAI = async () => {
  try {
    await aiService.initialize();
    aiInitialized = true;
    console.log('[AI] AI service initialized');
    console.log(`[AI] Active provider: ${aiService.getActiveProviderName()}`);
  } catch (error) {
    console.error('[AI] AI service initialization failed:', error.message);
    console.error('[AI] AI features will be unavailable');
    aiInitialized = false;
  }
};

// Start DB and AI initialization
initDB();
initAI();

// WebSocket connection handler for collaborative code editing and chat
// Using simple WebSocket relay
wss.on('connection', (ws, req) => {
  // Extract room name from URL (e.g., /room-name)
  // For chat, the room can be 'chat-senderId-receiverId'
  const room = req.url.slice(1) || 'default-room';
  ws.room = room;

  console.log(`[WebSocket] Client connected to room: ${room}`);

  // Relay messages to all other connected clients IN THE SAME ROOM
  ws.on('message', (message) => {
    try {
      // Parse message to check if it's a chat message
      const parsedMessage = JSON.parse(message);
      
      // Relay to all clients in the room
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1 && client.room === ws.room) { // 1 = OPEN
          client.send(message); // Send original message (buffer or string)
        }
      });
    } catch (e) {
      // Not JSON or simple relay
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1 && client.room === ws.room) {
        client.send(message);
      }
    });
    }
  });

  ws.on('close', () => {
    console.log(`[WebSocket] Client disconnected from room: ${room}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Tu2tor API Server',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    mongodb: dbConnected ? 'connected' : 'disconnected',
    ai: aiInitialized ? 'initialized' : 'unavailable',
    aiProvider: aiInitialized ? aiService.getActiveProviderName() : 'none',
    timestamp: new Date().toISOString()
  });
});

// Import routes
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

import { executeCode } from './services/codeExecution.js';

// Code Execution Endpoint
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

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});



// Start server with WebSocket support
server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Server] API: http://localhost:${PORT}`);
  console.log(`[Server] Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`[Server] WebSocket server ready for collaborative editing`);
});
