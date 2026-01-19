# System Architecture

High-level architecture and design patterns for Tu2tor platform.

## System Overview

Tu2tor follows a standard three-tier architecture with real-time communication capabilities.

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Client (React) │ ◄─────► │  Server (Node)  │ ◄─────► │  Database (MongoDB) │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                            │
       │                            │
       │                    ┌───────┴────────┐
       │                    │                │
       │                    │   AI Services  │
       │                    │   (Gemini/     │
       └────────────────────│    OpenAI)     │
         WebSocket          │                │
         (Yjs Sync)         └────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthContext (Authentication state)
├── AppContext (Application state)
├── AIContext (AI service state)
├── VideoContext (Video session state)
│
└── Router
    ├── Landing Page
    ├── Auth Pages (Login/Register)
    ├── Dashboard
    ├── Search (Tutor finder)
    ├── Sessions
    │   ├── SessionsPage (List)
    │   └── SessionRoomPage (Active session)
    │       ├── JitsiMeetRoom
    │       ├── CodeCollabEditor
    │       ├── MarkdownCollabEditor
    │       └── SessionControls
    ├── AIChat
    ├── KnowledgeBase
    │   ├── KnowledgeBaseUpload
    │   └── KnowledgeBaseView
    ├── StudyNotes
    ├── Calendar
    └── Todo
```

### State Management

Uses React Context API for global state:

- **AuthContext**: User authentication, JWT token, role
- **AppContext**: Tutors, bookings, subjects, messages
- **AIContext**: AI service initialization, provider status
- **VideoContext**: Floating video session data

### Data Flow

1. **User Action** → Component event handler
2. **API Call** → `services/api.js` or `services/aiAPI.js`
3. **Update State** → Context provider
4. **Re-render** → Subscribed components

## Backend Architecture

### Layered Structure

```
Routes → Controllers → Services → Models → Database
                         ↓
                    AI Providers
                    WebSocket
                    File Processing
```

### Key Services

**AIService** (`ai/services/AIService.js`):
- Manages multiple AI providers (Gemini, OpenAI)
- Provider switching
- Token counting and cost tracking

**RAGService** (`services/ragService.js`):
- Document chunking
- Semantic search
- Context assembly
- Answer generation

**DocumentProcessor** (`services/documentProcessor.js`):
- File parsing (PDF, PPTX, DOCX)
- OCR (Tesseract.js)
- Text extraction
- Metadata extraction

**WebSocketService** (`services/websocketService.js`):
- Room-based message broadcast
- Heartbeat mechanism
- Connection management

### Database Schema

**Core Collections**:
- `users` - User accounts
- `tutors` - Tutor profiles
- `bookings` - Session bookings
- `reviews` - Tutor reviews
- `knowledgebases` - Uploaded documents
- `knowledgechunks` - Document chunks with embeddings
- `studynotes` - Study notes
- `todos` - Task items
- `messages` - Chat messages
- `notifications` - User notifications

**Relationships**:
```
User (1) ──── (N) Booking
User (1) ──── (1) Tutor
Booking (1) ──── (1) Review
User (1) ──── (N) KnowledgeBase
KnowledgeBase (1) ──── (N) KnowledgeChunk
User (1) ──── (N) StudyNote
```

## Real-time Collaboration

### Yjs + WebSocket

**Architecture**:
```
Client A                Server                 Client B
   │                      │                       │
   │──── Yjs Update ────►│                       │
   │                      │──── Yjs Update ─────►│
   │                      │                       │
   │                      │◄──── Yjs Update ─────│
   │◄──── Yjs Update ────│                       │
```

**Room Isolation**:
- Each session has unique room ID
- Messages only broadcast within same room
- Automatic cleanup when room empty

**CRDT Algorithm**:
- Yjs uses CRDT (Conflict-free Replicated Data Type)
- Guarantees eventual consistency
- No need for operational transformation

## AI Integration

### Multi-Provider Architecture

```
AIService (Facade)
    │
    ├── GeminiProvider
    │   ├── gemini-2.5-flash (default)
    │   ├── gemini-2.5-pro (thinking mode)
    │   └── gemini-2.5-flash (vision)
    │
    └── OpenAIProvider
        ├── gpt-4o (default)
        └── gpt-4o-mini (fallback)
```

### Deep Think Mode

Uses chain-of-thought prompting:

1. System prompt includes "Think step-by-step"
2. Model generates `**Thinking:**` section
3. Model generates `**Answer:**` section
4. Frontend parses and displays separately

### RAG Pipeline

```
User Query
    │
    ├─► Keyword Extraction
    │
    ├─► MongoDB Text Search
    │       │
    │       └─► Retrieve Relevant Chunks
    │
    ├─► Context Assembly (Top 5 chunks)
    │
    └─► AI Generation (Gemini + Context)
            │
            └─► Answer + Source Citations
