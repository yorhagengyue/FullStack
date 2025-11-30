import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  BookOpen,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const SessionsPage = () => {
  const { user } = useAuth();
  const { bookings, tutors } = useApp();

  const [activeTab, setActiveTab] = useState('active');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [bookings]);

  // Get current time
  const now = new Date();

  // Filter sessions based on status and time
  const activeSessions = bookings.filter(booking => {
    if (booking.status !== 'confirmed') return false;
    const sessionDate = new Date(booking.date);
    const fifteenMinutes = 15 * 60 * 1000;
    // Active if within ±15 minutes
    return Math.abs(now.getTime() - sessionDate.getTime()) <= fifteenMinutes;
  });

  const upcomingSessions = bookings.filter(booking => {
    if (booking.status !== 'confirmed') return false;
    const sessionDate = new Date(booking.date);
    const fifteenMinutes = 15 * 60 * 1000;
    // Upcoming if more than 15 minutes in the future
    return sessionDate.getTime() - now.getTime() > fifteenMinutes;
  });

  const completedSessions = bookings.filter(booking =>
    booking.status === 'completed'
  );

  const tabs = [
    { id: 'active', label: 'Active Now', count: activeSessions.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingSessions.length },
    { id: 'completed', label: 'Completed', count: completedSessions.length },
  ];

  const getCurrentSessions = () => {
    switch (activeTab) {
      case 'active': return activeSessions;
      case 'upcoming': return upcomingSessions;
      case 'completed': return completedSessions;
      default: return [];
    }
  };

  const currentSessions = getCurrentSessions();

  const getSessionStatus = (booking) => {
    const sessionDate = new Date(booking.date);
    const fifteenMinutes = 15 * 60 * 1000;
    const timeDiff = sessionDate.getTime() - now.getTime();

    if (Math.abs(timeDiff) <= fifteenMinutes) {
      return { label: 'Live Now', color: 'bg-rose-500 text-white animate-pulse', canJoin: true };
    } else if (timeDiff > 0) {
      const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      return {
        label: hoursUntil > 0 ? `In ${hoursUntil}h ${minutesUntil}m` : `In ${minutesUntil}m`,
        color: 'bg-blue-100 text-blue-700',
        canJoin: false
      };
    } else {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-600', canJoin: false };
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F5F9] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1600px] bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-6 md:p-10 min-h-[90vh]">
        
      {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sessions</h1>
          <p className="text-gray-500 mt-1">Your virtual classroom and session history.</p>
        </div>

          {/* Tabs */}
        <div className="flex mb-8 p-1.5 bg-gray-50 rounded-full border border-gray-100 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-gray-100 text-gray-900' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
              )}
                </button>
              ))}
            </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-4" />
            <p className="text-gray-500">Loading sessions...</p>
          </div>
        ) : (
          <>
          {currentSessions.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {currentSessions.map((booking) => {
                const tutorId = booking.tutor?.userId || booking.tutorId;
                const tutor = tutors.find(t => t.userId === tutorId);
                const status = getSessionStatus(booking);

                return (
                  <div
                    key={booking._id || booking.bookingId}
                      className="group bg-white rounded-[32px] p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 flex flex-col"
                  >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                        {booking.sessionType === 'online' && (
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                            <Video className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.subject}</h3>
                      
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                            {tutor?.username?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{tutor?.username || 'Tutor'}</p>
                          <p className="text-xs text-gray-500">Instructor</p>
                      </div>
                    </div>

                      <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                          {new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-3 text-gray-400" />
                          {booking.timeSlot} • {booking.duration} min
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        {booking.location}
                      </div>
                    </div>

                      <div className="mt-auto">
                        {status.canJoin && booking.sessionType === 'online' ? (
                        <Link
                          to={`/app/session/${booking._id || booking.bookingId}`}
                            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                        >
                            Enter Classroom
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        ) : activeTab === 'upcoming' ? (
                          <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2">
                            Not Started Yet
                        </button>
                        ) : activeTab === 'completed' && !booking.hasReview ? (
                        <Link
                          to={`/app/review/${booking._id || booking.bookingId}`}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            Rate Session
                        </Link>
                        ) : (
                          <div className="w-full py-3 bg-gray-50 text-gray-500 rounded-xl font-semibold text-sm text-center">
                            Session Closed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} sessions</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                  {activeTab === 'active' && "You don't have any sessions scheduled for right now."}
                  {activeTab === 'upcoming' && "No upcoming sessions. Book a tutor to get started!"}
                  {activeTab === 'completed' && "Your completed sessions history will appear here."}
                </p>
                {activeTab === 'upcoming' && (
                  <Link
                    to="/app/search"
                    className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all"
                  >
                    Find a Tutor
                  </Link>
                )}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default SessionsPage;
