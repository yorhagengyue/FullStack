import { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, CreditCard } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const BookingModal = ({ isOpen, onClose, tutor, subject, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    duration: 1,
    location: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    if (!formData.location) newErrors.location = 'Please select a location';

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = 'Please select a future date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Combine date and time into proper datetime
      const dateTime = new Date(`${formData.date}T${formData.timeSlot.split('-')[0]}:00`);

      await onSubmit({
        tutorId: tutor._id || tutor.id, // Use tutor's MongoDB _id
        subject,
        date: dateTime.toISOString(),
        timeSlot: formData.timeSlot,
        duration: formData.duration,
        location: formData.location,
        notes: formData.notes
      });
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Book a Session</h2>
              <p className="text-primary-100">with {tutor?.username}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subject Display */}
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-gray-600 mb-1">Subject</p>
            <p className="font-bold text-gray-900">{subject}</p>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-primary-600" />
              Select Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border-2 ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Time Slot */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-2 text-primary-600" />
              Select Time Slot *
            </label>
            <select
              value={formData.timeSlot}
              onChange={(e) => handleChange('timeSlot', e.target.value)}
              className={`w-full px-4 py-3 border-2 ${errors.timeSlot ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
            >
              <option value="">Choose a time slot</option>
              {tutor?.availableSlots && tutor.availableSlots.length > 0 ? (
                tutor.availableSlots.map((slot, index) => {
                  // Handle both string and object formats
                  const slotValue = typeof slot === 'string'
                    ? slot
                    : `${slot.startTime}-${slot.endTime}`;
                  const slotLabel = typeof slot === 'string'
                    ? slot
                    : `${slot.day}: ${slot.startTime} - ${slot.endTime}`;

                  return (
                    <option key={index} value={slotValue}>
                      {slotLabel}
                    </option>
                  );
                })
              ) : (
                <>
                  <option value="09:00-10:00">09:00 - 10:00</option>
                  <option value="10:00-11:00">10:00 - 11:00</option>
                  <option value="11:00-12:00">11:00 - 12:00</option>
                  <option value="13:00-14:00">13:00 - 14:00</option>
                  <option value="14:00-15:00">14:00 - 15:00</option>
                  <option value="15:00-16:00">15:00 - 16:00</option>
                  <option value="16:00-17:00">16:00 - 17:00</option>
                  <option value="17:00-18:00">17:00 - 18:00</option>
                  <option value="18:00-19:00">18:00 - 19:00</option>
                  <option value="19:00-20:00">19:00 - 20:00</option>
                </>
              )}
            </select>
            {errors.timeSlot && (
              <p className="text-red-500 text-sm mt-1">{errors.timeSlot}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 mr-2 text-primary-600" />
              Duration (hours) *
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleChange('duration', Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value={0.5}>30 minutes</option>
              <option value={1}>1 hour</option>
              <option value={1.5}>1.5 hours</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-primary-600" />
              Select Location *
            </label>
            <select
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={`w-full px-4 py-3 border-2 ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
            >
              <option value="">Choose a location</option>
              {tutor?.preferredLocations && tutor.preferredLocations.length > 0 ? (
                tutor.preferredLocations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))
              ) : (
                <>
                  <option value="Online">Online (Video Call)</option>
                  <option value="Library">School Library</option>
                  <option value="Study Room">Study Room</option>
                  <option value="Canteen">Canteen</option>
                </>
              )}
            </select>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-2 text-primary-600" />
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              placeholder="Any specific topics or questions you'd like to cover?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Cost Summary */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Session Cost:</span>
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">
                  {Math.round((tutor?.hourlyRate || 30) * formData.duration)} credits
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {tutor?.hourlyRate || 30} credits/hour × {formData.duration} hour(s)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Credits will be deducted upon tutor confirmation
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Booking...</span>
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
