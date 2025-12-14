# Tu2tor API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Tutors](#tutor-endpoints)
   - [Bookings](#booking-endpoints)
   - [Reviews](#review-endpoints)
   - [Messages](#message-endpoints)
   - [Notifications](#notification-endpoints)
   - [Study Notes](#study-note-endpoints)
   - [Todos](#todo-endpoints)
   - [AI Services](#ai-endpoints)
   - [Knowledge Base](#knowledge-base-endpoints)
   - [RAG (Retrieval-Augmented Generation)](#rag-endpoints)
   - [Code Execution](#code-execution-endpoints)

---

## Overview

The Tu2tor API is a RESTful API built with Node.js and Express.js. It provides endpoints for managing tutors, bookings, reviews, messaging, AI assistance, and more.

**Version:** 1.0.0  
**Protocol:** HTTP/HTTPS  
**Data Format:** JSON

---

## Authentication

Most endpoints require JWT (JSON Web Token) authentication.

### Getting a Token

1. Register or login via the authentication endpoints
2. Receive a JWT token in the response
3. Include the token in subsequent requests

### Using the Token

Include the JWT token in the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

Tokens expire after 30 days by default (configurable via `JWT_EXPIRE` environment variable).

---

## Base URL

**Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://your-domain.com/api
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Common Error Types

- `ValidationError` - Invalid input data
- `AuthenticationError` - Invalid or missing token
- `AuthorizationError` - Insufficient permissions
- `NotFoundError` - Resource not found
- `ConflictError` - Resource already exists
- `RateLimitError` - Too many requests

---

## API Endpoints

## Authentication Endpoints

### Register User

Register a new user account.

**Endpoint:** `POST /api/auth/register`  
**Authentication:** None

**Request Body:**
```json
{
  "email": "student@tp.edu.sg",
  "password": "SecurePass123!",
  "username": "John Doe",
  "studentId": "1234567D",
  "major": "Computer Science",
  "yearOfStudy": 2
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student@tp.edu.sg",
      "username": "John Doe",
      "studentId": "1234567D",
      "major": "Computer Science",
      "yearOfStudy": 2,
      "role": ["student"],
      "credits": 100,
      "points": 0,
      "badges": []
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login User

Authenticate and receive a JWT token.

**Endpoint:** `POST /api/auth/login`  
**Authentication:** None

**Request Body:**
```json
{
  "email": "student@tp.edu.sg",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student@tp.edu.sg",
      "username": "John Doe",
      "role": ["student", "tutor"],
      "credits": 120,
      "points": 250
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "student@tp.edu.sg",
      "username": "John Doe",
      "studentId": "1234567D",
      "major": "Computer Science",
      "yearOfStudy": 2,
      "role": ["student", "tutor"],
      "credits": 120,
      "points": 250,
      "badges": ["newbie", "helper"],
      "avatar": "/uploads/avatar.jpg"
    }
  }
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /api/auth/update-profile`  
**Authentication:** Required

**Request Body:**
```json
{
  "username": "John Smith",
  "major": "Information Technology",
  "bio": "Passionate about programming and helping others learn."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

### Change Password

Change user password.

**Endpoint:** `PUT /api/auth/change-password`  
**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Tutor Endpoints

### Get All Tutors

Search and filter tutors.

**Endpoint:** `GET /api/tutors`  
**Authentication:** None

**Query Parameters:**
- `subject` (string) - Filter by subject name
- `minRating` (number) - Minimum rating (1-5)
- `availability` (string) - Day of week (Monday-Sunday)
- `search` (string) - Search in name, bio, subjects
- `limit` (number) - Results per page (default: 20)
- `page` (number) - Page number (default: 1)

**Example Request:**
```http
GET /api/tutors?subject=Python&minRating=4.5&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tutors": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "Jane Smith",
          "avatar": "/uploads/avatar.jpg"
        },
        "bio": "Experienced Python tutor with 3 years of teaching...",
        "subjects": [
          {
            "subjectName": "Python Programming",
            "proficiencyLevel": "expert"
          }
        ],
        "averageRating": 4.8,
        "totalReviews": 24,
        "totalSessions": 50,
        "responseRate": 98,
        "availableSlots": [
          {
            "day": "Monday",
            "startTime": "14:00",
            "endTime": "16:00"
          }
        ]
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 5
    }
  }
}
```

---

### Get Tutor by ID

Get detailed information about a specific tutor.

**Endpoint:** `GET /api/tutors/:id`  
**Authentication:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tutor": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "Jane Smith",
        "email": "jane@tp.edu.sg",
        "avatar": "/uploads/avatar.jpg",
        "major": "Computer Science",
        "yearOfStudy": 3
      },
      "bio": "Experienced Python tutor...",
      "subjects": [...],
      "completedCourses": [
        {
          "code": "CS101",
          "name": "Programming Fundamentals",
          "grade": "A"
        }
      ],
      "availableSlots": [...],
      "preferredLocation": ["Library", "Online"],
      "languages": ["English", "Chinese"],
      "averageRating": 4.8,
      "totalReviews": 24,
      "totalSessions": 50,
      "totalHours": 75.5,
      "responseRate": 98,
      "responseTime": 120,
      "isVerified": true,
      "status": "active"
    }
  }
}
```

---

### Get Tutor by User ID

Get tutor profile by user ID.

**Endpoint:** `GET /api/tutors/user/:userId`  
**Authentication:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tutor": { ... }
  }
}
```

---

### Create Tutor Profile

Create a new tutor profile for the authenticated user.

**Endpoint:** `POST /api/tutors`  
**Authentication:** Required

**Request Body:**
```json
{
  "bio": "Passionate about teaching programming...",
  "subjects": [
    {
      "subjectName": "Python Programming",
      "proficiencyLevel": "expert",
      "yearsOfExperience": 2
    },
    {
      "subjectName": "JavaScript",
      "proficiencyLevel": "advanced",
      "yearsOfExperience": 1
    }
  ],
  "completedCourses": [
    {
      "code": "CS101",
      "name": "Programming Fundamentals",
      "grade": "A"
    }
  ],
  "availableSlots": [
    {
      "day": "Monday",
      "startTime": "14:00",
      "endTime": "16:00",
      "isRecurring": true
    },
    {
      "day": "Wednesday",
      "startTime": "10:00",
      "endTime": "12:00",
      "isRecurring": true
    }
  ],
  "preferredLocation": ["Library", "Online"],
  "languages": ["English", "Chinese"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "tutor": { ... }
  }
}
```

---

### Update Tutor Profile

Update tutor profile information.

**Endpoint:** `PUT /api/tutors/:id`  
**Authentication:** Required (must be the tutor owner)

**Request Body:**
```json
{
  "bio": "Updated bio...",
  "availableSlots": [...],
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tutor": { ... }
  }
}
```

---

## Booking Endpoints

### Get User Bookings

Get all bookings for the authenticated user (as student or tutor).

**Endpoint:** `GET /api/bookings`  
**Authentication:** Required

**Query Parameters:**
- `role` (string) - Filter by role: "student" or "tutor"
- `status` (string) - Filter by status: "pending", "confirmed", "completed", "cancelled"
- `upcoming` (boolean) - Only upcoming bookings

**Example Request:**
```http
GET /api/bookings?role=student&status=confirmed&upcoming=true
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "studentId": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "John Doe",
          "avatar": "/uploads/avatar.jpg"
        },
        "tutorId": {
          "_id": "507f1f77bcf86cd799439014",
          "username": "Jane Smith",
          "avatar": "/uploads/avatar2.jpg"
        },
        "subjectName": "Python Programming",
        "sessionDate": "2024-12-20T14:00:00Z",
        "duration": 2,
        "location": "Library Level 3",
        "locationType": "offline",
        "description": "Need help with object-oriented programming concepts",
        "status": "confirmed",
        "createdAt": "2024-12-15T10:00:00Z"
      }
    ]
  }
}
```

---

### Get Booking by ID

Get detailed information about a specific booking.

**Endpoint:** `GET /api/bookings/:id`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439013",
      "studentId": { ... },
      "tutorId": { ... },
      "subjectName": "Python Programming",
      "courseCode": "CS101",
      "sessionDate": "2024-12-20T14:00:00Z",
      "duration": 2,
      "endTime": "2024-12-20T16:00:00Z",
      "location": "Library Level 3",
      "locationType": "offline",
      "meetingLink": null,
      "description": "Need help with OOP concepts",
      "status": "confirmed",
      "isRated": false,
      "reminderSent": true,
      "createdAt": "2024-12-15T10:00:00Z",
      "confirmedAt": "2024-12-15T11:30:00Z"
    }
  }
}
```

---

### Create Booking

Create a new tutoring session booking.

**Endpoint:** `POST /api/bookings`  
**Authentication:** Required

**Request Body:**
```json
{
  "tutorId": "507f1f77bcf86cd799439014",
  "subjectName": "Python Programming",
  "courseCode": "CS101",
  "sessionDate": "2024-12-20T14:00:00Z",
  "duration": 2,
  "location": "Library Level 3",
  "locationType": "offline",
  "description": "Need help with object-oriented programming concepts"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "booking": { ... }
  },
  "message": "Booking created successfully. 10 credits deducted."
}
```

---

### Start Session

Mark a booking session as started.

**Endpoint:** `POST /api/bookings/:id/start`  
**Authentication:** Required (tutor only)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439013",
      "status": "confirmed",
      "startedAt": "2024-12-20T14:05:00Z"
    }
  }
}
```

---

### Complete Session

Mark a booking session as completed.

**Endpoint:** `POST /api/bookings/:id/complete`  
**Authentication:** Required (tutor only)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439013",
      "status": "completed",
      "completedAt": "2024-12-20T16:10:00Z"
    }
  },
  "message": "Session completed. Tutor earned 20 credits."
}
```

---

### Update Booking

Update booking status (confirm, cancel, etc.).

**Endpoint:** `PUT /api/bookings/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "status": "cancelled",
  "cancellationReason": "Schedule conflict"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": { ... }
  }
}
```

---

### Delete Booking

Delete a booking (admin only).

**Endpoint:** `DELETE /api/bookings/:id`  
**Authentication:** Required (admin role)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

---

## Review Endpoints

### Get Tutor Reviews

Get all reviews for a specific tutor.

**Endpoint:** `GET /api/reviews/tutor/:tutorId`  
**Authentication:** None

**Query Parameters:**
- `limit` (number) - Results per page
- `page` (number) - Page number
- `sort` (string) - Sort by: "recent", "rating", "helpful"

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "bookingId": "507f1f77bcf86cd799439013",
        "tutorId": "507f1f77bcf86cd799439014",
        "studentId": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "John Doe",
          "avatar": "/uploads/avatar.jpg"
        },
        "rating": 5,
        "comment": "Excellent tutor! Very patient and explains concepts clearly.",
        "tags": ["Patient", "Clear Explanation", "Well Prepared"],
        "isAnonymous": false,
        "isVerified": true,
        "helpfulCount": 12,
        "response": {
          "content": "Thank you for the kind words!",
          "createdAt": "2024-12-21T10:00:00Z"
        },
        "status": "published",
        "createdAt": "2024-12-20T20:00:00Z"
      }
    ],
    "pagination": {
      "total": 24,
      "page": 1,
      "pages": 3
    },
    "stats": {
      "averageRating": 4.8,
      "totalReviews": 24,
      "ratingDistribution": {
        "5": 18,
        "4": 5,
        "3": 1,
        "2": 0,
        "1": 0
      }
    }
  }
}
```

