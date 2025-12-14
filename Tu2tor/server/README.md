# Tu2tor Backend API

Backend server for Tu2tor tutoring platform built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 7.0

## Quick Start

### 1. Install Dependencies

From the project root:
```bash
cd Tu2tor
npm run install:all
```

Or install backend only:
```bash
cd Tu2tor/server
npm install
```

### 2. Configure Environment Variables

Create `.env` file in `Tu2tor/server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# Database
MONGODB_URI=mongodb://localhost:27017/tu2tor

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# AI - Google Gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_THINKING_MODEL=gemini-2.5-pro
GEMINI_VISION_MODEL=gemini-2.5-flash

# Knowledge Base
KB_MAX_CONCURRENT=5
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Server
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb

# Start MongoDB
# Windows: Service starts automatically
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Recommended)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get connection string: Connect > Connect your application
4. Update `MONGODB_URI` in `.env`

### 4. Start the Server

```bash
# From Tu2tor/server directory
npm run dev
```

Server runs on http://localhost:5000

## API Endpoints

See [API_DOCUMENTATION.md](../../API_DOCUMENTATION.md) for complete API reference.

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Available Routes

**Authentication**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

**Tutors**
- GET `/api/tutors` - Search tutors
- GET `/api/tutors/:id` - Get tutor details
- POST `/api/tutors` - Create tutor profile

**Bookings**
- GET `/api/bookings` - Get user bookings
- POST `/api/bookings` - Create booking
- POST `/api/bookings/:id/start` - Start session
- POST `/api/bookings/:id/complete` - Complete session

**AI Services**
- POST `/api/ai/chat` - Stream AI chat
- POST `/api/ai/generate` - Generate content
- POST `/api/ai/detect-subject` - Detect subject
- POST `/api/ai/generate-note` - Generate study note

**Knowledge Base**
- POST `/api/knowledge-base` - Upload document
- GET `/api/knowledge-base` - List documents
- GET `/api/knowledge-base/search` - Search documents

**RAG**
- POST `/api/rag/query` - RAG-powered Q&A

**Study Notes**
- GET `/api/study-notes` - List notes
- POST `/api/study-notes` - Create note
- POST `/api/study-notes/create-restructured` - AI restructure

**Messages**
- GET `/api/messages/contacts` - Get contacts
- POST `/api/messages` - Send message

**Reviews**
- GET `/api/reviews/tutor/:tutorId` - Get tutor reviews
- POST `/api/reviews` - Create review

**Todos**
- GET `/api/todos` - Get todos
- POST `/api/todos` - Create todo

**Code Execution**
- POST `/api/code/execute` - Execute code in sandbox

## Project Structure

```
server/
├── src/
│   ├── ai/                      # AI Services
│   │   ├── providers/           # AI provider implementations
│   │   │   ├── BaseAIProvider.js
│   │   │   ├── GeminiProvider.js
│   │   │   └── OpenAIProvider.js
│   │   ├── services/            # AI business logic
│   │   │   ├── AIService.js
│   │   │   └── NotesIntelligenceService.js
│   │   ├── middleware/          # AI-specific middleware
│   │   │   ├── rateLimit.js
│   │   │   └── costTracking.js
│   │   └── utils/
│   │       └── promptTemplates.js
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/             # Route controllers
│   │   ├── authController.js
│   │   ├── tutorController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   ├── messageController.js
│   │   ├── studyNoteController.js
│   │   ├── todoController.js
│   │   ├── aiController.js
│   │   ├── knowledgeBaseController.js
│   │   └── ragController.js
│   ├── models/                  # Mongoose models
│   │   ├── User.js
│   │   ├── Tutor.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   ├── Message.js
│   │   ├── StudyNote.js
│   │   ├── Todo.js
│   │   ├── Notification.js
│   │   └── KnowledgeBase.js
│   ├── routes/                  # Express routes
│   │   ├── authRoutes.js
│   │   ├── tutorRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── studyNoteRoutes.js
│   │   ├── todoRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── knowledgeBaseRoutes.js
│   │   ├── ragRoutes.js
│   │   └── testRoutes.js
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── services/                # Business logic
│   │   ├── codeExecution.js     # Code sandbox
│   │   ├── documentProcessor.js # OCR & parsing
│   │   └── ragService.js        # RAG system
│   ├── scripts/
│   │   ├── seed.js              # Database seeding
│   │   └── migrateReviewTutorIds.js
│   └── server.js                # Entry point
├── uploads/
│   └── knowledge-base/          # Uploaded documents
├── .env                         # Environment variables
├── package.json
└── README.md
```

## Database Models

### Core Models

**User** - User accounts and authentication
- email, password, username, studentId
- role (student/tutor), credits, points, badges

**Tutor** - Tutor profiles
- subjects, availability, ratings
- totalSessions, averageRating, responseRate

**Booking** - Tutoring sessions
- studentId, tutorId, subject, sessionDate
- status (pending/confirmed/completed/cancelled)

**Review** - Student reviews
- rating (1-5), comment, tags
- isAnonymous, isVerified, helpfulCount

**StudyNote** - Learning notes
- content, subject, tags, sources
- restructured (AI-powered), originalMessages

**KnowledgeBase** - Uploaded documents
- file, extractedText, subject, tags
- processStatus, pageCount, wordCount

**Message** - User messaging
- senderId, receiverId, content
- isRead, timestamp

**Todo** - Task management
- task, dueDate, priority, completed
- relatedBooking

**Notification** - System notifications
- userId, type, content, isRead
- actionUrl, createdAt

## Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Role-based access control

### Real-time Features
- WebSocket server for collaboration
- Yjs CRDT for conflict-free editing
- Live code collaboration
- Markdown collaborative notes

### AI Integration
- Google Gemini AI (2.5 Flash & Pro)
- Streaming responses (SSE)
- Multi-modal support (text + images)
- Rate limiting and cost tracking

### Knowledge Base & RAG
- Document upload (PDF, PPTX, DOCX, Images)
- OCR text extraction (Tesseract.js)
- MongoDB full-text search
- AI-enhanced retrieval

### Code Execution
- Sandboxed Python execution
- JavaScript execution (Node.js)
- Syntax error handling
- Output capture

## Security Features

- CORS configuration
- Input validation (Mongoose schemas)
- Rate limiting for AI endpoints
- File upload validation
- JWT token expiration
- Password strength requirements

## Development Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Migrate review tutor IDs
npm run migrate:reviews
```

