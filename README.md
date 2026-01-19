# Tu2tor

A full-stack online tutoring platform built with the MERN stack.

## Overview

Tu2tor connects students with tutors for real-time learning sessions featuring video conferencing, collaborative code editing, and AI-powered assistance.

## Key Features

- Smart tutor matching based on subject, rating, and availability
- Real-time video meetings with Jitsi Meet integration
- Collaborative code editor with Python sandbox
- Markdown note-taking with real-time sync
- AI-powered chat with deep thinking mode
- Knowledge base with RAG-enhanced Q&A
- Document processing with OCR support

## Tech Stack

**Frontend**: React 18, Vite, Tailwind CSS, Framer Motion  
**Backend**: Node.js, Express, MongoDB, Mongoose  
**Real-time**: WebSocket (ws), Yjs (CRDT), y-websocket  
**AI**: Google Gemini API, OpenAI API  
**Video**: Jitsi Meet (iframe)  
**Code Editor**: Monaco Editor  
**Deployment**: Render.com, MongoDB Atlas

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Gemini API key (recommended) or OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/yorhagengyue/FullStack.git
cd FullStack

# Install frontend dependencies
cd Tu2tor
npm install

# Install backend dependencies
cd server
npm install
```

### Configuration

Create `.env` files:

**Frontend** (`Tu2tor/.env.local`):
```
VITE_API_BASE_URL=/api
VITE_WS_URL=ws://localhost:5000
VITE_JITSI_DOMAIN=meet.jit.si
```

**Backend** (`Tu2tor/server/.env`):
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Run Locally

```bash
# Start both frontend and backend concurrently
cd Tu2tor
npm run dev
```

Frontend: `http://localhost:5174`  
Backend: `http://localhost:5000`

## Project Structure

```
Tu2tor/
├── src/                  # Frontend source code
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── context/         # React Context providers
│   ├── services/        # API clients
│   └── utils/           # Helper functions
│
└── server/              # Backend source code
    ├── src/
    │   ├── controllers/ # Request handlers
    │   ├── models/      # Mongoose schemas
    │   ├── routes/      # API routes
    │   ├── services/    # Business logic
    │   ├── middleware/  # Custom middleware
    │   └── ai/          # AI service layer
    └── tests/           # Test files
```

## Documentation

- [Setup Guide](./SETUP.md) - Detailed installation and configuration
- [API Reference](./API.md) - Complete API documentation
- [Architecture](./ARCHITECTURE.md) - System design and data flow
- [RAG System](./RAG.md) - Retrieval-Augmented Generation implementation

## Testing

**Frontend**:
```bash
cd Tu2tor
npm test
npm run test:coverage
```

**Backend**:
```bash
cd Tu2tor/server
npm test
npm run test:coverage
```

## Deployment

The application is configured for deployment on Render.com. See `render.yaml` for configuration details.

## License

MIT License

## Contributors

Developed by GengYue as part of CIT2C20 Full-Stack Web Development coursework (2025-2026).

## Support

For issues and questions, please open an issue on GitHub.