---

### Get Booking Review

Get review for a specific booking.

**Endpoint:** `GET /api/reviews/booking/:bookingId`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "review": { ... }
  }
}
```

---

### Get Student Reviews

Get all reviews written by a specific student.

**Endpoint:** `GET /api/reviews/student/:studentId`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reviews": [ ... ]
  }
}
```

---

### Create Review

Create a review for a completed booking.

**Endpoint:** `POST /api/reviews`  
**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": "507f1f77bcf86cd799439013",
  "rating": 5,
  "comment": "Excellent tutor! Very patient and explains concepts clearly.",
  "tags": ["Patient", "Clear Explanation", "Well Prepared"],
  "isAnonymous": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "review": { ... }
  },
  "message": "Review created successfully. +5 bonus credits for 5-star rating!"
}
```

---

### Update Review

Update an existing review (within 72 hours).

**Endpoint:** `PUT /api/reviews/:id`  
**Authentication:** Required (must be review author)

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated comment...",
  "tags": ["Patient", "Helpful"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "review": { ... }
  }
}
```

---

### Delete Review

Delete a review (within 72 hours).

**Endpoint:** `DELETE /api/reviews/:id`  
**Authentication:** Required (must be review author)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

### Mark Review as Helpful

Mark a review as helpful.

**Endpoint:** `POST /api/reviews/:id/helpful`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "review": {
      "_id": "507f1f77bcf86cd799439015",
      "helpfulCount": 13
    }
  }
}
```

---

### Add Tutor Response

Add a response to a review (tutor only).

**Endpoint:** `POST /api/reviews/:id/response`  
**Authentication:** Required (must be the reviewed tutor)

**Request Body:**
```json
{
  "content": "Thank you for the feedback! I'm glad I could help."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "review": {
      "_id": "507f1f77bcf86cd799439015",
      "response": {
        "content": "Thank you for the feedback!",
        "createdAt": "2024-12-21T10:00:00Z"
      }
    }
  }
}
```

---

## Message Endpoints

### Get Contacts

Get all contacts (users with message history).

**Endpoint:** `GET /api/messages/contacts`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "username": "Jane Smith",
        "avatar": "/uploads/avatar2.jpg",
        "lastMessage": {
          "content": "See you tomorrow!",
          "timestamp": "2024-12-15T18:30:00Z",
          "isRead": true
        },
        "unreadCount": 0
      }
    ]
  }
}
```

