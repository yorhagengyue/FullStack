import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Star, ArrowLeft, CheckCircle, AlertCircle, User, Calendar, BookOpen } from 'lucide-react';

const ReviewSubmitPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, tutors, createReview, updateBooking } = useApp();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Find the booking (API uses _id, but we may receive bookingId as param)
  const booking = bookings.find(b => b._id === bookingId || b.bookingId === bookingId);

  // Get tutor - handle both populated and non-populated tutor data
  // If tutorId is populated, it will have userId field (User ID)
  // If not populated, tutorId is the Tutor document ID, we need to find the User ID
  const tutorUserId = booking?.tutorId?.userId || booking?.tutor?.userId;
  const tutor = tutorUserId ? tutors.find(t => t.userId === tutorUserId) : null;

  // Available tags
  const availableTags = [
    'Clear Explanations',
    'Patient',
    'Knowledgeable',
    'Well Prepared',
    'Engaging',
    'Helpful Materials',
    'Punctual',
    'Responsive',
    'Encouraging',
    'Professional'
  ];

  // Validation
  if (!booking) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
        <p className="text-gray-600 mb-6">The booking you're trying to review doesn't exist.</p>
        <Link to="/app/bookings" className="btn-primary inline-block">
          Back to Bookings
        </Link>
      </div>
    );
  }

  if (booking.status !== 'completed') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Completed</h2>
        <p className="text-gray-600 mb-6">You can only review completed sessions.</p>
        <Link to="/app/bookings" className="btn-primary inline-block">
          Back to Bookings
        </Link>
      </div>
    );
  }

  if (booking.hasReview) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Already Submitted</h2>
        <p className="text-gray-600 mb-6">You've already submitted a review for this session.</p>
        <Link to="/app/bookings" className="btn-primary inline-block">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please write a comment with at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create review using API
      console.log('Submitting review with tutorUserId:', tutorUserId);
      await createReview({
        bookingId: booking._id || bookingId,
        tutorId: tutorUserId, // This should be the User ID, not Tutor ID
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        isAnonymous
      });

      // Mark booking as reviewed (API handles this automatically)
      // No need to call updateBooking - the backend middleware does this

      // Redirect to bookings page
      navigate('/app/bookings', {
        state: { message: 'Review submitted successfully!' }
      });
    } catch (err) {
      console.error('Submit review error:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F2F5F9] font-sans">
      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Bookings
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Write a Review</h1>
        <p className="text-gray-600 mt-2">Share your experience with this tutoring session</p>
      </div>

      {/* Session Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Session Details</h3>
        <div className="flex items-start space-x-4">
          {/* Tutor Avatar */}
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">
              {tutor?.username?.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 grid md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">Tutor</span>
              </div>
              <p className="font-semibold text-gray-900">{tutor?.username}</p>
            </div>

            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="text-sm">Subject</span>
              </div>
              <p className="font-semibold text-gray-900">{booking.subject}</p>
            </div>

            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">Date</span>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(booking.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="space-y-8">
          {/* Rating */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4">
              Rate Your Experience *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${value <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                      }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-4 text-2xl font-bold text-gray-900">{rating}.0</span>
              )}
            </div>
            {rating > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Great session!'}
                {rating === 3 && 'Good session'}
                {rating === 2 && 'Could be better'}
                {rating === 1 && 'Poor experience'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-2">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Share your thoughts about this session... What did you like? What could be improved?"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              {comment.length} characters (minimum 10)
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Add Tags (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Select tags that describe your experience
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTags.includes(tag)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <div>
              <label htmlFor="anonymous" className="font-medium text-gray-900 cursor-pointer">
                Post as Anonymous
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Your identity will be hidden from public view, but the tutor will still receive your feedback.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">Review Guidelines</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Be honest and constructive in your feedback</li>
          <li>• Focus on the tutoring experience and teaching quality</li>
          <li>• Avoid including personal information or inappropriate content</li>
          <li>• Be respectful and professional in your language</li>
          <li>• Provide specific examples when possible</li>
        </ul>
      </div>
      </div>
    </div>
  );
};

export default ReviewSubmitPage;
