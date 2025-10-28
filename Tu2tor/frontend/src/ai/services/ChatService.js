/**
 * ChatService - AI Chat Assistant service
 *
 * Provides intelligent chat assistance for students using the Tu2tor platform
 */

import { fillTemplate, formatTutorListForPrompt, PROMPT_TEMPLATES } from '../utils/promptTemplates';

export class ChatService {
  constructor(aiService, appContext) {
    this.aiService = aiService;
    this.appContext = appContext;
  }

  /**
   * Create system prompt with platform context
   */
  createSystemPrompt(user, tutors) {
    const tutorContext = tutors ? formatTutorListForPrompt(tutors.slice(0, 5)) : 'Loading tutors...';

    const context = `
Current User: ${user?.username || 'Student'} (${user?.major || 'Unknown Major'}, Year ${user?.yearOfStudy || 'N/A'})
Available Credits: ${user?.credits || 0}

Platform Features:
- Browse and search for peer tutors
- Book tutoring sessions
- Submit and view reviews
- Manage bookings and credits
- Send messages to tutors

Top Available Tutors:
${tutorContext}
    `.trim();

    return fillTemplate('CHAT_SYSTEM', { context });
  }

  /**
   * Send a chat message with context awareness
   */
  async sendMessage(message, user, tutors, chatHistory = []) {
    try {
      const systemPrompt = this.createSystemPrompt(user, tutors);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: message }
      ];

      const result = await this.aiService.chat(messages, {
        temperature: 0.7,
        maxTokens: 1500,
      });

      return {
        success: true,
        message: result.content,
        tokens: result.tokens,
        cost: result.cost,
        provider: result.provider,
      };
    } catch (error) {
      console.error('[ChatService] Send message failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Stream chat response for real-time updates
   */
  async streamMessage(message, user, tutors, chatHistory, onChunk) {
    try {
      const systemPrompt = this.createSystemPrompt(user, tutors);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory,
        { role: 'user', content: message }
      ];

      const result = await this.aiService.streamChat(messages, onChunk, {
        temperature: 0.7,
        maxTokens: 1500,
      });

      return {
        success: true,
        message: result.content,
        tokens: result.tokens,
        cost: result.cost,
        provider: result.provider,
      };
    } catch (error) {
      console.error('[ChatService] Stream message failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get suggested questions for the user
   */
  getSuggestedQuestions(user) {
    const suggestions = [
      "What subjects can I get help with?",
      "How do I book a tutoring session?",
      "How does the credit system work?",
      "Can you recommend a tutor for me?",
      "What are the most popular subjects?",
    ];

    // Personalize based on user's major
    if (user?.major === 'Information Technology') {
      suggestions.unshift("Find me a programming tutor");
      suggestions.unshift("Who can help with web development?");
    } else if (user?.major === 'Business Analytics') {
      suggestions.unshift("Find me a data analytics tutor");
    }

    return suggestions;
  }

  /**
   * Analyze user intent to provide better responses
   */
  analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();

    const intents = {
      findTutor: /find|search|looking for|need.*tutor|recommend/i.test(message),
      booking: /book|schedule|appointment|session/i.test(message),
      credits: /credit|payment|cost|price|how much/i.test(message),
      help: /help|how to|how do i|what is|explain/i.test(message),
      review: /review|rating|feedback/i.test(message),
    };

    return intents;
  }
}

export default ChatService;