---

### Get All Users

Get all users for starting new conversations.

**Endpoint:** `GET /api/messages/users`  
**Authentication:** Required

**Query Parameters:**
- `search` (string) - Search by username or email

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "username": "Jane Smith",
        "email": "jane@tp.edu.sg",
        "avatar": "/uploads/avatar2.jpg",
        "major": "Computer Science"
      }
    ]
  }
}
```

---

### Get Conversation

Get message history with a specific user.

**Endpoint:** `GET /api/messages/:contactId`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "senderId": "507f1f77bcf86cd799439011",
        "receiverId": "507f1f77bcf86cd799439014",
        "content": "Hi! Are you available for a Python tutoring session this week?",
        "isRead": true,
        "createdAt": "2024-12-15T10:00:00Z"
      },
      {
        "_id": "507f1f77bcf86cd799439017",
        "senderId": "507f1f77bcf86cd799439014",
        "receiverId": "507f1f77bcf86cd799439011",
        "content": "Yes! I'm free on Wednesday afternoon.",
        "isRead": true,
        "createdAt": "2024-12-15T10:15:00Z"
      }
    ]
  }
}
```

---

### Send Message

Send a message to another user.

**Endpoint:** `POST /api/messages`  
**Authentication:** Required

**Request Body:**
```json
{
  "receiverId": "507f1f77bcf86cd799439014",
  "content": "Hi! Are you available for a Python tutoring session this week?"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "507f1f77bcf86cd799439016",
      "senderId": "507f1f77bcf86cd799439011",
      "receiverId": "507f1f77bcf86cd799439014",
      "content": "Hi! Are you available...",
      "isRead": false,
      "createdAt": "2024-12-15T10:00:00Z"
    }
  }
}
```

