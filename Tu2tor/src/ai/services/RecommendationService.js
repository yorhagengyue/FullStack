/**
 * RecommendationService - AI-powered tutor recommendation system
 *
 * Enhances the existing ranking algorithm with AI-powered semantic matching
 */

import { fillTemplate, formatTutorListForPrompt, extractJSON } from '../utils/promptTemplates';

export class RecommendationService {
  constructor(aiService) {
    this.aiService = aiService;
  }

  /**
   * Get AI-enhanced tutor recommendations
   */
  async getRecommendations(user, query, tutors, options = {}) {
    try {
      const tutorList = formatTutorListForPrompt(tutors);

      // Convert priority slider value (0-100) to human-readable preference
      const priorityValue = options.priority !== undefined ? options.priority : 50;
      let priorityText = 'Balanced';
      if (priorityValue < 30) {
        priorityText = 'Schedule First';
      } else if (priorityValue > 70) {
        priorityText = 'Rating First';
      }

      const prompt = fillTemplate('RECOMMEND_TUTORS', {
        studentMajor: user.major || 'Not specified',
        studentYear: user.yearOfStudy || 'N/A',
        studentTimes: options.preferredTimes || 'Flexible',
        studentLocations: options.preferredLocations || 'Any',
        query: query || 'General tutoring',
        priority: priorityText,
        tutorList,
      });

      // Use chat method to ensure we use OpenAI (current provider)
      const result = await this.aiService.chat(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.3, // Lower temperature for consistent recommendations
          maxTokens: 1500,
        }
      );

      // Extract JSON from response
      const recommendations = extractJSON(result.content);

      return {
        success: true,
        recommendations: recommendations.recommendations || [],
        rawResponse: result.content,
        tokens: result.tokens,
        reasoningTokens: result.reasoningTokens,
        cost: result.cost,
        provider: result.provider,
        model: result.model,
      };
    } catch (error) {
      console.error('[RecommendationService] Get recommendations failed:', error);
      return {
        success: false,
        error: error.message,
        recommendations: [],
      };
    }
  }

  /**
   * Explain why a tutor matches the student's needs
   */
  async explainMatch(user, tutor, context = '') {
    try {
      const prompt = `Explain in 1-2 brief sentences why ${tutor.username} matches ${user.username}.

Student: ${user.major}, Year ${user.yearOfStudy}
Tutor: ${tutor.major}, Year ${tutor.yearOfStudy}
Subjects: ${tutor.subjects?.map(s => s.name).join(', ')}
Rating: ${tutor.averageRating}/5 (${tutor.totalReviews} reviews)

${context ? `Context: ${context}` : ''}

Be concise and specific.`;

      const result = await this.aiService.chat(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.7,
          maxTokens: 150,
        }
      );

      return {
        success: true,
        explanation: result.content,
        tokens: result.tokens,
        cost: result.cost,
      };
    } catch (error) {
      console.error('[RecommendationService] Explain match failed:', error);
      return {
        success: false,
        explanation: 'This tutor matches your requirements based on subject expertise and availability.',
      };
    }
  }

  /**
   * Analyze user's learning needs from natural language
   */
  async analyzeUserNeeds(query) {
    try {
      const prompt = `Analyze this student's tutoring request and extract key information:

Request: "${query}"

Extract and return as JSON:
{
  "subjects": ["subject codes or names"],
  "urgency": "high/medium/low",
  "preferredTimes": ["day/time preferences"],
  "learningGoals": ["what they want to achieve"],
  "tutorQualities": ["desired tutor characteristics"],
  "budget": "credits willing to spend (if mentioned)"
}`;

      const result = await this.aiService.chat(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.3,
          maxTokens: 500,
        }
      );

      const analysis = extractJSON(result.content);

      return {
        success: true,
        analysis,
      };
    } catch (error) {
      console.error('[RecommendationService] Analyze needs failed:', error);
      return {
        success: false,
        analysis: null,
      };
    }
  }

  /**
   * Compare multiple tutors and provide insights
   */
  async compareTutors(tutors, criterion = 'overall') {
    try {
      const tutorList = formatTutorListForPrompt(tutors);

      const prompt = `Compare these tutors and provide insights:

${tutorList}

Comparison criterion: ${criterion}

For each tutor, provide:
1. Key strengths
2. Best suited for (student types)
3. Notable considerations

Return as JSON:
{
  "comparisons": [
    {
      "tutorId": "user001",
      "strengths": ["strength1", "strength2"],
      "bestFor": "description",
      "considerations": ["note1", "note2"]
    }
  ],
  "recommendation": "Overall recommendation based on comparison"
}`;

      const result = await this.aiService.chat(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.5,
          maxTokens: 1000,
        }
      );

      const comparison = extractJSON(result.content);

      return {
        success: true,
        comparison,
      };
    } catch (error) {
      console.error('[RecommendationService] Compare tutors failed:', error);
      return {
        success: false,
        comparison: null,
      };
    }
  }

  /**
   * Suggest search refinements when results are not satisfactory
   */
  async suggestRefinements(originalQuery, resultCount, currentFilters) {
    try {
      const prompt = fillTemplate('REFINE_SEARCH_QUERY', {
        resultCount,
        originalQuery,
        currentFilters: JSON.stringify(currentFilters),
      });

      const result = await this.aiService.chat(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.7,
          maxTokens: 500,
        }
      );

      const suggestions = extractJSON(result.content);

      return {
        success: true,
        suggestions: suggestions.suggestions || [],
      };
    } catch (error) {
      console.error('[RecommendationService] Suggest refinements failed:', error);
      return {
        success: false,
        suggestions: [],
      };
    }
  }

  /**
   * Generate personalized tutor introduction
   */
  async generateIntroduction(tutor, user) {
    try {
      const prompt = `Write a warm, personalized introduction email from ${tutor.username} to ${user.username}.

Tutor: ${tutor.username} (${tutor.major}, Year ${tutor.yearOfStudy})
Student: ${user.username} (${user.major}, Year ${user.yearOfStudy})

Tutor's subjects: ${tutor.subjects?.map(s => s.name).join(', ')}
Tutor's bio: ${tutor.bio || 'Not provided'}

Requirements:
- Friendly, peer-to-peer tone
- Mention common ground (same school, similar interests)
- Briefly highlight teaching approach
- Encourage the student to reach out
- 3-4 sentences, casual but professional
- First person from tutor's perspective`;

      const result = await this.aiService.chat(
        [{ role: 'user', content: prompt }],
        {
          temperature: 0.8,
          maxTokens: 300,
        }
      );

      return {
        success: true,
        introduction: result.content,
      };
    } catch (error) {
      console.error('[RecommendationService] Generate introduction failed:', error);
      return {
        success: false,
        introduction: `Hi! I'm ${tutor.username} and I'd love to help you with your studies. Feel free to reach out!`,
      };
    }
  }
}

export default RecommendationService;
