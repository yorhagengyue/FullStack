/**
 * Backend AI Service
 * Securely handles AI API calls with API keys stored server-side
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    this.gemini = null;
    this.openai = null;
    this.activeProvider = null;
    
    this.initialize();
  }

  initialize() {
    // Initialize Gemini (API key securely stored in server .env)
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.activeProvider = 'gemini';
      console.log('[Backend AIService] Gemini initialized');
    }

    // TODO: Add OpenAI initialization when needed
    // if (process.env.OPENAI_API_KEY) {
    //   this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // }

    if (!this.activeProvider) {
      console.warn('[Backend AIService] No AI provider configured');
    }
  }

  /**
   * Generate content using AI
   */
  async generateContent(prompt, options = {}) {
    try {
      if (!this.gemini) {
        throw new Error('AI service not available');
      }

      const modelName = options.model || 'gemini-2.0-flash-exp';
      const model = this.gemini.getGenerativeModel({ model: modelName });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        provider: 'gemini',
        model: modelName,
      };
    } catch (error) {
      console.error('[Backend AIService] Content generation failed:', error);
      throw error;
    }
  }

  /**
   * Chat with streaming support
   */
  async streamChat(messages, options = {}) {
    try {
      if (!this.gemini) {
        throw new Error('AI service not available');
      }

      const modelName = options.thinkingMode 
        ? 'gemini-exp-1206' 
        : (options.model || 'gemini-2.0-flash-exp');

      const model = this.gemini.getGenerativeModel({ model: modelName });

      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      const chat = model.startChat({
        history,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2500,
        },
      });

      // For streaming
      const result = await chat.sendMessageStream(lastMessage.content);

      return result;
    } catch (error) {
      console.error('[Backend AIService] Stream chat failed:', error);
      throw error;
    }
  }

  /**
   * Check service health
   */
  async healthCheck() {
    return {
      available: !!this.gemini || !!this.openai,
      provider: this.activeProvider,
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance
const aiService = new AIService();

export default aiService;