---

### Mark as Read

Mark messages from a contact as read.

**Endpoint:** `PUT /api/messages/read/:contactId`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

### Get Unread Count

Get total unread message count.

**Endpoint:** `GET /api/messages/unread/count`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### Delete Conversation

Delete entire conversation with a user.

**Endpoint:** `DELETE /api/messages/:contactId`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

## Study Note Endpoints

### Get All Study Notes

Get all study notes for the authenticated user.

**Endpoint:** `GET /api/study-notes`  
**Authentication:** Required

**Query Parameters:**
- `subject` (string) - Filter by subject
- `tags` (string) - Filter by tags (comma-separated)
- `search` (string) - Search in title and content
- `limit` (number) - Results per page
- `page` (number) - Page number

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "_id": "507f1f77bcf86cd799439018",
        "userId": "507f1f77bcf86cd799439011",
        "title": "Python OOP Concepts",
        "content": "# Object-Oriented Programming\n\n## Classes and Objects...",
        "subject": "Python Programming",
        "tags": ["Python", "OOP", "Programming"],
        "sources": [
          {
            "type": "ai-chat",
            "reference": "AI Chat Session - Dec 15, 2024"
          }
        ],
        "isRestructured": false,
        "createdAt": "2024-12-15T15:00:00Z",
        "updatedAt": "2024-12-15T15:00:00Z"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pages": 2
    }
  }
}
```

---

### Get Study Note by ID

Get a specific study note.

**Endpoint:** `GET /api/study-notes/:id`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "note": {
      "_id": "507f1f77bcf86cd799439018",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Python OOP Concepts",
      "content": "# Object-Oriented Programming...",
      "subject": "Python Programming",
      "tags": ["Python", "OOP"],
      "sources": [...],
      "restructuredVersions": [
        {
          "content": "Restructured content...",
          "intensity": "moderate",
          "createdAt": "2024-12-16T10:00:00Z"
        }
      ],
      "isRestructured": false,
      "createdAt": "2024-12-15T15:00:00Z"
    }
  }
}
```

---

### Create Study Note

Create a new study note.

**Endpoint:** `POST /api/study-notes`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Python OOP Concepts",
  "content": "# Object-Oriented Programming\n\nClasses and Objects...",
  "subject": "Python Programming",
  "tags": ["Python", "OOP", "Programming"],
  "sources": [
    {
      "type": "ai-chat",
      "reference": "AI Chat Session - Dec 15, 2024"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "note": { ... }
  }
}
```

---

### Update Study Note

Update an existing study note.

**Endpoint:** `PUT /api/study-notes/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["Python", "OOP", "Advanced"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "note": { ... }
  }
}
```

---

### Append to Study Note

Append content and sources to an existing note.

**Endpoint:** `POST /api/study-notes/:id/append`  
**Authentication:** Required

**Request Body:**
```json
{
  "content": "\n\n## Additional Topic\n\nMore content...",
  "sources": [
    {
      "type": "session",
      "reference": "Tutoring Session with Jane - Dec 16"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "note": { ... }
  }
}
```

---

### Restructure Note

Use AI to restructure an existing note.

**Endpoint:** `POST /api/study-notes/:id/restructure`  
**Authentication:** Required

**Request Body:**
```json
{
  "intensity": "moderate"
}
```

**Intensity Options:**
- `light` - Minor formatting improvements
- `moderate` - Reorganize sections, improve clarity
- `heavy` - Complete restructure with enhanced explanations

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "note": {
      "_id": "507f1f77bcf86cd799439018",
      "restructuredVersions": [
        {
          "content": "# Python OOP - Restructured\n\n...",
          "intensity": "moderate",
          "createdAt": "2024-12-16T10:00:00Z"
        }
      ]
    }
  }
}
```

---

### Create Restructured Note

Create a new note with AI restructuring.

**Endpoint:** `POST /api/study-notes/create-restructured`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Python Basics",
  "content": "Unorganized content about Python...",
  "subject": "Python Programming",
  "tags": ["Python"],
  "intensity": "moderate"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "note": {
      "_id": "507f1f77bcf86cd799439019",
      "content": "AI-restructured content...",
      "isRestructured": true,
      ...
    }
  }
}
```

---

### Compare Note Versions

Compare original vs restructured versions.

**Endpoint:** `GET /api/study-notes/:id/compare`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "original": {
      "content": "Original content...",
      "wordCount": 250
    },
    "restructured": {
      "content": "Restructured content...",
      "intensity": "moderate",
      "wordCount": 280,
      "createdAt": "2024-12-16T10:00:00Z"
    },
    "improvements": [
      "Added clear section headers",
      "Improved formatting",
      "Enhanced explanations"
    ]
  }
}
```

