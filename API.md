# API Reference

Complete API documentation for Tu2tor platform.

Base URL: `http://localhost:5000/api` (development) or `https://tu2tor-backend.onrender.com/api` (production)

## Authentication

All authenticated endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Auth Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

**Register**:
```json
POST /api/auth/register
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "student" | "tutor",
  "school": "string"
}
```

**Login**:
```json
POST /api/auth/login
{
  "email": "string",
  "password": "string"
}
Response: {
  "token": "jwt_token",
  "user": { ... }
}
```

## Tutors

```
GET    /api/tutors
POST   /api/tutors
GET    /api/tutors/:id
PUT    /api/tutors/:id
DELETE /api/tutors/:id
GET    /api/tutors/search?subject=Math&minRating=4
```

**Create Tutor Profile**:
```json
POST /api/tutors
{
  "subjects": ["Math", "Physics"],
  "hourlyRate": 50,
  "bio": "string",
  "expertise": ["Calculus", "Algebra"]
}
```

## Bookings

```
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id
POST   /api/bookings/:id/start
POST   /api/bookings/:id/complete
```

**Create Booking**:
```json
POST /api/bookings
{
  "tutorId": "string",
  "subject": "string",
  "date": "ISO8601",
  "timeSlot": "09:00-10:00",
  "duration": 60,
  "location": "Online"
}
```

**Start Session**:
```json
POST /api/bookings/:id/start
Response: {
  "success": true,
  "booking": { actualStartTime: "ISO8601", ... }
}
```

## AI Services

### Chat

```
POST /api/ai/chat
```

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "string" },
    { "role": "assistant", "content": "string" }
  ],
  "options": {
    "thinkingMode": false,
    "temperature": 0.7,
    "maxTokens": 2000,
    "enableGrounding": false
  }
}
```

**Response**: Server-Sent Events (SSE) stream

### Other AI Endpoints

```
POST /api/ai/generate
POST /api/ai/detect-subject
POST /api/ai/generate-note
GET  /api/ai/providers
POST /api/ai/providers/switch
GET  /api/ai/usage
GET  /api/ai/health
```

## Knowledge Base

### Document Management

```
POST   /api/knowledge-base              # Upload document
GET    /api/knowledge-base              # List documents
GET    /api/knowledge-base/:id          # Get document
PUT    /api/knowledge-base/:id          # Update metadata
DELETE /api/knowledge-base/:id          # Delete document
```

**Upload Document**:
```
POST /api/knowledge-base
Content-Type: multipart/form-data

Form Data:
- file: <binary>
- subjectId: string
- title: string
- metadata: JSON {
    description: string,
    tags: string[],
    visibility: "private" | "public"
  }
```

**Response**:
```json
{
  "success": true,
  "document": {
    "_id": "string",
    "title": "string",
    "type": "pdf" | "pptx" | "docx" | "image",
    "processingStatus": {
      "status": "pending" | "processing" | "completed" | "failed",
      "progress": 0-100,
      "currentStep": "string"
    }
  }
}
```

### Document Content

```
GET /api/knowledge-base/:id/content?page=1&pageSize=10&includeFullText=false
```

### Document Chunks

```
GET /api/knowledge-base/:id/chunks
Response: {
  "chunks": [
    {
      "_id": "string",
      "content": "string",
      "metadata": {
        "chunkIndex": number,
        "tokenCount": number,
        "charCount": number,
        "chunkType": "semantic" | "paragraph" | "section",
        "summary": "string"
      }
    }
  ],
  "stats": {
    "totalChunks": number,
    "avgTokens": number,
    "totalTokens": number
  }
}
```

### Search

```
GET /api/knowledge-base/search?q=query&subjectId=...&tags=tag1,tag2
```

## RAG (Retrieval-Augmented Generation)

```
POST /api/rag/query
```

**Request**:
```json
{
  "question": "string",
  "documentIds": ["id1", "id2"],  // optional
  "subjectId": "string"           // optional
}
```

**Response**:
```json
{
  "success": true,
  "answer": "string",
  "sources": [
    {
      "docId": "string",
      "title": "string",
      "pageNumber": number,
      "chunkId": "string",
      "similarity": number
    }
  ]
}
```

## Study Notes

```
GET    /api/study-notes
POST   /api/study-notes
GET    /api/study-notes/:id
PUT    /api/study-notes/:id
DELETE /api/study-notes/:id
POST   /api/study-notes/restructure
```

**Restructure Note**:
```json
POST /api/study-notes/restructure
{
  "messages": [...],
  "subject": "string",
  "intensity": "low" | "medium" | "high",
  "sources": [...] // optional
}
```

## Code Execution

```
POST /api/code/execute
```

**Request**:
```json
{
  "language": "python" | "javascript",
  "code": "string"
}
```

**Response**:
```json
{
  "output": "string",
  "error": "string" // if any
}
```

## WebSocket

WebSocket server runs on the same port as HTTP server.

**Connection URLs**:
- Local: `ws://localhost:5000/<room-id>`
- Production: `wss://tu2tor-backend.onrender.com/<room-id>`

**Room Naming**:
- Code Editor: `code-session-<bookingId>`
- Markdown Editor: `markdown-session-<bookingId>`

Messages are automatically relayed to all clients in the same room. Yjs handles the synchronization protocol.

## Rate Limits

- AI Chat: 10 requests/minute per user
- File Upload: 5 files/minute per user
- RAG Query: 20 requests/minute per user

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `413`: Payload Too Large (>10MB)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Pagination

Endpoints supporting pagination use these query parameters:

```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## File Upload Limits

- **Max file size**: 50MB
- **Supported formats**:
  - Documents: PDF, PPTX, DOCX
  - Images: JPG, JPEG, PNG
- **Body size limit**: 10MB (for JSON payloads)

## WebSocket Events

While the WebSocket server primarily handles Yjs binary messages, you can also send JSON control messages for custom logic:

```javascript
// Example: Authentication message
ws.send(JSON.stringify({
  type: 'auth',
  userId: 'user_id',
  username: 'username'
}));
```

Server will relay messages to other clients in the same room.
