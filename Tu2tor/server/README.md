# Tu2tor Backend API

Backend server for Tu2tor tutoring platform built with Node.js, Express, and MongoDB.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation) OR MongoDB Atlas account

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### 3. MongoDB Setup Options

#### Option A: Local MongoDB

1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

3. Your `.env` should have:
```env
MONGODB_URI=mongodb://localhost:27017/tu2tor
```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Get your connection string from "Connect" > "Connect your application"
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tu2tor?retryWrites=true&w=majority
```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on http://localhost:5000

## 🧪 Testing the Connection

Once the server is running, test these endpoints:

### Check Server Status
```bash
curl http://localhost:5000/
```

### Check Database Connection
```bash
curl http://localhost:5000/api/health
```

### Check Database Status (collections count)
```bash
curl http://localhost:5000/api/test/db-status
```

### Create Test User
```bash
curl -X POST http://localhost:5000/api/test/create-test-user
```

### Get All Users
```bash
curl http://localhost:5000/api/test/users
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Tutor.js             # Tutor model
│   │   └── Booking.js           # Booking model
│   ├── routes/
│   │   └── testRoutes.js        # Test routes
│   ├── controllers/             # (to be added)
│   └── server.js                # Main server file
├── .env                         # Environment variables
├── .env.example                 # Environment template
└── package.json
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🗄️ Database Models

### User Model
- username, email, password
- role (student/tutor/admin)
- school, major, yearOfStudy
- credits, badges, profileCompletion

### Tutor Model
- subjects, hourlyRate
- availableSlots, preferredLocations
- ratings, reviews
- totalSessions, completedSessions

### Booking Model
- studentId, tutorId
- subject, date, timeSlot, location
- status (pending/confirmed/completed/cancelled)
- cost, notes

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT authentication (ready to implement)
- CORS configuration
- Input validation with Mongoose schemas

## 📝 Next Steps

1. Implement authentication routes (login, register)
2. Create CRUD operations for tutors
3. Implement booking system
4. Add review and rating system
5. Connect frontend to backend API

## 🐛 Troubleshooting

### MongoDB Connection Error

If you see connection errors:

1. **Local MongoDB**: Ensure MongoDB service is running
   ```bash
   # Windows: Check Services app
   # Mac: brew services list
   # Linux: systemctl status mongod
   ```

2. **MongoDB Atlas**:
   - Check your connection string
   - Whitelist your IP address in Atlas dashboard
   - Ensure database user has correct permissions

### Port Already in Use

If port 5000 is busy, change PORT in `.env`:
```env
PORT=5001
```

## 📞 Support

For issues or questions, please create an issue in the repository.