## Testing

### Health Check
```bash
# Check server status
curl http://localhost:5000/

# Check database connection
curl http://localhost:5000/api/health
```

### Create Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tp.edu.sg",
    "password": "Test123!",
    "username": "Test User",
    "studentId": "1234567D",
    "major": "Computer Science",
    "yearOfStudy": 2
  }'
```

## Troubleshooting

### MongoDB Connection Error
1. Ensure MongoDB is running
2. Check connection string in `.env`
3. For Atlas: whitelist IP address
4. Verify database user permissions

### Port Already in Use
Change PORT in `.env` to another port (e.g., 5001)

### AI Service Error
1. Verify `GEMINI_API_KEY` in `.env`
2. Check API quota and limits
3. Review backend logs for details

### File Upload Error
1. Check file size (<50MB)
2. Verify file type is supported
3. Ensure `uploads/` directory exists

## Performance Tips

1. **Database Indexing**
   - Indexes already configured on models
   - Add custom indexes as needed

2. **Connection Pooling**
   - MongoDB uses connection pooling by default
   - Adjust `maxPoolSize` if needed

3. **Rate Limiting**
   - AI endpoints: 20 req/min
   - General endpoints: 100 req/15min
   - Adjust in middleware as needed

4. **Caching**
   - Consider Redis for session storage
   - Cache frequently accessed data

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 5000 | Server port |
| NODE_ENV | No | development | Environment |
| FRONTEND_URL | Yes | - | Frontend URL for CORS |
| MONGODB_URI | Yes | - | MongoDB connection string |
| JWT_SECRET | Yes | - | JWT signing secret |
| JWT_EXPIRE | No | 30d | JWT expiration time |
| GEMINI_API_KEY | Yes | - | Google Gemini API key |
| GEMINI_MODEL | No | gemini-2.5-flash | Default model |
| GEMINI_THINKING_MODEL | No | gemini-2.5-pro | Deep thinking model |
| KB_MAX_CONCURRENT | No | 5 | Max concurrent KB processing |

## Support

For issues and questions:
- See main [README.md](../../README.md)
- Check [API_DOCUMENTATION.md](../../API_DOCUMENTATION.md)
- Review code comments and examples

---

**Last Updated:** December 14, 2025
