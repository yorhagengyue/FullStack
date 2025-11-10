import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Plus,
  X,
  Video
} from 'lucide-react';


const BookingPage = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { bookings, tutors, createBooking, updateBooking } = useApp();

  const [activeTab, setActiveTab] = useState('all');
  const [expandedFilters, setExpandedFilters] = useState({
    status: true,
    subject: true,
    date: false
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    confirmStyle: 'primary'
  });

  // Get tutor info from navigation state if coming from tutor detail page
  const { tutorId: navTutorId, subject: navSubject } = location.state || {};

  // Filter bookings by user
  const userBookings = bookings.filter(
    b => b.studentId === user?.userId || b.tutorId === user?.userId
  );

  // Filter by tab
  const filteredBookings = userBookings.filter(booking => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return booking.status === 'confirmed' || booking.status === 'pending';
    if (activeTab === 'completed') return booking.status === 'completed';
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  // Sort by date (most recent first)
  const sortedBookings = [...filteredBookings].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  // Get unique subjects for filter
  const uniqueSubjects = [...new Set(userBookings.map(b => b.subject))];

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      confirmed: 'bg-green-100 text-green-700 border-green-300',
      completed: 'bg-blue-100 text-blue-700 border-blue-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleCancelBooking = (bookingId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmText: 'Cancel Booking',
      confirmStyle: 'danger',
      onConfirm: () => {
        updateBooking(bookingId, { status: 'cancelled' });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleCompleteBooking = (bookingId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Complete Session',
      message: 'Mark this session as completed? You can leave a review after marking it complete.',
      confirmText: 'Mark Complete',
      confirmStyle: 'primary',
      onConfirm: () => {
        updateBooking(bookingId, { status: 'completed' });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const toggleFilter = (filterName) => {
    setExpandedFilters({
      ...expandedFilters,
      [filterName]: !expandedFilters[filterName]
    });
  };

  const tabs = [
    { id: 'all', label: 'All', count: userBookings.length },
    { id: 'upcoming', label: 'Upcoming', count: userBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length },
    { id: 'completed', label: 'Completed', count: userBookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: userBookings.filter(b => b.status === 'cancelled').length },
  ];

  return (
    <>
      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <aside className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Clear All
              </button>
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <button
                onClick={() => toggleFilter('status')}
                className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
              >
                <span>Status</span>
                {expandedFilters.status ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedFilters.status && (
                <div className="space-y-2 mt-2 pl-2">
                  {tabs.map((tab) => (
                    <label key={tab.id} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="status"
                        checked={activeTab === tab.id}
                        onChange={() => setActiveTab(tab.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                        {tab.label}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {tab.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Subject Filter */}
            <div className="mb-4">
              <button
                onClick={() => toggleFilter('subject')}
                className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
              >
                <span>Subject</span>
                {expandedFilters.subject ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedFilters.subject && (
                <div className="space-y-2 mt-2 pl-2">
                  {uniqueSubjects.slice(0, 5).map((subject) => (
                    <label key={subject} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                        {subject}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Date Range Filter */}
            <div className="mb-4">
              <button
                onClick={() => toggleFilter('date')}
                className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
              >
                <span>Date Range</span>
                {expandedFilters.date ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedFilters.date && (
                <div className="space-y-3 mt-2 pl-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">From</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">To</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg border border-primary-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-bold text-gray-900">{userBookings.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-bold text-primary-600">
                    {userBookings.filter(b => new Date(b.date).getMonth() === new Date().getMonth()).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                Showing {sortedBookings.length} {activeTab === 'all' ? 'total' : activeTab} bookings
              </p>
            </div>
            <Link
              to="/app/search"
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Link>
          </div>

          {/* Bookings Grid */}
          {sortedBookings.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedBookings.map((booking) => {
                const isStudent = booking.studentId === user?.userId;
                const otherParty = isStudent
                  ? tutors.find(t => t.userId === booking.tutorId)
                  : null;

                return (
                <div
                  key={booking.bookingId}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Card Header - Visual Area */}
                  <div className="relative bg-gradient-to-br from-primary-500 to-purple-600 p-6 h-32">
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(booking.status)} backdrop-blur-sm`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(booking.status)}
                        <h3 className="text-xl font-bold text-white">{booking.subject}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Tutor/Student Info */}
                    <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {isStudent
                            ? otherParty?.username?.charAt(0).toUpperCase()
                            : booking.studentId?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">
                          {isStudent ? 'Tutor' : 'Student'}
                        </p>
                        <p className="font-semibold text-gray-900 truncate">
                          {isStudent ? otherParty?.username : booking.studentId}
                        </p>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-3 text-primary-600 flex-shrink-0" />
                        <span className="font-medium">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-3 text-primary-600 flex-shrink-0" />
                        <span>{booking.timeSlot}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-primary-600 flex-shrink-0" />
                        <span className="truncate">{booking.location}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-700 line-clamp-2">{booking.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2 mt-auto">
                      {booking.status === 'pending' && (
                        <>
                          {!isStudent && (
                            <button
                              onClick={() => updateBooking(booking.bookingId, { status: 'confirmed' })}
                              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm transition-colors"
                            >
                              Confirm Session
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelBooking(booking.bookingId)}
                            className="w-full py-2.5 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg font-semibold text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <>
                          {booking.sessionType === 'online' && (
                            <Link
                              to={`/app/session/${booking._id || booking.bookingId}`}
                              className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Video Session
                            </Link>
                          )}
                          <button
                            onClick={() => handleCompleteBooking(booking.bookingId)}
                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors"
                          >
                            Mark Complete
                          </button>
                          <div className={`grid ${isStudent ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                            <button
                              key="message-btn"
                              className="py-2 border border-gray-300 hover:border-primary-500 rounded-lg font-medium text-gray-700 hover:text-primary-600 text-xs transition-colors flex items-center justify-center"
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                              Message
                            </button>
                            {isStudent && (
                              <Link
                                key="profile-link"
                                to={`/app/tutor/${booking.tutorId}`}
                                className="py-2 border border-gray-300 hover:border-primary-500 rounded-lg font-medium text-gray-700 hover:text-primary-600 text-xs transition-colors flex items-center justify-center"
                              >
                                <User className="w-3.5 h-3.5 mr-1.5" />
                                Profile
                              </Link>
                            )}
                          </div>
                        </>
                      )}

                      {booking.status === 'completed' && (
                        <div className="space-y-2">
                          {isStudent && !booking.hasReview && (
                            <Link
                              to={`/app/review/${booking.bookingId}`}
                              className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Leave Review
                            </Link>
                          )}
                          {isStudent && booking.hasReview && (
                            <div className="py-2.5 bg-green-50 text-green-700 rounded-lg font-semibold text-sm text-center border border-green-200">
                              <CheckCircle className="w-4 h-4 inline mr-2" />
                              Review Submitted
                            </div>
                          )}
                          <button className="w-full py-2 border border-gray-300 hover:border-primary-500 rounded-lg font-medium text-gray-700 hover:text-primary-600 text-sm transition-colors flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </button>
                        </div>
                      )}

                      {booking.status === 'cancelled' && (
                        <div className="py-2.5 bg-red-50 text-red-700 rounded-lg font-semibold text-sm text-center border border-red-200">
                          Session Cancelled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all'
                ? "You haven't booked any sessions yet"
                : `No ${activeTab} bookings`}
            </p>
            <Link
              to="/app/search"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Find a Tutor
            </Link>
          </div>
        )}
      </div>
    </div>

      {/* Custom Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{confirmDialog.title}</h3>
                <button
                  onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-gray-600 leading-relaxed">{confirmDialog.message}</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-5 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-5 py-2.5 font-semibold rounded-lg transition-colors ${
                  confirmDialog.confirmStyle === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingPage;
