import { X, Calendar, Clock, MapPin, User, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Modal to display all activities for a selected day
 */
const DayActivitiesModal = ({ isOpen, onClose, selectedDay }) => {
  if (!isOpen || !selectedDay) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white bg-opacity-30 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedDay.displayDate}
              </h2>
              <p className="text-primary-100 text-sm">
                {selectedDay.count} session{selectedDay.count > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activities List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {selectedDay.activities.length > 0 ? (
            <div className="space-y-4">
              {selectedDay.activities.map((activity) => (
                <div
                  key={activity.bookingId}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                        {activity.subject}
                      </h3>
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                      {getStatusIcon(activity.status)}
                      <span className="capitalize">{activity.status}</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-3 mb-3">
                    {/* Time Slot */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{activity.timeSlot || `${activity.duration}h session`}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{activity.location}</span>
                    </div>

                    {/* Tutor/Student Info */}
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        {activity.tutorId === 'currentUser'
                          ? `Student: ${activity.studentId}`
                          : `Tutor: ${activity.tutorId}`
                        }
                      </span>
                    </div>

                    {/* Booking ID */}
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-mono text-xs">{activity.bookingId}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {activity.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">Notes:</span> {activity.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Link
                      to="/app/bookings"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline"
                    >
                      View in Bookings →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No activities on this day</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayActivitiesModal;