---

### Get Restructure Options

Get available restructure intensity options.

**Endpoint:** `GET /api/study-notes/restructure-options`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "options": [
      {
        "value": "light",
        "label": "Light Restructure",
        "description": "Minor formatting improvements"
      },
      {
        "value": "moderate",
        "label": "Moderate Restructure",
        "description": "Reorganize sections, improve clarity"
      },
      {
        "value": "heavy",
        "label": "Heavy Restructure",
        "description": "Complete restructure with enhanced explanations"
      }
    ]
  }
}
```

---

### Get Subjects List

Get all unique subjects from user's notes.

**Endpoint:** `GET /api/study-notes/subjects/list`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "subjects": [
      "Python Programming",
      "Data Structures",
      "Web Development"
    ]
  }
}
```

---

### Get Tags List

Get all unique tags from user's notes.

**Endpoint:** `GET /api/study-notes/tags/list`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tags": [
      "Python",
      "OOP",
      "JavaScript",
      "React",
      "Algorithms"
    ]
  }
}
```

---

### Delete Study Note

Delete a study note.

**Endpoint:** `DELETE /api/study-notes/:id`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Study note deleted successfully"
}
```

---

## Todo Endpoints

### Get All Todos

Get all todos for the authenticated user.

**Endpoint:** `GET /api/todos`  
**Authentication:** Required

**Query Parameters:**
- `status` (string) - Filter by status: "pending", "completed"
- `priority` (string) - Filter by priority: "low", "medium", "high"

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "userId": "507f1f77bcf86cd799439011",
        "task": "Review Python OOP notes before tutoring session",
        "dueDate": "2024-12-20T14:00:00Z",
        "priority": "high",
        "completed": false,
        "relatedBooking": "507f1f77bcf86cd799439013",
        "createdAt": "2024-12-15T10:00:00Z"
      }
    ]
  }
}
```

---

### Create Todo

Create a new todo item.

**Endpoint:** `POST /api/todos`  
**Authentication:** Required

**Request Body:**
```json
{
  "task": "Review Python OOP notes before tutoring session",
  "dueDate": "2024-12-20T14:00:00Z",
  "priority": "high",
  "relatedBooking": "507f1f77bcf86cd799439013"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "todo": { ... }
  }
}
```

---

### Update Todo

Update a todo item.

**Endpoint:** `PUT /api/todos/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "task": "Updated task description",
  "priority": "medium",
  "dueDate": "2024-12-21T10:00:00Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "todo": { ... }
  }
}
```

---

### Toggle Todo

Toggle todo completion status.

**Endpoint:** `PATCH /api/todos/:id/toggle`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "todo": {
      "_id": "507f1f77bcf86cd799439020",
      "completed": true,
      "completedAt": "2024-12-20T15:00:00Z"
    }
  }
}
```

---

### Delete Todo

Delete a todo item.

**Endpoint:** `DELETE /api/todos/:id`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

---

### Delete Completed Todos

Delete all completed todos.

**Endpoint:** `DELETE /api/todos/completed/all`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "3 completed todos deleted"
}
```

---

## AI Endpoints

### Health Check

Check AI service health and status.

**Endpoint:** `GET /api/ai/health`  
**Authentication:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "available": true
  }
}
```

---

### Get Available Providers

Get list of available AI providers.

