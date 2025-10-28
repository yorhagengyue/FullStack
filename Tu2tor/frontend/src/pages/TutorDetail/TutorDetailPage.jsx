import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import BookingModal from '../../components/common/BookingModal';
import {
  Star,
  MapPin,
  Clock,
  Award,
  BookOpen,
  Calendar,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  Users
} from 'lucide-react';
import { BADGE_CONFIG } from '../../utils/constants';

const TutorDetailPage = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tutors, reviews, createBooking } = useApp();
  const toast = useToast();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Find the tutor
  const tutor = tutors.find(t => t.userId === tutorId);

  // Get tutor's reviews
  const tutorReviews = reviews.filter(r => r.tutorId === tutorId);

  if (!tutor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Tutor not found</p>
        <Link to="/app/search" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Search
        </Link>
      </div>
    );
  }

  const handleBookSession = () => {
    if (!selectedSubject) {
      toast.warning('Please select a subject first');
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      createBooking({
        ...bookingData,
        studentId: user.userId,
        tutorId: tutor.userId,
      });
      toast.success('Booking request sent successfully!');
      navigate('/app/bookings');
    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Search
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Tutor Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tutor Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">
                    {tutor.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{tutor.username}</h1>
                <p className="text-lg text-gray-600 mb-4">{tutor.major}</p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-bold text-gray-900 mr-1">{tutor.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">({tutor.totalReviews} reviews)</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-1" />
                    <span className="text-sm">~{tutor.responseTime} mins response</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-1" />
                    <span className="text-sm">{tutor.totalSessions || 0} sessions</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {tutor.school}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Year {tutor.yearOfStudy}
                  </span>
                  {tutor.badges && tutor.badges.length > 0 && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      {tutor.badges.length} Badges
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">
              {tutor.bio || `Hi! I'm ${tutor.username.split(' ')[0]}, a ${tutor.major} student at ${tutor.school}. I have successfully completed these courses and I'm passionate about helping fellow students excel in their studies. I believe in making complex topics easy to understand through clear explanations and practical examples.`}
            </p>
          </div>

          {/* Subjects */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subjects I Teach</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tutor.subjects?.map((subject) => (
                <div
                  key={subject.code}
                  onClick={() => setSelectedSubject(subject.code)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedSubject === subject.code
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{subject.code}</h3>
                      <p className="text-sm text-gray-600 mt-1">{subject.name}</p>
                      {subject.grade && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Grade: {subject.grade}
                        </span>
                      )}
                    </div>
                    {selectedSubject === subject.code && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>

            {/* Locations */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Preferred Locations</h3>
              <div className="flex flex-wrap gap-2">
                {tutor.preferredLocations?.map((location, index) => (
                  <span key={index} className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
                    <MapPin className="w-4 h-4 mr-2" />
                    {location}
                  </span>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Time Slots</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tutor.availableSlots?.map((slot, index) => (
                  <div key={index} className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {slot}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          {tutor.badges && tutor.badges.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tutor.badges.map((badgeType, index) => {
                  const badge = BADGE_CONFIG[badgeType];
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 text-center hover:border-primary-300 transition-colors">
                      <div className="text-4xl mb-2">{badge?.icon}</div>
                      <p className="font-semibold text-gray-900 text-sm">{badge?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{badge?.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reviews ({tutorReviews.length})
            </h2>

            {tutorReviews.length > 0 ? (
              <div className="space-y-4">
                {tutorReviews.map((review) => (
                  <div key={review.reviewId} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          {review.isAnonymous ? 'Anonymous Student' : review.studentId}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {review.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No reviews yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Book a Session</h3>

            {/* Price Info */}
            <div className="mb-6 p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Session Cost</span>
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-yellow-600 mr-1" />
                  <span className="text-2xl font-bold text-gray-900">
                    {tutor.hourlyRate || 10}
                  </span>
                  <span className="text-gray-600 ml-1">credits</span>
                </div>
              </div>
            </div>

            {/* Selected Subject */}
            {selectedSubject ? (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Selected Subject:</p>
                <p className="font-semibold text-gray-900">{selectedSubject}</p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">Please select a subject from the list above</p>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBookSession}
              disabled={!selectedSubject}
              className={`w-full py-3 rounded-lg font-semibold transition-colors mb-3 ${
                selectedSubject
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Book Session
            </button>

            {/* Message Button */}
            <button className="w-full py-3 border-2 border-gray-300 hover:border-primary-500 rounded-lg font-semibold text-gray-700 hover:text-primary-600 transition-colors flex items-center justify-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Send Message
            </button>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Instant confirmation after booking</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Free cancellation up to 24 hours before session</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Verified campus tutor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        tutor={tutor}
        subject={selectedSubject}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
};

export default TutorDetailPage;
