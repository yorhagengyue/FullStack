/**
 * OllamaProvider - Local Ollama AI implementation
 *
 * Provides integration with locally-hosted Ollama models
 * Ollama allows running LLMs locally for privacy and offline use
 */

import axios from 'axios';
import { BaseAIProvider } from './BaseAIProvider';

export class OllamaProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.providerName = 'ollama';
    this.isOnline = false; // Local provider, works offline
    this.baseUrl = config.baseUrl || import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
    this.modelName = config.model || import.meta.env.VITE_OLLAMA_MODEL || 'llama2';
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000, // 60 seconds timeout for local processing
    });

    // Ollama is free (local), so cost is always 0
    this.pricing = {
      input: 0,
      output: 0,
    };
  }

  /**
   * Initialize Ollama connection
   */
  async initialize() {
    try {
      // Check if Ollama server is running
      const health = await this.checkHealth();
      if (!health.available) {
        throw new Error('Ollama server is not running. Please start Ollama and ensure the model is pulled.');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[OllamaProvider] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check Ollama server health and model availability
   */
  async checkHealth() {
    try {
      // Try to connect to Ollama API
      const response = await this.axiosInstance.get('/api/tags', {
        timeout: 5000,
      });

      const models = response.data.models || [];
      const modelExists = models.some(m => m.name.includes(this.modelName));

      if (!modelExists && models.length > 0) {
        // Model not found, but others exist - suggest first available
        return {
          available: false,
          message: `Model '${this.modelName}' not found. Available models: ${models.map(m => m.name).join(', ')}`,
          suggestedModel: models[0].name,
          installedModels: models.map(m => m.name),
        };
      }

      if (models.length === 0) {
        return {
          available: false,
          message: 'Ollama is running but no models are installed. Run: ollama pull llama2',
          installedModels: [],
        };
      }

      return {
        available: true,
        message: 'Ollama server is healthy',
        model: this.modelName,
        installedModels: models.map(m => m.name),
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        return {
          available: false,
          message: 'Ollama server is not running. Please start Ollama: https://ollama.ai',
          error: 'CONNECTION_REFUSED',
        };
      }

      return {
        available: false,
        message: error.message || 'Ollama health check failed',
        error: error.toString(),
      };
    }
  }

  /**
   * Chat with Ollama
   */
  async chat(messages, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Convert messages to Ollama format
      const ollamaMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.axiosInstance.post('/api/chat', {
        model: this.modelName,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2000,
          top_p: options.topP || 0.9,
          top_k: options.topK || 40,
        },
      });

      const content = response.data.message.content;

      // Estimate tokens (rough approximation)
      const inputChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
      const outputChars = content.length;
      const totalTokens = Math.ceil((inputChars + outputChars) / 4);

      return {
        content,
        tokens: totalTokens,
        cost: 0, // Ollama is free
        provider: this.providerName,
        model: this.modelName,
        evalCount: response.data.eval_count || 0,
        evalDuration: response.data.eval_duration || 0,
      };
    } catch (error) {
      console.error('[OllamaProvider] Chat failed:', error);

      if (error.response?.status === 404) {
        throw new Error(`Model '${this.modelName}' not found. Run: ollama pull ${this.modelName}`);
      }

      throw new Error(`Ollama chat failed: ${error.message}`);
    }
  }

  /**
   * Generate content with Ollama
   */
  async generateContent(prompt, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await this.axiosInstance.post('/api/generate', {
        model: this.modelName,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2000,
          top_p: options.topP || 0.9,
          top_k: options.topK || 40,
        },
      });

      const content = response.data.response;

      // Estimate tokens
      const inputChars = prompt.length;
      const outputChars = content.length;
      const totalTokens = Math.ceil((inputChars + outputChars) / 4);

      return {
        content,
        tokens: totalTokens,
        cost: 0, // Ollama is free
        provider: this.providerName,
        model: this.modelName,
      };
    } catch (error) {
      console.error('[OllamaProvider] Content generation failed:', error);
      throw new Error(`Ollama content generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embeddings with Ollama
   */
  async embed(text) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Use a specialized embedding model if available
      const embeddingModel = 'mxbai-embed-large'; // Popular embedding model for Ollama

      const response = await this.axiosInstance.post('/api/embeddings', {
        model: embeddingModel,
        prompt: text,
      });

      const embedding = response.data.embedding;

      return {
        embedding,
        dimensions: embedding.length,
        model: embeddingModel,
      };
    } catch (error) {
      console.warn('[OllamaProvider] Embedding failed, model may not be installed:', error.message);

      // Return null embedding if model not available
      return {
        embedding: null,
        dimensions: 0,
        model: 'none',
        error: `Embedding model not available. Run: ollama pull mxbai-embed-large`,
      };
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

      const ollamaMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.axiosInstance.post(
        '/api/chat',
        {
          model: this.modelName,
          messages: ollamaMessages,
          stream: true,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.maxTokens || 2000,
          },
        },
        {
          responseType: 'stream',
        }
      );

      let fullContent = '';

      // Handle streaming response
      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          try {
            const lines = chunk.toString().split('\n').filter(Boolean);
            lines.forEach((line) => {
              const data = JSON.parse(line);
              if (data.message?.content) {
                const content = data.message.content;
                fullContent += content;
                onChunk(content);
              }
            });
          } catch (err) {
            console.error('[OllamaProvider] Stream parsing error:', err);
          }
        });

        response.data.on('end', () => {
          const inputChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
          const totalTokens = Math.ceil((inputChars + fullContent.length) / 4);

          resolve({
            content: fullContent,
            tokens: totalTokens,
            cost: 0,
            provider: this.providerName,
            model: this.modelName,
          });
        });

        response.data.on('error', (error) => {
          reject(new Error(`Ollama stream failed: ${error.message}`));
        });
      });
    } catch (error) {
      console.error('[OllamaProvider] Stream chat failed:', error);
      throw new Error(`Ollama stream chat failed: ${error.message}`);
    }
  }

  /**
   * Estimate cost (always 0 for Ollama)
   */
  async estimateCost(text, options = {}) {
    const chars = text.length;
    const tokens = Math.ceil(chars / 4);

    return {
      estimatedTokens: tokens,
      estimatedCost: 0, // Ollama is free
      pricePerKChars: this.pricing,
    };
  }

  /**
   * Get Ollama capabilities
   */
  getCapabilities() {
    return {
      chat: true,
      contentGeneration: true,
      embeddings: true,
      streaming: true,
      vision: false, // Not supported yet
      maxTokens: 4096, // Depends on model
      contextWindow: 4096, // Depends on model
      supportedModels: ['llama2', 'mistral', 'codellama', 'neural-chat', 'starling-lm'],
      pricing: this.pricing,
      offline: true, // Works without internet
    };
  }

  /**
   * Pull a new model from Ollama
   */
  async pullModel(modelName) {
    try {
      console.log(`[OllamaProvider] Pulling model: ${modelName}`);

      const response = await this.axiosInstance.post('/api/pull', {
        name: modelName,
        stream: false,
      });

      return {
        success: true,
        model: modelName,
        message: `Model ${modelName} pulled successfully`,
      };
    } catch (error) {
      console.error('[OllamaProvider] Model pull failed:', error);
      return {
        success: false,
        model: modelName,
        error: error.message,
      };
    }
  }

  /**
   * List all installed models
   */
  async listModels() {
    try {
      const response = await this.axiosInstance.get('/api/tags');
      return response.data.models || [];
    } catch (error) {
      console.error('[OllamaProvider] List models failed:', error);
      return [];
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.axiosInstance = null;
    await super.cleanup();
  }
}

export default OllamaProvider;
