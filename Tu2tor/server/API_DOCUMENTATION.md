# Tu2tor Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Routes (`/api/auth`)

### 1. Register New User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "alice_student",
  "email": "alice@tp.edu.sg",
  "password": "password123",
  "role": "student",
  "school": "Temasek Polytechnic",
  "major": "Information Technology",
  "yearOfStudy": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "alice_student",
    "email": "alice@tp.edu.sg",
    "role": "student",
    "school": "Temasek Polytechnic",
    "major": "Information Technology",
    "yearOfStudy": 2,
    "credits": 100,
    "profileCompletion": 50
  }
}
```

### 2. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "alice@tp.edu.sg",
  "password": "password123"
}
```

**Response:** Same as register

### 3. Get Current User
**GET** `/api/auth/me`

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "alice_student",
    "email": "alice@tp.edu.sg",
    "role": "student",
    "school": "Temasek Polytechnic",
    "major": "Information Technology",
    "yearOfStudy": 2,
    "credits": 100,
    "badges": [],
    "profileCompletion": 50,
    "createdAt": "2025-10-30T09:51:07.397Z"
  }
}
```

### 4. Update Profile
**PUT** `/api/auth/update-profile`

**Headers:** Requires authentication

**Request Body:** (all fields optional)
```json
{
  "username": "new_username",
  "phoneNumber": "+65 1234 5678",
  "bio": "Computer Science student passionate about learning",
  "school": "Temasek Polytechnic",
  "major": "Information Technology",
  "yearOfStudy": 2,
  "profilePicture": "https://example.com/avatar.jpg",
  "preferences": {
    "learningStyle": "visual",
    "preferredTime": ["morning", "afternoon"]
  }
}
```

### 5. Change Password
**PUT** `/api/auth/change-password`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## Tutor Routes (`/api/tutors`)

### 1. Get All Tutors (with filters)
**GET** `/api/tutors`

**Query Parameters:**
- `subject` - Filter by subject code (e.g., "CS101")
- `school` - Filter by school name
- `minRating` - Minimum rating (0-5)
- `maxRate` - Maximum hourly rate
- `location` - Filter by preferred location
- `search` - Search in username, bio, subjects
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```
GET /api/tutors?subject=CS101&minRating=4&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "tutors": [
    {
      "id": "...",
      "userId": "...",
      "username": "bob_tutor",
      "email": "bob@tp.edu.sg",
      "school": "Temasek Polytechnic",
      "major": "Computer Science",
      "yearOfStudy": 3,
      "bio": "Experienced CS tutor specializing in algorithms",
      "subjects": [
        {
          "code": "CS101",
          "name": "Programming Fundamentals",
          "grade": "A"
        }
      ],
      "hourlyRate": 25,
      "availableSlots": [
        {
          "day": "Monday",
          "startTime": "14:00",
          "endTime": "16:00"
        }
      ],
      "preferredLocations": ["TP Library", "Online"],
      "averageRating": 4.5,
      "totalReviews": 10,
      "totalSessions": 25,
      "responseTime": 120,
      "isAvailable": true
    }
  ]
}
```

### 2. Get Tutor by ID
**GET** `/api/tutors/:id`

**Response:** Same as single tutor object above

### 3. Get Tutor by User ID
**GET** `/api/tutors/user/:userId`

**Response:** Same as single tutor object above

### 4. Create Tutor Profile
**POST** `/api/tutors`

**Headers:** Requires authentication

**Request Body:**
```json
{
  "bio": "Experienced CS tutor specializing in algorithms and data structures",
  "subjects": [
    {
      "code": "CS101",
      "name": "Programming Fundamentals",
      "grade": "A"
    },
    {
      "code": "CS201",
      "name": "Data Structures",
      "grade": "A"
    }
  ],
  "hourlyRate": 25,
  "availableSlots": [
    {
      "day": "Monday",
      "startTime": "14:00",
      "endTime": "16:00"
    },
    {
      "day": "Wednesday",
      "startTime": "14:00",
      "endTime": "16:00"
    }
  ],
  "preferredLocations": ["TP Library", "Starbucks @ TP", "Online"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tutor profile created successfully",
  "tutor": { /* tutor object */ }
}
```

### 5. Update Tutor Profile
**PUT** `/api/tutors/:id`

**Headers:** Requires authentication (must be the tutor owner)

**Request Body:** Same as create (all fields optional)

---

## Booking Routes (`/api/bookings`)

All booking routes require authentication.

### 1. Get Bookings
**GET** `/api/bookings`

**Headers:** Requires authentication

**Query Parameters:**
- `status` - Filter by status (pending/confirmed/completed/cancelled)
- `startDate` - Filter bookings after this date
- `endDate` - Filter bookings before this date

**Response:**
```json
{
  "success": true,
  "count": 1,
  "bookings": [
    {
      "id": "...",
      "student": {
        "id": "...",
        "username": "alice_student",
        "email": "alice@tp.edu.sg",
        "school": "Temasek Polytechnic"
      },
      "tutor": {
        "id": "...",
        "userId": "...",
        "username": "bob_tutor",
        "email": "bob@tp.edu.sg",
        "school": "Temasek Polytechnic"
      },
      "subject": "CS101",
      "date": "2025-11-01T00:00:00.000Z",
      "timeSlot": "14:00-16:00",
      "duration": 2,
      "location": "TP Library",
      "status": "pending",
      "cost": 50,
      "notes": "Need help with linked lists",
      "createdAt": "2025-10-30T09:55:03.470Z",
      "updatedAt": "2025-10-30T09:55:03.470Z"
    }
  ]
}
```

### 2. Get Booking by ID
**GET** `/api/bookings/:id`

**Headers:** Requires authentication (must be student or tutor involved)

**Response:** Single booking object

### 3. Create Booking
**POST** `/api/bookings`

**Headers:** Requires authentication (students only)

**Request Body:**
```json
{
  "tutorId": "690335a60206e6d34453b1a7",
  "subject": "CS101",
  "date": "2025-11-01",
  "timeSlot": "14:00-16:00",
  "duration": 2,
  "location": "TP Library",
  "notes": "Need help with linked lists"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": "...",
    "studentId": "...",
    "tutorId": "...",
    "subject": "CS101",
    "date": "2025-11-01T00:00:00.000Z",
    "timeSlot": "14:00-16:00",
    "duration": 2,
    "location": "TP Library",
    "status": "pending",
    "cost": 50,
    "notes": "Need help with linked lists"
  }
}
```

### 4. Update Booking
**PUT** `/api/bookings/:id`

**Headers:** Requires authentication (student or tutor)

**Request Body:**
```json
{
  "status": "confirmed",
  "location": "Online via Zoom",
  "notes": "Updated notes"
}
```

**Status Update Rules:**
- **Students** can only cancel pending bookings
- **Tutors** can:
  - Confirm pending bookings
  - Complete confirmed bookings (triggers credit transfer)
  - Cancel any booking

**Response:**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {
    "id": "...",
    "status": "confirmed",
    "location": "Online via Zoom",
    "notes": "Updated notes",
    "updatedAt": "2025-10-30T10:00:00.000Z"
  }
}
```

