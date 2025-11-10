import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from server directory
dotenv.config({ path: join(__dirname, '../../.env') });

import User from '../models/User.js';
import Tutor from '../models/Tutor.js';
import Booking from '../models/Booking.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Tutor.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create Users (Students & Tutors)
    console.log('👥 Creating users...');

    const password = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      // Students
      {
        username: 'alice_student',
        email: 'alice@tp.edu.sg',
        password: password,
        role: 'student',
        school: 'Temasek Polytechnic',
        major: 'Information Technology',
        yearOfStudy: 2,
        credits: 150,
        profileCompletion: 80,
        badges: ['early-adopter'],
      },
      {
        username: 'charlie_student',
        email: 'charlie@tp.edu.sg',
        password: password,
        role: 'student',
        school: 'Temasek Polytechnic',
        major: 'Business',
        yearOfStudy: 1,
        credits: 100,
        profileCompletion: 60,
      },
      {
        username: 'diana_student',
        email: 'diana@tp.edu.sg',
        password: password,
        role: 'student',
        school: 'Temasek Polytechnic',
        major: 'Engineering',
        yearOfStudy: 3,
        credits: 200,
        profileCompletion: 90,
        badges: ['top-learner'],
      },
      {
        username: 'edward_student',
        email: 'edward@tp.edu.sg',
        password: password,
        role: 'student',
        school: 'Temasek Polytechnic',
        major: 'Information Technology',
        yearOfStudy: 1,
        credits: 120,
        profileCompletion: 70,
      },
      {
        username: 'fiona_student',
        email: 'fiona@tp.edu.sg',
        password: password,
        role: 'student',
        school: 'Temasek Polytechnic',
        major: 'Design',
        yearOfStudy: 2,
        credits: 180,
        profileCompletion: 85,
        badges: ['creative'],
      },
      {
        username: 'george_student',
        email: 'george@tp.edu.sg',
        password: password,
        role: 'student',
        school: 'Temasek Polytechnic',
        major: 'Business',
        yearOfStudy: 2,
        credits: 140,
        profileCompletion: 75,
      },
      {
        username: 'hannah_student',
        email: 'hannah@tp.edu.sg',
        password: password,
        role: 'student',
        school: 'Temasek Polytechnic',
        major: 'Engineering',
        yearOfStudy: 1,
        credits: 90,
        profileCompletion: 55,
      },
      {
        username: 'ivan_student',
        email: 'ivan@tp.edu.sg',
        password: password,
        role: 'student',
        school: 'Temasek Polytechnic',
        major: 'Information Technology',
        yearOfStudy: 3,
        credits: 220,
        profileCompletion: 95,
        badges: ['tech-wizard', 'helpful'],
      },
      // Tutors
      {
        username: 'bob_tutor',
        email: 'bob@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Computer Science',
        yearOfStudy: 3,
        credits: 300,
        bio: 'Experienced CS tutor specializing in algorithms and data structures',
        profileCompletion: 100,
        badges: ['top-tutor', 'helpful'],
      },
      {
        username: 'emily_tutor',
        email: 'emily@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Mathematics',
        yearOfStudy: 3,
        credits: 250,
        bio: 'Math enthusiast with a passion for teaching. Specializing in calculus and statistics.',
        profileCompletion: 95,
        badges: ['patient-tutor'],
      },
      {
        username: 'frank_tutor',
        email: 'frank@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Business Administration',
        yearOfStudy: 3,
        credits: 180,
        bio: 'Business studies tutor with real-world experience. Can help with accounting and marketing.',
        profileCompletion: 85,
      },
      {
        username: 'grace_tutor',
        email: 'grace@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Engineering',
        yearOfStudy: 3,
        credits: 220,
        bio: 'Engineering tutor specializing in mechanics and electronics. Patient and thorough.',
        profileCompletion: 90,
        badges: ['responsive'],
      },
      {
        username: 'henry_tutor',
        email: 'henry@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Information Technology',
        yearOfStudy: 3,
        credits: 280,
        bio: 'Web development and database expert. Can teach HTML, CSS, JavaScript, React, and SQL.',
        profileCompletion: 100,
        badges: ['coding-guru', 'helpful'],
      },
      {
        username: 'iris_tutor',
        email: 'iris@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Design',
        yearOfStudy: 3,
        credits: 200,
        bio: 'UI/UX designer and graphic design tutor. Proficient in Figma, Adobe Creative Suite.',
        profileCompletion: 90,
        badges: ['creative-genius'],
      },
      {
        username: 'jack_tutor',
        email: 'jack@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Information Technology',
        yearOfStudy: 3,
        credits: 260,
        bio: 'Network and cybersecurity specialist. Can teach networking fundamentals and security best practices.',
        profileCompletion: 95,
        badges: ['security-expert', 'patient-tutor'],
      },
      {
        username: 'kelly_tutor',
        email: 'kelly@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Mathematics',
        yearOfStudy: 3,
        credits: 240,
        bio: 'Math and physics tutor. Strong in algebra, trigonometry, and mechanics.',
        profileCompletion: 88,
      },
      {
        username: 'leo_tutor',
        email: 'leo@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Business',
        yearOfStudy: 3,
        credits: 210,
        bio: 'Economics and finance tutor. Can help with microeconomics, macroeconomics, and financial management.',
        profileCompletion: 85,
        badges: ['finance-pro'],
      },
      // Additional diverse tutors
      {
        username: 'maya_tutor',
        email: 'maya@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Information Technology',
        yearOfStudy: 3,
        credits: 270,
        bio: 'AI and Machine Learning specialist. Passionate about data science, Python, and neural networks.',
        profileCompletion: 98,
        badges: ['ai-expert', 'top-tutor', 'innovative'],
      },
      {
        username: 'nathan_tutor',
        email: 'nathan@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Information Technology',
        yearOfStudy: 2,
        credits: 190,
        bio: 'Mobile app developer. Teaching Android and iOS development with React Native and Flutter.',
        profileCompletion: 82,
        badges: ['mobile-dev', 'patient-tutor'],
      },
      {
        username: 'olivia_tutor',
        email: 'olivia@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Design',
        yearOfStudy: 3,
        credits: 230,
        bio: 'Animation and video editing expert. Adobe After Effects, Premiere Pro, and 3D modeling.',
        profileCompletion: 93,
        badges: ['creative-genius', 'responsive'],
      },
      {
        username: 'peter_tutor',
        email: 'peter@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Engineering',
        yearOfStudy: 2,
        credits: 170,
        bio: 'Mechanical engineering student. Strong in CAD, thermodynamics, and materials science.',
        profileCompletion: 75,
      },
      {
        username: 'quinn_tutor',
        email: 'quinn@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Business',
        yearOfStudy: 3,
        credits: 245,
        bio: 'Digital marketing and e-commerce specialist. SEO, social media marketing, and analytics.',
        profileCompletion: 91,
        badges: ['marketing-guru', 'helpful'],
      },
      {
        username: 'rachel_tutor',
        email: 'rachel@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Information Technology',
        yearOfStudy: 3,
        credits: 255,
        bio: 'Cloud computing and DevOps engineer. AWS, Docker, Kubernetes, and CI/CD pipelines.',
        profileCompletion: 96,
        badges: ['cloud-expert', 'top-tutor'],
      },
      {
        username: 'sam_tutor',
        email: 'sam@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Mathematics',
        yearOfStudy: 2,
        credits: 195,
        bio: 'Budget-friendly math tutor. Good at explaining complex concepts in simple terms.',
        profileCompletion: 70,
        badges: ['affordable', 'patient-tutor'],
      },
      {
        username: 'tina_tutor',
        email: 'tina@tp.edu.sg',
        password: password,
        role: 'tutor',
        school: 'Temasek Polytechnic',
        major: 'Business',
        yearOfStudy: 3,
        credits: 225,
        bio: 'Supply chain management and logistics expert. Project management and operations.',
        profileCompletion: 88,
        badges: ['operations-pro'],
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Find students and tutors
    const students = users.filter(u => u.role === 'student');
    const tutorUsers = users.filter(u => u.role === 'tutor');

    // Create Tutor Profiles
    console.log('🎓 Creating tutor profiles...');

    const tutors = await Tutor.insertMany([
      {
        userId: tutorUsers[0]._id, // bob_tutor
        bio: 'Experienced CS tutor specializing in algorithms and data structures',
        subjects: [
          { code: 'CS101', name: 'Programming Fundamentals', grade: 'A' },
          { code: 'CS201', name: 'Data Structures', grade: 'A' },
          { code: 'CS301', name: 'Algorithms', grade: 'A+' },
        ],
        hourlyRate: 25,
        availableSlots: [
          { day: 'Monday', startTime: '14:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
          { day: 'Friday', startTime: '10:00', endTime: '12:00' },
        ],
        preferredLocations: ['TP Library', 'Starbucks @ TP', 'Online'],
        averageRating: 4.8,
        totalReviews: 15,
        totalSessions: 48,
        completedSessions: 45,
        responseTime: 120,
        isAvailable: true,
      },
      {
        userId: tutorUsers[1]._id, // emily_tutor
        bio: 'Math enthusiast with a passion for teaching. Specializing in calculus and statistics.',
        subjects: [
          { code: 'MATH101', name: 'Calculus I', grade: 'A+' },
          { code: 'MATH201', name: 'Calculus II', grade: 'A' },
          { code: 'MATH301', name: 'Statistics', grade: 'A' },
          { code: 'MATH302', name: 'Linear Algebra', grade: 'A+' },
        ],
        hourlyRate: 30,
        availableSlots: [
          { day: 'Tuesday', startTime: '13:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '13:00', endTime: '17:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '12:00' },
        ],
        preferredLocations: ['TP Library', 'Online', 'Tampines Mall'],
        averageRating: 4.9,
        totalReviews: 22,
        totalSessions: 67,
        completedSessions: 65,
        responseTime: 90,
        isAvailable: true,
      },
      {
        userId: tutorUsers[2]._id, // frank_tutor
        bio: 'Business studies tutor with real-world experience. Can help with accounting and marketing.',
        subjects: [
          { code: 'BUS101', name: 'Business Fundamentals', grade: 'A' },
          { code: 'ACC101', name: 'Accounting Principles', grade: 'A+' },
          { code: 'MKT201', name: 'Marketing Strategy', grade: 'A' },
        ],
        hourlyRate: 28,
        availableSlots: [
          { day: 'Monday', startTime: '18:00', endTime: '21:00' },
          { day: 'Wednesday', startTime: '18:00', endTime: '21:00' },
          { day: 'Friday', startTime: '18:00', endTime: '21:00' },
        ],
        preferredLocations: ['TP Library', 'Online', 'Bedok Library'],
        averageRating: 4.6,
        totalReviews: 12,
        totalSessions: 35,
        completedSessions: 33,
        responseTime: 150,
        isAvailable: true,
      },
      {
        userId: tutorUsers[3]._id, // grace_tutor
        bio: 'Engineering tutor specializing in mechanics and electronics. Patient and thorough.',
        subjects: [
          { code: 'ENG101', name: 'Engineering Mechanics', grade: 'A' },
          { code: 'ENG201', name: 'Electronics', grade: 'A+' },
          { code: 'ENG301', name: 'Circuit Analysis', grade: 'A' },
        ],
        hourlyRate: 32,
        availableSlots: [
          { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
        ],
        preferredLocations: ['TP Engineering Lab', 'TP Library', 'Online'],
        averageRating: 4.7,
        totalReviews: 18,
        totalSessions: 52,
        completedSessions: 50,
        responseTime: 110,
        isAvailable: true,
      },
      {
        userId: tutorUsers[4]._id, // henry_tutor
        bio: 'Web development and database expert. Can teach HTML, CSS, JavaScript, React, and SQL.',
        subjects: [
          { code: 'WEB101', name: 'Web Development Basics', grade: 'A+' },
          { code: 'WEB201', name: 'Frontend Development', grade: 'A+' },
          { code: 'DB101', name: 'Database Systems', grade: 'A' },
          { code: 'JS301', name: 'Advanced JavaScript', grade: 'A+' },
        ],
        hourlyRate: 35,
        availableSlots: [
          { day: 'Monday', startTime: '15:00', endTime: '19:00' },
          { day: 'Wednesday', startTime: '15:00', endTime: '19:00' },
          { day: 'Friday', startTime: '15:00', endTime: '19:00' },
          { day: 'Saturday', startTime: '10:00', endTime: '14:00' },
        ],
        preferredLocations: ['Online', 'TP Library', 'Starbucks @ TP'],
        averageRating: 4.95,
        totalReviews: 28,
        totalSessions: 89,
        completedSessions: 87,
        responseTime: 60,
        isAvailable: true,
      },
      {
        userId: tutorUsers[5]._id, // iris_tutor
        bio: 'UI/UX designer and graphic design tutor. Proficient in Figma, Adobe Creative Suite.',
        subjects: [
          { code: 'DES101', name: 'Design Fundamentals', grade: 'A+' },
          { code: 'UX201', name: 'UI/UX Design', grade: 'A+' },
          { code: 'GD101', name: 'Graphic Design', grade: 'A' },
        ],
        hourlyRate: 30,
        availableSlots: [
          { day: 'Tuesday', startTime: '14:00', endTime: '18:00' },
          { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
          { day: 'Saturday', startTime: '10:00', endTime: '13:00' },
        ],
        preferredLocations: ['TP Design Studio', 'Online', 'Starbucks @ TP'],
        averageRating: 4.85,
        totalReviews: 20,
        totalSessions: 45,
        completedSessions: 43,
        responseTime: 80,
        isAvailable: true,
      },
      {
        userId: tutorUsers[6]._id, // jack_tutor
        bio: 'Network and cybersecurity specialist. Can teach networking fundamentals and security best practices.',
        subjects: [
          { code: 'NET101', name: 'Networking Fundamentals', grade: 'A+' },
          { code: 'SEC201', name: 'Cybersecurity', grade: 'A+' },
          { code: 'CS401', name: 'System Administration', grade: 'A' },
        ],
        hourlyRate: 38,
        availableSlots: [
          { day: 'Monday', startTime: '16:00', endTime: '20:00' },
          { day: 'Wednesday', startTime: '16:00', endTime: '20:00' },
          { day: 'Friday', startTime: '16:00', endTime: '20:00' },
        ],
        preferredLocations: ['TP IT Lab', 'Online'],
        averageRating: 4.9,
        totalReviews: 25,
        totalSessions: 60,
        completedSessions: 58,
        responseTime: 70,
        isAvailable: true,
      },
      {
        userId: tutorUsers[7]._id, // kelly_tutor
        bio: 'Math and physics tutor. Strong in algebra, trigonometry, and mechanics.',
        subjects: [
          { code: 'MATH101', name: 'Calculus I', grade: 'A' },
          { code: 'MATH201', name: 'Calculus II', grade: 'A+' },
          { code: 'PHY101', name: 'Physics I', grade: 'A' },
          { code: 'PHY201', name: 'Physics II', grade: 'A+' },
        ],
        hourlyRate: 28,
        availableSlots: [
          { day: 'Tuesday', startTime: '15:00', endTime: '19:00' },
          { day: 'Thursday', startTime: '15:00', endTime: '19:00' },
        ],
        preferredLocations: ['TP Library', 'Online', 'Tampines Library'],
        averageRating: 4.75,
        totalReviews: 16,
        totalSessions: 38,
        completedSessions: 37,
        responseTime: 100,
        isAvailable: true,
      },
      {
        userId: tutorUsers[8]._id, // leo_tutor
        bio: 'Economics and finance tutor. Can help with microeconomics, macroeconomics, and financial management.',
        subjects: [
          { code: 'ECON101', name: 'Microeconomics', grade: 'A+' },
          { code: 'ECON201', name: 'Macroeconomics', grade: 'A' },
          { code: 'FIN101', name: 'Financial Management', grade: 'A+' },
        ],
        hourlyRate: 32,
        availableSlots: [
          { day: 'Monday', startTime: '13:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '13:00', endTime: '17:00' },
          { day: 'Friday', startTime: '13:00', endTime: '17:00' },
        ],
        preferredLocations: ['TP Library', 'Online', 'Bedok Library'],
        averageRating: 4.8,
        totalReviews: 19,
        totalSessions: 42,
        completedSessions: 40,
        responseTime: 90,
        isAvailable: true,
      },
      // New diverse tutor profiles
      {
        userId: tutorUsers[9]._id, // maya_tutor
        bio: 'AI and Machine Learning specialist. Passionate about data science, Python, and neural networks.',
        subjects: [
          { code: 'AI101', name: 'Artificial Intelligence Fundamentals', grade: 'A+' },
          { code: 'ML201', name: 'Machine Learning', grade: 'A+' },
          { code: 'DS301', name: 'Data Science', grade: 'A+' },
          { code: 'PY201', name: 'Advanced Python', grade: 'A+' },
        ],
        hourlyRate: 45,
        availableSlots: [
          { day: 'Tuesday', startTime: '19:00', endTime: '22:00' },
          { day: 'Thursday', startTime: '19:00', endTime: '22:00' },
          { day: 'Saturday', startTime: '14:00', endTime: '18:00' },
        ],
        preferredLocations: ['Online', 'TP IT Lab', 'Starbucks @ TP'],
        averageRating: 4.95,
        totalReviews: 32,
        totalSessions: 75,
        completedSessions: 73,
        responseTime: 45,
        isAvailable: true,
      },
      {
        userId: tutorUsers[10]._id, // nathan_tutor
        bio: 'Mobile app developer. Teaching Android and iOS development with React Native and Flutter.',
        subjects: [
          { code: 'MOB101', name: 'Mobile Development Basics', grade: 'A' },
          { code: 'RN201', name: 'React Native', grade: 'A+' },
          { code: 'FLT201', name: 'Flutter Development', grade: 'A' },
        ],
        hourlyRate: 33,
        availableSlots: [
          { day: 'Monday', startTime: '17:00', endTime: '21:00' },
          { day: 'Wednesday', startTime: '17:00', endTime: '21:00' },
          { day: 'Sunday', startTime: '10:00', endTime: '14:00' },
        ],
        preferredLocations: ['Online', 'TP Library', 'Bedok Mall'],
        averageRating: 4.7,
        totalReviews: 14,
        totalSessions: 29,
        completedSessions: 28,
        responseTime: 130,
        isAvailable: true,
      },
      {
        userId: tutorUsers[11]._id, // olivia_tutor
        bio: 'Animation and video editing expert. Adobe After Effects, Premiere Pro, and 3D modeling.',
        subjects: [
          { code: 'ANI101', name: 'Animation Basics', grade: 'A+' },
          { code: 'VID201', name: 'Video Editing', grade: 'A+' },
          { code: '3D101', name: '3D Modeling', grade: 'A' },
          { code: 'AE201', name: 'After Effects Advanced', grade: 'A+' },
        ],
        hourlyRate: 40,
        availableSlots: [
          { day: 'Tuesday', startTime: '10:00', endTime: '13:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '13:00' },
          { day: 'Saturday', startTime: '15:00', endTime: '19:00' },
        ],
        preferredLocations: ['TP Design Studio', 'Online'],
        averageRating: 4.9,
        totalReviews: 24,
        totalSessions: 56,
        completedSessions: 54,
        responseTime: 75,
        isAvailable: true,
      },
      {
        userId: tutorUsers[12]._id, // peter_tutor
        bio: 'Mechanical engineering student. Strong in CAD, thermodynamics, and materials science.',
        subjects: [
          { code: 'CAD101', name: 'CAD Design', grade: 'A' },
          { code: 'THM201', name: 'Thermodynamics', grade: 'A' },
          { code: 'MAT101', name: 'Materials Science', grade: 'A+' },
        ],
        hourlyRate: 26,
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '12:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '12:00' },
          { day: 'Friday', startTime: '09:00', endTime: '12:00' },
        ],
        preferredLocations: ['TP Engineering Lab', 'TP Library', 'Online'],
        averageRating: 4.65,
        totalReviews: 10,
        totalSessions: 22,
        completedSessions: 21,
        responseTime: 180,
        isAvailable: true,
      },
      {
        userId: tutorUsers[13]._id, // quinn_tutor
        bio: 'Digital marketing and e-commerce specialist. SEO, social media marketing, and analytics.',
        subjects: [
          { code: 'DM101', name: 'Digital Marketing', grade: 'A+' },
          { code: 'SEO201', name: 'SEO & SEM', grade: 'A+' },
          { code: 'SMM201', name: 'Social Media Marketing', grade: 'A' },
          { code: 'ANA101', name: 'Marketing Analytics', grade: 'A+' },
        ],
        hourlyRate: 36,
        availableSlots: [
          { day: 'Tuesday', startTime: '16:00', endTime: '20:00' },
          { day: 'Thursday', startTime: '16:00', endTime: '20:00' },
          { day: 'Saturday', startTime: '11:00', endTime: '15:00' },
        ],
        preferredLocations: ['Online', 'Starbucks @ TP', 'Tampines Mall'],
        averageRating: 4.85,
        totalReviews: 21,
        totalSessions: 48,
        completedSessions: 46,
        responseTime: 65,
        isAvailable: true,
      },
      {
        userId: tutorUsers[14]._id, // rachel_tutor
        bio: 'Cloud computing and DevOps engineer. AWS, Docker, Kubernetes, and CI/CD pipelines.',
        subjects: [
          { code: 'CLOUD101', name: 'Cloud Computing', grade: 'A+' },
          { code: 'AWS201', name: 'AWS Architecture', grade: 'A+' },
          { code: 'DOC201', name: 'Docker & Containers', grade: 'A+' },
          { code: 'CICD301', name: 'DevOps & CI/CD', grade: 'A' },
        ],
        hourlyRate: 42,
        availableSlots: [
          { day: 'Monday', startTime: '18:30', endTime: '21:30' },
          { day: 'Wednesday', startTime: '18:30', endTime: '21:30' },
          { day: 'Sunday', startTime: '13:00', endTime: '17:00' },
        ],
        preferredLocations: ['Online', 'TP IT Lab'],
        averageRating: 4.92,
        totalReviews: 27,
        totalSessions: 63,
        completedSessions: 61,
        responseTime: 55,
        isAvailable: true,
      },
      {
        userId: tutorUsers[15]._id, // sam_tutor
        bio: 'Budget-friendly math tutor. Good at explaining complex concepts in simple terms.',
        subjects: [
          { code: 'MATH101', name: 'Calculus I', grade: 'A' },
          { code: 'MATH201', name: 'Calculus II', grade: 'A' },
          { code: 'ALG101', name: 'Algebra', grade: 'A+' },
        ],
        hourlyRate: 18,
        availableSlots: [
          { day: 'Monday', startTime: '10:00', endTime: '14:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '14:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
          { day: 'Friday', startTime: '10:00', endTime: '14:00' },
        ],
        preferredLocations: ['TP Library', 'Online'],
        averageRating: 4.6,
        totalReviews: 11,
        totalSessions: 26,
        completedSessions: 25,
        responseTime: 200,
        isAvailable: true,
      },
      {
        userId: tutorUsers[16]._id, // tina_tutor
        bio: 'Supply chain management and logistics expert. Project management and operations.',
        subjects: [
          { code: 'SCM101', name: 'Supply Chain Management', grade: 'A+' },
          { code: 'LOG201', name: 'Logistics', grade: 'A' },
          { code: 'PM101', name: 'Project Management', grade: 'A+' },
          { code: 'OPS201', name: 'Operations Management', grade: 'A' },
        ],
        hourlyRate: 31,
        availableSlots: [
          { day: 'Tuesday', startTime: '14:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '14:00', endTime: '17:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '12:00' },
        ],
        preferredLocations: ['TP Library', 'Online', 'Tampines Library'],
        averageRating: 4.78,
        totalReviews: 17,
        totalSessions: 39,
        completedSessions: 38,
        responseTime: 95,
        isAvailable: true,
      },
    ]);

    console.log(`✅ Created ${tutors.length} tutor profiles`);

    // Create Bookings
    console.log('📅 Creating bookings...');

    const bookings = await Booking.insertMany([
      // Completed bookings
      {
        studentId: students[0]._id, // alice
        tutorId: tutors[0]._id, // bob
        subject: 'CS101',
        date: new Date('2025-10-15T14:00:00'),
        timeSlot: '14:00-15:00',
        duration: 1,
        location: 'TP Library',
        status: 'completed',
        cost: 25,
        notes: 'Help with sorting algorithms',
      },
      {
        studentId: students[0]._id, // alice
        tutorId: tutors[1]._id, // emily
        subject: 'MATH101',
        date: new Date('2025-10-20T13:00:00'),
        timeSlot: '13:00-15:00',
        duration: 2,
        location: 'Online',
        sessionType: 'online',
        status: 'completed',
        cost: 60,
        notes: 'Calculus review for midterm',
      },
      {
        studentId: students[1]._id, // charlie
        tutorId: tutors[2]._id, // frank
        subject: 'ACC101',
        date: new Date('2025-10-18T18:00:00'),
        timeSlot: '18:00-19:00',
        duration: 1,
        location: 'Online',
        sessionType: 'online',
        status: 'completed',
        cost: 28,
        notes: 'Balance sheet fundamentals',
      },
      {
        studentId: students[2]._id, // diana
        tutorId: tutors[3]._id, // grace
        subject: 'ENG201',
        date: new Date('2025-10-22T10:00:00'),
        timeSlot: '10:00-12:00',
        duration: 2,
        location: 'TP Engineering Lab',
        status: 'completed',
        cost: 64,
        notes: 'Circuit analysis practice',
      },
      // Confirmed upcoming bookings
      // TEST BOOKING - Active now for video testing
      {
        studentId: students[0]._id, // alice
        tutorId: tutors[4]._id, // henry
        subject: 'WEB201 - Video Test Session',
        date: new Date(), // Current time
        timeSlot: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        duration: 1,
        location: 'Online',
        sessionType: 'online',
        status: 'confirmed',
        cost: 35,
        notes: 'Test video session - Join now to test video conferencing',
      },
      {
        studentId: students[0]._id, // alice
        tutorId: tutors[4]._id, // henry
        subject: 'WEB201',
        date: new Date('2025-11-10T15:00:00'),
        timeSlot: '15:00-17:00',
        duration: 2,
        location: 'Online',
        sessionType: 'online',
        status: 'confirmed',
        cost: 70,
        notes: 'React hooks and state management',
      },
      {
        studentId: students[1]._id, // charlie
        tutorId: tutors[0]._id, // bob
        subject: 'CS201',
        date: new Date('2025-11-08T14:00:00'),
        timeSlot: '14:00-16:00',
        duration: 2,
        location: 'TP Library',
        status: 'confirmed',
        cost: 50,
        notes: 'Binary search trees and traversal',
      },
      {
        studentId: students[2]._id, // diana
        tutorId: tutors[1]._id, // emily
        subject: 'MATH301',
        date: new Date('2025-11-12T13:00:00'),
        timeSlot: '13:00-14:00',
        duration: 1,
        location: 'TP Library',
        status: 'confirmed',
        cost: 30,
        notes: 'Probability distributions',
      },
      // Pending bookings
      {
        studentId: students[0]._id, // alice
        tutorId: tutors[2]._id, // frank
        subject: 'BUS101',
        date: new Date('2025-11-15T18:00:00'),
        timeSlot: '18:00-19:00',
        duration: 1,
        location: 'Online',
        sessionType: 'online',
        status: 'pending',
        cost: 28,
        notes: 'Business strategy concepts',
      },
      {
        studentId: students[1]._id, // charlie
        tutorId: tutors[1]._id, // emily
        subject: 'MATH101',
        date: new Date('2025-11-14T14:00:00'),
        timeSlot: '14:00-15:00',
        duration: 1,
        location: 'Online',
        sessionType: 'online',
        status: 'pending',
        cost: 30,
        notes: 'Derivatives and integrals',
      },
      // More completed bookings
      {
        studentId: students[3]._id, // edward
        tutorId: tutors[4]._id, // henry
        subject: 'WEB101',
        date: new Date('2025-10-25T15:00:00'),
        timeSlot: '15:00-16:00',
        duration: 1,
        location: 'Online',
        sessionType: 'online',
        status: 'completed',
        cost: 35,
        notes: 'HTML and CSS basics',
      },
      {
        studentId: students[4]._id, // fiona
        tutorId: tutors[5]._id, // iris
        subject: 'DES101',
        date: new Date('2025-10-19T14:00:00'),
        timeSlot: '14:00-16:00',
        duration: 2,
        location: 'TP Design Studio',
        status: 'completed',
        cost: 60,
        notes: 'Design principles and color theory',
      },
      {
        studentId: students[5]._id, // george
        tutorId: tutors[8]._id, // leo
        subject: 'ECON101',
        date: new Date('2025-10-21T13:00:00'),
        timeSlot: '13:00-14:00',
        duration: 1,
        location: 'TP Library',
        status: 'completed',
        cost: 32,
        notes: 'Supply and demand concepts',
      },
      {
        studentId: students[6]._id, // hannah
        tutorId: tutors[3]._id, // grace
        subject: 'ENG101',
        date: new Date('2025-10-17T10:00:00'),
        timeSlot: '10:00-12:00',
        duration: 2,
        location: 'TP Engineering Lab',
        status: 'completed',
        cost: 64,
        notes: 'Statics and force diagrams',
      },
      {
        studentId: students[7]._id, // ivan
        tutorId: tutors[6]._id, // jack
        subject: 'NET101',
        date: new Date('2025-10-23T16:00:00'),
        timeSlot: '16:00-18:00',
        duration: 2,
        location: 'TP IT Lab',
        status: 'completed',
        cost: 76,
        notes: 'TCP/IP and network layers',
      },
      // More confirmed upcoming bookings
      {
        studentId: students[3]._id, // edward
        tutorId: tutors[0]._id, // bob
        subject: 'CS101',
        date: new Date('2025-11-11T14:00:00'),
        timeSlot: '14:00-15:00',
        duration: 1,
        location: 'TP Library',
        status: 'confirmed',
        cost: 25,
        notes: 'Loops and conditionals',
      },
      {
        studentId: students[4]._id, // fiona
        tutorId: tutors[5]._id, // iris
        subject: 'UX201',
        date: new Date('2025-11-13T14:00:00'),
        timeSlot: '14:00-16:00',
        duration: 2,
        location: 'Online',
        sessionType: 'online',
        status: 'confirmed',
        cost: 60,
        notes: 'User research and wireframing',
      },
      {
        studentId: students[5]._id, // george
        tutorId: tutors[2]._id, // frank
        subject: 'ACC101',
        date: new Date('2025-11-09T18:00:00'),
        timeSlot: '18:00-19:00',
        duration: 1,
        location: 'Online',
        sessionType: 'online',
        status: 'confirmed',
        cost: 28,
        notes: 'Financial statements',
      },
      {
        studentId: students[6]._id, // hannah
        tutorId: tutors[7]._id, // kelly
        subject: 'PHY101',
        date: new Date('2025-11-16T15:00:00'),
        timeSlot: '15:00-17:00',
        duration: 2,
        location: 'TP Library',
        status: 'confirmed',
        cost: 56,
        notes: 'Kinematics and motion',
      },
      {
        studentId: students[7]._id, // ivan
        tutorId: tutors[6]._id, // jack
        subject: 'SEC201',
        date: new Date('2025-11-17T16:00:00'),
        timeSlot: '16:00-18:00',
        duration: 2,
        location: 'Online',
        sessionType: 'online',
        status: 'confirmed',
        cost: 76,
        notes: 'Network security fundamentals',
      },
      // More pending bookings
      {
        studentId: students[3]._id, // edward
        tutorId: tutors[4]._id, // henry
        subject: 'DB101',
        date: new Date('2025-11-18T15:00:00'),
        timeSlot: '15:00-17:00',
        duration: 2,
        location: 'Online',
        sessionType: 'online',
        status: 'pending',
        cost: 70,
        notes: 'SQL queries and database design',
      },
      {
        studentId: students[4]._id, // fiona
        tutorId: tutors[5]._id, // iris
        subject: 'GD101',
        date: new Date('2025-11-19T14:00:00'),
        timeSlot: '14:00-15:00',
        duration: 1,
        location: 'TP Design Studio',
        status: 'pending',
        cost: 30,
        notes: 'Adobe Illustrator basics',
      },
      {
        studentId: students[5]._id, // george
        tutorId: tutors[8]._id, // leo
        subject: 'FIN101',
        date: new Date('2025-11-20T13:00:00'),
        timeSlot: '13:00-15:00',
        duration: 2,
        location: 'TP Library',
        status: 'pending',
        cost: 64,
        notes: 'Time value of money',
      },
      {
        studentId: students[6]._id, // hannah
        tutorId: tutors[3]._id, // grace
        subject: 'ENG201',
        date: new Date('2025-11-21T10:00:00'),
        timeSlot: '10:00-12:00',
        duration: 2,
        location: 'TP Engineering Lab',
        status: 'pending',
        cost: 64,
        notes: 'Circuit theory',
      },
      {
        studentId: students[7]._id, // ivan
        tutorId: tutors[0]._id, // bob
        subject: 'CS301',
        date: new Date('2025-11-22T14:00:00'),
        timeSlot: '14:00-16:00',
        duration: 2,
        location: 'TP Library',
        status: 'pending',
        cost: 50,
        notes: 'Algorithm optimization',
      },
    ]);

    console.log(`✅ Created ${bookings.length} bookings`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length} (${students.length} students, ${tutorUsers.length} tutors)`);
    console.log(`   Tutor Profiles: ${tutors.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log('\n🔐 Login credentials:');
    console.log('   All users: password123');
    console.log('   Students: alice@tp.edu.sg, charlie@tp.edu.sg, diana@tp.edu.sg, edward@tp.edu.sg, fiona@tp.edu.sg, george@tp.edu.sg, hannah@tp.edu.sg, ivan@tp.edu.sg');
    console.log('   Tutors: bob@tp.edu.sg, emily@tp.edu.sg, frank@tp.edu.sg, grace@tp.edu.sg, henry@tp.edu.sg, iris@tp.edu.sg, jack@tp.edu.sg, kelly@tp.edu.sg, leo@tp.edu.sg');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
