import { SUBJECT_CATEGORIES, BOOKING_STATUS, BADGE_TYPES } from './constants';

// Mock User Data - Based on real TP programs
export const mockUsers = [
  {
    userId: 'user001',
    email: 'john.tan@student.tp.edu.sg',
    username: 'John Tan Wei Ming',
    studentId: '2301234A',
    major: 'Information Technology', // T30
    yearOfStudy: 2,
    avatar: 'https://ui-avatars.com/api/?name=John+Tan&background=6366f1&color=fff',
    role: ['student', 'tutor'],
    credits: 150,
    points: 280,
    badges: [BADGE_TYPES.NEWBIE, BADGE_TYPES.EXPERT],
    school: 'Temasek Polytechnic',
    createdAt: '2024-04-15T08:30:00Z',
    isActive: true
  },
  {
    userId: 'user002',
    email: 'sarah.lim@student.tp.edu.sg',
    username: 'Sarah Lim Hui Ting',
    studentId: '2301235B',
    major: 'Applied Artificial Intelligence', // T69
    yearOfStudy: 3,
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Lim&background=10b981&color=fff',
    role: ['student', 'tutor'],
    credits: 200,
    points: 450,
    badges: [BADGE_TYPES.NEWBIE, BADGE_TYPES.EXPERT, BADGE_TYPES.VETERAN],
    school: 'Temasek Polytechnic',
    createdAt: '2024-03-20T10:00:00Z',
    isActive: true
  },
  {
    userId: 'user003',
    email: 'michael.wong@student.tp.edu.sg',
    username: 'Michael Wong Jun Hao',
    studentId: '2201236C',
    major: 'Cybersecurity & Digital Forensics', // T64
    yearOfStudy: 3,
    avatar: 'https://ui-avatars.com/api/?name=Michael+Wong&background=f59e0b&color=fff',
    role: ['student', 'tutor'],
    credits: 180,
    points: 380,
    badges: [BADGE_TYPES.NEWBIE, BADGE_TYPES.VETERAN, BADGE_TYPES.SCHOLAR],
    school: 'Temasek Polytechnic',
    createdAt: '2023-04-10T09:00:00Z',
    isActive: true
  },
  {
    userId: 'user004',
    email: 'emily.ng@student.tp.edu.sg',
    username: 'Emily Ng Xin Yi',
    studentId: '2301237D',
    major: 'Business Process & Systems Engineering', // T43
    yearOfStudy: 2,
    avatar: 'https://ui-avatars.com/api/?name=Emily+Ng&background=ec4899&color=fff',
    role: ['student', 'tutor'],
    credits: 160,
    points: 320,
    badges: [BADGE_TYPES.NEWBIE, BADGE_TYPES.EXPERT],
    school: 'Temasek Polytechnic',
    createdAt: '2024-04-01T10:00:00Z',
    isActive: true
  },
  {
    userId: 'user005',
    email: 'david.chen@student.tp.edu.sg',
    username: 'David Chen Kai Wen',
    studentId: '2301238E',
    major: 'Immersive Media & Game Development', // T65
    yearOfStudy: 2,
    avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=8b5cf6&color=fff',
    role: ['student', 'tutor'],
    credits: 140,
    points: 250,
    badges: [BADGE_TYPES.NEWBIE],
    school: 'Temasek Polytechnic',
    createdAt: '2024-03-15T14:00:00Z',
    isActive: true
  },
  {
    userId: 'user006',
    email: 'rachel.teo@student.tp.edu.sg',
    username: 'Rachel Teo Mei Ling',
    studentId: '2201239F',
    major: 'Information Technology', // T30
    yearOfStudy: 3,
    avatar: 'https://ui-avatars.com/api/?name=Rachel+Teo&background=06b6d4&color=fff',
    role: ['student', 'tutor'],
    credits: 190,
    points: 410,
    badges: [BADGE_TYPES.NEWBIE, BADGE_TYPES.EXPERT, BADGE_TYPES.VETERAN],
    school: 'Temasek Polytechnic',
    createdAt: '2023-04-20T11:00:00Z',
    isActive: true
  },
  {
    userId: 'user007',
    email: 'james.lee@student.tp.edu.sg',
    username: 'James Lee Wei Jie',
    studentId: '2301240G',
    major: 'Big Data & Analytics', // T61
    yearOfStudy: 2,
    avatar: 'https://ui-avatars.com/api/?name=James+Lee&background=f97316&color=fff',
    role: ['student', 'tutor'],
    credits: 170,
    points: 290,
    badges: [BADGE_TYPES.NEWBIE, BADGE_TYPES.EXPERT],
    school: 'Temasek Polytechnic',
    createdAt: '2024-03-25T09:30:00Z',
    isActive: true
  },
  {
    userId: 'user008',
    email: 'amanda.koh@student.tp.edu.sg',
    username: 'Amanda Koh Si Min',
    studentId: '2301241H',
    major: 'Accountancy & Finance', // T02
    yearOfStudy: 2,
    avatar: 'https://ui-avatars.com/api/?name=Amanda+Koh&background=14b8a6&color=fff',
    role: ['student', 'tutor'],
    credits: 155,
    points: 260,
    badges: [BADGE_TYPES.NEWBIE],
    school: 'Temasek Polytechnic',
    createdAt: '2024-04-05T13:00:00Z',
    isActive: true
  }
];

