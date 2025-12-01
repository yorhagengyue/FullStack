import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tutorsAPI, bookingsAPI, reviewsAPI, notificationsAPI } from '../services/api';
import {
  mockTutors,
  mockReviews,
  mockCreditTransactions,
  mockSubjects,
  mockBookings
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
      // Fallback to mock data
      setBookings(mockBookings);
      return mockBookings;
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
  // Review methods (connected to real API)
  // ========================================================================

  /**
   * Create a new review
   */
  const createReview = async (reviewData) => {
    try {
      const newReview = await reviewsAPI.createReview(reviewData);

      // Update local state
      setReviews(prev => [...prev, newReview]);

      // Refresh tutors to get updated ratings
      await fetchTutors();

      return newReview;
    } catch (err) {
      console.error('Failed to create review:', err);
      throw err;
    }
  };

  /**
   * Get reviews for a tutor
   */
  const getTutorReviews = async (tutorId) => {
    try {
      const response = await reviewsAPI.getTutorReviews(tutorId);
      return response.reviews;
    } catch (err) {
      console.error('Failed to get tutor reviews:', err);
      // Fallback to local state
      return reviews.filter(r => r.tutorId === tutorId);
    }
  };

  /**
   * Get review for a booking
   */
  const getBookingReview = async (bookingId) => {
    try {
      const review = await reviewsAPI.getBookingReview(bookingId);
      return review;
    } catch (err) {
      console.error('Failed to get booking review:', err);
      return null;
    }
  };

  /**
   * Update a review
   */
  const updateReview = async (reviewId, updates) => {
    try {
      const updatedReview = await reviewsAPI.updateReview(reviewId, updates);

      // Update local state
      setReviews(prev =>
        prev.map(r => (r._id === reviewId ? updatedReview : r))
      );

      return updatedReview;
    } catch (err) {
      console.error('Failed to update review:', err);
      throw err;
    }
  };

  /**
   * Mark review as helpful
   */
  const markReviewAsHelpful = async (reviewId) => {
    try {
      await reviewsAPI.markAsHelpful(reviewId);

      // Update local state
      setReviews(prev =>
        prev.map(r =>
          r._id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        )
      );
    } catch (err) {
      console.error('Failed to mark review as helpful:', err);
      throw err;
    }
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
  // Message methods (real-time & API)
  // ========================================================================

  const [ws, setWs] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    // Prevent multiple connections
    if (wsConnected || ws) return;

    // Connect to WebSocket for real-time chat
    const wsHost = 'ws://localhost:5000';

    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const connect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('⚠️ Max WebSocket reconnect attempts reached, falling back to polling');
        return;
      }

      socket = new WebSocket(`${wsHost}/chat-system`);

      socket.onopen = () => {
        console.log('✅ Connected to Chat WebSocket');
        setWsConnected(true);
        reconnectAttempts = 0;
      };

      socket.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          
          setMessages(prev => {
            // Check for duplicates
            if (prev.some(m => m._id === messageData._id || m.messageId === messageData.messageId)) {
              return prev;
            }
            return [...prev, messageData];
          });
        } catch (e) {
          // Ignore non-JSON messages (like Yjs binary data)
        }
      };

      socket.onclose = () => {
        console.log('❌ Chat WebSocket disconnected');
        setWsConnected(false);
        // Don't auto-reconnect to avoid infinite loop
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setWs(socket);
    };

    // Delay initial connection slightly to avoid race conditions
    const timeoutId = setTimeout(connect, 500);

    return () => {
      clearTimeout(timeoutId);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const sendMessage = async (messageData) => {
    try {
      // Send to API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      const savedMessage = await response.json();

      // Update local state
      setMessages(prev => [...prev, savedMessage]);

      // Try to send via WebSocket for real-time (optional, don't fail if WS is down)
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(savedMessage));
        }
      } catch (wsErr) {
        console.warn('WebSocket send failed (non-critical):', wsErr);
      }

      return savedMessage;
    } catch (err) {
      console.error('SendMessage Error:', err);
      
      // Fallback: Save to localStorage if API fails
      const fallbackMessage = {
      ...messageData,
        messageId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isRead: false,
        _localOnly: true
      };
      setMessages(prev => [...prev, fallbackMessage]);
      localStorage.setItem('tu2tor_messages', JSON.stringify([...messages, fallbackMessage]));
      
      return fallbackMessage;
    }
  };

  const fetchMessages = useCallback(async (contactId) => {
    try {
      const response = await fetch(`/api/messages/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      
      // Merge with existing messages, avoiding duplicates
      setMessages(prev => {
        const newIds = new Set(data.map(m => m._id));
        const filteredPrev = prev.filter(m => !newIds.has(m._id));
        return [...filteredPrev, ...data];
      });
      
      return data;
    } catch (err) {
      console.error('FetchMessages Error:', err);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/contacts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return await response.json();
    } catch (err) {
      console.error('FetchContacts Error:', err);
      return [];
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (err) {
      console.error('FetchAllUsers Error:', err);
      return [];
    }
  }, []);

  const markMessageAsRead = (messageId) => {
    // Optimistic
    setMessages(prev =>
      prev.map(m => m._id === messageId ? { ...m, isRead: true } : m)
    );
    // TODO: Call API
  };

  const markConversationAsRead = async (userId, contactId) => {
    try {
      await fetch(`/api/messages/read/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setMessages(prev =>
        prev.map(m => {
      const isInConversation =
        (m.senderId === contactId && m.receiverId === userId) ||
            (m.senderId === userId && m.receiverId === contactId) ||
            (m.senderId?._id === contactId && m.receiverId?._id === userId) || // Handle populated objects
            (m.senderId?._id === userId && m.receiverId?._id === contactId);
            
      return isInConversation && !m.isRead ? { ...m, isRead: true } : m;
        })
      );
    } catch (err) {
      console.error('MarkRead Error:', err);
    }
  };

  const deleteConversation = async (contactId) => {
    try {
      await fetch(`/api/messages/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove messages locally
      setMessages(prev => prev.filter(m => {
        const sId = m.senderId?._id || m.senderId;
        const rId = m.receiverId?._id || m.receiverId;
        return !(sId === contactId || rId === contactId);
      }));
      
      return true;
    } catch (err) {
      console.error('DeleteConversation Error:', err);
      return false;
    }
  };

  const getConversation = (userId, contactId) => {
    const filtered = messages.filter(m => {
      // Handle both populated objects and raw IDs
      const sId = m.senderId?._id || m.senderId;
      const rId = m.receiverId?._id || m.receiverId;
      
      // Convert to string for comparison (MongoDB ObjectIds)
      const sIdStr = String(sId);
      const rIdStr = String(rId);
      const userIdStr = String(userId);
      const contactIdStr = String(contactId);
      
      return (sIdStr === userIdStr && rIdStr === contactIdStr) || 
             (sIdStr === contactIdStr && rIdStr === userIdStr);
    });
    
    return filtered.sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp));
  };

  const getUnreadCount = (userId, contactId) => {
    return messages.filter(m => {
      const sId = m.senderId?._id || m.senderId;
      const rId = m.receiverId?._id || m.receiverId;
      return sId === contactId && rId === userId && !m.isRead;
    }).length;
  };

  const getLastMessage = (userId, contactId) => {
    const conversation = getConversation(userId, contactId);
    return conversation[conversation.length - 1] || null;
  };

  // ========================================================================
  // Notification methods (connected to real API)
  // ========================================================================

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      const response = await notificationsAPI.getNotifications(params);
      setNotifications(response.notifications || []);
      return response;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Fallback to localStorage
      const saved = localStorage.getItem('tu2tor_notifications');
      if (saved) setNotifications(JSON.parse(saved));
      return { notifications: [] };
    }
  }, []);

  const addNotification = async (notificationData) => {
    // For local/optimistic updates
    const newNotification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId || n.id === notificationId) ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Optimistic update anyway
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId || n.id === notificationId) ? { ...n, read: true } : n)
      );
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId && n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      // Optimistic update anyway
      setNotifications(prev => prev.filter(n => n._id !== notificationId && n.id !== notificationId));
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationsAPI.deleteAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      setNotifications([]);
    }
  };

  const getUserNotifications = () => {
    return notifications;
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter(n => !n.read).length;
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
    getBookingReview,
    updateReview,
    markReviewAsHelpful,

    // Credit methods
    addCreditTransaction,
    getUserTransactions,

    // Feedback methods
    addUserFeedback,
    updateUserPreference,

    // Message methods
    sendMessage,
    fetchMessages,
    fetchContacts,
    fetchAllUsers,
    deleteConversation,
    markMessageAsRead,
    markConversationAsRead,
    getConversation,
    getUnreadCount,
    getLastMessage,

    // Notification methods
    fetchNotifications,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,
    clearAllNotifications,
    getUserNotifications,
    getUnreadNotificationCount,

    // Favorite methods
    toggleFavoriteTutor,
    isTutorFavorited,
    getUserFavoriteTutors,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
