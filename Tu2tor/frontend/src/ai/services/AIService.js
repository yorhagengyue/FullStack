/**
 * AIService - Unified AI service layer
 *
 * Orchestrates multiple AI providers (Gemini, Ollama, etc.) and provides
 * a consistent interface for all AI operations across the application.
 */

import { GeminiProvider } from '../providers/GeminiProvider';
import { OllamaProvider } from '../providers/OllamaProvider';

export class AIService {
  constructor() {
    this.providers = new Map();
    this.activeProvider = null;
    this.activeProviderName = null;
    this.mode = 'online'; // 'online' or 'offline'
    this.fallbackEnabled = true;
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byProvider: {},
    };
  }

  /**
   * Initialize the AI service with default providers
   */
  async initialize() {
    try {
      // Register Gemini provider
      const geminiConfig = {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        model: import.meta.env.VITE_GEMINI_MODEL,
      };
      const geminiProvider = new GeminiProvider(geminiConfig);
      this.registerProvider('gemini', geminiProvider);

      // Register Ollama provider
      const ollamaConfig = {
        baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL,
        model: import.meta.env.VITE_OLLAMA_MODEL,
      };
      const ollamaProvider = new OllamaProvider(ollamaConfig);
      this.registerProvider('ollama', ollamaProvider);

      // Set default provider
      const defaultProvider = import.meta.env.VITE_DEFAULT_AI_PROVIDER || 'gemini';
      await this.switchProvider(defaultProvider);

      console.log('[AIService] Initialized with providers:', Array.from(this.providers.keys()));
      return true;
    } catch (error) {
      console.error('[AIService] Initialization failed:', error);
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
    console.log(`[AIService] Registered provider: ${name}`);
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

      // Check provider health before switching
      const health = await provider.checkHealth();

      if (!health.available) {
        console.warn(`[AIService] Provider '${providerName}' not available:`, health.message);

        // Try fallback if enabled
        if (this.fallbackEnabled) {
          return await this.fallbackToAvailableProvider(providerName);
        }

        throw new Error(`Provider '${providerName}' is not available: ${health.message}`);
      }

      // Initialize provider if not done
      if (!provider.isInitialized) {
        await provider.initialize();
      }

      this.activeProvider = provider;
      this.activeProviderName = providerName;
      this.mode = provider.isOnline ? 'online' : 'offline';

      console.log(`[AIService] Switched to provider: ${providerName} (${this.mode} mode)`);

      return {
        success: true,
        provider: providerName,
        mode: this.mode,
        capabilities: provider.getCapabilities(),
      };
    } catch (error) {
      console.error(`[AIService] Failed to switch to provider '${providerName}':`, error);
      throw error;
    }
  }

  /**
   * Fallback to an available provider
   */
  async fallbackToAvailableProvider(failedProvider) {
    console.log(`[AIService] Attempting fallback from '${failedProvider}'...`);

    const providerPriority = failedProvider === 'gemini' ? ['ollama'] : ['gemini'];

    for (const name of providerPriority) {
      try {
        const provider = this.providers.get(name);
        if (provider) {
          const health = await provider.checkHealth();
          if (health.available) {
            await this.switchProvider(name);
            console.log(`[AIService] Fell back to provider: ${name}`);
            return {
              success: true,
              provider: name,
              fallback: true,
              originalProvider: failedProvider,
            };
          }
        }
      } catch (error) {
        console.warn(`[AIService] Fallback to '${name}' failed:`, error.message);
      }
    }

    throw new Error('No available AI providers');
  }

  /**
   * Send a chat message
   */
  async chat(messages, options = {}) {
    try {
      if (!this.activeProvider) {
        throw new Error('No active AI provider. Call initialize() first.');
      }

      const result = await this.activeProvider.chat(messages, options);

      // Track usage
      this.updateUsageStats(this.activeProviderName, result);

      return result;
    } catch (error) {
      console.error('[AIService] Chat failed:', error);

      // Try fallback if enabled
      if (this.fallbackEnabled && this.activeProviderName) {
        try {
          await this.fallbackToAvailableProvider(this.activeProviderName);
          return await this.chat(messages, options); // Retry with fallback
        } catch (fallbackError) {
          console.error('[AIService] Fallback also failed:', fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * Generate content
   */
  async generateContent(prompt, options = {}) {
    try {
      if (!this.activeProvider) {
        throw new Error('No active AI provider');
      }

      const result = await this.activeProvider.generateContent(prompt, options);

      // Track usage
      this.updateUsageStats(this.activeProviderName, result);

      return result;
    } catch (error) {
      console.error('[AIService] Content generation failed:', error);

      // Try fallback
      if (this.fallbackEnabled && this.activeProviderName) {
        try {
          await this.fallbackToAvailableProvider(this.activeProviderName);
          return await this.generateContent(prompt, options);
        } catch (fallbackError) {
          console.error('[AIService] Fallback also failed:', fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * Generate embeddings for semantic search
   */
  async embed(text) {
    try {
      if (!this.activeProvider) {
        throw new Error('No active AI provider');
      }

      return await this.activeProvider.embed(text);
    } catch (error) {
      console.error('[AIService] Embedding failed:', error);
      throw error;
    }
  }

  /**
   * Stream chat responses
   */
  async streamChat(messages, onChunk, options = {}) {
    try {
      if (!this.activeProvider) {
        throw new Error('No active AI provider');
      }

      const result = await this.activeProvider.streamChat(messages, onChunk, options);

      // Track usage
      this.updateUsageStats(this.activeProviderName, result);

      return result;
    } catch (error) {
      console.error('[AIService] Stream chat failed:', error);
      throw error;
    }
  }

  /**
   * Estimate cost of a request
   */
  async estimateCost(text, options = {}) {
    if (!this.activeProvider) {
      return { estimatedTokens: 0, estimatedCost: 0 };
    }

    return await this.activeProvider.estimateCost(text, options);
  }

  /**
   * Get current provider capabilities
   */
  getCapabilities() {
    if (!this.activeProvider) {
      return null;
    }

    return this.activeProvider.getCapabilities();
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return { ...this.usageStats };
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

    this.providers.forEach((provider, name) => {
      this.usageStats.byProvider[name] = {
        requests: 0,
        tokens: 0,
        cost: 0,
      };
    });
  }

  /**
   * Update usage statistics
   */
  updateUsageStats(providerName, result) {
    this.usageStats.totalRequests += 1;
    this.usageStats.totalTokens += result.tokens || 0;
    this.usageStats.totalCost += result.cost || 0;

    if (this.usageStats.byProvider[providerName]) {
      this.usageStats.byProvider[providerName].requests += 1;
      this.usageStats.byProvider[providerName].tokens += result.tokens || 0;
      this.usageStats.byProvider[providerName].cost += result.cost || 0;
    }
  }

  /**
   * Get all registered providers
   */
  getProviders() {
    return Array.from(this.providers.keys());
  }

  /**
   * Get active provider name
   */
  getActiveProviderName() {
    return this.activeProviderName;
  }

  /**
   * Check if a provider is available
   */
  async isProviderAvailable(providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return false;
    }

    const health = await provider.checkHealth();
    return health.available;
  }

  /**
   * Enable or disable automatic fallback
   */
  setFallbackEnabled(enabled) {
    this.fallbackEnabled = enabled;
  }

  /**
   * Clean up all providers
   */
  async cleanup() {
    for (const [name, provider] of this.providers) {
      try {
        await provider.cleanup();
        console.log(`[AIService] Cleaned up provider: ${name}`);
      } catch (error) {
        console.error(`[AIService] Failed to cleanup provider '${name}':`, error);
      }
    }

    this.providers.clear();
    this.activeProvider = null;
    this.activeProviderName = null;
  }
}

// Create and export singleton instance
const aiService = new AIService();
export default aiService;
