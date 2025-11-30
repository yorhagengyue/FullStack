import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  Star,
  Check,
  Trash2,
  Settings
} from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useAuth();
  const {
    bookings,
    reviews,
    notifications: savedNotifications,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    markAllNotificationsAsRead,
    clearAllNotifications,
    getUserNotifications
  } = useApp();
  const [filter, setFilter] = useState('all');

  // Auto-generate notifications logic (kept from original)
  useEffect(() => {
    if (!user) return;
    const userBookings = bookings.filter(b => b.studentId === user.userId || b.tutorId === user.userId);
    const userReviews = reviews.filter(r => r.tutorId === user.userId);
    const existingNotifIds = savedNotifications.map(n => n.sourceId);

    userBookings.forEach(booking => {
      const sourceId = `booking-${booking.bookingId}`;
      if (!existingNotifIds.includes(sourceId)) {
        addNotification({
          userId: user.userId,
          sourceId,
          type: 'booking',
          title: `Booking ${booking.status}`,
          message: `Your session for ${booking.subject} has been ${booking.status}`,
          icon: booking.status === 'confirmed' ? 'CheckCircle' : booking.status === 'cancelled' ? 'AlertCircle' : 'Calendar',
          color: booking.status === 'confirmed' ? 'green' : booking.status === 'cancelled' ? 'red' : 'yellow'
        });
      }
    });

    userReviews.forEach(review => {
      const sourceId = `review-${review.reviewId}`;
      if (!existingNotifIds.includes(sourceId)) {
        addNotification({
          userId: user.userId,
          sourceId,
          type: 'review',
          title: 'New Review Received',
          message: `You received a ${review.rating}-star review`,
          icon: 'Star',
          color: 'yellow'
        });
      }
    });
  }, [bookings, reviews, user]);

  const notifications = getUserNotifications(user?.userId || '').map(notif => ({
    ...notif,
    time: new Date(notif.timestamp),
    icon: notif.icon === 'CheckCircle' ? CheckCircle : notif.icon === 'AlertCircle' ? AlertCircle : notif.icon === 'Calendar' ? Calendar : notif.icon === 'Star' ? Star : Bell
  }));

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  const filters = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'booking', label: 'Bookings', count: notifications.filter(n => n.type === 'booking').length },
    { id: 'review', label: 'Reviews', count: notifications.filter(n => n.type === 'review').length },
  ];

  const formatTime = (time) => {
    const now = new Date();
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#F2F5F9] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1000px] bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-6 md:p-10 min-h-[85vh]">
        
      {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-gray-500 mt-1">Stay updated with your session alerts and messages.</p>
        </div>
          
          <div className="flex gap-3">
          <button
              onClick={() => user && markAllNotificationsAsRead(user.userId)}
            disabled={notifications.filter(n => !n.read).length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
              <Check className="w-4 h-4" /> Mark all read
          </button>
          <button
              onClick={() => user && confirm('Clear all notifications?') && clearAllNotifications(user.userId)}
            disabled={notifications.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors disabled:opacity-50"
          >
              <Trash2 className="w-4 h-4" /> Clear all
          </button>
        </div>
      </div>

      {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                filter === f.id 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
          >
            {f.label}
              {f.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  filter === f.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
              {f.count}
            </span>
              )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
        <div className="space-y-4">
      {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => {
            const Icon = notification.icon;
              const colorStyles = {
                green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
                red: { bg: 'bg-rose-100', text: 'text-rose-600' },
                yellow: { bg: 'bg-amber-100', text: 'text-amber-600' },
                blue: { bg: 'bg-blue-100', text: 'text-blue-600' }
              }[notification.color] || { bg: 'bg-gray-100', text: 'text-gray-600' };

            return (
              <div
                key={notification.id}
                  onClick={() => markNotificationAsRead(notification.id)}
                  className={`group relative p-5 rounded-[24px] transition-all cursor-pointer border ${
                    notification.read 
                      ? 'bg-white border-gray-100 hover:border-gray-200' 
                      : 'bg-blue-50/30 border-blue-100 hover:border-blue-200'
                  }`}
              >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorStyles.bg}`}>
                      <Icon className={`w-6 h-6 ${colorStyles.text}`} />
                  </div>
                    
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className={`font-semibold text-base truncate ${notification.read ? 'text-gray-900' : 'text-blue-900'}`}>
                        {notification.title}
                      </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatTime(notification.time)}
                      </span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>
                    </div>

                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                  
                  {!notification.read && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-blue-500 rounded-full group-hover:opacity-0 transition-opacity"></div>
                  )}
              </div>
            );
            })
      ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 text-gray-300" />
          </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500 max-w-xs">
            {filter === 'all'
                  ? "You don't have any notifications at the moment." 
                  : `No ${filter} notifications found.`}
          </p>
        </div>
      )}
        </div>

        {/* Footer Settings Hint */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
           <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <Settings className="w-4 h-4" />
              Manage Notification Preferences
        </button>
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