**Endpoint:** `GET /api/ai/providers`  
**Authentication:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "name": "gemini",
        "displayName": "Google Gemini",
        "available": true,
        "models": ["gemini-2.5-flash", "gemini-2.5-pro"]
      }
    ],
    "active": "gemini"
  }
}
```

---

### Generate Content

Generate AI content (non-streaming).

**Endpoint:** `POST /api/ai/generate`  
**Authentication:** Required

**Request Body:**
```json
{
  "prompt": "Explain object-oriented programming in simple terms",
  "options": {
    "maxTokens": 1000,
    "temperature": 0.7
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "content": "Object-oriented programming (OOP) is a programming paradigm...",
  "usage": {
    "promptTokens": 12,
    "completionTokens": 150,
    "totalTokens": 162
  }
}
```

---

### Chat with AI (Streaming)

Stream AI chat responses using Server-Sent Events (SSE).

**Endpoint:** `POST /api/ai/chat`  
**Authentication:** Required

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain Python classes"
    }
  ],
  "options": {
    "thinkingMode": false,
    "maxTokens": 2000,
    "temperature": 0.7
  }
}
```

**Response:** `200 OK` (Server-Sent Events)
```
data: {"chunk": "Python"}

data: {"chunk": " classes"}

data: {"chunk": " are"}

...

data: {"done": true, "usage": {"totalTokens": 250}}
```

**JavaScript Client Example:**
```javascript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ messages, options })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.chunk) {
        console.log(data.chunk);
      }
    }
  }
}
```

---

### Detect Subject

Detect academic subject from text content.

**Endpoint:** `POST /api/ai/detect-subject`  
**Authentication:** Required

**Request Body:**
```json
{
  "content": "I need help understanding recursion and how to implement it in Python..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "subject": "Python Programming",
    "confidence": 0.92,
    "keywords": ["recursion", "Python", "implementation"]
  }
}
```

---

### Generate Study Note

Generate a formatted study note from conversation.

**Endpoint:** `POST /api/ai/generate-note`  
**Authentication:** Required

**Request Body:**
```json
{
  "conversation": [
    {
      "role": "user",
      "content": "What is recursion?"
    },
    {
      "role": "assistant",
      "content": "Recursion is a programming technique..."
    }
  ],
  "subject": "Python Programming"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "title": "Understanding Recursion in Python",
    "content": "# Understanding Recursion\n\n## What is Recursion?\n...",
    "subject": "Python Programming",
    "tags": ["Python", "Recursion", "Algorithms"]
  }
}
```

---

### Switch AI Provider

Switch active AI provider (admin only).

**Endpoint:** `POST /api/ai/providers/switch`  
**Authentication:** Required

**Request Body:**
```json
{
  "provider": "gemini"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Switched to Gemini provider",
  "data": {
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
}
```

---

### Get AI Usage Statistics

Get usage statistics for AI services.

**Endpoint:** `GET /api/ai/usage`  
**Authentication:** Required

**Query Parameters:**
- `period` (string) - Time period: "today", "week", "month"

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": "week",
    "totalRequests": 45,
    "totalTokens": 12500,
    "requestsByType": {
      "chat": 30,
      "generate": 10,
      "detectSubject": 5
    },
    "averageResponseTime": 1.2
  }
}
```

---

## Knowledge Base Endpoints

### Upload Document

Upload a document to the knowledge base.

**Endpoint:** `POST /api/knowledge-base`  
**Authentication:** Required

**Request:** `multipart/form-data`
```
file: [PDF/PPTX/DOCX/Image file]
title: "Python Programming Lecture Notes"
subject: "Python Programming"
description: "Comprehensive notes on Python basics"
tags: ["Python", "Programming", "Basics"]
visibility: "private"
```

**Supported File Types:**
- PDF (.pdf)
- PowerPoint (.ppt, .pptx)
- Word (.doc, .docx)
- Images (.jpg, .jpeg, .png)

**Max File Size:** 50MB

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439021",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Python Programming Lecture Notes",
      "fileName": "lecture-notes.pdf",
      "fileSize": 2048576,
      "fileType": "application/pdf",
      "filePath": "/uploads/knowledge-base/1234567890-lecture-notes.pdf",
      "subject": "Python Programming",
      "description": "Comprehensive notes...",
      "tags": ["Python", "Programming", "Basics"],
      "visibility": "private",
      "processStatus": "processing",
      "createdAt": "2024-12-15T10:00:00Z"
    }
  },
  "message": "Document uploaded successfully. Processing..."
}
```

---

### Get All Documents

Get all documents for the authenticated user.

**Endpoint:** `GET /api/knowledge-base`  
**Authentication:** Required

**Query Parameters:**
- `subject` (string) - Filter by subject
- `tags` (string) - Filter by tags (comma-separated)
- `search` (string) - Search in title and content
- `status` (string) - Filter by process status: "processing", "completed", "failed"
- `limit` (number) - Results per page
- `page` (number) - Page number

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "title": "Python Programming Lecture Notes",
        "fileName": "lecture-notes.pdf",
        "fileSize": 2048576,
        "fileType": "application/pdf",
        "subject": "Python Programming",
        "tags": ["Python", "Programming"],
        "processStatus": "completed",
        "pageCount": 25,
        "wordCount": 5000,
        "createdAt": "2024-12-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "pages": 1
    }
  }
}
```

---

### Get Document by ID

Get detailed information about a specific document.

**Endpoint:** `GET /api/knowledge-base/:id`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439021",
      "userId": "507f1f77bcf86cd799439011",
      "title": "Python Programming Lecture Notes",
      "fileName": "lecture-notes.pdf",
      "fileSize": 2048576,
      "fileType": "application/pdf",
      "filePath": "/uploads/knowledge-base/1234567890-lecture-notes.pdf",
      "subject": "Python Programming",
      "description": "Comprehensive notes...",
      "tags": ["Python", "Programming", "Basics"],
      "visibility": "private",
      "processStatus": "completed",
      "extractedText": "# Python Basics\n\n...",
      "pageCount": 25,
      "wordCount": 5000,
      "processingTime": 12.5,
      "createdAt": "2024-12-15T10:00:00Z",
      "processedAt": "2024-12-15T10:00:12Z"
    }
  }
}
```

