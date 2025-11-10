import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  BookOpen,
  CheckCircle,
  Loader2,
  AlertCircle
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
    { id: 'active', label: 'Active Now', count: activeSessions.length, color: 'text-green-600' },
    { id: 'upcoming', label: 'Upcoming', count: upcomingSessions.length, color: 'text-blue-600' },
    { id: 'completed', label: 'Completed', count: completedSessions.length, color: 'text-gray-600' },
  ];

  const getCurrentSessions = () => {
    switch (activeTab) {
      case 'active':
        return activeSessions;
      case 'upcoming':
        return upcomingSessions;
      case 'completed':
        return completedSessions;
      default:
        return [];
    }
  };

  const currentSessions = getCurrentSessions();

  const getSessionStatus = (booking) => {
    const sessionDate = new Date(booking.date);
    const fifteenMinutes = 15 * 60 * 1000;
    const timeDiff = sessionDate.getTime() - now.getTime();

    if (Math.abs(timeDiff) <= fifteenMinutes) {
      return { label: 'Active Now', color: 'bg-green-100 text-green-700', canJoin: true };
    } else if (timeDiff > 0) {
      const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      return {
        label: hoursUntil > 0 ? `In ${hoursUntil}h ${minutesUntil}m` : `In ${minutesUntil}m`,
        color: 'bg-blue-100 text-blue-700',
        canJoin: false
      };
    } else {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-700', canJoin: false };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-600 mt-2">View and manage your tutoring sessions</p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading sessions...</span>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          {currentSessions.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {currentSessions.map((booking) => {
                const tutorId = booking.tutor?.userId || booking.tutorId;
                const tutor = tutors.find(t => t.userId === tutorId);
                const status = getSessionStatus(booking);

                return (
                  <div
                    key={booking._id || booking.bookingId}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Avatar */}
                        <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {tutor?.username?.charAt(0).toUpperCase() || 'T'}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {booking.subject}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {user?.role === 'tutor'
                              ? `Student: ${booking.student?.username || 'Student'}`
                              : `Tutor: ${tutor?.username || 'Tutor'}`
                            }
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {booking.timeSlot}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {booking.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {booking.duration} min
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      {status.canJoin && booking.sessionType === 'online' && (
                        <Link
                          to={`/app/session/${booking._id || booking.bookingId}`}
                          className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Now
                        </Link>
                      )}

                      {!status.canJoin && activeTab === 'upcoming' && booking.sessionType === 'online' && (
                        <button
                          disabled
                          className="flex-1 py-2.5 bg-gray-100 text-gray-400 rounded-lg font-semibold text-sm cursor-not-allowed flex items-center justify-center"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Not Yet Available
                        </button>
                      )}

                      {activeTab === 'completed' && !booking.hasReview && user?.role === 'student' && (
                        <Link
                          to={`/app/review/${booking._id || booking.bookingId}`}
                          className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Leave Review
                        </Link>
                      )}

                      {activeTab === 'completed' && booking.hasReview && (
                        <div className="flex-1 py-2.5 bg-green-50 text-green-700 rounded-lg font-semibold text-sm flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reviewed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} sessions</h3>
              <p className="text-gray-600">
                {activeTab === 'active' && 'No sessions are currently active'}
                {activeTab === 'upcoming' && 'You have no upcoming sessions scheduled'}
                {activeTab === 'completed' && 'You have no completed sessions yet'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SessionsPage;
