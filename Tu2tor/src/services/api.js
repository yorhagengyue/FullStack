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
      console.error('[API] Network error details:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.request?.status,
        statusText: error.request?.statusText
      });
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
   * Start session (mark as started)
   */
  startSession: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/start`);
    return response.data;
  },

  /**
   * Complete session
   */
  completeSession: async (bookingId, data = {}) => {
    const response = await api.post(`/bookings/${bookingId}/complete`, data);
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
// Knowledge Base & RAG API
// ============================================================================

export const knowledgeBaseAPI = {
  /**
   * Get knowledge base documents (supports filters: subjectId, type, status)
   */
  list: async (params = {}) => {
    const response = await api.get('/knowledge-base', { params });
    return response.data;
  },

  /**
   * Upload a knowledge base document (multipart/form-data)
   */
  upload: async (file, subjectId, title, metadata = {}) => {
    const formData = new FormData();
    // Backend expects field name "file" (multer.single('file'))
    formData.append('file', file);
    formData.append('subjectId', subjectId);
    formData.append('title', title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.visibility) formData.append('visibility', metadata.visibility);
    if (Array.isArray(metadata.tags)) {
      metadata.tags.forEach(tag => formData.append('tags', tag));
    }

    const response = await api.post('/knowledge-base', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a knowledge base document
   */
  delete: async (documentId) => {
    const response = await api.delete(`/knowledge-base/${documentId}`);
    return response.data;
  }
};

export const ragAPI = {
  /**
   * RAG query (MongoDB全文 + AI)
   */
  query: async ({ question, subjectId, documentIds = [] }) => {
    const response = await api.post('/rag/query', {
      question,
      subjectId,
      documentIds
    });
    return response.data;
  }
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
// Notifications API
// ============================================================================

export const notificationsAPI = {
  /**
   * Get all notifications
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Delete all notifications
   */
  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications');
    return response.data;
  },
};

// ============================================================================
// Todos API
// ============================================================================

export const todosAPI = {
  /**
   * Get all todos for current user
   */
  getTodos: async () => {
    const response = await api.get('/todos');
    return response.data;
  },

  /**
   * Create a new todo
   */
  createTodo: async (todoData) => {
    const response = await api.post('/todos', todoData);
    return response.data;
  },

  /**
   * Update a todo
   */
  updateTodo: async (todoId, updates) => {
    const response = await api.put(`/todos/${todoId}`, updates);
    return response.data;
  },

  /**
   * Toggle todo completion
   */
  toggleTodo: async (todoId) => {
    const response = await api.patch(`/todos/${todoId}/toggle`);
    return response.data;
  },

  /**
   * Delete a todo
   */
  deleteTodo: async (todoId) => {
    const response = await api.delete(`/todos/${todoId}`);
    return response.data;
  },

  /**
   * Delete all completed todos
   */
  deleteCompletedTodos: async () => {
    const response = await api.delete('/todos/completed/all');
    return response.data;
  },
};

// ============================================================================
// Study Notes API
// ============================================================================

export const studyNotesAPI = {
  /**
   * Get all study notes for current user
   */
  getStudyNotes: async (params = {}) => {
    const response = await api.get('/study-notes', { params });
    return response.data;
  },

  /**
   * Get a single study note
   */
  getStudyNote: async (noteId) => {
    const response = await api.get(`/study-notes/${noteId}`);
    return response.data;
  },

  /**
   * Create a new study note
   */
  createStudyNote: async (noteData) => {
    const response = await api.post('/study-notes', noteData);
    return response.data;
  },

  /**
   * Update a study note
   */
  updateStudyNote: async (noteId, updates) => {
    const response = await api.put(`/study-notes/${noteId}`, updates);
    return response.data;
  },

  /**
   * Append content & sources to a study note
   */
  appendStudyNote: async (noteId, data) => {
    const response = await api.post(`/study-notes/${noteId}/append`, data);
    return response.data;
  },

  /**
   * Delete a study note
   */
  deleteStudyNote: async (noteId) => {
    const response = await api.delete(`/study-notes/${noteId}`);
    return response.data;
  },

  /**
   * Get all subjects with note count
   */
  getSubjects: async () => {
    const response = await api.get('/study-notes/subjects/list');
    return response.data;
  },

  /**
   * Get all tags
   */
  getTags: async () => {
    const response = await api.get('/study-notes/tags/list');
    return response.data;
  },

  // ============================================
  // AI-Powered Note Intelligence APIs
  // ============================================

  /**
   * Get restructure intensity options
   */
  getRestructureOptions: async () => {
    const response = await api.get('/study-notes/restructure-options');
    return response.data;
  },

  /**
   * Create new note with AI restructuring from conversation
   */
  createRestructuredNote: async (data) => {
    const response = await api.post('/study-notes/create-restructured', data);
    return response.data;
  },

  /**
   * Restructure existing note with AI
   */
  restructureNote: async (noteId, intensity = 'medium') => {
    const response = await api.post(`/study-notes/${noteId}/restructure`, { intensity });
    return response.data;
  },

  /**
   * Compare original conversation with restructured version
   */
  compareNoteVersions: async (noteId) => {
    const response = await api.get(`/study-notes/${noteId}/compare`);
    return response.data;
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
