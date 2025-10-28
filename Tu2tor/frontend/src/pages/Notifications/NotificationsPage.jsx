import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  Star,
  MessageSquare,
  Clock,
  Filter,
  Check,
  Trash2
} from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { bookings, reviews } = useApp();
  const [filter, setFilter] = useState('all');

  // Generate notifications from bookings and reviews
  const userBookings = bookings.filter(
    b => b.studentId === user?.userId || b.tutorId === user?.userId
  );

  const userReviews = reviews.filter(r => r.tutorId === user?.userId);

  const notifications = [
    ...userBookings.map(booking => ({
      id: `booking-${booking.bookingId}`,
      type: 'booking',
      title: `Booking ${booking.status}`,
      message: `Your session for ${booking.subject} has been ${booking.status}`,
      time: new Date(booking.createdAt),
      read: false,
      icon: booking.status === 'confirmed' ? CheckCircle :
            booking.status === 'cancelled' ? AlertCircle : Calendar,
      color: booking.status === 'confirmed' ? 'green' :
             booking.status === 'cancelled' ? 'red' : 'yellow'
    })),
    ...userReviews.slice(0, 5).map(review => ({
      id: `review-${review.reviewId}`,
      type: 'review',
      title: 'New Review Received',
      message: `You received a ${review.rating}-star review`,
      time: new Date(review.createdAt),
      read: false,
      icon: Star,
      color: 'yellow'
    }))
  ].sort((a, b) => b.time - a.time);

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
    const diff = Math.floor((now - time) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {notifications.filter(n => !n.read).length} unread notifications
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
          <button className="btn-secondary flex items-center">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear all
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 flex space-x-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              filter === f.id ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            const bgColor = {
              green: 'bg-green-100',
              red: 'bg-red-100',
              yellow: 'bg-yellow-100',
              blue: 'bg-blue-100'
            }[notification.color] || 'bg-gray-100';

            const iconColor = {
              green: 'text-green-600',
              red: 'text-red-600',
              yellow: 'text-yellow-600',
              blue: 'text-blue-600'
            }[notification.color] || 'text-gray-600';

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border ${
                  notification.read ? 'border-gray-200' : 'border-primary-300 bg-primary-50/30'
                } p-5 hover:shadow-md transition-all cursor-pointer`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 ${bgColor} rounded-full flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatTime(notification.time)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? "You're all caught up!"
              : `No ${filter} notifications`}
          </p>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Notification Preferences</h3>
        <p className="text-primary-100 mb-4">
          Customize how you receive updates about your tutoring activities
        </p>
        <button className="px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
          Manage Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
