# Setup Guide

Detailed installation and configuration instructions for Tu2tor platform.

## System Requirements

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MongoDB 6.0 or higher (or MongoDB Atlas account)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/yorhagengyue/FullStack.git
cd "FullStack/TP year2.2/Full stack"
```

### 2. Frontend Setup

```bash
cd Tu2tor
npm install
```

Install includes:
- React, React Router, React DOM
- Vite (build tool)
- Tailwind CSS
- Framer Motion
- Monaco Editor
- Yjs, y-websocket
- ReactMarkdown
- Axios

### 3. Backend Setup

```bash
cd Tu2tor/server
npm install
```

Install includes:
- Express
- Mongoose
- jsonwebtoken
- bcryptjs
- Multer
- ws (WebSocket)
- @google/generative-ai
- pdf-parse, mammoth, officeparser
- tesseract.js
- python-shell

### 4. Environment Configuration

#### Frontend Environment

Create `Tu2tor/.env.local`:

```bash
# API Configuration
VITE_API_BASE_URL=/api
VITE_WS_URL=ws://localhost:5000

# Jitsi Configuration
VITE_JITSI_DOMAIN=meet.jit.si

# App Configuration
VITE_APP_NAME=Tu2tor
```

#### Backend Environment

Create `Tu2tor/server/.env`:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tu2tor?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_THINKING_MODEL=gemini-2.5-pro
GEMINI_VISION_MODEL=gemini-2.5-flash

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5174

# Knowledge Base
KB_MAX_CONCURRENT=3
```

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist your IP address
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### Option 2: Local MongoDB

```bash
# Install MongoDB Community Edition
# Then start service
mongod --dbpath /path/to/data

# Update MONGODB_URI
MONGODB_URI=mongodb://localhost:27017/tu2tor
```

## API Keys

### Gemini API (Google AI Studio)

1. Visit https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy to `GEMINI_API_KEY` in `.env`

### OpenAI API (Optional)

1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy to `OPENAI_API_KEY` in `.env`

## Running the Application

### Development Mode

**Concurrent mode** (recommended):
```bash
cd Tu2tor
npm run dev
```

This starts both frontend (port 5174) and backend (port 5000).

**Separate terminals**:

Terminal 1 (Frontend):
```bash
cd Tu2tor
npm run client
```

Terminal 2 (Backend):
```bash
cd Tu2tor
npm run server
```

### Production Mode

```bash
# Build frontend
cd Tu2tor
npm run build

# Start backend
cd server
npm start
```

## Verification

### Check Frontend

Open browser: `http://localhost:5174`

You should see the Tu2tor landing page.

### Check Backend

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "ai": "initialized",
  "aiProvider": "gemini"
}
```

### Check WebSocket

WebSocket server runs on the same port as backend (5000). Yjs connections will be established automatically when you open collaborative editors.

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Change port in .env
PORT=5001
```

### MongoDB Connection Failed

- Check connection string format
- Verify database user credentials
- Ensure IP whitelist includes your address
- Check network/firewall settings

### AI Service Not Initialized

- Verify API key is correct and active
- Check API key has sufficient quota
- Review backend console logs for detailed errors

### Monaco Editor Worker Errors

Already handled in `CodeCollabEditor.jsx` with custom worker configuration. If issues persist, check browser console for specific errors.

## Next Steps

- See [API.md](./API.md) for API endpoint documentation
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See `render.yaml` for production deployment configuration
