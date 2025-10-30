import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { rankTutorsFixed, rankTutorsDynamic } from '../../utils/rankingAlgorithm';
import AIRecommendations from '../../components/ai/AIRecommendations';
import { Search, Star, MapPin, Clock, Award, SlidersHorizontal, X, Heart, Sparkles } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

  // Fetch tutors from API when component mounts or filters change
  useEffect(() => {
    const fetchData = async () => {
      const filters = {};

      // Add backend-supported filters
      if (selectedSubject) {
        filters.subject = selectedSubject;
      }
      if (selectedLocation) {
        filters.location = selectedLocation;
      }
      if (minRating > 0) {
        filters.minRating = minRating;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      await fetchTutors(filters);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedLocation, minRating, searchTerm]); // Remove fetchTutors from deps to avoid infinite loop

  // Handle favorite toggle
  const handleToggleFavorite = (e, tutorId) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavoriteTutor(user.userId, tutorId);
    }
  };

  // Get unique locations from tutors
  const locations = useMemo(() => {
    const locs = new Set();
    tutors.forEach(tutor => {
      tutor.preferredLocations?.forEach(loc => locs.add(loc));
    });
    return Array.from(locs);
  }, [tutors]);

  // Apply smart matching/ranking to API results
  const filteredTutors = useMemo(() => {
    let results = tutors;

    // Apply client-side filters
    results = results.filter(tutor => {
      // Price range filter
      if (tutor.hourlyRate < priceRange.min || tutor.hourlyRate > priceRange.max) {
        return false;
      }

      // Day availability filter
      if (selectedDay && tutor.availableSlots) {
        const hasDay = tutor.availableSlots.some(slot => slot.day === selectedDay);
        if (!hasDay) return false;
      }

      // Response time filter
      if (tutor.responseTime > maxResponseTime) {
        return false;
      }

      // Experience filter
      if (tutor.completedSessions < minExperience) {
        return false;
      }

      return true;
    });

    // Apply smart matching if enabled (client-side ranking)
    if (useSmartMatching && user) {
      // Use student's available time preferences if they exist
      const studentTimePreferences = user.availableSlots || [];
      const studentSchool = user.school || 'Temasek Polytechnic';

      // Use dynamic ranking with priority slider
      results = rankTutorsDynamic(
        results,
        studentTimePreferences,
        studentSchool,
        prioritySlider
      );
    } else {
      // Sort by rating if smart matching is disabled
      results = [...results].sort((a, b) => b.averageRating - a.averageRating);
    }

    return results;
  }, [tutors, useSmartMatching, prioritySlider, user, priceRange, selectedDay, maxResponseTime, minExperience]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find a Tutor</h1>
        <p className="text-gray-600 mt-2">
          Search for tutors by subject, name, or use our smart matching system
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course code or tutor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center justify-center space-x-2 whitespace-nowrap"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>

              {/* Day Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available On
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="input-field"
                >
                  <option value="">Any Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Row */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange.min} - ${priceRange.max}/hr
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="input-field text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="input-field text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Response Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Response Time
                </label>
                <select
                  value={maxResponseTime}
                  onChange={(e) => setMaxResponseTime(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={300}>Any</option>
                  <option value={60}>Within 1 hour</option>
                  <option value={120}>Within 2 hours</option>
                  <option value={180}>Within 3 hours</option>
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Experience
                </label>
                <select
                  value={minExperience}
                  onChange={(e) => setMinExperience(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={0}>Any Experience</option>
                  <option value={10}>10+ Sessions</option>
                  <option value={25}>25+ Sessions</option>
                  <option value={50}>50+ Sessions</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedSubject('');
                    setSelectedLocation('');
                    setMinRating(0);
                    setSearchTerm('');
                    setPriceRange({ min: 0, max: 100 });
                    setSelectedDay('');
                    setMaxResponseTime(300);
                    setMinExperience(0);
                  }}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Smart Matching Toggle */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSmartMatching}
                  onChange={(e) => setUseSmartMatching(e.target.checked)}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Enable Smart Matching</span>
                  <p className="text-sm text-gray-600">Rank tutors based on schedule compatibility and preferences</p>
                </div>
              </label>
            </div>
          </div>

          {/* Priority Slider */}
          {useSmartMatching && (
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Matching Priority: {prioritySlider < 30 ? 'Schedule First' : prioritySlider > 70 ? 'Rating First' : 'Balanced'}
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-600 whitespace-nowrap">Schedule</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={prioritySlider}
                  onChange={(e) => setPrioritySlider(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-600 whitespace-nowrap">Rating</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredTutors.length} {filteredTutors.length === 1 ? 'Tutor' : 'Tutors'} Found
          </h2>
          <div className="flex items-center space-x-3">
            {useSmartMatching && (
              <span className="text-sm text-primary-600 font-medium">
                Sorted by Smart Matching
              </span>
            )}
            <button
              onClick={() => setShowAIRecommendations(!showAIRecommendations)}
              className="btn-primary flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Insights</span>
            </button>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        {showAIRecommendations && (
          <div className="mb-6">
            <AIRecommendations
              tutors={filteredTutors}
              searchQuery={searchTerm}
              prioritySlider={prioritySlider}
              onClose={() => setShowAIRecommendations(false)}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoadingTutors ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading tutors...</p>
          </div>
        ) : filteredTutors.length > 0 ? (
          <div className="grid gap-6">
            {filteredTutors.map((tutor, index) => (
              <div key={tutor.userId} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link to={`/app/tutor/${tutor.userId}`} className="text-xl font-bold text-gray-900 hover:text-primary-600">
                          {tutor.username}
                        </Link>
                        {useSmartMatching && index < 3 && (
                          <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                            Top Match
                          </span>
                        )}
                        <p className="text-gray-600 mt-1">{tutor.major}</p>
                      </div>
                    </div>

                    {/* Rating and Info */}
                    <div className="flex items-center mt-3 space-x-4 flex-wrap gap-2">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1 font-semibold text-gray-900">
                          {tutor.averageRating.toFixed(1)}
                        </span>
                        <span className="ml-1 text-sm text-gray-600">
                          ({tutor.totalReviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        ~{tutor.responseTime} mins
                      </div>

                      <div className="flex items-center text-sm font-semibold text-primary-600">
                        ${tutor.hourlyRate}/hr
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        {tutor.completedSessions} sessions
                      </div>
                    </div>

                    {/* Subjects */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Teaches:</p>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects?.slice(0, 4).map((subject) => (
                          <span
                            key={subject.code}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {subject.code}
                          </span>
                        ))}
                        {tutor.subjects?.length > 4 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            +{tutor.subjects.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{tutor.preferredLocations?.join(', ')}</span>
                    </div>

                    {/* Badges */}
                    {tutor.badges && tutor.badges.length > 0 && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-gray-600">
                          {tutor.badges.length} badge{tutor.badges.length > 1 ? 's' : ''} earned
                        </span>
                      </div>
                    )}

                    {/* Match Score */}
                    {useSmartMatching && tutor.matchScore !== undefined && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Match Score</span>
                          <span className="font-semibold text-primary-600">{tutor.matchScore}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${tutor.matchScore}%` }}
                          />
                        </div>
                        {/* Recommendation Reasons */}
                        {tutor.recommendationReasons && tutor.recommendationReasons.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {tutor.recommendationReasons.map((reason, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full">
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 md:items-end">
                    <button
                      onClick={(e) => handleToggleFavorite(e, tutor.userId)}
                      className={`p-3 rounded-lg transition-colors ${
                        isTutorFavorited(user?.userId, tutor.userId)
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={isTutorFavorited(user?.userId, tutor.userId) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isTutorFavorited(user?.userId, tutor.userId) ? 'fill-red-600' : ''
                        }`}
                      />
                    </button>
                    <Link
                      to={`/app/tutor/${tutor.userId}`}
                      className="btn-primary text-center whitespace-nowrap"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No tutors found</p>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
