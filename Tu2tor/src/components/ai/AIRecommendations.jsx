import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAI } from '../../context/AIContext';
import { RecommendationService } from '../../ai/services/RecommendationService';
import aiService from '../../ai/services/AIService';
import { Sparkles, Loader2, TrendingUp, AlertCircle, X } from 'lucide-react';

const AIRecommendations = ({ tutors, searchQuery, prioritySlider, onClose }) => {
  const { user } = useAuth();
  const { isInitialized } = useAI();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  // Auto-generate recommendations on mount or when priority changes
  useEffect(() => {
    if (isInitialized && user && tutors.length > 0) {
      console.log('[AIRecommendations] Ready to generate recommendations with priority:', prioritySlider);
      // Clear previous recommendations when priority changes
      setRecommendations([]);
      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        handleGenerateRecommendations();
      }, 500);
    }
  }, [isInitialized, user, tutors.length, prioritySlider]);

  const handleGenerateRecommendations = async () => {
    if (!isInitialized || !user) {
      setError('AI service not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const recService = new RecommendationService(aiService);

      // Get top 5 tutors for AI analysis
      const topTutors = tutors.slice(0, 5);

      console.log('[AIRecommendations] Generating recommendations...', {
        tutorCount: topTutors.length,
        user: user?.username,
        query: searchQuery || 'Looking for a good tutor',
        priority: prioritySlider,
      });

      const result = await recService.getRecommendations(
        user,
        searchQuery || 'Looking for a good tutor',
        topTutors,
        { priority: prioritySlider }
      );

      console.log('[AIRecommendations] Result:', result);

      if (result.success && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
      } else {
        const errorMsg = result.error || 'Unable to generate AI recommendations. Please try again.';
        console.error('[AIRecommendations] Failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('[AIRecommendations] Error:', err);
      setError(err.message || 'Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Find tutor by ID
  const findTutor = (tutorId) => {
    return tutors.find(t => t.userId === tutorId);
  };

  return (
    <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-lg border-2 border-primary-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI-Powered Recommendations</h3>
            <p className="text-sm text-gray-600">Get personalized tutor suggestions based on your needs</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Analyzing tutors with AI...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={handleGenerateRecommendations}
              className="text-xs text-red-600 hover:text-red-700 font-medium mt-2 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const tutor = findTutor(rec.tutorId);
            if (!tutor) return null;

            return (
              <div
                key={rec.tutorId}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{tutor.username}</h4>
                      <p className="text-sm text-gray-600">{tutor.major} • Year {tutor.yearOfStudy}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-primary-600">{rec.matchScore}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Why This Match</p>
                    <ul className="space-y-1">
                      {rec.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-primary-600 mr-2">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rec.concerns && rec.concerns.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Considerations</p>
                      <ul className="space-y-1">
                        {rec.concerns.map((concern, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Algorithm Dimension Scores */}
                  {tutor.dimensionScores && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Match Dimensions</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Time Match</span>
                          <span className="font-medium text-primary-600">
                            {Math.round(tutor.dimensionScores.timeOverlap)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Rating</span>
                          <span className="font-medium text-primary-600">
                            {Math.round(tutor.dimensionScores.rating)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Response</span>
                          <span className="font-medium text-primary-600">
                            {Math.round(tutor.dimensionScores.responseSpeed)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Same School</span>
                          <span className="font-medium text-primary-600">
                            {Math.round(tutor.dimensionScores.sameSchool)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center space-x-3">
                  <a
                    href={`/app/tutor/${tutor.userId}`}
                    className="flex-1 text-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View Profile
                  </a>
                  <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                    Message
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleGenerateRecommendations}
            disabled={isLoading}
            className="w-full text-center px-4 py-2 border-2 border-dashed border-primary-300 hover:border-primary-400 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
          >
            Regenerate Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
