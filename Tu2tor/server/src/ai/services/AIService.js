/**
 * Backend AIService - Unified AI service layer
 *
 * Orchestrates multiple AI providers (Gemini, OpenAI) and provides
 * a consistent interface for all AI operations across the backend.
 * 
 * Key differences from frontend version:
 * - Uses process.env for API keys (secure)
 * - Returns async generators for streaming
 * - Simplified provider management
 */

import { GeminiProvider } from '../providers/GeminiProvider.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';

export class AIService {
  constructor() {
    this.providers = new Map();
    this.activeProvider = null;
    this.activeProviderName = null;
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byProvider: {},
    };
  }

  /**
   * Initialize the AI service with available providers
   */
  async initialize() {
    try {
      console.log('[Backend AIService] Initializing...');
      console.log('[Backend AIService] GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
      console.log('[Backend AIService] OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

      // Register Gemini provider
      if (process.env.GEMINI_API_KEY) {
        const geminiConfig = {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          thinkingModel: process.env.GEMINI_THINKING_MODEL || 'gemini-exp-1206',
        };
        const geminiProvider = new GeminiProvider(geminiConfig);
        this.registerProvider('gemini', geminiProvider);
      }

      // Register OpenAI provider
      if (process.env.OPENAI_API_KEY) {
        const openaiConfig = {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4o',
        };
        const openaiProvider = new OpenAIProvider(openaiConfig);
        this.registerProvider('openai', openaiProvider);
      }

      console.log('[Backend AIService] Registered providers:', Array.from(this.providers.keys()));

      // Set default provider
      const defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'gemini';

      if (this.providers.has(defaultProvider)) {
        await this.switchProvider(defaultProvider);
        console.log('[Backend AIService] Initialized with provider:', defaultProvider);
        return true;
      } else {
        // Fallback to first available provider
        const firstProvider = Array.from(this.providers.keys())[0];
        if (firstProvider) {
          await this.switchProvider(firstProvider);
          console.log('[Backend AIService] Initialized with fallback provider:', firstProvider);
          return true;
        }
      }

      throw new Error('No AI providers configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in server .env');
    } catch (error) {
      console.error('[Backend AIService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Register a new AI provider
   */
  registerProvider(name, provider) {
    this.providers.set(name, provider);
    this.usageStats.byProvider[name] = {
      requests: 0,
      tokens: 0,
      cost: 0,
    };
    console.log(`[Backend AIService] Registered provider: ${name}`);
  }

  /**
   * Switch to a different AI provider
   */
  async switchProvider(providerName) {
    try {
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(`Provider '${providerName}' not registered`);
      }

      // Initialize provider if needed
      if (!provider.isInitialized) {
        await provider.initialize();
      }

      // Check health
      const health = await provider.checkHealth();
      if (!health.available) {
        throw new Error(`Provider '${providerName}' is not available: ${health.message}`);
      }

      this.activeProvider = provider;
      this.activeProviderName = providerName;

      console.log(`[Backend AIService] Switched to provider: ${providerName}`);
      return {
        success: true,
        provider: providerName,
        model: provider.modelName,
      };
    } catch (error) {
      console.error(`[Backend AIService] Failed to switch to provider '${providerName}':`, error);
      throw error;
    }
  }

  /**
   * Get list of available providers
   */
  getProviders() {
    return Array.from(this.providers.keys()).map(name => ({
      name,
      isActive: name === this.activeProviderName,
      capabilities: this.providers.get(name).getCapabilities(),
    }));
  }

  /**
   * Get active provider name
   */
  getActiveProviderName() {
    return this.activeProviderName;
  }

  /**
   * Get current model details
   */
  getCurrentModel(options = {}) {
    if (!this.activeProvider) {
      return { provider: null, model: null };
    }

    const isThinking = options.thinkingMode;
    const model = isThinking 
      ? (this.activeProvider.thinkingModelName || this.activeProvider.modelName)
      : this.activeProvider.modelName;

    return {
      provider: this.activeProviderName,
      model,
      isThinking,
    };
  }

  /**
   * Generate content (non-streaming)
   */
  async generateContent(prompt, options = {}) {
    try {
      if (!this.activeProvider) {
        throw new Error('No active AI provider');
      }

      console.log('[Backend AIService] Generating content with', this.activeProviderName);
      if (options.enableGrounding) {
        console.log('[Backend AIService] Web Search (Grounding) is ENABLED');
      }

      const result = await this.activeProvider.generateContent(prompt, options);

      // Track usage
      this.updateUsageStats(result);

      return result;
    } catch (error) {
      console.error('[Backend AIService] Content generation failed:', error);
      throw error;
    }
  }

  /**
   * Stream chat (returns async generator for SSE)
   */
  async* streamChat(messages, options = {}) {
    try {
      if (!this.activeProvider) {
        throw new Error('No active AI provider');
      }

      console.log('[Backend AIService] Streaming chat with', this.activeProviderName);
      console.log('[Backend AIService] Thinking mode:', !!options.thinkingMode);
      if (options.enableGrounding) {
        console.log('[Backend AIService] Web Search (Grounding) is ENABLED');
      }

      // Increment request count
      this.usageStats.totalRequests++;
      this.usageStats.byProvider[this.activeProviderName].requests++;

      // Stream from provider
      for await (const chunk of this.activeProvider.streamChat(messages, options)) {
        yield chunk;
      }
    } catch (error) {
      console.error('[Backend AIService] Stream chat failed:', error);
      throw error;
    }
  }

  /**
   * Check health of a specific provider or all providers
   */
  async checkHealth(providerName = null) {
    try {
      if (providerName) {
        const provider = this.providers.get(providerName);
        if (!provider) {
          return {
            available: false,
            message: `Provider '${providerName}' not found`,
          };
        }
        return await provider.checkHealth();
      }

      // Check all providers
      const results = {};
      for (const [name, provider] of this.providers) {
        results[name] = await provider.checkHealth();
      }
      return results;
    } catch (error) {
      console.error('[Backend AIService] Health check failed:', error);
      return {
        available: false,
        message: error.message,
      };
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      ...this.usageStats,
      activeProvider: this.activeProviderName,
    };
  }

  /**
   * Update usage statistics
   */
  updateUsageStats(result) {
    if (result.tokens) {
      this.usageStats.totalTokens += result.tokens;
      this.usageStats.byProvider[this.activeProviderName].tokens += result.tokens;
    }
    if (result.cost) {
      this.usageStats.totalCost += result.cost;
      this.usageStats.byProvider[this.activeProviderName].cost += result.cost;
    }
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats() {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byProvider: {},
    };
    for (const name of this.providers.keys()) {
      this.usageStats.byProvider[name] = {
        requests: 0,
        tokens: 0,
        cost: 0,
      };
    }
  }
}

// Singleton instance
const aiService = new AIService();

export default aiService;

