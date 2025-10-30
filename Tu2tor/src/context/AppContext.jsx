import { createContext, useContext, useState, useEffect } from 'react';
import { tutorsAPI, bookingsAPI } from '../services/api';
import {
  mockTutors,
  mockReviews,
  mockCreditTransactions,
  mockSubjects
} from '../utils/mockData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Data state
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState(mockReviews);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [subjects] = useState(mockSubjects);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [userPreference, setUserPreference] = useState(50);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [favoriteTutors, setFavoriteTutors] = useState([]);

  // Loading & error states
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [error, setError] = useState(null);

  // Initialize data from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('tu2tor_reviews');
    const savedTransactions = localStorage.getItem('tu2tor_transactions');
    const savedFeedbacks = localStorage.getItem('tu2tor_feedbacks');
    const savedPreference = localStorage.getItem('tu2tor_preference');
    const savedMessages = localStorage.getItem('tu2tor_messages');
    const savedNotifications = localStorage.getItem('tu2tor_notifications');
    const savedFavorites = localStorage.getItem('tu2tor_favorites');

    if (savedReviews) setReviews(JSON.parse(savedReviews));
    else setReviews(mockReviews);

    if (savedTransactions) setCreditTransactions(JSON.parse(savedTransactions));
    else setCreditTransactions(mockCreditTransactions);

    if (savedFeedbacks) setUserFeedbacks(JSON.parse(savedFeedbacks));
    if (savedPreference) setUserPreference(Number(savedPreference));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedFavorites) setFavoriteTutors(JSON.parse(savedFavorites));
  }, []);

  // ========================================================================
  // Tutor methods (connected to real API)
  // ========================================================================

  /**
   * Fetch tutors with filters
   */
  const fetchTutors = async (filters = {}) => {
    try {
      setIsLoadingTutors(true);
      setError(null);

      const response = await tutorsAPI.getTutors(filters);
      setTutors(response.tutors);

      return response.tutors;
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
      setError(err.message);
      // Fallback to mock data on error
      setTutors(mockTutors);
      return mockTutors;
    } finally {
      setIsLoadingTutors(false);
    }
  };

  /**
   * Get tutor by ID
   */
  const getTutorById = async (tutorId) => {
    try {
      // Check cache first
      const cached = tutors.find(t => t.id === tutorId);
      if (cached) return cached;

      // Fetch from API
      const response = await tutorsAPI.getTutorById(tutorId);
      return response.tutor;
    } catch (err) {
      console.error('Failed to get tutor:', err);
      // Fallback to mock data
      return mockTutors.find(t => t.userId === tutorId);
    }
  };

  /**
   * Create tutor profile
   */
  const createTutorProfile = async (tutorData) => {
    try {
      const response = await tutorsAPI.createTutor(tutorData);
      return response.tutor;
    } catch (err) {
      console.error('Failed to create tutor profile:', err);
      throw err;
    }
  };

  // ========================================================================
  // Booking methods (connected to real API)
  // ========================================================================

  /**
   * Fetch bookings for current user
   */
  const fetchBookings = async (filters = {}) => {
    try {
      setIsLoadingBookings(true);
      setError(null);

      const response = await bookingsAPI.getBookings(filters);
      setBookings(response.bookings);

      return response.bookings;
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err.message);
      return [];
    } finally {
      setIsLoadingBookings(false);
    }
  };

  /**
   * Create new booking
   */
  const createBooking = async (bookingData) => {
    try {
      const response = await bookingsAPI.createBooking(bookingData);
      const newBooking = response.booking;

      // Update local state
      setBookings(prev => [...prev, newBooking]);

      return newBooking;
    } catch (err) {
      console.error('Failed to create booking:', err);
      throw err;
    }
  };

  /**
   * Update booking
   */
  const updateBooking = async (bookingId, updates) => {
    try {
      const response = await bookingsAPI.updateBooking(bookingId, updates);

      // Update local state
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, ...response.booking } : b))
      );

      return response.booking;
    } catch (err) {
      console.error('Failed to update booking:', err);
      throw err;
    }
  };

  /**
   * Cancel booking
   */
  const cancelBooking = async (bookingId, reason) => {
    try {
      await updateBooking(bookingId, {
        status: 'cancelled',
        notes: reason
      });
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      throw err;
    }
  };

  /**
   * Get user's bookings
   */
  const getUserBookings = (userId) => {
    return bookings.filter(
      b => b.student?.id === userId || b.tutor?.userId === userId
    );
  };

  // ========================================================================
  // Review methods (still using mock data - to be implemented in backend)
  // ========================================================================

  const createReview = (reviewData) => {
    const newReview = {
      ...reviewData,
      reviewId: `review_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isVerified: true,
      helpfulCount: 0
    };
    const updated = [...reviews, newReview];
    setReviews(updated);
    localStorage.setItem('tu2tor_reviews', JSON.stringify(updated));

    // Update tutor rating
    updateTutorRating(reviewData.tutorId);

    return newReview;
  };

  const updateTutorRating = (tutorId) => {
    const tutorReviews = reviews.filter(r => r.tutorId === tutorId);
    if (tutorReviews.length > 0) {
      const avgRating = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
      const updated = tutors.map(t =>
        t.userId === tutorId
          ? { ...t, averageRating: Number(avgRating.toFixed(1)), totalReviews: tutorReviews.length }
          : t
      );
      setTutors(updated);
    }
  };

  const getTutorReviews = (tutorId) => {
    return reviews.filter(r => r.tutorId === tutorId);
  };

  // ========================================================================
  // Credit transaction methods
  // ========================================================================

  const addCreditTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      transactionId: `trans_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [...creditTransactions, newTransaction];
    setCreditTransactions(updated);
    localStorage.setItem('tu2tor_transactions', JSON.stringify(updated));
    return newTransaction;
  };

  const getUserTransactions = (userId) => {
    return creditTransactions.filter(t => t.userId === userId);
  };

  // ========================================================================
  // User feedback methods
  // ========================================================================

  const addUserFeedback = (feedback) => {
    const newFeedback = {
      ...feedback,
      timestamp: new Date().toISOString()
    };
    const updated = [...userFeedbacks, newFeedback];
    setUserFeedbacks(updated);
    localStorage.setItem('tu2tor_feedbacks', JSON.stringify(updated));
  };

  const updateUserPreference = (preference) => {
    setUserPreference(preference);
    localStorage.setItem('tu2tor_preference', preference.toString());
  };

  // ========================================================================
  // Message methods
  // ========================================================================

  const sendMessage = (messageData) => {
    const newMessage = {
      ...messageData,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem('tu2tor_messages', JSON.stringify(updated));
    return newMessage;
  };

  const markMessageAsRead = (messageId) => {
    const updated = messages.map(m =>
      m.messageId === messageId ? { ...m, isRead: true } : m
    );
    setMessages(updated);
    localStorage.setItem('tu2tor_messages', JSON.stringify(updated));
  };

  const markConversationAsRead = (userId, contactId) => {
    const updated = messages.map(m => {
      const isInConversation =
        (m.senderId === contactId && m.receiverId === userId) ||
        (m.senderId === userId && m.receiverId === contactId);
      return isInConversation && !m.isRead ? { ...m, isRead: true } : m;
    });
    setMessages(updated);
    localStorage.setItem('tu2tor_messages', JSON.stringify(updated));
  };

  const getConversation = (userId, contactId) => {
    return messages
      .filter(m =>
        (m.senderId === userId && m.receiverId === contactId) ||
        (m.senderId === contactId && m.receiverId === userId)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const getUnreadCount = (userId, contactId) => {
    return messages.filter(m =>
      m.senderId === contactId &&
      m.receiverId === userId &&
      !m.isRead
    ).length;
  };

  const getLastMessage = (userId, contactId) => {
    const conversation = getConversation(userId, contactId);
    return conversation[conversation.length - 1] || null;
  };

  // ========================================================================
  // Notification methods
  // ========================================================================

  const addNotification = (notificationData) => {
    const newNotification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    localStorage.setItem('tu2tor_notifications', JSON.stringify(updated));
    return newNotification;
  };

  const markNotificationAsRead = (notificationId) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('tu2tor_notifications', JSON.stringify(updated));
  };

  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    localStorage.setItem('tu2tor_notifications', JSON.stringify(updated));
  };

  const markAllNotificationsAsRead = (userId) => {
    const updated = notifications.map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('tu2tor_notifications', JSON.stringify(updated));
  };

  const clearAllNotifications = (userId) => {
    const updated = notifications.filter(n => n.userId !== userId);
    setNotifications(updated);
    localStorage.setItem('tu2tor_notifications', JSON.stringify(updated));
  };

  const getUserNotifications = (userId) => {
    return notifications.filter(n => n.userId === userId);
  };

  // ========================================================================
  // Favorite tutors methods
  // ========================================================================

  const toggleFavoriteTutor = (userId, tutorId) => {
    const favoriteKey = `${userId}_${tutorId}`;
    const isFavorited = favoriteTutors.includes(favoriteKey);

    let updated;
    if (isFavorited) {
      updated = favoriteTutors.filter(f => f !== favoriteKey);
    } else {
      updated = [...favoriteTutors, favoriteKey];
    }

    setFavoriteTutors(updated);
    localStorage.setItem('tu2tor_favorites', JSON.stringify(updated));
    return !isFavorited;
  };

  const isTutorFavorited = (userId, tutorId) => {
    const favoriteKey = `${userId}_${tutorId}`;
    return favoriteTutors.includes(favoriteKey);
  };

  const getUserFavoriteTutors = (userId) => {
    const favoriteKeys = favoriteTutors.filter(f => f.startsWith(`${userId}_`));
    const tutorIds = favoriteKeys.map(f => f.split('_')[1]);
    return tutors.filter(t => tutorIds.includes(t.userId));
  };

  const value = {
    // Data
    tutors,
    bookings,
    reviews,
    creditTransactions,
    subjects,
    userFeedbacks,
    userPreference,
    messages,
    notifications,
    favoriteTutors,

    // Loading states
    isLoadingTutors,
    isLoadingBookings,
    error,

    // Tutor methods
    fetchTutors,
    getTutorById,
    createTutorProfile,

    // Booking methods
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    getUserBookings,

    // Review methods
    createReview,
    getTutorReviews,

    // Credit methods
    addCreditTransaction,
    getUserTransactions,

    // Feedback methods
    addUserFeedback,
    updateUserPreference,

    // Message methods
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    getConversation,
    getUnreadCount,
    getLastMessage,

    // Notification methods
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,
    clearAllNotifications,
    getUserNotifications,

    // Favorite methods
    toggleFavoriteTutor,
    isTutorFavorited,
    getUserFavoriteTutors,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
