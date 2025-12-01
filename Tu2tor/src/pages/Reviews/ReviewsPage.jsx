import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { reviewsAPI } from '../../services/api';
import { Star, Filter, Loader2, MessageSquare, Calendar, User, ArrowUpRight } from 'lucide-react';

const ReviewsPage = () => {
  const { user } = useAuth();
  const { bookings, tutors } = useApp();

  const [activeTab, setActiveTab] = useState('received');
  const [filterRating, setFilterRating] = useState(0);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        if (user.role === 'tutor') {
          const response = await reviewsAPI.getTutorReviews(user.userId);
          setReceivedReviews(response.reviews || []);
          setStats(response.stats);
        }
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

  const filteredReviews = (activeTab === 'received' ? receivedReviews : givenReviews).filter(
    review => filterRating === 0 || review.rating === filterRating
  );

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
        className={`${size} ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
      />
    ));
  };

  return (
    <div className="min-h-full bg-[#F2F5F9] font-sans">
      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8">
        
      {/* Header */}
        <div className="flex justify-between items-center mb-8">
      <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reviews</h1>
              <p className="text-gray-500 mt-1">Feedback from your sessions and interactions.</p>
           </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-4" />
             <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
             
             {/* Left Column - Stats & Filters */}
             <div className="space-y-6">
                {/* Rating Summary Card */}
                <div className="bg-gray-900 text-white rounded-[32px] p-8 relative overflow-hidden">
                   <div className="relative z-10 text-center">
                      <div className="text-6xl font-bold mb-2">{averageRating}</div>
                      <div className="flex justify-center gap-1 mb-2">
                         {renderStars(Math.round(parseFloat(averageRating)), 'w-6 h-6')}
                      </div>
                      <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Average Rating</p>
                   </div>
                   {/* Decorative Circle */}
                   <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                {/* Distribution */}
                <div className="bg-white border border-gray-100 rounded-[24px] p-6">
                   <h3 className="font-bold text-gray-900 mb-4">Rating Breakdown</h3>
                   <div className="space-y-3">
                      {ratingDistribution.map((dist) => (
                         <div key={dist.rating} className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 w-12 font-medium text-gray-700">
                               {dist.rating} <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                               <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${dist.percentage}%` }}></div>
                            </div>
                            <div className="w-8 text-right text-gray-400 font-medium">{dist.count}</div>
                         </div>
                ))}
              </div>
            </div>

                {/* Filters */}
                <div className="bg-gray-50 rounded-[24px] p-6">
                   <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Filter className="w-4 h-4" /> Filters
                   </h3>
                   <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterRating(0)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                           filterRating === 0 ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    All
                  </button>
                      {[5,4,3,2,1].map(r => (
                    <button
                           key={r}
                           onClick={() => setFilterRating(r)}
                           className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${
                              filterRating === r ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                            {r} <Star className="w-3 h-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

             {/* Right Column - Review List */}
             <div className="lg:col-span-2 space-y-6">
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                   {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                           activeTab === tab.id 
                             ? 'bg-gray-900 text-white shadow-lg' 
                             : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                         {tab.label}
                         <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                            activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                         }`}>
                            {tab.count}
                         </span>
                      </button>
                   ))}
                </div>

                {/* List */}
                <div className="space-y-4">
            {filteredReviews.length > 0 ? (
                      filteredReviews.map((review) => {
                  const booking = review.bookingId?.subject
                    ? review.bookingId
                    : bookings.find(b => b._id === review.bookingId || b.bookingId === review.bookingId);

                  const studentName = review.studentId?.username || 'Student';
                  const tutorData = review.tutorId?.username
                    ? review.tutorId
                    : tutors.find(t => t.userId === review.tutorId);

                  return (
                            <div key={review._id} className="group bg-white p-6 rounded-[24px] border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all">
                               <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg font-bold text-gray-500">
                              {activeTab === 'received'
                                ? (review.isAnonymous ? '?' : studentName.charAt(0).toUpperCase())
                                           : (tutorData?.username || 'T').charAt(0).toUpperCase()
                                        }
                          </div>
                                     <div>
                                        <h4 className="font-bold text-gray-900 text-lg">
                              {activeTab === 'received'
                                              ? (review.isAnonymous ? 'Anonymous' : studentName)
                                              : tutorData?.username || 'Tutor'
                                           }
                                        </h4>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                           <Calendar className="w-3 h-3" />
                                           {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                          </div>
                        </div>
                                  <div className="flex gap-1">
                                     {renderStars(review.rating)}
                        </div>
                      </div>

                               <div className="bg-gray-50 rounded-xl p-4 mb-4 relative">
                                  <MessageSquare className="w-4 h-4 text-gray-300 absolute top-4 left-4" />
                                  <p className="text-gray-600 pl-8 leading-relaxed italic">"{review.comment}"</p>
                        </div>

                               <div className="flex justify-between items-center">
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                                        {review.tags.map((tag, i) => (
                                           <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500">
                                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                                  {booking && (
                                     <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Session: {booking.subject} <ArrowUpRight className="w-3 h-3" />
              </div>
            )}
          </div>
                  </div>
                         );
                      })
                   ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-[32px]">
                         <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Star className="w-8 h-8 text-gray-300" />
                </div>
                         <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews found</h3>
                         <p className="text-gray-500">
                            {activeTab === 'received' 
                               ? (filterRating === 0 ? "No reviews yet." : `No ${filterRating}-star reviews.`) 
                               : "You haven't written any reviews yet."}
                         </p>
              </div>
            )}
                </div>
            </div>
          </div>
        )}
        </div>
    </div>
  );
};

export default ReviewsPage;