// Mock Tutor Profile Data - Real TP courses and modules
export const mockTutorProfiles = [
  {
    profileId: 'profile001',
    userId: 'user001',
    bio: 'Year 2 Information Technology student passionate about software development and cloud technologies. Currently pursuing AWS Certified Cloud Practitioner certification. I have completed multiple full-stack projects and enjoy explaining programming concepts in simple, practical terms.',
    subjects: [
      { subjectId: 'sub001', subjectName: 'Programming Fundamentals', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub002', subjectName: 'Object-Oriented Programming', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub003', subjectName: 'Database Design & Administration', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub004', subjectName: 'Web Application Development', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING }
    ],
    completedCourses: [
      { code: 'IT1001', name: 'Programming Fundamentals', grade: 'A' },
      { code: 'IT2001', name: 'Object-Oriented Programming', grade: 'A' },
      { code: 'IT2002', name: 'Database Design & Administration', grade: 'B+' },
      { code: 'IT2003', name: 'Data Structures & Algorithms', grade: 'A' }
    ],
    availableSlots: [
      { day: 'Monday', startTime: '14:00', endTime: '17:00', isRecurring: true },
      { day: 'Wednesday', startTime: '18:00', endTime: '21:00', isRecurring: true },
      { day: 'Friday', startTime: '15:00', endTime: '18:00', isRecurring: true }
    ],
    preferredLocation: ['Library @ TP', 'Online (Zoom/Teams)'],
    languages: ['English', 'Mandarin'],
    totalSessions: 45,
    totalHours: 68.5,
    averageRating: 4.9,
    totalReviews: 28,
    responseRate: 98,
    responseTime: 45,
    isVerified: true,
    status: 'active',
    school: 'Temasek Polytechnic'
  },
  {
    profileId: 'profile002',
    userId: 'user002',
    bio: 'Year 3 Applied AI student with strong foundation in Python, machine learning and data analytics. I have hands-on experience with TensorFlow, scikit-learn, and pandas. My teaching approach focuses on practical applications and real-world datasets to make AI concepts easier to understand.',
    subjects: [
      { subjectId: 'sub001', subjectName: 'Programming Fundamentals', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub005', subjectName: 'Python Programming', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub006', subjectName: 'Data Analytics', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub007', subjectName: 'Machine Learning Fundamentals', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub008', subjectName: 'Mathematics for Computing', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.MATH }
    ],
    completedCourses: [
      { code: 'AI1001', name: 'Introduction to AI', grade: 'A' },
      { code: 'AI2001', name: 'Machine Learning', grade: 'A' },
      { code: 'AI2002', name: 'Data Analytics with Python', grade: 'A' },
      { code: 'AI2003', name: 'Neural Networks & Deep Learning', grade: 'A-' }
    ],
    availableSlots: [
      { day: 'Tuesday', startTime: '16:00', endTime: '19:00', isRecurring: true },
      { day: 'Thursday', startTime: '14:00', endTime: '17:00', isRecurring: true },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00', isRecurring: true }
    ],
    preferredLocation: ['Online (Zoom/Teams)', 'Student Hub @ TP'],
    languages: ['English', 'Mandarin'],
    totalSessions: 52,
    totalHours: 78,
    averageRating: 4.8,
    totalReviews: 35,
    responseRate: 95,
    responseTime: 60,
    isVerified: true,
    status: 'active',
    school: 'Temasek Polytechnic'
  },
  {
    profileId: 'profile003',
    userId: 'user003',
    bio: 'Final year Cybersecurity & Digital Forensics student with industry internship experience. Proficient in network security, ethical hacking, and digital investigation techniques. I can share practical insights from real security assessments and help you understand complex security concepts through hands-on labs.',
    subjects: [
      { subjectId: 'sub002', subjectName: 'Object-Oriented Programming', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub009', subjectName: 'Network Fundamentals', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.OTHER },
      { subjectId: 'sub010', subjectName: 'Cybersecurity Fundamentals', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.OTHER },
      { subjectId: 'sub011', subjectName: 'Ethical Hacking', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.OTHER },
      { subjectId: 'sub012', subjectName: 'Linux Administration', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.OTHER }
    ],
    completedCourses: [
      { code: 'CDF1001', name: 'Introduction to Cybersecurity', grade: 'A' },
      { code: 'CDF2001', name: 'Network Security', grade: 'A' },
      { code: 'CDF2002', name: 'Ethical Hacking & Penetration Testing', grade: 'A' },
      { code: 'CDF3001', name: 'Digital Forensics', grade: 'A-' }
    ],
    availableSlots: [
      { day: 'Monday', startTime: '19:00', endTime: '21:00', isRecurring: true },
      { day: 'Wednesday', startTime: '14:00', endTime: '17:00', isRecurring: true },
      { day: 'Friday', startTime: '18:00', endTime: '21:00', isRecurring: true }
    ],
    preferredLocation: ['Library @ TP', 'Online (Zoom/Teams)'],
    languages: ['English', 'Mandarin'],
    totalSessions: 38,
    totalHours: 57,
    averageRating: 4.7,
    totalReviews: 24,
    responseRate: 92,
    responseTime: 90,
    isVerified: true,
    status: 'active',
    school: 'Temasek Polytechnic'
  },
  {
    profileId: 'profile004',
    userId: 'user004',
    bio: 'Year 2 Business Process & Systems Engineering student combining business analytics, mathematics and programming skills. I help students bridge the gap between technical concepts and business applications, making complex topics more relatable and practical.',
    subjects: [
      { subjectId: 'sub013', subjectName: 'Business Analytics', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.OTHER },
      { subjectId: 'sub014', subjectName: 'Statistics & Probability', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.MATH },
      { subjectId: 'sub008', subjectName: 'Mathematics for Computing', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.MATH },
      { subjectId: 'sub015', subjectName: 'Process Improvement Techniques', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.OTHER }
    ],
    completedCourses: [
      { code: 'BPS1001', name: 'Business Fundamentals', grade: 'A' },
      { code: 'BPS2001', name: 'Business Analytics', grade: 'A' },
      { code: 'BPS2002', name: 'Operations Research', grade: 'A' },
      { code: 'MAT1001', name: 'Mathematics for Business', grade: 'A-' }
    ],
    availableSlots: [
      { day: 'Tuesday', startTime: '10:00', endTime: '13:00', isRecurring: true },
      { day: 'Thursday', startTime: '15:00', endTime: '18:00', isRecurring: true }
    ],
    preferredLocation: ['Library @ TP', 'Study Pods @ TP'],
    languages: ['English'],
    totalSessions: 25,
    totalHours: 37.5,
    averageRating: 4.6,
    totalReviews: 18,
    responseRate: 94,
    responseTime: 75,
    isVerified: true,
    status: 'active',
    school: 'Temasek Polytechnic'
  },
  {
    profileId: 'profile005',
    userId: 'user005',
    bio: 'Year 2 Immersive Media & Game Development student with passion for interactive experiences. Proficient in Unity, C#, and 3D modeling. I can guide you through game development from concept to completion, with hands-on projects and portfolio building tips.',
    subjects: [
      { subjectId: 'sub016', subjectName: 'Game Programming', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub017', subjectName: 'Unity Game Engine', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub018', subjectName: 'C# Programming', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub019', subjectName: '3D Modeling & Animation', proficiencyLevel: 'intermediate', category: SUBJECT_CATEGORIES.OTHER }
    ],
    completedCourses: [
      { code: 'IMG1001', name: 'Introduction to Game Development', grade: 'A' },
      { code: 'IMG2001', name: 'Game Programming with Unity', grade: 'A-' },
      { code: 'IMG2002', name: '3D Graphics & Animation', grade: 'B+' }
    ],
    availableSlots: [
      { day: 'Monday', startTime: '18:00', endTime: '21:00', isRecurring: true },
      { day: 'Wednesday', startTime: '19:00', endTime: '22:00', isRecurring: true },
      { day: 'Saturday', startTime: '14:00', endTime: '18:00', isRecurring: true }
    ],
    preferredLocation: ['Online (Discord/Zoom)', 'Student Hub @ TP'],
    languages: ['English', 'Mandarin'],
    totalSessions: 30,
    totalHours: 45,
    averageRating: 4.5,
    totalReviews: 20,
    responseRate: 90,
    responseTime: 50,
    isVerified: true,
    status: 'active',
    school: 'Temasek Polytechnic'
  },
  {
    profileId: 'profile006',
    userId: 'user006',
    bio: 'Year 3 Information Technology student specializing in full-stack development and cloud computing. AWS Certified Cloud Practitioner with experience in React, Node.js, and AWS services. I focus on helping students build real-world projects and prepare for technical interviews.',
    subjects: [
      { subjectId: 'sub004', subjectName: 'Web Application Development', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub020', subjectName: 'Mobile Application Development', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub003', subjectName: 'Database Design & Administration', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub021', subjectName: 'Cloud Computing with AWS', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.OTHER }
    ],
    completedCourses: [
      { code: 'IT2003', name: 'Data Structures & Algorithms', grade: 'A' },
      { code: 'IT3001', name: 'Advanced Web Development', grade: 'A' },
      { code: 'IT3002', name: 'Cloud Computing', grade: 'A-' }
    ],
    availableSlots: [
      { day: 'Tuesday', startTime: '17:00', endTime: '20:00', isRecurring: true },
      { day: 'Thursday', startTime: '16:00', endTime: '19:00', isRecurring: true },
      { day: 'Sunday', startTime: '10:00', endTime: '14:00', isRecurring: true }
    ],
    preferredLocation: ['Library @ TP', 'Online (Zoom/Teams)'],
    languages: ['English'],
    totalSessions: 42,
    totalHours: 63,
    averageRating: 4.8,
    totalReviews: 30,
    responseRate: 96,
    responseTime: 40,
    isVerified: true,
    status: 'active',
    school: 'Temasek Polytechnic'
  },
  {
    profileId: 'profile007',
    userId: 'user007',
    bio: 'Year 2 Big Data & Analytics student with expertise in data visualization, SQL, and Python analytics libraries. I enjoy making data analysis accessible and fun through real business case studies and interactive dashboards. Perfect for students looking to master Tableau, Power BI, or Excel.',
    subjects: [
      { subjectId: 'sub006', subjectName: 'Data Analytics', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub022', subjectName: 'SQL & Database Querying', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.PROGRAMMING },
      { subjectId: 'sub023', subjectName: 'Data Visualization', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.OTHER },
      { subjectId: 'sub014', subjectName: 'Statistics & Probability', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.MATH },
      { subjectId: 'sub005', subjectName: 'Python Programming', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.PROGRAMMING }
    ],
    completedCourses: [
      { code: 'BDA1001', name: 'Introduction to Big Data', grade: 'A' },
      { code: 'BDA2001', name: 'Data Analytics with Python', grade: 'A' },
      { code: 'BDA2002', name: 'Data Visualization & Storytelling', grade: 'A-' }
    ],
    availableSlots: [
      { day: 'Monday', startTime: '15:00', endTime: '18:00', isRecurring: true },
      { day: 'Wednesday', startTime: '16:00', endTime: '19:00', isRecurring: true },
      { day: 'Friday', startTime: '14:00', endTime: '17:00', isRecurring: true }
    ],
    preferredLocation: ['Online (Zoom/Teams)', 'Library @ TP'],
    languages: ['English', 'Malay'],
    totalSessions: 28,
    totalHours: 42,
    averageRating: 4.7,
    totalReviews: 19,
    responseRate: 93,
    responseTime: 55,
    isVerified: true,
    status: 'active',
    school: 'Temasek Polytechnic'
  },
  {
    profileId: 'profile008',
    userId: 'user008',
    bio: 'Year 2 Accountancy & Finance student with strong analytical skills and passion for teaching financial concepts. I help students understand accounting principles, financial statements, and Excel for finance. My approach combines theory with practical applications using real company examples.',
    subjects: [
      { subjectId: 'sub024', subjectName: 'Financial Accounting', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.OTHER },
      { subjectId: 'sub025', subjectName: 'Management Accounting', proficiencyLevel: 'advanced', category: SUBJECT_CATEGORIES.OTHER },
      { subjectId: 'sub026', subjectName: 'Excel for Finance', proficiencyLevel: 'expert', category: SUBJECT_CATEGORIES.OTHER },
      { subjectId: 'sub014', subjectName: 'Statistics & Probability', proficiencyLevel: 'intermediate', category: SUBJECT_CATEGORIES.MATH }
    ],
    completedCourses: [
      { code: 'ACC1001', name: 'Principles of Accounting', grade: 'A' },
      { code: 'ACC2001', name: 'Financial Accounting', grade: 'A' },
      { code: 'ACC2002', name: 'Cost & Management Accounting', grade: 'A-' }
    ],
    availableSlots: [
      { day: 'Tuesday', startTime: '14:00', endTime: '17:00', isRecurring: true },
      { day: 'Thursday', startTime: '18:00', endTime: '21:00', isRecurring: true },
      { day: 'Saturday', startTime: '09:00', endTime: '12:00', isRecurring: true }
    ],
    preferredLocation: ['Library @ TP', 'Online (Zoom/Teams)'],
    languages: ['English', 'Mandarin'],
    totalSessions: 22,
    totalHours: 33,
    averageRating: 4.6,
    totalReviews: 15,
    responseRate: 91,
    responseTime: 65,
    isVerified: true,
    status: 'active',
    school: 'Temasek Polytechnic'
  }
];

// Merge user and tutor profile data with proper field mapping
export const mockTutors = mockTutorProfiles.map(profile => {
  const user = mockUsers.find(u => u.userId === profile.userId) || {
    userId: profile.userId,
    username: 'Tutor',
    avatar: 'https://ui-avatars.com/api/?name=Tutor&background=6366f1&color=fff',
    school: 'Temasek Polytechnic'
  };

  // Map subjects to have both subjectName and code fields
  const subjects = profile.subjects.map(sub => {
    const matchedSubject = mockSubjects.find(ms => ms.name === sub.subjectName);
    return {
      ...sub,
      name: sub.subjectName,
      code: matchedSubject?.code || sub.subjectName
    };
  });

  // Keep availableSlots as objects for algorithm, but also add formatted strings for display
  const availableSlots = profile.availableSlots;
  const availableSlotsFormatted = profile.availableSlots.map(slot =>
    `${slot.day} ${slot.startTime}-${slot.endTime.substring(0, 5)}`
  );

  // Rename preferredLocation to preferredLocations (plural)
  const preferredLocations = profile.preferredLocation;

  // Merge hourlyRate from completedCourses count
  const hourlyRate = 10 + profile.completedCourses.length;

  return {
    ...user,
    ...profile,
    subjects,
    availableSlots, // Objects for algorithm
    availableSlotsDisplay: availableSlotsFormatted, // Strings for UI display
    preferredLocations,
    hourlyRate,
    // Keep profile fields that might be needed
    profileCompletion: 85,
    responseRate: profile.responseRate,
    responseTime: profile.responseTime
  };
});

// Mock Review Data
export const mockReviews = [
  {
    reviewId: 'review001',
    bookingId: 'booking001',
    tutorId: 'user001',
    studentId: 'student001',
    rating: 5,
    comment: 'John is an excellent tutor! He explained OOP concepts using real-world examples from his projects. His explanation of inheritance and polymorphism finally clicked for me. Highly recommend for IT students!',
    tags: ['Patient', 'Clear Explanation', 'Well Prepared'],
    isAnonymous: false,
    isVerified: true,
    helpfulCount: 12,
    studentName: 'Marcus Lim',
    studentAvatar: 'https://ui-avatars.com/api/?name=Marcus+Lim&background=random',
    createdAt: '2024-10-15T20:00:00Z'
  },
  {
    reviewId: 'review002',
    bookingId: 'booking002',
    tutorId: 'user001',
    studentId: 'student002',
    rating: 5,
    comment: 'Very punctual and came well-prepared with practice questions on database normalization. He made sure I understood each normal form before moving on. Thanks for helping me ace my IT2002 quiz!',
    tags: ['Punctual', 'Responsible', 'Patient'],
    isAnonymous: true,
    isVerified: true,
    helpfulCount: 8,
    studentName: 'Student from T30',
    studentAvatar: 'https://ui-avatars.com/api/?name=Student&background=random',
    createdAt: '2024-10-10T18:30:00Z'
  },
  {
    reviewId: 'review003',
    bookingId: 'booking003',
    tutorId: 'user002',
    studentId: 'student003',
    rating: 5,
    comment: 'Sarah\'s data analytics sessions are gold! She used a real Kaggle dataset to teach pandas and matplotlib. Learned more in 2 hours than weeks of self-study. Perfect for AI students struggling with data preprocessing.',
    tags: ['Professional', 'Efficient', 'Well Prepared'],
    isAnonymous: false,
    isVerified: true,
    helpfulCount: 15,
    studentName: 'Priya Kumar',
    studentAvatar: 'https://ui-avatars.com/api/?name=Priya+Kumar&background=random',
    createdAt: '2024-10-12T16:00:00Z'
  },
  {
    reviewId: 'review004',
    bookingId: 'booking004',
    tutorId: 'user002',
    studentId: 'student004',
    rating: 4,
    comment: 'Great at teaching ML fundamentals! Sometimes goes a bit fast when explaining linear algebra concepts, but overall very knowledgeable. Would book again for neural networks module.',
    tags: ['Professional', 'Friendly'],
    isAnonymous: true,
    isVerified: true,
    helpfulCount: 5,
    studentName: 'Student from T69',
    studentAvatar: 'https://ui-avatars.com/api/?name=Student&background=random',
    createdAt: '2024-10-08T19:00:00Z'
  },
  {
    reviewId: 'review005',
    bookingId: 'booking005',
    tutorId: 'user003',
    studentId: 'student005',
    rating: 5,
    comment: 'Michael\'s ethical hacking session was mind-blowing! He demonstrated actual penetration testing techniques and explained how to use Kali Linux tools. Perfect for CDF students preparing for practical assessments.',
    tags: ['Professional', 'Detailed', 'Efficient'],
    isAnonymous: false,
    isVerified: true,
    helpfulCount: 10,
    studentName: 'Arjun Singh',
    studentAvatar: 'https://ui-avatars.com/api/?name=Arjun+Singh&background=random',
    createdAt: '2024-10-18T21:00:00Z'
  },
  {
    reviewId: 'review006',
    bookingId: 'booking006',
    tutorId: 'user004',
    studentId: 'student006',
    rating: 5,
    comment: 'Emily made business analytics so much clearer! She connected the mathematical concepts to actual business decisions. Her process improvement examples from BPSE projects really helped me understand.',
    tags: ['Clear Explanation', 'Patient', 'Helpful'],
    isAnonymous: false,
    isVerified: true,
    helpfulCount: 9,
    studentName: 'Daniel Goh',
    studentAvatar: 'https://ui-avatars.com/api/?name=Daniel+Goh&background=random',
    createdAt: '2024-10-20T17:30:00Z'
  },
  {
    reviewId: 'review007',
    bookingId: 'booking007',
    tutorId: 'user005',
    studentId: 'student007',
    rating: 4,
    comment: 'David helped me debug my Unity game project! Super hands-on approach with actual coding together. Learned C# scripting techniques I couldn\'t find in tutorials. Great for IMG students.',
    tags: ['Practical', 'Friendly', 'Helpful'],
    isAnonymous: true,
    isVerified: true,
    helpfulCount: 7,
    studentName: 'Student from T65',
    studentAvatar: 'https://ui-avatars.com/api/?name=Student&background=random',
    createdAt: '2024-10-16T19:00:00Z'
  },
  {
    reviewId: 'review008',
    bookingId: 'booking008',
    tutorId: 'user006',
    studentId: 'student008',
    rating: 5,
    comment: 'Rachel is brilliant! She helped me understand React hooks and state management for my FYP. Also shared tips on AWS deployment which saved me hours. Definitely booking her again before my presentation.',
    tags: ['Expert', 'Clear Explanation', 'Motivating'],
    isAnonymous: false,
    isVerified: true,
    helpfulCount: 14,
    studentName: 'Wei Ting',
    studentAvatar: 'https://ui-avatars.com/api/?name=Wei+Ting&background=random',
    createdAt: '2024-10-22T20:00:00Z'
  },
  {
    reviewId: 'review009',
    bookingId: 'booking009',
    tutorId: 'user007',
    studentId: 'student009',
    rating: 5,
    comment: 'James taught me Power BI from scratch! Created a real dashboard with sales data during our session. His teaching style is perfect for visual learners. Best investment of my credits!',
    tags: ['Patient', 'Well Prepared', 'Efficient'],
    isAnonymous: false,
    isVerified: true,
    helpfulCount: 11,
    studentName: 'Nurul Izzah',
    studentAvatar: 'https://ui-avatars.com/api/?name=Nurul+Izzah&background=random',
    createdAt: '2024-10-19T16:45:00Z'
  }
];

// Mock Booking Data
export const mockBookings = [
  {
    bookingId: 'booking001',
    studentId: 'currentUser',
    tutorId: 'user001',
    subject: 'Object-Oriented Programming', // Changed from subjectName
    date: '2024-10-30', // Changed from sessionDate, simplified format
    timeSlot: '14:00 - 16:00', // Added timeSlot field
    duration: 2,
    location: 'Library @ TP Level 3',
    notes: 'Need help understanding inheritance, polymorphism and abstract classes for IT2001 module. Have quiz next week.', // Changed from description
    status: 'confirmed', // Using string instead of constant
    createdAt: '2024-10-20T10:00:00Z',
    hasReview: false
  },
  {
    bookingId: 'booking002',
    studentId: 'currentUser',
    tutorId: 'user002',
    subject: 'Machine Learning Fundamentals',
    date: '2024-10-28',
    timeSlot: '16:00 - 17:30',
    duration: 1.5,
    location: 'Online (Zoom)',
    notes: 'Preparing for AI module exam - need revision on supervised learning algorithms and model evaluation metrics.',
    status: 'pending',
    createdAt: '2024-10-22T14:00:00Z',
    hasReview: false
  },
  {
    bookingId: 'booking003',
    studentId: 'currentUser',
    tutorId: 'user001',
    subject: 'Database Design & Administration',
    date: '2024-10-15',
    timeSlot: '15:00 - 17:00',
    duration: 2,
    location: 'Library @ TP Level 3',
    notes: 'Learning database normalization (1NF, 2NF, 3NF) and ER diagram design for IT2002 project.',
    status: 'completed',
    createdAt: '2024-10-10T09:00:00Z',
    completedAt: '2024-10-15T17:00:00Z',
    hasReview: true
  },
  {
    bookingId: 'booking004',
    studentId: 'currentUser',
    tutorId: 'user003',
    subject: 'Cybersecurity Fundamentals',
    date: '2024-11-05',
    timeSlot: '14:00 - 16:00',
    duration: 2,
    location: 'Library @ TP Level 3',
    notes: 'Need help with network security concepts and cryptography basics.',
    status: 'confirmed',
    createdAt: '2024-10-25T10:00:00Z',
    hasReview: false
  },
  {
    bookingId: 'booking005',
    studentId: 'currentUser',
    tutorId: 'user002',
    subject: 'Python Programming',
    date: '2024-10-20',
    timeSlot: '16:00 - 18:00',
    duration: 2,
    location: 'Online (Zoom)',
    notes: 'Learn Python data structures and file handling.',
    status: 'completed',
    createdAt: '2024-10-15T09:00:00Z',
    completedAt: '2024-10-20T18:00:00Z',
    hasReview: false
  },
  {
    bookingId: 'booking006',
    studentId: 'currentUser',
    tutorId: 'user004',
    subject: 'Business Analytics',
    date: '2024-10-12',
    timeSlot: '10:00 - 12:00',
    duration: 2,
    location: 'Student Hub @ TP',
    notes: 'Help with statistics and data interpretation for business case study.',
    status: 'cancelled',
    createdAt: '2024-10-08T10:00:00Z',
    cancelledAt: '2024-10-11T14:00:00Z',
    hasReview: false
  }
];

// Mock Credit Transaction Data
export const mockCreditTransactions = [
  {
    transactionId: 'trans001',
    userId: 'currentUser',
    amount: 100,
    type: 'initial_bonus',
    balance: 100,
    description: 'Welcome bonus - Thanks for joining Tu2tor!',
    createdAt: '2024-09-15T08:30:00Z'
  },
  {
    transactionId: 'trans002',
    userId: 'currentUser',
    amount: -10,
    type: 'booking_cost',
    relatedId: 'booking001',
    balance: 90,
    description: 'Booked session with John Tan - OOP',
    createdAt: '2024-10-20T10:00:00Z'
  },
  {
    transactionId: 'trans003',
    userId: 'currentUser',
    amount: 20,
    type: 'booking_reward',
    relatedId: 'booking003',
    balance: 110,
    description: 'Completed tutoring session - Database Design',
    createdAt: '2024-10-15T17:00:00Z'
  },
  {
    transactionId: 'trans004',
    userId: 'currentUser',
    amount: 5,
    type: 'review_bonus',
    relatedId: 'review001',
    balance: 115,
    description: '5-star review bonus - Keep it up!',
    createdAt: '2024-10-15T20:00:00Z'
  }
];

// Mock Subject List - Based on real TP modules
export const mockSubjects = [
  { subjectId: 'sub001', name: 'Programming Fundamentals', code: 'IT1001', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '💻', tutorCount: 15 },
  { subjectId: 'sub002', name: 'Object-Oriented Programming', code: 'IT2001', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '🎯', tutorCount: 12 },
  { subjectId: 'sub003', name: 'Database Design & Administration', code: 'IT2002', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '🗄️', tutorCount: 10 },
  { subjectId: 'sub004', name: 'Web Application Development', code: 'IT3001', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '🌐', tutorCount: 14 },
  { subjectId: 'sub005', name: 'Python Programming', code: 'AI1002', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '🐍', tutorCount: 18 },
  { subjectId: 'sub006', name: 'Data Analytics', code: 'BDA2001', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '📊', tutorCount: 11 },
  { subjectId: 'sub007', name: 'Machine Learning Fundamentals', code: 'AI2001', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '🤖', tutorCount: 8 },
  { subjectId: 'sub008', name: 'Mathematics for Computing', code: 'MAT1001', category: SUBJECT_CATEGORIES.MATH, icon: '📐', tutorCount: 9 },
  { subjectId: 'sub009', name: 'Network Fundamentals', code: 'CDF1002', category: SUBJECT_CATEGORIES.OTHER, icon: '🌐', tutorCount: 7 },
  { subjectId: 'sub010', name: 'Cybersecurity Fundamentals', code: 'CDF1001', category: SUBJECT_CATEGORIES.OTHER, icon: '🔒', tutorCount: 6 },
  { subjectId: 'sub011', name: 'Ethical Hacking', code: 'CDF2001', category: SUBJECT_CATEGORIES.OTHER, icon: '🎭', tutorCount: 5 },
  { subjectId: 'sub012', name: 'Linux Administration', code: 'CDF2003', category: SUBJECT_CATEGORIES.OTHER, icon: '🐧', tutorCount: 4 },
  { subjectId: 'sub013', name: 'Business Analytics', code: 'BPS2001', category: SUBJECT_CATEGORIES.OTHER, icon: '💼', tutorCount: 8 },
  { subjectId: 'sub014', name: 'Statistics & Probability', code: 'MAT2001', category: SUBJECT_CATEGORIES.MATH, icon: '📈', tutorCount: 10 },
  { subjectId: 'sub015', name: 'Process Improvement Techniques', code: 'BPS2002', category: SUBJECT_CATEGORIES.OTHER, icon: '⚙️', tutorCount: 5 },
  { subjectId: 'sub016', name: 'Game Programming', code: 'IMG2001', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '🎮', tutorCount: 7 },
  { subjectId: 'sub017', name: 'Unity Game Engine', code: 'IMG2002', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '🕹️', tutorCount: 6 },
  { subjectId: 'sub018', name: 'C# Programming', code: 'IMG1002', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '⚡', tutorCount: 8 },
  { subjectId: 'sub019', name: '3D Modeling & Animation', code: 'IMG2003', category: SUBJECT_CATEGORIES.OTHER, icon: '🎨', tutorCount: 4 },
  { subjectId: 'sub020', name: 'Mobile Application Development', code: 'IT3002', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '📱', tutorCount: 9 },
  { subjectId: 'sub021', name: 'Cloud Computing with AWS', code: 'IT3003', category: SUBJECT_CATEGORIES.OTHER, icon: '☁️', tutorCount: 7 },
  { subjectId: 'sub022', name: 'SQL & Database Querying', code: 'BDA1002', category: SUBJECT_CATEGORIES.PROGRAMMING, icon: '🔍', tutorCount: 12 },
  { subjectId: 'sub023', name: 'Data Visualization', code: 'BDA2002', category: SUBJECT_CATEGORIES.OTHER, icon: '📉', tutorCount: 8 },
  { subjectId: 'sub024', name: 'Financial Accounting', code: 'ACC2001', category: SUBJECT_CATEGORIES.OTHER, icon: '💰', tutorCount: 10 },
  { subjectId: 'sub025', name: 'Management Accounting', code: 'ACC2002', category: SUBJECT_CATEGORIES.OTHER, icon: '📊', tutorCount: 7 },
  { subjectId: 'sub026', name: 'Excel for Finance', code: 'ACC1002', category: SUBJECT_CATEGORIES.OTHER, icon: '📗', tutorCount: 11 }
];

// Current logged-in user
export const currentUser = {
  userId: 'currentUser',
  email: 'alex.student@student.tp.edu.sg',
  username: 'Alex Tan Kai Ming',
  studentId: '2301999Z',
  major: 'Information Technology',
  yearOfStudy: 2,
  avatar: 'https://ui-avatars.com/api/?name=Alex+Tan&background=4f46e5&color=fff',
  role: ['student'],
  credits: 115,
  points: 50,
  badges: [BADGE_TYPES.NEWBIE],
  school: 'Temasek Polytechnic',
  createdAt: '2024-04-15T08:30:00Z',
  isActive: true
};
