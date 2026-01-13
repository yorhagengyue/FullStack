/**
 * Enhanced WebSocket Service for real-time collaboration
 * Handles Yjs document sync, chat messages, and presence tracking
 */

class WebSocketService {
  constructor(wss) {
    this.wss = wss;
    this.rooms = new Map(); // roomId -> Set of clients
    this.setupConnectionHandler();
  }

  setupConnectionHandler() {
    this.wss.on('connection', (ws, req) => {
      const urlParams = new URL(req.url, 'http://localhost').pathname;
      const room = urlParams.slice(1) || 'default-room';
      
      ws.room = room;
      ws.isAlive = true;
      ws.userId = null; // Will be set after authentication if needed
      ws.username = null;

      // Add client to room
      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      this.rooms.get(room).add(ws);

      console.log(`[WebSocket] Client connected to room: ${room}`);
      console.log(`[WebSocket] Room ${room} now has ${this.rooms.get(room).size} clients`);

      // Send welcome message with room info
      this.sendToClient(ws, {
        type: 'connection',
        room: room,
        userCount: this.rooms.get(room).size,
        users: this.getRoomUsers(room),
        timestamp: new Date().toISOString()
      });

      // Broadcast user joined to others in room
      this.broadcastToRoom(room, {
        type: 'user-joined',
        room: room,
        userCount: this.rooms.get(room).size,
        users: this.getRoomUsers(room),
        timestamp: new Date().toISOString()
      }, ws);

      // Heartbeat - pong response
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Message handler
      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      // Connection close handler
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      // Error handler
      ws.on('error', (error) => {
        console.error(`[WebSocket] Error in room ${room}:`, error.message);
      });
    });

    // Setup heartbeat interval to detect dead connections
    this.setupHeartbeat();
  }

  handleMessage(ws, message) {
    try {
      // Try to parse as JSON for control messages
      const data = JSON.parse(message);
      
      // Handle authentication message
      if (data.type === 'auth') {
        ws.userId = data.userId;
        ws.username = data.username;
        console.log(`[WebSocket] User ${ws.username} authenticated in room ${ws.room}`);
        
        // Broadcast updated user list
        this.broadcastToRoom(ws.room, {
          type: 'user-list-updated',
          userCount: this.rooms.get(ws.room).size,
          users: this.getRoomUsers(ws.room),
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Handle presence update
      if (data.type === 'presence') {
        this.broadcastToRoom(ws.room, {
          type: 'presence-update',
          userId: ws.userId,
          username: ws.username,
          ...data.state
        }, ws);
        return;
      }

      // For other JSON messages (like chat), relay them
      this.broadcastToRoom(ws.room, message, ws);
      
    } catch (e) {
      // Not JSON - this is likely a Yjs binary message
      // Relay binary messages to all clients in the same room (for Yjs sync)
      this.broadcastToRoom(ws.room, message, ws);
    }
  }

  handleDisconnect(ws) {
    const room = ws.room;
    
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(ws);
      
      console.log(`[WebSocket] Client disconnected from room: ${room}`);
      console.log(`[WebSocket] Room ${room} now has ${this.rooms.get(room).size} clients`);

      // Broadcast user left to others in room
      this.broadcastToRoom(room, {
        type: 'user-left',
        userId: ws.userId,
        username: ws.username,
        userCount: this.rooms.get(room).size,
        users: this.getRoomUsers(room),
        timestamp: new Date().toISOString()
      });

      // Clean up empty rooms
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
        console.log(`[WebSocket] Room ${room} is now empty and removed`);
      }
    }
  }

  broadcastToRoom(room, message, excludeClient = null) {
    if (!this.rooms.has(room)) return;

    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    const messageBuf = Buffer.isBuffer(message) ? message : Buffer.from(messageStr);

    this.rooms.get(room).forEach((client) => {
      if (client !== excludeClient && client.readyState === 1) { // 1 = OPEN
        try {
          client.send(messageBuf);
        } catch (error) {
          console.error(`[WebSocket] Error sending to client:`, error.message);
        }
      }
    });
  }

  sendToClient(ws, data) {
    if (ws.readyState === 1) { // 1 = OPEN
      ws.send(JSON.stringify(data));
    }
  }

  getRoomUsers(room) {
    if (!this.rooms.has(room)) return [];
    
    const users = [];
    this.rooms.get(room).forEach((client) => {
      if (client.userId) {
        users.push({
          userId: client.userId,
          username: client.username
        });
      }
    });
    return users;
  }

  setupHeartbeat() {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          console.log(`[WebSocket] Terminating dead connection in room: ${ws.room}`);
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  // Get stats for monitoring
  getStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalClients: this.wss.clients.size,
      rooms: {}
    };

    this.rooms.forEach((clients, room) => {
      stats.rooms[room] = {
        clientCount: clients.size,
        users: this.getRoomUsers(room)
      };
    });

    return stats;
  }
}

export default WebSocketService;

