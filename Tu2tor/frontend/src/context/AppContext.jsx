import { createContext, useContext, useState, useEffect } from 'react';
import {
  mockTutors,
  mockBookings,
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
  // 状态管理
  const [tutors, setTutors] = useState(mockTutors);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState(mockReviews);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [subjects] = useState(mockSubjects);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [userPreference, setUserPreference] = useState(50); // 0-100, 默认50
  const [messages, setMessages] = useState([]); // 消息状态
  const [notifications, setNotifications] = useState([]); // 通知状态
  const [favoriteTutors, setFavoriteTutors] = useState([]); // 收藏的导师

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedBookings = localStorage.getItem('tu2tor_bookings');
    const savedReviews = localStorage.getItem('tu2tor_reviews');
    const savedTransactions = localStorage.getItem('tu2tor_transactions');
    const savedFeedbacks = localStorage.getItem('tu2tor_feedbacks');
    const savedPreference = localStorage.getItem('tu2tor_preference');
    const savedMessages = localStorage.getItem('tu2tor_messages');
    const savedNotifications = localStorage.getItem('tu2tor_notifications');
    const savedFavorites = localStorage.getItem('tu2tor_favorites');

    if (savedBookings) setBookings(JSON.parse(savedBookings));
    else setBookings(mockBookings);

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

  // 预约相关方法
  const createBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      bookingId: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    const updated = [...bookings, newBooking];
    setBookings(updated);
    localStorage.setItem('tu2tor_bookings', JSON.stringify(updated));
    return newBooking;
  };

  const updateBooking = (bookingId, updates) => {
    const updated = bookings.map(b =>
      b.bookingId === bookingId ? { ...b, ...updates } : b
    );
    setBookings(updated);
    localStorage.setItem('tu2tor_bookings', JSON.stringify(updated));
  };

  const cancelBooking = (bookingId, reason) => {
    updateBooking(bookingId, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledBy: 'student'
    });
  };

  // 评价相关方法
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

    // 更新导师的平均评分
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

  // Credit交易相关方法
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

  // 用户反馈相关方法
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

  // 获取导师的评价
  const getTutorReviews = (tutorId) => {
    return reviews.filter(r => r.tutorId === tutorId);
  };

  // 获取导师详情
  const getTutorById = (tutorId) => {
    return tutors.find(t => t.userId === tutorId);
  };

  // 获取用户的预约
  const getUserBookings = (userId) => {
    return bookings.filter(b => b.studentId === userId || b.tutorId === userId);
  };

  // 获取用户的Credit交易记录
  const getUserTransactions = (userId) => {
    return creditTransactions.filter(t => t.userId === userId);
  };

  // 消息相关方法
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

  // 通知相关方法
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

  // 收藏导师相关方法
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
    // 数据
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

    // 预约方法
    createBooking,
    updateBooking,
    cancelBooking,

    // 评价方法
    createReview,
    getTutorReviews,

    // Credit方法
    addCreditTransaction,
    getUserTransactions,

    // 反馈方法
    addUserFeedback,
    updateUserPreference,

    // 消息方法
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    getConversation,
    getUnreadCount,
    getLastMessage,

    // 通知方法
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,
    clearAllNotifications,
    getUserNotifications,

    // 收藏方法
    toggleFavoriteTutor,
    isTutorFavorited,
    getUserFavoriteTutors,

    // 查询方法
    getTutorById,
    getUserBookings
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
