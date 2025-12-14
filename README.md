# Tu2tor - Peer-to-Peer Tutor Finder Platform
## Full-Stack Web Development Project

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)](https://www.mongodb.com/mern-stack)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/react-19.1.1-blue)](https://reactjs.org)

---

## Project Information

- **App Name:** Tu2tor
- **Course:** CIT2C20 Full Stack Web Development
- **Semester:** AY2025/2026 October
- **Project Type:** Individual Project
- **Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js)

---

## Project Overview

**Tu2tor** - A campus peer-to-peer tutoring platform where students can both teach and learn. The name "Tu2tor" cleverly uses "2" to represent "two-way" learning, embodying the core concept of peer-to-peer education where every student can be both a tutor and a tutee.

### Core Value Proposition

Tu2tor connects students seeking academic help with peer tutors willing to share knowledge, creating a convenient, trustworthy, and efficient campus learning platform. The platform uses a virtual Credit system to encourage mutual learning - students earn Credits by helping others, which can then be used to book tutoring sessions.

---

## Key Features

### 1. User System & Authentication
- **JWT-based Authentication** - Secure token-based auth
- **School Email Verification** - Campus-only access
- **Profile Management** - Avatar, skills, expertise tags
- **Dual Role System** - Both student and tutor roles

### 2. Intelligent Tutor Search
- **Multi-dimensional Filtering** - Subject, rating, availability
- **Dynamic Weight Ranking Algorithm** - Personalized matching
- **Explainable Recommendations** - Visual reason chips
- **User Preference Learning** - Feedback-based optimization

### 3. Booking Management
- **Calendar Visualization** - Interactive schedule view
- **One-click Booking** - Simplified reservation process
- **Status Workflow** - pending → confirmed → completed
- **Automatic Reminders** - Email/notification system

### 4. Review System
- **5-Star Rating + Comments** - Comprehensive feedback
- **Anonymous Reviews** - Privacy protection
- **72-Hour Retraction** - Edit/delete window
- **Tag Extraction** - AI-powered categorization

### 5. Credit & Gamification
- **Virtual Credit Economy** - Earn by tutoring, spend on learning
- **Badge Achievement System** - Milestone rewards
- **Leaderboard** - Top tutor rankings
- **Transaction History** - Complete credit tracking

### 6. Real-time Session Room
- **Jitsi Meet Integration** - HD video conferencing
- **Collaborative Code Editor** - Monaco + Yjs sync
  - Python sandbox execution
  - Syntax highlighting
  - Multi-user real-time editing
- **Markdown Collaborative Notes** - Yjs-powered
  - Edit/Split/Preview modes
  - Real-time synchronization
  - Export functionality
- **Floating Video Window** - Minimize/maximize support
- **Smart Layout Switching** - Auto-adjust for editors

### 7. AI Assistant System
- **Gemini AI Integration**
  - gemini-2.5-flash (Regular chat)
  - gemini-2.5-pro (Deep thinking mode)
- **Streaming Responses** - SSE-based real-time output
- **Image Understanding** - Multi-modal support
- **Subject Detection** - Auto-categorization
- **Note Generation** - AI-powered summarization
- **Tutor Recommendations** - AI-enhanced matching

### 8. Knowledge Base System (RAG)
- **Document Upload** - PDF, PPTX, DOCX, Images
- **OCR Text Extraction** - Tesseract.js powered
- **MongoDB Full-text Search** - Fast retrieval
- **AI-enhanced Retrieval** - Context-aware results
- **Subject Classification** - Organized by topics

### 9. Learning Tools
- **Todo List** - Task management with session tracking
- **Study Notes** - AI-powered restructuring
  - Tag-based organization
  - Full-text search
  - Version comparison
- **Calendar View** - Activity tracking
- **Messaging System** - Real-time notifications

---

## Technical Architecture

### Tech Stack

#### Frontend
```json
{
  "framework": "React 19.1.1 + Vite 7.1.7",
  "styling": "Tailwind CSS 4.1.16",
  "animations": "Framer Motion 12.23 + GSAP 3.13",
  "editor": "Monaco Editor 0.54",
  "markdown": "React Markdown 10.1 + Remark GFM",
  "collaboration": "Yjs 13.6 + Y-WebSocket 3.0",
  "http": "Axios 1.13",
  "routing": "React Router DOM 7.9"
}
```

