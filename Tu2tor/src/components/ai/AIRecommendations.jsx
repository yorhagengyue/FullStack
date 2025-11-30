import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAI } from '../../context/AIContext';
import { RecommendationService } from '../../ai/services/RecommendationService';
import aiService from '../../ai/services/AIService';
import { Sparkles, Loader2, TrendingUp, AlertCircle, X, Zap, RefreshCw, MessageCircle, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIRecommendations = ({ tutors, searchQuery, prioritySlider, onClose }) => {
  const { user } = useAuth();
  const { isInitialized } = useAI();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  // Auto-generate recommendations on mount or when priority changes
  useEffect(() => {
    if (isInitialized && user && tutors.length > 0) {
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

      const result = await recService.getRecommendations(
        user,
        searchQuery || 'Looking for a good tutor',
        topTutors,
        { priority: prioritySlider }
      );

      if (result.success && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
      } else {
        const errorMsg = result.error || 'Unable to generate AI recommendations. Please try again.';
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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[32px] p-8 text-white border border-white/10 shadow-2xl">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Insights</h3>
              <p className="text-sm text-blue-200/80">Personalized matches based on your learning style</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-blue-200/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
            <p className="text-blue-200 font-medium animate-pulse">Analyzing tutor compatibility...</p>
        </div>
      )}

      {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
              <p className="text-sm text-red-200">{error}</p>
            <button
              onClick={handleGenerateRecommendations}
                className="text-xs text-red-300 hover:text-white font-bold mt-2 flex items-center gap-1 transition-colors"
            >
                <RefreshCw className="w-3 h-3" /> Try Again
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => {
            const tutor = findTutor(rec.tutorId);
            if (!tutor) return null;

            return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                key={rec.tutorId}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1"
              >
                  {/* Match Score Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    {rec.matchScore}% Match
                  </div>

                  {/* Tutor Info */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 p-[2px]">
                      <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-800">
                         <img 
                           src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.username}`} 
                           alt={tutor.username} 
                           className="w-full h-full object-cover" 
                         />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">{tutor.username}</h4>
                      <div className="flex items-center gap-2 text-xs text-blue-200/60">
                        <span>{tutor.major}</span>
                        <span>•</span>
                        <div className="flex items-center gap-0.5 text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          {tutor.averageRating?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                  </div>
                </div>

                  {/* AI Analysis */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/10">
                      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2">Why This Match</p>
                      <ul className="space-y-1.5">
                        {rec.reasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="text-xs text-blue-100/80 flex items-start gap-2 leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Match Dimensions */}
                  {tutor.dimensionScores && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <span className="block text-[10px] text-white/40 uppercase">Time</span>
                          <span className="text-sm font-bold text-white">{Math.round(tutor.dimensionScores.timeOverlap)}%</span>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <span className="block text-[10px] text-white/40 uppercase">Rating</span>
                          <span className="text-sm font-bold text-white">{Math.round(tutor.dimensionScores.rating)}%</span>
                      </div>
                    </div>
                  )}
                </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                  <a
                    href={`/app/tutor/${tutor.userId}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors"
                  >
                      View Profile <ArrowRight className="w-3 h-3" />
                  </a>
                    <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                      <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
                </motion.div>
            );
          })}

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center"
            >
          <button
            onClick={handleGenerateRecommendations}
            disabled={isLoading}
                className="flex flex-col items-center gap-3 text-blue-200/60 hover:text-white transition-colors group"
          >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-500/30 group-hover:border-blue-400 flex items-center justify-center group-hover:bg-blue-500/10 transition-all">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Regenerate</span>
          </button>
            </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AIRecommendations;
