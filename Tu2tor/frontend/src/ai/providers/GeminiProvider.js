/**
 * GeminiProvider - Google Gemini AI implementation
 *
 * Provides integration with Google's Gemini AI models (Gemini Pro, Gemini Pro Vision)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './BaseAIProvider';

export class GeminiProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.providerName = 'gemini';
    this.isOnline = true;
    this.apiKey = config.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    this.modelName = config.model || import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
    this.thinkingModelName = config.thinkingModel || import.meta.env.VITE_GEMINI_THINKING_MODEL || 'gemini-2.5-pro-exp-03-25';
    this.genAI = null;
    this.model = null;
    this.thinkingModel = null;
    this.embeddingModel = null;

    // Gemini pricing (per 1000 characters)
    this.pricing = {
      'gemini-2.0-flash': {
        input: 0.00025,
        output: 0.0005,
      },
      'gemini-2.5-pro-exp-03-25': {
        input: 0.002,
        output: 0.004,
      },
      'gemini-2.5-pro': {
        input: 0.002,
        output: 0.004,
      },
      'gemini-pro': {
        input: 0.00025,
        output: 0.0005,
      },
      'gemini-pro-vision': {
        input: 0.0025,
        output: 0.0025,
      },
    };
  }

  /**
   * Initialize Gemini AI
   */
  async initialize() {
    try {
      console.log('[GeminiProvider] Initializing...', {
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none',
        modelName: this.modelName,
        thinkingModelName: this.thinkingModelName,
      });

      if (!this.apiKey) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env.local');
      }

      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      this.thinkingModel = this.genAI.getGenerativeModel({ model: this.thinkingModelName });
      this.embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });

      this.isInitialized = true;
      console.log('[GeminiProvider] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[GeminiProvider] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check Gemini API health
   */
  async checkHealth() {
    try {
      // Quick check: just verify API key is configured
      if (!this.apiKey) {
        return {
          available: false,
          message: 'Gemini API key not configured',
          error: 'Missing API key',
        };
      }

      // Initialize if needed
      if (!this.isInitialized) {
        await this.initialize();
      }

      // If initialization succeeded, consider it available
      // Don't make actual API call during health check to avoid quota/network issues
      return {
        available: true,
        message: 'Gemini API is configured and ready',
        model: this.modelName,
      };
    } catch (error) {
      return {
        available: false,
        message: error.message || 'Gemini API unavailable',
        error: error.toString(),
      };
    }
  }

  /**
   * Chat with Gemini
   */
  async chat(messages, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      // Start chat with history
      const chat = this.model.startChat({
        history,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2000,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
        },
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      const content = response.text();

      // Estimate tokens and cost
      const inputChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      const outputChars = content.length;
      const inputTokens = Math.ceil(inputChars / 4);
      const outputTokens = Math.ceil(outputChars / 4);
      const totalTokens = inputTokens + outputTokens;

      const pricing = this.pricing[this.modelName] || this.pricing['gemini-pro'];
      const cost =
        (inputChars / 1000) * pricing.input + (outputChars / 1000) * pricing.output;

      return {
        content,
        tokens: totalTokens,
        cost: parseFloat(cost.toFixed(6)),
        provider: this.providerName,
        model: this.modelName,
      };
    } catch (error) {
      console.error('[GeminiProvider] Chat failed:', error);
      throw new Error(`Gemini chat failed: ${error.message}`);
    }
  }

  /**
   * Generate content with Gemini
   */
  async generateContent(prompt, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2000,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
        },
      });

      const response = await result.response;
      const content = response.text();

      // Estimate tokens and cost
      const inputChars = prompt.length;
      const outputChars = content.length;
      const inputTokens = Math.ceil(inputChars / 4);
      const outputTokens = Math.ceil(outputChars / 4);
      const totalTokens = inputTokens + outputTokens;

      const pricing = this.pricing[this.modelName] || this.pricing['gemini-pro'];
      const cost =
        (inputChars / 1000) * pricing.input + (outputChars / 1000) * pricing.output;

      return {
        content,
        tokens: totalTokens,
        cost: parseFloat(cost.toFixed(6)),
        provider: this.providerName,
        model: this.modelName,
      };
    } catch (error) {
      console.error('[GeminiProvider] Content generation failed:', error);
      throw new Error(`Gemini content generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for semantic search
   */
  async embed(text) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const result = await this.embeddingModel.embedContent(text);
      const embedding = result.embedding;

      return {
        embedding: embedding.values,
        dimensions: embedding.values.length,
        model: 'embedding-001',
      };
    } catch (error) {
      console.error('[GeminiProvider] Embedding failed:', error);
      throw new Error(`Gemini embedding failed: ${error.message}`);
    }
  }

  /**
   * Stream chat responses in real-time
   */
  async streamChat(messages, onChunk, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1];

      // Use thinking model if thinkingMode is enabled
      const modelToUse = options.thinkingMode ? this.thinkingModel : this.model;
      const modelNameUsed = options.thinkingMode ? this.thinkingModelName : this.modelName;

      console.log('[GeminiProvider] Using model:', modelNameUsed, 'Thinking mode:', !!options.thinkingMode);

      const chat = modelToUse.startChat({
        history,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2000,
        },
      });

      const result = await chat.sendMessageStream(lastMessage.content);

      let fullContent = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullContent += chunkText;
        onChunk(chunkText);
      }

      // Calculate final stats
      const inputChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      const outputChars = fullContent.length;
      const totalTokens = Math.ceil((inputChars + outputChars) / 4);

      const pricing = this.pricing[modelNameUsed] || this.pricing['gemini-2.0-flash'];
      const cost =
        (inputChars / 1000) * pricing.input + (outputChars / 1000) * pricing.output;

      return {
        content: fullContent,
        tokens: totalTokens,
        cost: parseFloat(cost.toFixed(6)),
        provider: this.providerName,
        model: modelNameUsed,
      };
    } catch (error) {
      console.error('[GeminiProvider] Stream chat failed:', error);
      throw new Error(`Gemini stream chat failed: ${error.message}`);
    }
  }

  /**
   * Estimate cost before making request
   */
  async estimateCost(text, options = {}) {
    const chars = text.length;
    const tokens = Math.ceil(chars / 4);
    const pricing = this.pricing[this.modelName] || this.pricing['gemini-pro'];

    // Assume output is similar length to input
    const estimatedOutputChars = chars * 1.5;
    const estimatedCost =
      (chars / 1000) * pricing.input + (estimatedOutputChars / 1000) * pricing.output;

    return {
      estimatedTokens: tokens,
      estimatedCost: parseFloat(estimatedCost.toFixed(6)),
      pricePerKChars: pricing,
    };
  }

  /**
   * Get Gemini capabilities
   */
  getCapabilities() {
    return {
      chat: true,
      contentGeneration: true,
      embeddings: true,
      streaming: true,
      vision: this.modelName.includes('vision'),
      maxTokens: 2048,
      contextWindow: 30720, // ~30k tokens
      supportedModels: ['gemini-pro', 'gemini-pro-vision'],
      pricing: this.pricing[this.modelName],
    };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.genAI = null;
    this.model = null;
    this.embeddingModel = null;
    await super.cleanup();
  }
}

export default GeminiProvider;
