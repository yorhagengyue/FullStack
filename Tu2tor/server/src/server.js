import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import connectDB from './config/database.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server for collaborative editing
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// WebSocket connection handler for collaborative code editing
// Using simple WebSocket relay for Yjs synchronization
wss.on('connection', (ws, req) => {
  // Extract room name from URL (e.g., /room-name)
  // y-websocket typically connects to ws://host:port/room-name
  const room = req.url.slice(1) || 'default-room';
  ws.room = room;

  console.log(`✅ WebSocket client connected to room: ${room}`);

  // Relay messages to all other connected clients IN THE SAME ROOM
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1 && client.room === ws.room) { // 1 = OPEN
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log(`❌ WebSocket client disconnected from room: ${room}`);
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
    status: 'healthy',
    mongodb: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Import routes
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`🔗 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`🔌 WebSocket server ready for collaborative editing`);
});
