import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Plus,
  Video,
  MoreVertical,
  Send,
  Inbox,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, tutors, updateBooking, fetchBookings } = useApp();

  const [activeSection, setActiveSection] = useState('sent'); // 'sent' or 'received'
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    confirmStyle: 'primary'
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  // Get user ID (handle both formats)
  const userId = user?.id || user?.userId;

  // Split bookings into sent (as student) and received (as tutor)
  const sentBookings = bookings.filter(b => {
    const studentId = b.student?.id || b.studentId;
    return String(studentId) === String(userId);
  });

  const receivedBookings = bookings.filter(b => {
    const tutorUserId = b.tutor?.userId || b.tutorId;
    return String(tutorUserId) === String(userId);
  });

  // Apply status filter
  const filterByStatus = (bookingList) => {
    if (statusFilter === 'all') return bookingList;
    if (statusFilter === 'active') return bookingList.filter(b => b.status === 'confirmed' || b.status === 'pending');
    return bookingList.filter(b => b.status === statusFilter);
  };

  const currentBookings = activeSection === 'sent' 
    ? filterByStatus(sentBookings) 
    : filterByStatus(receivedBookings);

  // Sort by date (most recent first)
  const sortedBookings = [...currentBookings].sort((a, b) =>
    new Date(b.date || b.startTime) - new Date(a.date || a.startTime)
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default: return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleCancelBooking = (bookingId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmText: 'Yes, Cancel',
      confirmStyle: 'danger',
      onConfirm: async () => {
        await updateBooking(bookingId, { status: 'cancelled' });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleConfirmBooking = (bookingId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Booking',
      message: 'Accept this booking request? The student will be notified.',
      confirmText: 'Confirm',
      confirmStyle: 'primary',
      onConfirm: async () => {
        await updateBooking(bookingId, { status: 'confirmed' });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleCompleteBooking = (bookingId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Complete Session',
      message: 'Mark this session as completed? Credits will be transferred.',
      confirmText: 'Mark Complete',
      confirmStyle: 'primary',
      onConfirm: async () => {
        await updateBooking(bookingId, { status: 'completed' });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const BookingCard = ({ booking, isSent }) => {
    const bookingId = booking._id || booking.id || booking.bookingId;
    const otherPartyName = isSent 
      ? (booking.tutor?.username || 'Tutor')
      : (booking.student?.username || 'Student');
    const otherPartyAvatar = isSent
      ? booking.tutor?.profilePicture
      : booking.student?.profilePicture;

  return (
      <div className="group bg-white rounded-[28px] p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 flex flex-col relative overflow-hidden">
        {/* Top Accent */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${
          booking.status === 'confirmed' ? 'bg-emerald-500' : 
          booking.status === 'pending' ? 'bg-amber-500' :
          booking.status === 'cancelled' ? 'bg-rose-500' : 'bg-blue-500'
        }`}></div>

        {/* Direction Badge */}
        <div className="absolute top-4 right-4">
          <div className={`p-2 rounded-full ${isSent ? 'bg-blue-50' : 'bg-purple-50'}`}>
            {isSent ? (
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            ) : (
              <ArrowDownLeft className="w-4 h-4 text-purple-600" />
              )}
            </div>
            </div>

        <div className="flex items-start gap-4 mb-4 mt-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
            <img 
              src={otherPartyAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPartyName}`}
              alt={otherPartyName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{booking.subject}</h3>
            <p className="text-sm text-gray-500">
              {isSent ? 'with' : 'from'} <span className="font-medium text-gray-700">{otherPartyName}</span>
            </p>
                      </div>
                    </div>

        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 w-fit mb-4 ${getStatusBadge(booking.status)}`}>
          {getStatusIcon(booking.status)}
          <span className="capitalize">{booking.status}</span>
                      </div>

        <div className="space-y-2.5 mb-6 bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {new Date(booking.date || booking.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
                          <span>{booking.timeSlot}</span>
                        </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{booking.location}</span>
                        </div>
                      </div>

        {/* Actions based on role and status */}
        <div className="mt-auto pt-4 border-t border-gray-100 grid gap-2">
          {/* For SENT bookings (I am the student) */}
          {isSent && (
            <>
              {booking.status === 'confirmed' && (
                          <>
                              <button
                    onClick={() => navigate(`/app/session/${bookingId}`)}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Join Session
                            </button>
                          </>
                        )}
              {booking.status === 'pending' && (
                            <button
                  onClick={() => handleCancelBooking(bookingId)}
                  className="w-full py-3 border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl font-semibold text-sm transition-colors"
                            >
                  Cancel Request
                            </button>
              )}
              {booking.status === 'completed' && !booking.hasReview && (
                                <Link
                  to={`/app/review/${bookingId}`}
                  className="w-full py-3 bg-amber-400 text-white hover:bg-amber-500 rounded-xl font-semibold text-sm transition-colors text-center flex items-center justify-center gap-2"
                                >
                  <Star className="w-4 h-4 fill-current" />
                  Leave Review
                                </Link>
                              )}
                          </>
                        )}

          {/* For RECEIVED bookings (I am the tutor) */}
          {!isSent && (
            <>
              {booking.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleConfirmBooking(bookingId)}
                    className="w-full py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-semibold text-sm transition-colors"
                              >
                    Accept
                  </button>
                            <button
                    onClick={() => handleCancelBooking(bookingId)}
                    className="w-full py-3 border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl font-semibold text-sm transition-colors"
                            >
                    Decline
                            </button>
                          </div>
                        )}
              {booking.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => navigate(`/app/session/${bookingId}`)}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Start Session
                  </button>
                  <button
                    onClick={() => handleCompleteBooking(bookingId)}
                    className="w-full py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Mark Complete
                  </button>
                </>
                        )}
            </>
          )}
                    </div>
                  </div>
                );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        {activeSection === 'sent' ? (
          <Send className="w-8 h-8 text-gray-300" />
        ) : (
          <Inbox className="w-8 h-8 text-gray-300" />
        )}
              </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {activeSection === 'sent' ? 'No sent requests' : 'No received requests'}
      </h3>
      <p className="text-gray-500 mb-8 max-w-sm">
        {activeSection === 'sent' 
          ? "You haven't booked any tutoring sessions yet. Find a tutor to get started!"
          : "You haven't received any booking requests yet. Make sure your tutor profile is set up."
        }
              </p>
      {activeSection === 'sent' && (
              <Link
                to="/app/search"
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all"
              >
                Find a Tutor
              </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-full bg-[#F2F5F9] font-sans">
      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
            <p className="text-gray-500 mt-1">Manage your tutoring sessions and requests.</p>
            </div>
          <Link
            to="/app/search"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </Link>
        </div>

        {/* Section Toggle - Sent vs Received */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl">
            <button
              onClick={() => setActiveSection('sent')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'sent'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Send className="w-4 h-4" />
              Sent Requests
              {sentBookings.length > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeSection === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {sentBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSection('received')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeSection === 'received'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Received Requests
              {receivedBookings.length > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeSection === 'received' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {receivedBookings.length}
                </span>
              )}
            </button>
      </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusTabs.map(tab => (
                <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  statusFilter === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                </button>
            ))}
          </div>
        </div>

        {/* Section Description */}
        <div className={`mb-6 p-4 rounded-2xl ${activeSection === 'sent' ? 'bg-blue-50' : 'bg-purple-50'}`}>
          <div className="flex items-center gap-3">
            {activeSection === 'sent' ? (
              <>
                <div className="p-2 bg-blue-100 rounded-xl">
                  <ArrowUpRight className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sent Requests</h3>
                  <p className="text-sm text-gray-600">Bookings you've made as a student with other tutors</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-purple-100 rounded-xl">
                  <ArrowDownLeft className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Received Requests</h3>
                  <p className="text-sm text-gray-600">Booking requests from students who want to learn from you</p>
                </div>
              </>
            )}
              </div>
            </div>

        {/* Bookings Grid */}
        {sortedBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedBookings.map((booking) => (
              <BookingCard 
                key={booking._id || booking.id || booking.bookingId} 
                booking={booking} 
                isSent={activeSection === 'sent'}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
            </div>

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{confirmDialog.title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                  confirmDialog.confirmStyle === 'danger'
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                    : 'bg-gray-900 hover:bg-gray-800 shadow-gray-200'
                  }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
