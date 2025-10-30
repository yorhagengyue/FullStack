/**
 * OpenAIProvider - OpenAI GPT implementation
 *
 * Provides integration with OpenAI's GPT models (GPT-4, GPT-4o, GPT-3.5-turbo)
 */

import axios from 'axios';
import { BaseAIProvider } from './BaseAIProvider';

export class OpenAIProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.providerName = 'openai';
    this.isOnline = true;
    this.apiKey = config.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    this.modelName = config.model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-5';
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

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  /**
   * Initialize OpenAI provider
   */
  async initialize() {
    try {
      console.log('[OpenAIProvider] Initializing...', {
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 15) + '...' : 'none',
        modelName: this.modelName,
      });

      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env.local');
      }

      this.isInitialized = true;
      console.log('[OpenAIProvider] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[OpenAIProvider] Initialization failed:', error);
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
      console.error('[OpenAIProvider] Health check failed:', error);
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
    return messages.map(msg => {
      const content = [];

      // Add text content
      if (msg.content) {
        content.push({
          type: 'text',
          text: msg.content,
        });
      }

      // Add image files if present (for vision models)
      if (msg.files && msg.files.length > 0) {
        msg.files.forEach(file => {
          content.push({
            type: 'image_url',
            image_url: {
              url: file.data, // data URL format
            },
          });
        });
      }

      return {
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: content.length === 1 && content[0].type === 'text' ? content[0].text : content,
      };
    });
  }

  /**
   * Stream chat responses in real-time
   */
  async streamChat(messages, onChunk, options = {}) {
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
      // Only add temperature for older models (gpt-4o, gpt-4o-mini)
      if (!this.modelName.startsWith('gpt-5') && !this.modelName.startsWith('o3')) {
        requestBody.temperature = options.temperature || 0.7;
      }

      // Add reasoning_effort for GPT-5 when thinkingMode is enabled
      if (this.modelName === 'gpt-5' && options.thinkingMode) {
        // minimal (fastest), low, medium (best quality for our use case)
        requestBody.reasoning_effort = options.reasoningEffort || 'medium';

        // Optional: Add verbosity control
        requestBody.verbosity = 'medium';
      }

      console.log('[OpenAIProvider] Streaming chat with', {
        model: this.modelName,
        messageCount: messages.length,
        hasImages: messages.some(m => m.files && m.files.length > 0),
        thinkingMode: options.thinkingMode,
        reasoningEffort: requestBody.reasoning_effort,
      });

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
      let fullContent = '';
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
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              console.warn('[OpenAIProvider] Failed to parse chunk:', e);
            }
          }
        }
      }

      // Estimate tokens (rough approximation: 1 token ≈ 4 chars)
      const inputChars = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0);
      const totalTokens = Math.ceil((inputChars + fullContent.length) / 4);

      const modelPricing = this.pricing[this.modelName] || this.pricing['gpt-4o'];
      const cost = totalTokens * (modelPricing.input + modelPricing.output);

      return {
        content: fullContent,
        tokens: totalTokens,
        cost,
        provider: this.providerName,
        model: this.modelName,
      };
    } catch (error) {
      console.error('[OpenAIProvider] Stream chat failed:', error);
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

      // GPT-5 doesn't support temperature
      if (!this.modelName.startsWith('gpt-5') && !this.modelName.startsWith('o3')) {
        requestBody.temperature = options.temperature || 0.7;
      }

      const response = await this.axiosInstance.post('/chat/completions', requestBody);

      const content = response.data.choices[0].message.content;
      const usage = response.data.usage;

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
      console.error('[OpenAIProvider] Chat failed:', error);
      throw new Error(`OpenAI chat failed: ${error.response?.data?.error?.message || error.message}`);
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

      const response = await this.axiosInstance.post('/embeddings', {
        model: 'text-embedding-3-small',
        input: text,
      });

      const embedding = response.data.data[0].embedding;

      return {
        embedding,
        dimensions: embedding.length,
        model: 'text-embedding-3-small',
      };
    } catch (error) {
      console.warn('[OpenAIProvider] Embedding failed:', error.message);
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
    const supportsVision = ['gpt-5', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'].includes(
      this.modelName
    );

    const supportsReasoning = ['gpt-5', 'o3-mini', 'o3'].includes(this.modelName);

    return {
      chat: true,
      contentGeneration: true,
      embeddings: true,
      streaming: true,
      vision: supportsVision,
      reasoning: supportsReasoning,
      maxTokens: 8192,
      contextWindow: this.modelName === 'gpt-5' ? 128000 : 128000,
      supportedModels: ['gpt-5', 'gpt-4o', 'gpt-4o-mini', 'o3-mini'],
      pricing: this.pricing,
      offline: false,
    };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.axiosInstance = null;
    await super.cleanup();
  }
}

export default OpenAIProvider;
