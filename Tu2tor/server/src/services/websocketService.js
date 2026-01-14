/**
 * WebSocket Service for real-time collaboration
 * Handles Yjs document sync for code and markdown editors
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

      // Add client to room
      if (!this.rooms.has(room)) {
        this.rooms.set(room, new Set());
      }
      this.rooms.get(room).add(ws);

      console.log(`[WebSocket] Client connected to room: ${room}`);
      console.log(`[WebSocket] Room ${room} now has ${this.rooms.get(room).size} clients`);

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
    // Simply relay all messages (primarily Yjs binary sync)
    // to all clients in the same room
    this.broadcastToRoom(ws.room, message, ws);
  }

  handleDisconnect(ws) {
    const room = ws.room;
    
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(ws);
      
      console.log(`[WebSocket] Client disconnected from room: ${room}`);
      console.log(`[WebSocket] Room ${room} now has ${this.rooms.get(room).size} clients`);

      // Clean up empty rooms
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
        console.log(`[WebSocket] Room ${room} is now empty and removed`);
      }
    }
  }

  broadcastToRoom(room, message, excludeClient = null) {
    if (!this.rooms.has(room)) return;

    // Handle different message types correctly
    let dataToSend;
    if (Buffer.isBuffer(message)) {
      // Already a Buffer, use as-is (for Yjs binary sync)
      dataToSend = message;
    } else if (message instanceof Uint8Array) {
      // Yjs binary message, convert to Buffer
      dataToSend = Buffer.from(message);
    } else if (typeof message === 'string') {
      // String message, use as-is
      dataToSend = message;
    } else {
      // Object, serialize to JSON
      dataToSend = JSON.stringify(message);
    }

    this.rooms.get(room).forEach((client) => {
      if (client !== excludeClient && client.readyState === 1) { // 1 = OPEN
        try {
          client.send(dataToSend);
        } catch (error) {
          console.error(`[WebSocket] Error sending to client:`, error.message);
        }
      }
    });
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
        clientCount: clients.size
      };
    });

    return stats;
  }
}

export default WebSocketService;