#### Backend
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js 4.18",
  "database": "MongoDB 7.0 + Mongoose 8.0",
  "authentication": "JWT 9.0 + bcrypt 2.4",
  "realtime": "WebSocket (ws 8.18)",
  "ai": "Google Gemini AI 0.24",
  "ocr": "Tesseract.js 6.0",
  "documents": "pdf-parse, mammoth, officeparser",
  "code-execution": "python-shell 5.0"
}
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │   Auth   │  │Dashboard │  │  Search  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Sessions │  │ AI Chat  │  │  Notes   │  │Knowledge │   │
│  └──────────┘  └──────────┘  └──────────┘  └─────Base─┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API / WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Tutor   │  │ Booking  │  │  Review  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    AI    │  │   RAG    │  │  Notes   │  │ Messages │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Database                         │
│  Users | Tutors | Bookings | Reviews | Credits | Notes     │
│  KnowledgeBase | Messages | Todos | Notifications          │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  Gemini AI | Jitsi Meet | Email Service | WebSocket        │
└─────────────────────────────────────────────────────────────┘
```

---

## UI/UX Highlights

### Modern Component Library (ReactBits)

21+ premium UI animation components integrated:

- **Aurora** - Stunning aurora background effects
- **SplitText** - Text split animations
- **SpotlightCard** - Interactive spotlight cards
- **ScrollVelocity** - Smooth scroll animations
- **ShuffleText** - Text shuffle effects
- **PillNav** - Pill-style navigation
- **GooeyNav** - Gooey navigation effect
- **RotatingText** - Rotating text animations
- **Particles** - Particle effects
- **CountUp** - Animated counters
- **Magnet** - Magnetic hover effects
- **ShinyText** - Shiny text effects
- **And more...**

### Design Principles

- **Dark Theme** - Modern dark mode interface
- **Purple/Blue Palette** - Consistent color scheme
- **Responsive Design** - Mobile-first approach
- **Framer Motion** - Smooth micro-interactions
- **GSAP Animations** - Advanced motion graphics

---

## Data Models

### Core Database Schemas

1. **User** - Basic user information and authentication
   - email, password, username, studentId, role, credits, points, badges

2. **TutorProfile** - Detailed tutor information
   - bio, subjects, availability, stats, ratings, languages

3. **Booking** - Tutoring session bookings
   - studentId, tutorId, subject, time, location, status

4. **Review** - Student reviews and ratings
   - rating, comment, tags, helpfulCount, response

5. **Subject** - Subject/course information
   - name, code, category, level, tutorCount

6. **CreditTransaction** - Credit transaction history
   - userId, amount, type, balance, description

7. **StudyNote** - Learning notes and materials
   - content, subject, tags, sources, restructured versions

8. **Todo** - Task management
   - task, dueDate, priority, completed, relatedBooking

9. **KnowledgeBase** - Uploaded documents
   - file, extractedText, subject, tags, processStatus

10. **Message** - User messaging
    - sender, receiver, content, read, timestamp

11. **Notification** - System notifications
    - user, type, content, read, actionUrl

---

## Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
MongoDB >= 7.0
npm or yarn
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Full stack"
```

2. **Install dependencies**
```bash
cd Tu2tor
npm run install:all
```

3. **Environment Setup**

Create `.env` files:

**Frontend (`Tu2tor/.env.local`)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

**Backend (`Tu2tor/server/.env`)**
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# Database
MONGODB_URI=mongodb://localhost:27017/tu2tor

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# AI - Gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_THINKING_MODEL=gemini-2.5-pro
GEMINI_VISION_MODEL=gemini-2.5-flash

# Knowledge Base
KB_MAX_CONCURRENT=5
```

4. **Start Development Servers**
```bash
# Start both frontend and backend
npm run dev

# Or separately:
# Frontend (in Tu2tor/)
npm run client

# Backend (in Tu2tor/)
npm run server
```

5. **Access the Application**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Reference

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Tutors
- `GET /api/tutors` - Search tutors (with filters)
- `GET /api/tutors/:id` - Get tutor details
- `POST /api/tutors` - Create tutor profile

#### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `POST /api/bookings/:id/start` - Start session
- `POST /api/bookings/:id/complete` - Complete session

#### AI
- `POST /api/ai/chat` - Stream AI chat
- `POST /api/ai/generate` - Generate content
- `POST /api/ai/detect-subject` - Detect subject
- `POST /api/ai/generate-note` - Generate study note

#### Knowledge Base
- `POST /api/knowledge-base` - Upload document
- `GET /api/knowledge-base` - List documents
- `GET /api/knowledge-base/search` - Search documents
- `POST /api/rag/query` - RAG-powered Q&A

#### Study Notes
- `GET /api/study-notes` - List notes
- `POST /api/study-notes` - Create note
- `POST /api/study-notes/create-restructured` - AI restructure
- `GET /api/study-notes/:id/compare` - Compare versions

---

## Testing

### Run Tests
```bash
# Backend tests
cd Tu2tor/server
npm test