### 5. Delete Booking (Admin Only)
**DELETE** `/api/bookings/:id`

**Headers:** Requires authentication (admin role)

**Response:**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

---

## Test Routes (`/api/test`)

### 1. Database Status
**GET** `/api/test/db-status`

**Response:**
```json
{
  "status": "connected",
  "database": "tu2tor",
  "collections": {
    "users": 2,
    "tutors": 1,
    "bookings": 3
  },
  "message": "Database is connected and working!"
}
```

### 2. Create Test User
**POST** `/api/test/create-test-user`

### 3. Get All Users
**GET** `/api/test/users`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: 'student' | 'tutor' | 'admin',
  school: String,
  major: String,
  yearOfStudy: Number,
  phoneNumber: String,
  bio: String,
  profilePicture: String,
  credits: Number (default: 100),
  badges: [String],
  profileCompletion: Number (0-100),
  preferences: Object,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Tutor Model
```javascript
{
  userId: ObjectId (ref: User),
  bio: String,
  subjects: [{
    code: String,
    name: String,
    grade: String
  }],
  hourlyRate: Number (default: 10),
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  preferredLocations: [String],
  totalSessions: Number,
  completedSessions: Number,
  averageRating: Number (0-5),
  totalReviews: Number,
  responseTime: Number (minutes),
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  studentId: ObjectId (ref: User),
  tutorId: ObjectId (ref: Tutor),
  subject: String,
  date: Date,
  timeSlot: String,
  duration: Number (hours),
  location: String,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  cost: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@tp.edu.sg","password":"pass123","school":"TP","major":"IT","yearOfStudy":2}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@tp.edu.sg","password":"pass123"}'

# Get tutors
curl http://localhost:5000/api/tutors

# Get my bookings (with token)
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Frontend (Axios)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Set auth token for all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Register
const response = await axios.post(`${API_URL}/auth/register`, {
  username: 'alice',
  email: 'alice@tp.edu.sg',
  password: 'pass123',
  school: 'Temasek Polytechnic',
  major: 'IT',
  yearOfStudy: 2
});

// Get tutors
const tutors = await axios.get(`${API_URL}/tutors`, {
  params: { subject: 'CS101', minRating: 4 }
});

// Create booking
const booking = await axios.post(`${API_URL}/bookings`, {
  tutorId: 'tutor_id_here',
  subject: 'CS101',
  date: '2025-11-01',
  timeSlot: '14:00-16:00',
  duration: 2,
  location: 'TP Library'
});
```

---

## Credits System

- **New users** start with 100 credits
- **Tutors** earn credits when bookings are completed
- **Students** spend credits when booking sessions
- Credits are transferred when a booking status changes to "completed"
- Cost calculation: `hourlyRate * duration`

Example:
- Tutor hourly rate: 25 credits/hour
- Session duration: 2 hours
- Total cost: 50 credits

---

## Next Steps for Frontend Integration

1. **Create API service layer** (`src/services/api.js`)
2. **Update AuthContext** to use real API instead of localStorage mock
3. **Update TutorContext** to fetch tutors from API
4. **Update BookingContext** to manage bookings via API
5. **Add error handling** for API failures
6. **Add loading states** during API calls
7. **Implement token refresh** for expired tokens
