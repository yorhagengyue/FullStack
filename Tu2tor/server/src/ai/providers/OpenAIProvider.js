/**
 * OpenAIProvider - OpenAI GPT implementation (Backend)
 *
 * Provides integration with OpenAI's GPT models (GPT-4, GPT-4o, GPT-5)
 * Uses process.env for secure server-side API key storage
 */

import { BaseAIProvider } from './BaseAIProvider.js';

export class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.providerName = 'openai';
    this.isOnline = true;
    // Use process.env instead of import.meta.env (backend)
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.modelName = config.model || process.env.OPENAI_MODEL || 'gpt-4o';
    this.baseUrl = 'https://api.openai.com/v1';

    // OpenAI pricing (per 1M tokens)
    this.pricing = {
      'gpt-5': {
        input: 2.00 / 1000000,
        output: 8.00 / 1000000,
      },
      'gpt-4o': {
        input: 2.50 / 1000000,
        output: 10.00 / 1000000,
      },
      'gpt-4o-mini': {
        input: 0.150 / 1000000,
        output: 0.600 / 1000000,
      },
      'o3-mini': {
        input: 1.10 / 1000000,
        output: 4.40 / 1000000,
      },
    };
  }

  /**
   * Initialize OpenAI provider
   */
  async initialize() {
    try {
      console.log('[Backend OpenAIProvider] Initializing...', {
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 15) + '...' : 'none',
        modelName: this.modelName,
      });

      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in server .env');
      }

      this.isInitialized = true;
      console.log('[Backend OpenAIProvider] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Backend OpenAIProvider] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check OpenAI API health
   */
  async checkHealth() {
    try {
      if (!this.apiKey) {
        return {
          available: false,
          message: 'OpenAI API key not configured',
          error: 'Missing API key',
        };
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

      return {
        available: true,
        message: 'OpenAI API is configured and ready',
        model: this.modelName,
      };
    } catch (error) {
      return {
        available: false,
        message: error.message || 'OpenAI health check failed',
        error: error.toString(),
      };
    }
  }

  /**
   * Format messages for OpenAI API
   */
  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
      content: msg.content,
    }));
  }

  /**
   * Stream chat responses in real-time
   * This method returns an async generator for SSE streaming
   */
  async* streamChat(messages, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const formattedMessages = this.formatMessages(messages);

      // Build request body
      const requestBody = {
        model: this.modelName,
        messages: formattedMessages,
        max_completion_tokens: options.maxTokens || 2000,
        stream: true,
      };

      // GPT-5 doesn't support temperature, top_p, etc.
      if (!this.modelName.startsWith('gpt-5') && !this.modelName.startsWith('o3')) {
        requestBody.temperature = options.temperature || 0.7;
      }

      // Add reasoning_effort for GPT-5 when thinkingMode is enabled
      if (this.modelName === 'gpt-5' && options.thinkingMode) {
        requestBody.reasoning_effort = options.reasoningEffort || 'medium';
        requestBody.verbosity = 'medium';
      }

      console.log('[Backend OpenAIProvider] Streaming with model:', this.modelName);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices[0]?.delta?.content;

              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn('[Backend OpenAIProvider] Failed to parse chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Backend OpenAIProvider] Stream chat failed:', error);
      throw new Error(`OpenAI chat failed: ${error.message}`);
    }
  }

  /**
   * Chat without streaming
   */
  async chat(messages, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const formattedMessages = this.formatMessages(messages);

      const requestBody = {
        model: this.modelName,
        messages: formattedMessages,
        max_completion_tokens: options.maxTokens || 2000,
      };

      if (!this.modelName.startsWith('gpt-5') && !this.modelName.startsWith('o3')) {
        requestBody.temperature = options.temperature || 0.7;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const usage = data.usage;

      const modelPricing = this.pricing[this.modelName] || this.pricing['gpt-4o'];
      const cost =
        usage.prompt_tokens * modelPricing.input + usage.completion_tokens * modelPricing.output;

      return {
        content,
        tokens: usage.total_tokens,
        cost,
        provider: this.providerName,
        model: this.modelName,
      };
    } catch (error) {
      console.error('[Backend OpenAIProvider] Chat failed:', error);
      throw new Error(`OpenAI chat failed: ${error.message}`);
    }
  }

  /**
   * Generate content (alias for chat)
   */
  async generateContent(prompt, options = {}) {
    return await this.chat([{ role: 'user', content: prompt }], options);
  }

  /**
   * Generate embeddings with OpenAI
   */
  async embed(text) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI embedding failed: ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;

      return {
        embedding,
        dimensions: embedding.length,
        model: 'text-embedding-3-small',
      };
    } catch (error) {
      console.warn('[Backend OpenAIProvider] Embedding failed:', error.message);
      return {
        embedding: null,
        dimensions: 0,
        model: 'none',
        error: `Embedding generation failed: ${error.message}`,
      };
    }
  }

  /**
   * Estimate cost for a request
   */
  async estimateCost(text, options = {}) {
    const chars = text.length;
    const tokens = Math.ceil(chars / 4);

    const modelPricing = this.pricing[this.modelName] || this.pricing['gpt-4o'];

    return {
      estimatedTokens: tokens,
      estimatedCost: tokens * (modelPricing.input + modelPricing.output),
      pricePerKChars: modelPricing,
    };
  }

  /**
   * Get OpenAI capabilities
   */
  getCapabilities() {
    const supportsReasoning = ['gpt-5', 'o3-mini', 'o3'].includes(this.modelName);

    return {
      chat: true,
      contentGeneration: true,
      embeddings: true,
      streaming: true,
      vision: false, // Backend doesn't support image processing for now
      reasoning: supportsReasoning,
      maxTokens: 8192,
      contextWindow: 128000,
      supportedModels: ['gpt-5', 'gpt-4o', 'gpt-4o-mini', 'o3-mini'],
      pricing: this.pricing,
    };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    await super.cleanup();
  }
}

export default OpenAIProvider;