---

### Search Documents

Search documents by content.

**Endpoint:** `GET /api/knowledge-base/search`  
**Authentication:** Required

**Query Parameters:**
- `q` (string) - Search query (required)
- `subject` (string) - Filter by subject
- `tags` (string) - Filter by tags
- `limit` (number) - Results limit

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "title": "Python Programming Lecture Notes",
        "subject": "Python Programming",
        "tags": ["Python", "Programming"],
        "excerpt": "...classes and objects are fundamental concepts...",
        "relevanceScore": 0.95,
        "matchedTerms": ["classes", "objects"]
      }
    ],
    "total": 3
  }
}
```

---

### Get Document Tags

Get all unique tags from user's documents.

**Endpoint:** `GET /api/knowledge-base/tags`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tags": [
      { "name": "Python", "count": 5 },
      { "name": "Programming", "count": 8 },
      { "name": "Web Development", "count": 3 }
    ]
  }
}
```

---

### Update Document

Update document metadata.

**Endpoint:** `PUT /api/knowledge-base/:id`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["Python", "Advanced", "OOP"],
  "visibility": "public"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "document": { ... }
  }
}
```

---

### Delete Document

Delete a document.

**Endpoint:** `DELETE /api/knowledge-base/:id`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

### Get Processing Status

Get document processing status.

**Endpoint:** `GET /api/knowledge-base/:id/status`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 65,
    "message": "Extracting text from page 16/25",
    "estimatedTimeRemaining": 8
  }
}
```

---

### Get Document Content

Get extracted text content from a document.

**Endpoint:** `GET /api/knowledge-base/:id/content`  
**Authentication:** Required

**Query Parameters:**
- `page` (number) - Page number for pagination
- `pageSize` (number) - Number of characters per page
- `includeFullText` (boolean) - Include full text in response

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "content": "# Python Basics\n\n## Variables and Data Types...",
    "pageCount": 25,
    "wordCount": 5000,
    "characterCount": 25000,
    "currentPage": 1,
    "totalPages": 5
  }
}
```

---

### Get Subject Statistics

Get statistics for a specific subject.

**Endpoint:** `GET /api/knowledge-base/subject/:subjectId/stats`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "subject": "Python Programming",
    "totalDocuments": 12,
    "totalPages": 285,
    "totalWords": 45000,
    "fileTypes": {
      "pdf": 8,
      "pptx": 3,
      "docx": 1
    },
    "recentUploads": 5,
    "mostUsedTags": [
      { "tag": "OOP", "count": 6 },
      { "tag": "Basics", "count": 4 }
    ]
  }
}
```

---

## RAG Endpoints

### Query RAG System

Query the Retrieval-Augmented Generation system.

**Endpoint:** `POST /api/rag/query`  
**Authentication:** Required

**Request Body:**
```json
{
  "query": "Explain the concept of inheritance in Python",
  "subject": "Python Programming",
  "documentIds": ["507f1f77bcf86cd799439021", "507f1f77bcf86cd799439022"],
  "maxResults": 5
}
```

**Parameters:**
- `query` (string, required) - The question to ask
- `subject` (string, optional) - Filter by subject
- `documentIds` (array, optional) - Specific documents to search
- `maxResults` (number, optional) - Max relevant documents (default: 5)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "answer": "Inheritance in Python allows a class to inherit attributes and methods from another class. The child class (subclass) inherits from the parent class (superclass), enabling code reuse and creating hierarchical relationships...",
    "sources": [
      {
        "documentId": "507f1f77bcf86cd799439021",
        "title": "Python OOP Lecture Notes",
        "excerpt": "...inheritance is a fundamental OOP concept where...",
        "relevance": 0.94,
        "page": 12
      },
      {
        "documentId": "507f1f77bcf86cd799439022",
        "title": "Advanced Python Concepts",
        "excerpt": "...multiple inheritance allows a class to inherit from...",
        "relevance": 0.87,
        "page": 8
      }
    ],
    "confidence": 0.91,
    "tokensUsed": 450
  }
}
```

---

## Code Execution Endpoints

### Execute Code

Execute code in a sandboxed environment.

**Endpoint:** `POST /api/code/execute`  
**Authentication:** None (rate-limited)

**Request Body:**
```json
{
  "language": "python",
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))"
}
```

**Supported Languages:**
- `python` - Python 3
- `javascript` - Node.js

**Response:** `200 OK`
```json
{
  "success": true,
  "output": "55\n",
  "executionTime": 0.045,
  "memoryUsed": 1024
}
```

**Error Response:** `200 OK`
```json
{
  "success": false,
  "error": "SyntaxError: invalid syntax",
  "line": 2,
  "output": ""
}
```

---

## Notification Endpoints

### Get Notifications

Get all notifications for the authenticated user.

**Endpoint:** `GET /api/notifications`  
**Authentication:** Required

**Query Parameters:**
- `read` (boolean) - Filter by read status
- `type` (string) - Filter by notification type
- `limit` (number) - Results per page

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "507f1f77bcf86cd799439023",
        "userId": "507f1f77bcf86cd799439011",
        "type": "booking_confirmed",
        "title": "Booking Confirmed",
        "message": "Your booking with Jane Smith has been confirmed.",
        "isRead": false,
        "actionUrl": "/app/bookings/507f1f77bcf86cd799439013",
        "createdAt": "2024-12-15T11:30:00Z"
      }
    ],
    "unreadCount": 5
  }
}
```

