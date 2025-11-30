-- Tu2tor Platform Database Schema (for ERD generation)
-- Note: This SQL is for documentation/ERD purposes only
-- Actual implementation uses MongoDB with Mongoose ODM

-- ============================================
-- Table: User
-- Description: Stores fundamental user information for authentication and profile management
-- ============================================
CREATE TABLE User (
    _id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    school VARCHAR(100) DEFAULT 'Temasek Polytechnic',
    major VARCHAR(100) NOT NULL,
    yearOfStudy INT NOT NULL CHECK (yearOfStudy BETWEEN 1 AND 3),
    phoneNumber VARCHAR(20),
    bio TEXT,
    profilePicture VARCHAR(255),
    credits INT DEFAULT 100,
    badges TEXT,
    profileCompletion INT DEFAULT 50 CHECK (profileCompletion BETWEEN 0 AND 100),
    learningStyle VARCHAR(50),
    preferredTime TEXT,
    notificationEmail BOOLEAN DEFAULT true,
    notificationPush BOOLEAN DEFAULT true,
    lastLogin TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Table: Tutor
-- Description: Extended profile for users offering tutoring services
-- ============================================
CREATE TABLE Tutor (
    _id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    subjects TEXT,
    hourlyRate DECIMAL(10,2) DEFAULT 10.00,
    availableSlots TEXT,
    availableSlotsDisplay TEXT,
    preferredLocations TEXT,
    totalSessions INT DEFAULT 0,
    completedSessions INT DEFAULT 0,
    averageRating DECIMAL(3,2) DEFAULT 0.00 CHECK (averageRating BETWEEN 0 AND 5),
    totalReviews INT DEFAULT 0,
    responseTime INT DEFAULT 120,
    isAvailable BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(_id) ON DELETE CASCADE
);

-- ============================================
-- Table: Booking
-- Description: Manages tutoring session requests and schedules
-- ============================================
CREATE TABLE Booking (
    _id VARCHAR(50) PRIMARY KEY,
    studentId VARCHAR(50) NOT NULL,
    tutorId VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL,
    timeSlot VARCHAR(50) NOT NULL,
    duration INT DEFAULT 60,
    location VARCHAR(255) NOT NULL,
    sessionType VARCHAR(20) DEFAULT 'online',
    meetingRoomId VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    cost DECIMAL(10,2) NOT NULL,
    notes TEXT,
    hasReview BOOLEAN DEFAULT false,
    actualStartTime TIMESTAMP,
    actualEndTime TIMESTAMP,
    actualDuration INT,
    sessionNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES User(_id) ON DELETE CASCADE,
    FOREIGN KEY (tutorId) REFERENCES Tutor(_id) ON DELETE CASCADE
);

-- ============================================
-- Table: Review
-- Description: Student feedback on completed tutoring sessions
-- ============================================
CREATE TABLE Review (
    _id VARCHAR(50) PRIMARY KEY,
    bookingId VARCHAR(50) NOT NULL UNIQUE,
    tutorId VARCHAR(50) NOT NULL,
    studentId VARCHAR(50) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    tags TEXT,
    isAnonymous BOOLEAN DEFAULT false,
    isVerified BOOLEAN DEFAULT false,
    helpfulCount INT DEFAULT 0,
    tutorResponse TEXT,
    tutorResponseDate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES Booking(_id) ON DELETE CASCADE,
    FOREIGN KEY (tutorId) REFERENCES User(_id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES User(_id) ON DELETE CASCADE
);

-- ============================================
-- Table: Subject
-- Description: Centralized catalog of available subjects for tutoring
-- ============================================
CREATE TABLE Subject (
    _id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    yearLevel INT CHECK (yearLevel BETWEEN 1 AND 3),
    description TEXT,
    prerequisites TEXT,
    isActive BOOLEAN DEFAULT true,
    tutorCount INT DEFAULT 0,
    demandScore INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes for Query Optimization
-- ============================================

-- User indexes
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_role ON User(role);
CREATE INDEX idx_user_school ON User(school);

-- Tutor indexes
CREATE INDEX idx_tutor_userId ON Tutor(userId);
CREATE INDEX idx_tutor_rating ON Tutor(averageRating DESC);
CREATE INDEX idx_tutor_hourlyRate ON Tutor(hourlyRate);
CREATE INDEX idx_tutor_available ON Tutor(isAvailable);

-- Booking indexes
CREATE INDEX idx_booking_student ON Booking(studentId, status);
CREATE INDEX idx_booking_tutor ON Booking(tutorId, status);
CREATE INDEX idx_booking_date ON Booking(date DESC);
CREATE INDEX idx_booking_status ON Booking(status);

-- Review indexes
CREATE INDEX idx_review_booking ON Review(bookingId);
CREATE INDEX idx_review_tutor ON Review(tutorId, createdAt DESC);
CREATE INDEX idx_review_student ON Review(studentId, createdAt DESC);
CREATE INDEX idx_review_verified ON Review(isVerified);

-- Subject indexes
CREATE INDEX idx_subject_code ON Subject(code);
CREATE INDEX idx_subject_category ON Subject(category);
CREATE INDEX idx_subject_active ON Subject(isActive);

-- ============================================
-- Sample Data Relationships
-- ============================================

-- Step 1: Insert Users (must be done first due to foreign keys)
-- Example: Student alice_student
INSERT INTO User (_id, username, email, password, role, major, yearOfStudy, credits, profileCompletion)
VALUES ('user_001', 'alice_student', 'alice@tp.edu.sg', '$2b$10$hashpassword1', 'student', 'Information Technology', 2, 150, 80);

-- Example: Tutor user bob_tutor
INSERT INTO User (_id, username, email, password, role, major, yearOfStudy, credits, profileCompletion)
VALUES ('user_002', 'bob_tutor', 'bob@tp.edu.sg', '$2b$10$hashpassword2', 'tutor', 'Information Technology', 3, 200, 100);

-- Example: Tutor user maya_tutor
INSERT INTO User (_id, username, email, password, role, major, yearOfStudy, credits, profileCompletion)
VALUES ('user_010', 'maya_tutor', 'maya@tp.edu.sg', '$2b$10$hashpassword3', 'tutor', 'Information Technology', 3, 300, 100);

-- Step 2: Insert Tutors (references User table)
-- Example: Tutor profile for bob_tutor
INSERT INTO Tutor (_id, userId, bio, hourlyRate, averageRating, totalReviews, totalSessions, completedSessions, responseTime, isAvailable)
VALUES ('tutor_001', 'user_002', 'Database expert specializing in optimization and SQL.', 35.00, 4.90, 28, 65, 63, 50, true);

-- Example: Tutor profile for maya_tutor
INSERT INTO Tutor (_id, userId, bio, hourlyRate, averageRating, totalReviews, totalSessions, completedSessions, responseTime, isAvailable)
VALUES ('tutor_002', 'user_010', 'AI and Machine Learning specialist. Passionate about data science, Python, and neural networks.', 45.00, 4.95, 32, 75, 73, 45, true);

-- Step 3: Insert Subject (independent table)
INSERT INTO Subject (_id, code, name, category, yearLevel, description, isActive, tutorCount, demandScore)
VALUES ('subject_001', 'DBAV', 'Database and Advanced Visualization', 'Information Technology', 2, 'Learn database design, SQL optimization, and data visualization techniques.', true, 8, 87);

-- Step 4: Insert Booking (references User and Tutor)
INSERT INTO Booking (_id, studentId, tutorId, subject, date, timeSlot, duration, location, sessionType, status, cost, notes)
VALUES ('booking_001', 'user_001', 'tutor_001', 'DBAV', '2025-11-15 14:00:00', '14:00-15:00', 60, 'TP Library', 'offline', 'completed', 35.00, 'Help with database optimization');

-- Step 5: Insert Review (references Booking and User)
INSERT INTO Review (_id, bookingId, tutorId, studentId, rating, comment, tags, isAnonymous, isVerified, helpfulCount)
VALUES ('review_001', 'booking_001', 'user_002', 'user_001', 5, 'Excellent tutor! Bob explained database optimization concepts very clearly and patiently.', 'Clear Explanations,Patient,Knowledgeable', false, true, 3);

-- ============================================
-- Entity Relationships Summary
-- ============================================

-- User (1) ──── (1) Tutor
-- User (1) ──── (M) Booking (as student)
-- Tutor (1) ──── (M) Booking (as tutor)
-- Booking (1) ──── (1) Review
-- User (1) ──── (M) Review (as student)
-- User (1) ──── (M) Review (as tutor)
-- Subject (M) ──── (M) Tutor (via subjects array)
-- Subject (M) ──── (M) Booking (via subject string)
