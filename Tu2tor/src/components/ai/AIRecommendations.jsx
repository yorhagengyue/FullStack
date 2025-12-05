import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAI } from '../../context/AIContext';
import aiAPI from '../../services/aiAPI';
import { Sparkles, Loader2, TrendingUp, AlertCircle, X, Zap, RefreshCw, MessageCircle, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIRecommendations = ({ tutors, searchQuery, prioritySlider, onClose }) => {
  const { user } = useAuth();
  const { isInitialized } = useAI();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  // Disabled auto-generation due to Gemini API issues
  // Users can manually trigger recommendations
  useEffect(() => {
    if (user && tutors.length > 0) {
      // Generate simple recommendations without AI
      generateSimpleRecommendations();
    }
  }, [user, tutors.length, prioritySlider]);

  // Simple recommendation algorithm (non-AI fallback)
  const generateSimpleRecommendations = () => {
    if (tutors.length === 0) return;

    const topTutors = tutors.slice(0, 5).map(tutor => ({
      tutorId: tutor.userId,
      matchScore: Math.round((tutor.averageRating || 3) * 20), // Convert 5-star to 100-point scale
      reasons: [
        `${tutor.averageRating?.toFixed(1) || 'New'} average rating`,
        `Specializes in ${tutor.major || 'general subjects'}`,
        tutor.courses?.length ? `Teaches ${tutor.courses.length} courses` : 'Experienced tutor'
      ].filter(Boolean)
    }));

    setRecommendations(topTutors.slice(0, 3));
  };

  const handleGenerateRecommendations = async () => {
    if (!isInitialized || !user) {
      setError('AI service not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get top 5 tutors for AI analysis
      const topTutors = tutors.slice(0, 5);

      // Build prompt for AI to analyze tutors
      const tutorInfo = topTutors.map(t => ({
        id: t.userId,
        name: t.username,
        major: t.major,
        bio: t.bio || 'No bio provided',
        rating: t.averageRating || 0,
        courses: t.courses?.map(c => c.name).join(', ') || 'No courses listed',
        availability: t.availability || 'Not specified'
      }));

      // Ultra-simplified prompt
      const tutorList = topTutors.map((t, i) => 
        `${i+1}. ${t.username} - ${t.major} - ${(t.averageRating || 0).toFixed(1)} stars`
      ).join('\n');

      const prompt = `Rate these tutors for a student.

Tutors:
${tutorList}

For each, give: tutor number, score 0-100, two reasons.
Format as JSON array.`;

      console.log('[AIRecommendations] Prompt:', prompt);
      console.log('[AIRecommendations] Prompt length:', prompt.length, 'chars');

      const response = await aiAPI.generateContent(prompt, {
        maxTokens: 1000,
        temperature: 0.7
      });

      console.log('[AIRecommendations] Full response:', response);
      console.log('[AIRecommendations] Response keys:', Object.keys(response || {}));

      // Check for errors in response
      if (!response || response.error || !response.success) {
        console.error('[AIRecommendations] Error response:', response);
        const errorMsg = response?.message || response?.error || 'Failed to generate recommendations from AI';
        throw new Error(errorMsg);
      }

      if (!response.content || response.content.trim() === '') {
        console.error('[AIRecommendations] Missing or empty content. Full response:', JSON.stringify(response, null, 2));
        throw new Error('AI returned empty response. This may be due to content filtering or the request being too complex.');
      }

      // Parse AI response
      let recommendations = [];
      try {
        // Extract JSON from response (handle markdown code blocks)
        let jsonText = response.content;
        
        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Try to find JSON array
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
        
        recommendations = JSON.parse(jsonText);
        
        if (!Array.isArray(recommendations)) {
          throw new Error('Response is not an array');
        }
        
        // Validate and enrich recommendations
        recommendations = recommendations
          .filter(rec => rec.tutorId && rec.matchScore)
          .map(rec => ({
            ...rec,
            matchScore: Math.min(100, Math.max(0, rec.matchScore)),
            reasons: rec.reasons || ['AI-recommended match']
          }))
          .slice(0, 3); // Top 3 recommendations

      } catch (parseErr) {
        console.error('[AIRecommendations] Failed to parse AI response:', parseErr);
        console.error('[AIRecommendations] Response content was:', response.content?.substring(0, 500));
        throw new Error('Failed to parse AI recommendations. AI may have returned invalid format.');
      }

      if (recommendations.length > 0) {
        setRecommendations(recommendations);
      } else {
        setError('Unable to generate AI recommendations. Please try again.');
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
              <h3 className="text-xl font-bold text-white tracking-tight">Top Recommendations</h3>
              <p className="text-sm text-blue-200/80">Based on ratings and expertise</p>
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
                      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2">Highlights</p>
                      <ul className="space-y-1.5">
                        {rec.reasons.slice(0, 3).map((reason, idx) => (
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
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Try AI</span>
          </button>
            </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AIRecommendations;