```

## Security

### Authentication Flow

```
1. User registers/logs in
2. Server validates credentials
3. Server generates JWT token (expires in 30 days)
4. Client stores token in localStorage
5. Client sends token in Authorization header
6. Server validates token with middleware
7. Request proceeds to controller
```

### Data Protection

- Passwords hashed with bcrypt (10 rounds)
- JWT signed with secret key
- MongoDB connection uses TLS
- API keys stored in environment variables (never committed)
- File uploads validated for type and size

### Access Control

**Document Visibility**:
- `private`: Only owner can access
- `subject`: Users in same subject can view
- `public`: Everyone can access

**Booking Access**:
- Students see their bookings
- Tutors see bookings assigned to them
- Only participants can start/complete sessions

## Performance Optimizations

### Frontend

- Code splitting with React.lazy
- Image lazy loading
- Virtual scrolling for long lists
- Debounced search inputs
- Memoized components with React.memo

### Backend

- MongoDB indexing on frequent query fields
- Connection pooling
- Caching of AI provider status
- Async/await for I/O operations
- Batch processing for file uploads

### WebSocket

- Binary message passthrough (avoid JSON parsing for Yjs)
- Heartbeat to detect dead connections
- Automatic room cleanup

## Scalability Considerations

**Horizontal Scaling**:
- Stateless API servers (can run multiple instances)
- JWT tokens enable distributed authentication
- MongoDB supports sharding for large datasets

**WebSocket Scaling**:
- Current: Single server, in-memory room management
- Future: Redis pub/sub for multi-server WebSocket

**File Storage**:
- Current: Local filesystem (`uploads/`)
- Future: S3-compatible object storage (AWS S3, Cloudflare R2)

**AI Service**:
- Provider abstraction allows easy switching
- Can implement request queuing for rate limiting
- Can add caching for repeated queries

## Data Flow Examples

### Example 1: Upload Document to Knowledge Base

```
1. User selects file in KnowledgeBaseUpload.jsx
2. Frontend: POST /api/knowledge-base with multipart/form-data
3. Backend: Multer saves file to uploads/
4. Backend: Creates KnowledgeBase document (status: pending)
5. Backend: Returns document to frontend
6. Frontend: Polls /api/knowledge-base/:id for status updates
7. Backend (async): DocumentProcessor extracts text
8. Backend: Updates status to "processing", progress: 30%
9. Backend: Generates chunks, creates KnowledgeChunk documents
10. Backend: Updates status to "completed", progress: 100%
11. Frontend: Detects completion, shows "Ready" badge
```

### Example 2: RAG Query in AI Chat

```
1. User selects documents in AIChat.jsx (Knowledge Base mode)
2. User types question
3. Frontend: POST /api/rag/query { question, documentIds }
4. Backend: RAGService.query()
5. Backend: MongoDB text search on selected documents' chunks
6. Backend: Retrieve top 5 relevant chunks
7. Backend: Assemble context from chunks
8. Backend: Call Gemini API with context + question
9. Backend: Parse answer and extract sources
10. Backend: Return { answer, sources }
11. Frontend: Display answer with source citations
```

## Monitoring and Logging

### Backend Logging

Console output includes:
- `[Server]` - Server lifecycle events
- `[DB]` - Database connection events
- `[AI]` - AI service events
- `[WebSocket]` - WebSocket connection events
- `[Backend AIService]` - AI provider messages

### Health Check

```
GET /api/health
Response: {
  "status": "healthy" | "unhealthy",
  "mongodb": "connected" | "disconnected",
  "ai": "initialized" | "unavailable",
  "aiProvider": "gemini" | "openai" | "none"
}
```

## Technology Decisions

### Why Yjs?

- CRDT algorithm ensures consistency without central server
- Built-in awareness (user cursors, selections)
- Multiple editor bindings (Monaco, CodeMirror, Quill)
- Efficient binary encoding

### Why Jitsi Meet?

- Open-source, free to use
- No server setup required (uses public infrastructure)
- Full-featured (audio, video, screen share, chat)
- Embeddable via iframe

### Why Gemini over OpenAI?

- Lower cost per token
- Generous free tier
- Native vision capabilities
- Thinking mode support (experimental)

### Why MongoDB?

- Flexible schema for evolving document structures
- Built-in full-text search
- Geospatial queries (future feature)
- Aggregation pipeline for complex queries
- Atlas cloud service with free tier
