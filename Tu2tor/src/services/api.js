import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Proxied to http://localhost:5000/api by Vite
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data, config } = error.response;

      if (status === 401) {
        // Check if this is a login/register request
        const isAuthRequest = config.url.includes('/auth/login') || config.url.includes('/auth/register');

        // Only redirect if user was logged in and token expired (not a login/register failure)
        if (!isAuthRequest && localStorage.getItem('token')) {
          // Token expired or invalid - clear and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        // For login/register failures, just pass the error to the component
      }

      // Return formatted error
      return Promise.reject({
        status,
        message: data.message || data.error || 'An error occurred',
        data: data
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: 'Network error - please check your connection',
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

// ============================================================================
// Authentication API
// ============================================================================

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    const response = await api.put('/auth/update-profile', updates);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwords) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },
};

// ============================================================================
// Tutors API
// ============================================================================

export const tutorsAPI = {
  /**
   * Get all tutors with filters
   */
  getTutors: async (filters = {}) => {
    const response = await api.get('/tutors', { params: filters });
    return response.data;
  },

  /**
   * Get tutor by ID
   */
  getTutorById: async (tutorId) => {
    const response = await api.get(`/tutors/${tutorId}`);
    return response.data;
  },

  /**
   * Get tutor by user ID
   */
  getTutorByUserId: async (userId) => {
    const response = await api.get(`/tutors/user/${userId}`);
    return response.data;
  },

  /**
   * Create tutor profile
   */
  createTutor: async (tutorData) => {
    const response = await api.post('/tutors', tutorData);
    return response.data;
  },

  /**
   * Update tutor profile
   */
  updateTutor: async (tutorId, updates) => {
    const response = await api.put(`/tutors/${tutorId}`, updates);
    return response.data;
  },
};

// ============================================================================
// Bookings API
// ============================================================================

export const bookingsAPI = {
  /**
   * Get all bookings for current user
   */
  getBookings: async (filters = {}) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  /**
   * Create new booking
   */
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  /**
   * Update booking
   */
  updateBooking: async (bookingId, updates) => {
    const response = await api.put(`/bookings/${bookingId}`, updates);
    return response.data;
  },

  /**
   * Delete booking (admin only)
   */
  deleteBooking: async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },
};

// ============================================================================
// Reviews API
// ============================================================================

export const reviewsAPI = {
  /**
   * Create a new review
   */
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  /**
   * Get reviews for a tutor
   */
  getTutorReviews: async (tutorId, params = {}) => {
    const response = await api.get(`/reviews/tutor/${tutorId}`, { params });
    return response.data;
  },

  /**
   * Get review for a booking
   */
  getBookingReview: async (bookingId) => {
    const response = await api.get(`/reviews/booking/${bookingId}`);
    return response.data;
  },

  /**
   * Get reviews by a student
   */
  getStudentReviews: async (studentId) => {
    const response = await api.get(`/reviews/student/${studentId}`);
    return response.data;
  },

  /**
   * Update a review
   */
  updateReview: async (reviewId, updates) => {
    const response = await api.put(`/reviews/${reviewId}`, updates);
    return response.data;
  },

  /**
   * Delete a review (admin only)
   */
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Mark review as helpful
   */
  markAsHelpful: async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  /**
   * Add tutor response to review
   */
  addTutorResponse: async (reviewId, response) => {
    const res = await api.post(`/reviews/${reviewId}/response`, { response });
    return res.data;
  },
};

// ============================================================================
// Test API (for development)
// ============================================================================

export const testAPI = {
  /**
   * Check database status
   */
  getDbStatus: async () => {
    const response = await api.get('/test/db-status');
    return response.data;
  },

  /**
   * Get all users
   */
  getUsers: async () => {
    const response = await api.get('/test/users');
    return response.data;
  },
};

export default api;
