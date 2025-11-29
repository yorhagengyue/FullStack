import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { reviewsAPI } from '../../services/api';
import { Star, User, Calendar, MessageSquare, Award, Filter, Loader2 } from 'lucide-react';

const ReviewsPage = () => {
  const { user } = useAuth();
  const { bookings, tutors } = useApp();

  const [activeTab, setActiveTab] = useState('received');
  const [filterRating, setFilterRating] = useState(0);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch received reviews if user is a tutor
        if (user.role === 'tutor') {
          const response = await reviewsAPI.getTutorReviews(user.userId);
          setReceivedReviews(response.reviews || []);
          setStats(response.stats);
        }

        // Fetch given reviews (as student)
        if (user.id) {
          const givenResponse = await reviewsAPI.getStudentReviews(user.id);
          setGivenReviews(givenResponse || []);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  // Filter by rating
  const filteredReviews = (activeTab === 'received' ? receivedReviews : givenReviews).filter(
    review => filterRating === 0 || review.rating === filterRating
  );

  // Calculate stats from API data or local calculation
  const averageRating = stats?.averageRating?.toFixed(1) || '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const breakdown = stats?.ratingBreakdown || [];
    const ratingData = breakdown.find(r => r._id === rating);
    const count = ratingData?.count || 0;
    const totalReviews = stats?.totalReviews || receivedReviews.length || 1;

    return {
      rating,
      count,
      percentage: totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0
    };
  });

  const tabs = [
    { id: 'received', label: 'Received', count: receivedReviews.length },
    { id: 'given', label: 'Given', count: givenReviews.length },
  ];

  const renderStars = (rating, size = 'w-4 h-4') => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600 mt-2">Manage and view your reviews</p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 p-2">
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                        ? 'bg-white/20'
                        : 'bg-gray-200'
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-900">Filter by Rating:</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterRating(0)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterRating === 0
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilterRating(rating)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center ${filterRating === rating
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {rating}
                      <Star className="w-3 h-3 ml-1 text-yellow-400 fill-yellow-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((review) => {
                  // Handle both populated and non-populated booking data
                  const booking = review.bookingId?.subject
                    ? review.bookingId
                    : bookings.find(b => b._id === review.bookingId || b.bookingId === review.bookingId);

                  // Handle populated student/tutor data
                  const studentName = review.studentId?.username || 'Student';
                  const tutorData = review.tutorId?.username
                    ? review.tutorId
                    : tutors.find(t => t.userId === review.tutorId);

                  return (
                    <div
                      key={review._id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {activeTab === 'received'
                                ? (review.isAnonymous ? '?' : studentName.charAt(0).toUpperCase())
                                : (tutorData?.username || 'T').charAt(0).toUpperCase()}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {activeTab === 'received'
                                ? (review.isAnonymous ? 'Anonymous Student' : studentName)
                                : tutorData?.username || 'Tutor'}
                            </h3>
                            <div className="flex items-center mb-2">
                              {renderStars(review.rating)}
                              <span className="ml-2 text-sm font-semibold text-gray-900">{review.rating}.0</span>
                            </div>
                            {booking && (
                              <p className="text-sm text-gray-600">
                                Session: {booking.subject} • {new Date(booking.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <div className="mb-3 p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {review.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-600">
                  {activeTab === 'received'
                    ? filterRating === 0
                      ? "You haven't received any reviews yet"
                      : `No ${filterRating}-star reviews received`
                    : filterRating === 0
                      ? "You haven't given any reviews yet"
                      : `No ${filterRating}-star reviews given`}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Statistics */}
          <div className="space-y-6">
            {/* Overall Rating Card */}
            {activeTab === 'received' && receivedReviews.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Rating</h3>

                {/* Large Rating Display */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(parseFloat(averageRating)), 'w-6 h-6')}
                  </div>
                  <p className="text-sm text-gray-600">{receivedReviews.length} total reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.rating} className="flex items-center space-x-3">
                      <div className="flex items-center w-16">
                        <span className="text-sm font-medium text-gray-700 mr-1">{dist.rating}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${dist.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {dist.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-600 mr-3" />
                    <span className="text-sm text-gray-600">Reviews Received</span>
                  </div>
                  <span className="font-bold text-gray-900">{receivedReviews.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm text-gray-600">Reviews Given</span>
                  </div>
                  <span className="font-bold text-gray-900">{givenReviews.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm text-gray-600">Avg Rating</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="font-bold text-gray-900">{averageRating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Review Tips</h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li>• Be specific and constructive</li>
                <li>• Mention teaching style and materials</li>
                <li>• Highlight strengths and areas for growth</li>
                <li>• Be respectful and professional</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
