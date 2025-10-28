// User Roles
export const ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor'
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

// Booking Status Configuration
export const BOOKING_STATUS_CONFIG = {
  [BOOKING_STATUS.PENDING]: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Clock'
  },
  [BOOKING_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800',
    icon: 'CheckCircle'
  },
  [BOOKING_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800',
    icon: 'CheckCheck'
  },
  [BOOKING_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: 'XCircle'
  },
  [BOOKING_STATUS.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: 'X'
  }
};

// Subject Categories
export const SUBJECT_CATEGORIES = {
  PROGRAMMING: 'programming',
  MATH: 'math',
  SCIENCE: 'science',
  LANGUAGE: 'language',
  OTHER: 'other'
};

export const SUBJECT_CATEGORY_LABELS = {
  [SUBJECT_CATEGORIES.PROGRAMMING]: 'Programming',
  [SUBJECT_CATEGORIES.MATH]: 'Mathematics',
  [SUBJECT_CATEGORIES.SCIENCE]: 'Science',
  [SUBJECT_CATEGORIES.LANGUAGE]: 'Language',
  [SUBJECT_CATEGORIES.OTHER]: 'Other'
};

// Badge Types
export const BADGE_TYPES = {
  NEWBIE: 'newbie',
  EXPERT: 'expert',
  VETERAN: 'veteran',
  SCHOLAR: 'scholar',
  FIVE_STAR: 'five_star'
};

export const BADGE_CONFIG = {
  [BADGE_TYPES.NEWBIE]: {
    name: 'Newbie Tutor',
    description: 'Completed 1st tutoring session',
    icon: '🌱',
    requirement: 1
  },
  [BADGE_TYPES.EXPERT]: {
    name: 'Expert Tutor',
    description: 'Average rating of 4.5+',
    icon: '⭐',
    requirement: 4.5
  },
  [BADGE_TYPES.VETERAN]: {
    name: 'Veteran Tutor',
    description: 'Completed 10 tutoring sessions',
    icon: '🏆',
    requirement: 10
  },
  [BADGE_TYPES.SCHOLAR]: {
    name: 'Scholar',
    description: 'Tutored 5 different subjects',
    icon: '📚',
    requirement: 5
  },
  [BADGE_TYPES.FIVE_STAR]: {
    name: 'Five Star Tutor',
    description: 'Received 10 five-star reviews',
    icon: '🌟',
    requirement: 10
  }
};

// Credit Transaction Types
export const CREDIT_TRANSACTION_TYPES = {
  INITIAL_BONUS: 'initial_bonus',
  BOOKING_COST: 'booking_cost',
  BOOKING_REWARD: 'booking_reward',
  REVIEW_BONUS: 'review_bonus',
  CANCELLATION_PENALTY: 'cancellation_penalty'
};

export const CREDIT_AMOUNTS = {
  [CREDIT_TRANSACTION_TYPES.INITIAL_BONUS]: 100,
  [CREDIT_TRANSACTION_TYPES.BOOKING_COST]: -10,
  [CREDIT_TRANSACTION_TYPES.BOOKING_REWARD]: 20,
  [CREDIT_TRANSACTION_TYPES.REVIEW_BONUS]: 5,
  [CREDIT_TRANSACTION_TYPES.CANCELLATION_PENALTY]: -5
};

// Recommendation Reasons
export const RECOMMENDATION_REASONS = {
  TIME_MATCH: {
    key: 'time_match',
    label: 'Time Match',
    icon: '⏰',
    color: 'bg-blue-100 text-blue-700'
  },
  HIGH_RATING: {
    key: 'high_rating',
    label: 'High Rating',
    icon: '⭐',
    color: 'bg-yellow-100 text-yellow-700'
  },
  FAST_RESPONSE: {
    key: 'fast_response',
    label: 'Fast Response',
    icon: '🚀',
    color: 'bg-green-100 text-green-700'
  },
  SAME_SCHOOL: {
    key: 'same_school',
    label: 'Same School',
    icon: '🏫',
    color: 'bg-purple-100 text-purple-700'
  },
  ACTIVE_TUTOR: {
    key: 'active_tutor',
    label: 'Active Tutor',
    icon: '🔥',
    color: 'bg-orange-100 text-orange-700'
  }
};

// Weekdays
export const WEEKDAYS = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' }
];

// Time Slots
export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Review Tags
export const REVIEW_TAGS = [
  'Patient', 'Clear Explanation', 'Well Prepared', 'Punctual', 'Responsible',
  'Friendly', 'Professional', 'Detailed', 'Humorous', 'Efficient'
];