# Frontend tests
cd Tu2tor
npm test
```

### Seed Database
```bash
cd Tu2tor/server
npm run seed
```

---

## Project Structure

```
Full stack/
├── Tu2tor/                          # Frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── ai/                  # AI-related components
│   │   │   ├── session/             # Session room components
│   │   │   ├── reactbits/           # Premium UI components
│   │   │   └── ...
│   │   ├── pages/                   # Page components
│   │   │   ├── Auth/                # Login/Register
│   │   │   ├── Dashboard/           # User dashboard
│   │   │   ├── Search/              # Tutor search
│   │   │   ├── Sessions/            # Video sessions
│   │   │   ├── AIChat/              # AI assistant
│   │   │   └── ...
│   │   ├── context/                 # React contexts
│   │   ├── services/                # API services
│   │   └── utils/                   # Utilities
│   ├── server/                      # Backend
│   │   └── src/
│   │       ├── controllers/         # Route controllers
│   │       ├── models/              # Mongoose models
│   │       ├── routes/              # Express routes
│   │       ├── middleware/          # Custom middleware
│   │       ├── ai/                  # AI service
│   │       │   ├── providers/       # AI providers
│   │       │   ├── services/        # AI services
│   │       │   └── middleware/      # AI middleware
│   │       ├── services/            # Business logic
│   │       ├── config/              # Configuration
│   │       └── server.js            # Entry point
│   ├── package.json
│   └── vite.config.js
├── archived_docs/                   # Archived documentation
├── README.md                        # This file
├── API_DOCUMENTATION.md             # API reference
└── Tu2tor_Project_Requirements.md   # Project requirements
```

---

## Key Technical Implementations

### 1. Intelligent Matching Algorithm

**Dynamic Weight Ranking System**
- Time overlap (40%)
- Rating quality (30%)
- Response speed (20%)
- Same school preference (10%)

**User Preference Learning**
- Adjustable weight sliders
- Negative feedback tracking
- Automatic weight optimization

### 2. Real-time Collaboration (Yjs CRDT)

**Code Editor**
```javascript
// Y.js document synchronization
const ydoc = new Y.Doc();
const ytext = ydoc.getText('monaco');
const provider = new WebsocketProvider('ws://localhost:5000', roomName, ydoc);
```

**Markdown Editor**
- Real-time multi-user editing
- Conflict-free synchronization
- User awareness (cursor positions)

### 3. AI Integration Strategy

**Model Selection**
```javascript
// Regular chat & image understanding
gemini-2.5-flash (fast, efficient)

// Deep thinking mode
gemini-2.5-pro (advanced reasoning)

// Automatic switching based on context
if (hasImages && deepThinking) {
  model = gemini-2.5-pro-vision
}
```

### 4. RAG (Retrieval-Augmented Generation)

**Document Processing Pipeline**
```
Upload → File Type Detection → Text Extraction (OCR/Parser)
→ MongoDB Storage → Full-text Indexing → AI Enhancement
```

**Query Flow**
```
User Query → MongoDB Search → Relevant Docs → Gemini AI
→ Context-aware Answer + Sources
```

---

## Project Milestones

### Part 1: Project Proposal (20%) - Week 5
**Deadline:** November 17, 2024

- Problem definition and requirements
- Project objectives
- 8 core features specification
- 3 wireframes
- 5 data models
- PPT presentation

### Part 2: MVP Prototype (45%) - Week 12
**Deadline:** January 5, 2026

- User authentication (frontend)
- Profile management
- **Intelligent tutor search**
- Tutor detail page
- Basic booking system
- Credit system UI
- Review system (frontend)
- Responsive design

### Part 3: Full Application (35%) - Week 16
**Deadline:** February 2, 2026

- Complete backend API
- MongoDB integration
- JWT authentication
- All 8 features fully implemented
- **Real-time collaboration**
- **AI assistant system**
- **Knowledge base (RAG)**
- Credit transaction system
- Badge achievement system

---

## Unique Selling Points

### 1. Explainable AI Matching
- Every recommendation has clear reasons
- User-adjustable preference weights
- Real-time feedback learning

### 2. Complete Collaboration Suite
- Video + Code + Markdown in one room
- Real-time synchronization
- Conflict-free editing (CRDT)

### 3. AI-Enhanced Learning
- Chat assistant (regular + deep thinking)
- RAG-powered knowledge retrieval
- Intelligent note restructuring

### 4. Gamification System
- Virtual credit economy
- Badge achievement system
- Leaderboard competition

---

## Performance Optimizations

### Frontend
- Code splitting with React.lazy
- Image lazy loading
- Virtualized lists for large data
- Service Worker caching

### Backend
- MongoDB indexing on frequently queried fields
- Connection pooling
- Rate limiting for AI endpoints
- Streaming responses (SSE)

### Real-time
- WebSocket connection pooling
- Message batching
- Efficient CRDT operations

---

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- School email verification
- Rate limiting on AI endpoints
- Input validation and sanitization
- CORS configuration
- Protected routes with middleware
- File upload validation

---

## Contributing

This is an academic project. For collaboration:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Author

**Student Project**
- Course: CIT2C20 Full Stack Web Development
- Institution: Temasek Polytechnic
- Academic Year: 2025/2026

---

## Acknowledgments

- **ReactBits** - Premium UI components
- **Jitsi Meet** - Video conferencing
- **Google Gemini** - AI capabilities
- **Yjs** - Real-time collaboration
- **Monaco Editor** - Code editing
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animation library

---

## Support

For issues and questions:
- Open an issue in the repository
- Check existing documentation
- Review API documentation

---

## Roadmap

### Future Enhancements
- Mobile app (React Native)
- Video recording & playback
- Screen sharing in sessions
- Calendar integration (Google Calendar)
- Payment gateway for premium features
- Advanced analytics dashboard
- Multi-language support
- Whiteboard collaboration
- Study group sessions (3+ users)

---

**Last Updated:** December 14, 2025

**Project Status:** Complete (Part 3 Finished)

---

<p align="center">Made with love using MERN Stack</p>
