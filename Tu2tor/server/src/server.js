import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import connectDB from './config/database.js';
import aiService from './ai/services/AIService.js';
import { createApp } from './app.js';

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

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer();

// Create WebSocket server for collaborative editing
const wss = new WebSocketServer({ server });

// Import WebSocket service
import WebSocketService from './services/websocketService.js';
const wsService = new WebSocketService(wss);

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

const { app, status } = createApp({ websocketService: wsService });

// Start DB and AI initialization
initDB().then(() => {
  status.dbConnected = dbConnected;
});
initAI().then(() => {
  status.aiInitialized = aiInitialized;
  status.aiProvider = aiService.getActiveProviderName() || 'none';
});



// Start server with WebSocket support
server.on('request', app);
server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Server] API: http://localhost:${PORT}`);
  console.log(`[Server] Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`[Server] WebSocket server ready for collaborative editing`);
});
