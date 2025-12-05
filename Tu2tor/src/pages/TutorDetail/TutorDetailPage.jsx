import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import BookingModal from '../../components/common/BookingModal';
import {
  Star,
  Clock,
  Award,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  Users,
  Globe,
  Shield
} from 'lucide-react';
import { BADGE_CONFIG } from '../../utils/constants';

// ReactBits
import TiltedCard from '../../components/reactbits/TiltedCard/TiltedCard';
import CountUp from '../../components/reactbits/CountUp/CountUp';
import SplitText from '../../components/reactbits/SplitText/SplitText';

const TutorDetailPage = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tutors, reviews, createBooking } = useApp();
  const toast = useToast();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const tutor = tutors.find(t => t.userId === tutorId || t._id === tutorId || t.id === tutorId);

  const tutorReviews = reviews.filter(r =>
    r.tutorId === tutorId || r.tutorId === tutor?.userId || r.tutorId === tutor?._id
  );

  if (!tutor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F5F9]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutor not found</h2>
        <button onClick={() => navigate('/app/search')} className="text-blue-600 hover:underline">Back to Search</button>
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
      const bookingPayload = {
        ...bookingData,
        sessionType: bookingData.location?.toLowerCase().includes('online') ? 'online' : 'offline',
      };
      await createBooking(bookingPayload);
      toast.success('Request sent!');
      setShowBookingModal(false);
      navigate('/app/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book.');
    }
  };

  // Avatar background based on random seed or fixed pattern
  const avatarBgGradient = "bg-gradient-to-br from-blue-500 to-indigo-600";

  return (
    <div className="min-h-full bg-[#F2F5F9] font-sans">
      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8">
        
      <button
        onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors group"
      >
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
          
        <div className="lg:col-span-2 space-y-6">
            
            {/* Enhanced Profile Header with TiltedCard effect for Avatar */}
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200/50 relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start">
                  
                  <div className="w-40 h-40 flex-shrink-0">
                    <TiltedCard
                      imageSrc={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.username}`}
                      altText={tutor.username}
                      containerHeight="160px"
                      containerWidth="160px"
                      imageHeight="160px"
                      imageWidth="160px"
                      rotateAmplitude={20}
                      scaleOnHover={1.1}
                      showTooltip={false}
                      showMobileWarning={false}
                      overlayContent={null}
                    />
                  </div>

                  <div className="flex-1 pt-2">
                     <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                        <SplitText text={tutor.username} delay={30} />
                     </h1>
                     <p className="text-xl text-gray-500 mb-4 font-medium flex items-center gap-2">
                        {tutor.major}
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                        <span className="text-gray-400 text-lg">{tutor.school}</span>
                     </p>
                     
                     <div className="flex flex-wrap gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-bold text-gray-600">
                    Year {tutor.yearOfStudy}
                  </span>
                        {tutor.badges?.length > 0 && (
                           <span className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold flex items-center gap-1">
                              <Award className="w-4 h-4" /> {tutor.badges.length} Badges
                    </span>
                  )}
                     </div>

                     <div className="flex items-center gap-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                           <Star className="w-6 h-6 text-yellow-400 fill-current" />
                           <div>
                              <span className="font-bold text-2xl block leading-none">{tutor.averageRating.toFixed(1)}</span>
                              <span className="text-gray-400 text-xs font-medium uppercase">Rating</span>
                           </div>
                        </div>
                        <div className="w-px h-10 bg-gray-100"></div>
                        <div className="flex items-center gap-2 text-gray-600">
                           <Users className="w-6 h-6 text-blue-500" />
                           <div>
                              <span className="font-bold text-2xl block leading-none">
                                <CountUp to={tutor.totalSessions || 0} />
                              </span>
                              <span className="text-gray-400 text-xs font-medium uppercase">Sessions</span>
                           </div>
                        </div>
                        <div className="w-px h-10 bg-gray-100"></div>
                        <div className="flex items-center gap-2 text-gray-600">
                           <Clock className="w-6 h-6 text-green-500" />
                           <div>
                              <span className="font-bold text-2xl block leading-none">
                                <CountUp to={tutor.responseTime} />m
                              </span>
                              <span className="text-gray-400 text-xs font-medium uppercase">Response</span>
                           </div>
                </div>
              </div>
            </div>
          </div>

               <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-50 rounded-full blur-3xl pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
               <p className="text-gray-600 leading-relaxed text-lg">
                  {tutor.bio || `Hi! I'm ${tutor.username.split(' ')[0]}, a passionate ${tutor.major} student at ${tutor.school}. I specialize in making complex concepts simple and engaging. Let's ace those exams together!`}
            </p>
          </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">I Can Teach</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tutor.subjects?.map((subject) => (
                     <button
                  key={subject.code}
                  onClick={() => setSelectedSubject(subject.code)}
                        className={`group relative flex justify-between items-start p-5 rounded-2xl border-2 text-left transition-all overflow-hidden ${
                           selectedSubject === subject.code 
                             ? 'border-gray-900 bg-gray-900 text-white shadow-lg transform scale-[1.02]' 
                             : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-900'
                    }`}
                >
                        <div className="relative z-10">
                           <div className="font-bold text-lg">{subject.code}</div>
                           <div className={`text-sm mt-1 font-medium ${selectedSubject === subject.code ? 'text-gray-300' : 'text-gray-500'}`}>
                              {subject.name}
                           </div>
                      {subject.grade && (
                              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold ${
                                 selectedSubject === subject.code ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                              }`}>
                          Grade: {subject.grade}
                        </span>
                      )}
                    </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center relative z-10 ${
                           selectedSubject === subject.code ? 'border-white bg-white' : 'border-gray-300'
                        }`}>
                           {selectedSubject === subject.code && <CheckCircle className="w-4 h-4 text-gray-900" />}
                  </div>
                     </button>
                ))}
              </div>
            </div>

            {tutor.badges?.length > 0 && (
               <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {tutor.badges.map((badgeId, i) => {
                        const badge = BADGE_CONFIG[badgeId];
                  return (
                           <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
                              <div className="text-4xl mb-2 transform hover:scale-110 transition-transform duration-300 cursor-default">{badge?.icon}</div>
                              <div className="font-bold text-gray-900 text-sm">{badge?.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
            {tutorReviews.length > 0 ? (
                  <div className="space-y-6">
                {tutorReviews.map((review) => (
                        <div key={review.reviewId} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                           <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                                    {(review.studentName || 'S').charAt(0)}
                                 </div>
                      <div>
                                    <div className="font-bold text-gray-900">{review.isAnonymous ? 'Student' : review.studentName}</div>
                                    <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                                 </div>
                              </div>
                              <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                          ))}
                              </div>
                        </div>
                           <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet.</p>
               )}
              </div>

        </div>

        <div className="lg:col-span-1">
             <div className="sticky top-8 space-y-6">
                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-indigo-100/50 border border-indigo-50">
                   <h3 className="text-xl font-bold text-gray-900 mb-6">Session Details</h3>

                   <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-2xl">
                      <span className="font-medium text-gray-600">Hourly Rate</span>
                      <div className="flex items-center gap-1">
                         <span className="text-3xl font-bold text-gray-900">
                            <CountUp to={tutor.hourlyRate || 10} />
                  </span>
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Credits</span>
              </div>
            </div>

                   <div className="space-y-3 mb-8">
            <button
              onClick={handleBookSession}
              disabled={!selectedSubject}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
                           selectedSubject 
                             ? 'bg-gray-900 text-white hover:bg-black shadow-gray-200' 
                             : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
                         {selectedSubject ? 'Book Session' : 'Select a Subject'}
            </button>

            <button
              onClick={() => navigate('/app/messages', { state: { selectedContactId: tutor.userId } })}
                        className="w-full py-4 bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
            >
                         <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" /> Chat with Tutor
            </button>
                   </div>

                   <div className="space-y-3 text-sm font-medium text-gray-500">
                      <div className="flex items-center gap-3">
                         <Globe className="w-5 h-5 text-blue-500" />
                         <span>Online & In-person available</span>
              </div>
                      <div className="flex items-center gap-3">
                         <Shield className="w-5 h-5 text-green-500" />
                         <span>Verified Student Tutor</span>
              </div>
                      <div className="flex items-center gap-3">
                         <Clock className="w-5 h-5 text-purple-500" />
                         <span>Free cancellation (24h notice)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

        </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        tutor={tutor}
        subject={selectedSubject}
        onSubmit={handleBookingSubmit}
      />
      </div>
    </div>
  );
};

export default TutorDetailPage;
