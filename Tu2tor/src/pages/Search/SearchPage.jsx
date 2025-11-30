import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { rankTutorsFixed, rankTutorsDynamic } from '../../utils/rankingAlgorithm';
import AIRecommendations from '../../components/ai/AIRecommendations';
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  SlidersHorizontal, 
  X, 
  Heart, 
  Sparkles,
  Filter,
  ChevronDown
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ReactBits
import SpotlightCard from '../../components/reactbits/SpotlightCard/SpotlightCard';
import SplitText from '../../components/reactbits/SplitText/SplitText';

const SearchPage = () => {
  const { user } = useAuth();
  const { tutors, subjects, toggleFavoriteTutor, isTutorFavorited, fetchTutors, isLoadingTutors } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [selectedDay, setSelectedDay] = useState('');
  const [maxResponseTime, setMaxResponseTime] = useState(300);
  const [minExperience, setMinExperience] = useState(0);
  const [useSmartMatching, setUseSmartMatching] = useState(true);
  const [prioritySlider, setPrioritySlider] = useState(50); // 0-100
  const [showFilters, setShowFilters] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const filters = {};
      if (selectedSubject) filters.subject = selectedSubject;
      if (selectedLocation) filters.location = selectedLocation;
      if (minRating > 0) filters.minRating = minRating;
      if (searchTerm) filters.search = searchTerm;

      await fetchTutors(filters);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedLocation, minRating, searchTerm]);

  const handleToggleFavorite = (e, tutorId) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavoriteTutor(user.userId, tutorId);
    }
  };

  const locations = useMemo(() => {
    const locs = new Set();
    tutors.forEach(tutor => {
      tutor.preferredLocations?.forEach(loc => locs.add(loc));
    });
    return Array.from(locs);
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    let results = tutors;
    results = results.filter(tutor => {
      if (tutor.hourlyRate < priceRange.min || tutor.hourlyRate > priceRange.max) return false;
      if (selectedDay && tutor.availableSlots) {
        const hasDay = tutor.availableSlots.some(slot => slot.day === selectedDay);
        if (!hasDay) return false;
      }
      if (tutor.responseTime > maxResponseTime) return false;
      if (tutor.completedSessions < minExperience) return false;
      return true;
    });

    if (useSmartMatching && user) {
      const studentTimePreferences = user.availableSlots || [];
      const studentSchool = user.school || 'Temasek Polytechnic';
      results = rankTutorsDynamic(results, studentTimePreferences, studentSchool, prioritySlider);
    } else {
      results = [...results].sort((a, b) => b.averageRating - a.averageRating);
    }

    return results;
  }, [tutors, useSmartMatching, prioritySlider, user, priceRange, selectedDay, maxResponseTime, minExperience]);

  return (
    <div className="min-h-screen bg-[#F2F5F9] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1600px] bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-6 md:p-10 min-h-[90vh]">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                <SplitText text="Find Tutors" delay={50} />
             </h1>
             <p className="text-gray-500 mt-1">Discover perfect matches for your learning goals.</p>
           </div>
           
           <div className="flex gap-3">
              <button 
                onClick={() => setShowAIRecommendations(!showAIRecommendations)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                AI Insights
              </button>
           </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-2 mb-8">
          <div className="flex flex-col lg:flex-row gap-2">
             <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by subject, name, or keyword..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-14 pl-14 pr-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-gray-200 rounded-[24px] outline-none transition-all text-gray-700 placeholder-gray-400"
                />
             </div>

             <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 px-2 lg:px-0">
                <div className="relative min-w-[160px]">
                   <select 
                     value={selectedSubject}
                     onChange={(e) => setSelectedSubject(e.target.value)}
                     className="w-full h-14 pl-4 pr-10 bg-gray-50 hover:bg-gray-100 border border-transparent rounded-[24px] outline-none appearance-none cursor-pointer text-gray-700 font-medium"
                   >
                      <option value="">All Subjects</option>
                      {subjects.map((s) => <option key={s.code} value={s.code}>{s.code}</option>)}
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-14 px-6 rounded-[24px] font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                    showFilters 
                      ? 'bg-gray-900 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                   <SlidersHorizontal className="w-4 h-4" />
                   More Filters
                </button>
             </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
             <div className="p-6 border-t border-gray-100 mt-2 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
                      <select 
                        value={selectedLocation} 
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none text-sm"
                      >
                         <option value="">Any Location</option>
                         {locations.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Rating</label>
                      <select 
                        value={minRating} 
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none text-sm"
                      >
                         <option value="0">Any Rating</option>
                         <option value="4">4+ Stars</option>
                         <option value="4.5">4.5+ Stars</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Hourly Rate (${priceRange.min} - ${priceRange.max})
                      </label>
                      <div className="flex items-center gap-2">
                         <input 
                           type="number" 
                           value={priceRange.min} 
                           onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                           className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none text-sm text-center" 
                           placeholder="Min"
                         />
                         <span className="text-gray-400">-</span>
                         <input 
                           type="number" 
                           value={priceRange.max} 
                           onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                           className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none text-sm text-center" 
                           placeholder="Max"
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ranking</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                         <input 
                           type="checkbox" 
                           checked={useSmartMatching} 
                           onChange={(e) => setUseSmartMatching(e.target.checked)}
                           className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                         />
                         <span className="text-sm font-medium text-gray-700">Smart Match</span>
                      </div>
                   </div>
                </div>
                <div className="mt-6 flex justify-end">
                   <button 
                     onClick={() => {
                       setSelectedSubject('');
                       setSelectedLocation('');
                       setMinRating(0);
                       setSearchTerm('');
                       setPriceRange({ min: 0, max: 100 });
                     }}
                     className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                   >
                      <X className="w-4 h-4" />
                      Clear All Filters
                   </button>
                </div>
             </div>
          )}
        </div>

        {showAIRecommendations && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[32px] p-6 border border-indigo-100 animate-in fade-in slide-in-from-top-4">
            <AIRecommendations
              tutors={filteredTutors}
              searchQuery={searchTerm}
              prioritySlider={prioritySlider}
              onClose={() => setShowAIRecommendations(false)}
            />
          </div>
        )}

        {isLoadingTutors ? (
          <div className="flex flex-col items-center justify-center py-20">
             <LoadingSpinner size="lg" />
             <p className="text-gray-500 mt-4 font-medium">Finding the best tutors for you...</p>
          </div>
        ) : filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {filteredTutors.map((tutor) => (
                <SpotlightCard 
                  key={tutor.userId} 
                  className="group hover:border-gray-200 hover:shadow-xl transition-all duration-300"
                  spotlightColor="rgba(59, 130, 246, 0.1)"
                >
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></div>
                   
                   <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-4">
                         <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.username}`} alt={tutor.username} className="w-full h-full object-cover" />
                            </div>
                            {useSmartMatching && tutor.matchScore >= 90 && (
                               <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                  %
                               </div>
                            )}
                         </div>
                         <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{tutor.username}</h3>
                            <p className="text-sm text-gray-500">{tutor.major}</p>
                         </div>
                      </div>
                      <button 
                        onClick={(e) => handleToggleFavorite(e, tutor.userId)}
                        className={`p-2.5 rounded-full transition-colors z-20 relative ${
                           isTutorFavorited(user?.userId, tutor.userId) 
                             ? 'bg-red-50 text-red-500' 
                             : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
                        }`}
                      >
                         <Heart className={`w-5 h-5 ${isTutorFavorited(user?.userId, tutor.userId) ? 'fill-current' : ''}`} />
                      </button>
                   </div>

                   <div className="flex flex-wrap gap-2 mb-6 h-16 overflow-hidden relative z-10">
                      {tutor.subjects?.slice(0, 3).map(sub => (
                         <span key={sub.code} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-600">
                            {sub.code}
                         </span>
                      ))}
                      {tutor.subjects?.length > 3 && (
                         <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-500">
                            +{tutor.subjects.length - 3}
                         </span>
                      )}
                   </div>

                   <div className="flex items-center justify-between py-4 border-t border-b border-dashed border-gray-100 mb-6 relative z-10">
                      <div className="text-center">
                         <div className="flex items-center gap-1 text-gray-900 font-bold">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            {tutor.averageRating.toFixed(1)}
                         </div>
                         <span className="text-[10px] text-gray-400 uppercase tracking-wide">Rating</span>
                      </div>
                      <div className="w-px h-8 bg-gray-100"></div>
                      <div className="text-center">
                         <div className="text-gray-900 font-bold">${tutor.hourlyRate}</div>
                         <span className="text-[10px] text-gray-400 uppercase tracking-wide">Per Hour</span>
                      </div>
                      <div className="w-px h-8 bg-gray-100"></div>
                      <div className="text-center">
                         <div className="text-gray-900 font-bold">{tutor.completedSessions}</div>
                         <span className="text-[10px] text-gray-400 uppercase tracking-wide">Sessions</span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between gap-4 relative z-10">
                      {useSmartMatching && tutor.matchScore && (
                         <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">Match Score</span>
                            <div className="flex items-center gap-2">
                               <div className="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${tutor.matchScore}%` }}></div>
                               </div>
                               <span className="text-xs font-bold text-green-600">{tutor.matchScore}%</span>
                            </div>
                         </div>
                      )}
                      <Link 
                        to={`/app/tutor/${tutor.userId}`} 
                        className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:shadow-blue-200 text-center z-20 relative"
                      >
                         View Profile
                      </Link>
                   </div>
                </SpotlightCard>
             ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">No tutors found</h3>
             <p className="text-gray-500 max-w-xs">We couldn't find any tutors matching your filters. Try adjusting your search.</p>
             <button 
               onClick={() => {
                 setSelectedSubject('');
                 setSelectedLocation('');
                 setMinRating(0);
                 setSearchTerm('');
                 setPriceRange({ min: 0, max: 100 });
               }}
               className="mt-6 px-6 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
             >
                Clear All Filters
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
