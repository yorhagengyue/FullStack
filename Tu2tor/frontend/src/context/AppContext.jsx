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

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedBookings = localStorage.getItem('tu2tor_bookings');
    const savedReviews = localStorage.getItem('tu2tor_reviews');
    const savedTransactions = localStorage.getItem('tu2tor_transactions');
    const savedFeedbacks = localStorage.getItem('tu2tor_feedbacks');
    const savedPreference = localStorage.getItem('tu2tor_preference');

    if (savedBookings) setBookings(JSON.parse(savedBookings));
    else setBookings(mockBookings);

    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedTransactions) setCreditTransactions(JSON.parse(savedTransactions));
    else setCreditTransactions(mockCreditTransactions);

    if (savedFeedbacks) setUserFeedbacks(JSON.parse(savedFeedbacks));
    if (savedPreference) setUserPreference(Number(savedPreference));
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

  const value = {
    // 数据
    tutors,
    bookings,
    reviews,
    creditTransactions,
    subjects,
    userFeedbacks,
    userPreference,

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

    // 查询方法
    getTutorById,
    getUserBookings
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