**Notification Types:**
- `booking_confirmed` - Booking confirmed by tutor
- `booking_cancelled` - Booking cancelled
- `booking_reminder` - Upcoming session reminder
- `review_received` - New review received
- `message_received` - New message received
- `credit_earned` - Credits earned
- `badge_unlocked` - New badge unlocked

---

### Mark as Read

Mark notifications as read.

**Endpoint:** `PUT /api/notifications/read`  
**Authentication:** Required

**Request Body:**
```json
{
  "notificationIds": [
    "507f1f77bcf86cd799439023",
    "507f1f77bcf86cd799439024"
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "2 notifications marked as read"
}
```

---

### Mark All as Read

Mark all notifications as read.

**Endpoint:** `PUT /api/notifications/read-all`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### Delete Notification

Delete a notification.

**Endpoint:** `DELETE /api/notifications/:id`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Rate Limiting

API rate limits are enforced to ensure fair usage.

### General Endpoints
- **Rate:** 100 requests per 15 minutes
- **Applies to:** Most endpoints

### AI Endpoints
- **Rate:** 20 requests per minute
- **Applies to:** `/api/ai/*`

### Code Execution
- **Rate:** 10 requests per minute
- **Applies to:** `/api/code/execute`

### Headers

Rate limit information is included in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1639564800
```

### Rate Limit Error

**Response:** `429 Too Many Requests`
```json
{
  "success": false,
  "error": "RateLimitError",
  "message": "Too many requests. Please try again in 5 minutes.",
  "retryAfter": 300
}
```

---

## WebSocket API

Real-time features use WebSocket connections.

### Connection URL

```
ws://localhost:5000/<room-name>
```

### Room Naming Conventions

- **Code Collaboration:** `code-session-<bookingId>`
- **Markdown Collaboration:** `markdown-<noteId>`
- **Chat:** `chat-<senderId>-<receiverId>`

### Message Format

Messages are relayed as-is between clients in the same room. For Yjs collaboration, messages are binary data handled by the Y-WebSocket provider.

### Example: Code Collaboration

```javascript
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

const ydoc = new Y.Doc();
const roomName = `code-session-${bookingId}`;
const provider = new WebsocketProvider(
  'ws://localhost:5000',
  roomName,
  ydoc
);

// Get shared text type
const ytext = ydoc.getText('monaco');

// Listen for changes
ytext.observe(() => {
  console.log('Text changed:', ytext.toString());
});

// Update text
ytext.insert(0, 'Hello World');
```

---

## Best Practices

### Authentication
1. Store JWT tokens securely (httpOnly cookies or secure storage)
2. Refresh tokens before expiration
3. Handle 401 errors by redirecting to login

### Error Handling
```javascript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Request failed');
  }

  return result.data;
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

### Pagination
Always use pagination for list endpoints to improve performance:

```javascript
const fetchTutors = async (page = 1, limit = 20) => {
  const response = await fetch(
    `/api/tutors?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  return data;
};
```

### File Uploads
Use FormData for file uploads:

```javascript
const uploadDocument = async (file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', metadata.title);
  formData.append('subject', metadata.subject);
  formData.append('tags', JSON.stringify(metadata.tags));

  const response = await fetch('/api/knowledge-base', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

---

## Change Log

### Version 1.0.0 (December 2025)
- Initial API release
- All core features implemented
- Authentication, bookings, reviews, messaging
- AI assistant with Gemini integration
- Knowledge base with RAG system
- Real-time collaboration features
- Study notes with AI restructuring
- Todo management

---

## Support

For API support and questions:

- **GitHub Issues:** [Repository Issues](https://github.com/your-repo/issues)
- **Documentation:** [README.md](./README.md)
- **Email:** support@tu2tor.edu

---

**Last Updated:** December 14, 2025

**API Version:** 1.0.0

---

<p align="center">Tu2tor API - Built with Express.js and MongoDB</p>

