import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
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
  Plus,
  X,
  Video,
  MoreVertical
} from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, tutors, updateBooking } = useApp();

  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    confirmStyle: 'primary'
  });

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
      message: 'Mark this session as completed? You can leave a review afterwards.',
      confirmText: 'Mark Complete',
      confirmStyle: 'primary',
      onConfirm: () => {
        updateBooking(bookingId, { status: 'completed' });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F5F9] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1600px] bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-6 md:p-10 min-h-[90vh]">
        
          {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
             <p className="text-gray-500 mt-1">Manage your upcoming sessions and history.</p>
            </div>
            <Link
              to="/app/search"
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Link>
          </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
           <div className="flex p-1.5 bg-gray-50 rounded-full border border-gray-100 overflow-x-auto max-w-full">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
           </div>

           {/* Simple Filter Toggle (Visual only for now or expanding later) */}
           <button 
             onClick={() => setShowFilters(!showFilters)}
             className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
           >
             <Filter className="w-4 h-4" />
             <span>Filter</span>
             <ChevronDown className="w-3 h-3" />
           </button>
        </div>

        {/* Bookings List */}
          {sortedBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedBookings.map((booking) => {
                const isStudent = booking.studentId === user?.userId;
                const otherParty = isStudent
                  ? tutors.find(t => t.userId === booking.tutorId)
                  : null;

                return (
                  <div key={booking.bookingId} className="group bg-white rounded-[32px] p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 flex flex-col relative overflow-hidden">
                     {/* Top Accent */}
                     <div className={`absolute top-0 left-0 w-full h-1.5 ${
                       booking.status === 'confirmed' ? 'bg-emerald-500' : 
                       booking.status === 'pending' ? 'bg-amber-500' :
                       booking.status === 'cancelled' ? 'bg-rose-500' : 'bg-blue-500'
                     }`}></div>

                     <div className="flex justify-between items-start mb-4 mt-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusBadge(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                           <span className="capitalize">{booking.status}</span>
                        </div>
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                           <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>

                     <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.subject}</h3>
                     
                     <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {isStudent ? 'T' : 'S'}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          with {isStudent ? otherParty?.username || 'Tutor' : booking.studentId}
                        </span>
                      </div>

                     <div className="space-y-3 mb-6 bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                           <Calendar className="w-4 h-4 text-gray-400" />
                           <span className="font-medium text-gray-900">
                             {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
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

                     <div className="mt-auto pt-4 border-t border-gray-100 grid gap-3">
                        {booking.status === 'confirmed' && (
                          <>
                              <button
                                onClick={() => navigate(`/app/session/${booking._id || booking.bookingId}`)}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                              >
                                <Video className="w-4 h-4" />
                                Join Session
                              </button>
                            <button
                                onClick={() => handleCompleteBooking(booking.bookingId)}
                                className="w-full py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-semibold text-sm transition-colors"
                            >
                                Mark Complete
                            </button>
                          </>
                        )}

                        {booking.status === 'pending' && (
                            <button
                            onClick={() => handleCancelBooking(booking.bookingId)}
                            className="w-full py-3 border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl font-semibold text-sm transition-colors"
                              >
                            Cancel Request
                              </button>
                        )}

                        {booking.status === 'completed' && !booking.hasReview && isStudent && (
                              <Link
                                to={`/app/review/${booking.bookingId}`}
                             className="w-full py-3 bg-amber-400 text-white hover:bg-amber-500 rounded-xl font-semibold text-sm transition-colors text-center flex items-center justify-center gap-2"
                              >
                             <Star className="w-4 h-4 fill-current" />
                                Leave Review
                              </Link>
                            )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
               <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-8">
              {activeTab === 'all' ? "You don't have any bookings yet." : `No ${activeTab} bookings found.`}
              </p>
              <Link
                to="/app/search"
              className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all"
              >
                Find a Tutor
              </Link>
            </div>
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
