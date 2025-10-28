/**
 * BaseAIProvider - Abstract base class for all AI providers
 *
 * This class defines the interface that all AI providers must implement.
 * It ensures consistent behavior across different AI services (Gemini, Ollama, etc.)
 */

export class BaseAIProvider {
  constructor(config) {
    this.config = config;
    this.providerName = 'base';
    this.isOnline = true; // true for cloud APIs, false for local models
    this.isInitialized = false;
  }

  /**
   * Initialize the AI provider with necessary configurations
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Check if the provider is available and healthy
   * @returns {Promise<{available: boolean, message: string}>}
   */
  async checkHealth() {
    throw new Error('checkHealth() must be implemented by subclass');
  }

  /**
   * Send a chat message and get a response
   * @param {Array<{role: string, content: string}>} messages - Conversation history
   * @param {Object} options - Additional options (temperature, maxTokens, etc.)
   * @returns {Promise<{content: string, tokens: number, cost: number}>}
   */
  async chat(messages, options = {}) {
    throw new Error('chat() must be implemented by subclass');
  }

  /**
   * Generate content based on a prompt
   * @param {string} prompt - The text prompt
   * @param {Object} options - Generation options
   * @returns {Promise<{content: string, tokens: number, cost: number}>}
   */
  async generateContent(prompt, options = {}) {
    throw new Error('generateContent() must be implemented by subclass');
  }

  /**
   * Generate embeddings for semantic search
   * @param {string} text - Text to embed
   * @returns {Promise<{embedding: number[], dimensions: number}>}
   */
  async embed(text) {
    throw new Error('embed() must be implemented by subclass');
  }

  /**
   * Stream a response for real-time chat
   * @param {Array<{role: string, content: string}>} messages - Conversation history
   * @param {Function} onChunk - Callback for each chunk
   * @param {Object} options - Additional options
   * @returns {Promise<{content: string, tokens: number, cost: number}>}
   */
  async streamChat(messages, onChunk, options = {}) {
    throw new Error('streamChat() must be implemented by subclass');
  }

  /**
   * Estimate the cost of a request before making it
   * @param {string} text - Input text
   * @param {Object} options - Request options
   * @returns {Promise<{estimatedTokens: number, estimatedCost: number}>}
   */
  async estimateCost(text, options = {}) {
    throw new Error('estimateCost() must be implemented by subclass');
  }

  /**
   * Get provider capabilities and limits
   * @returns {Object} - Provider metadata
   */
  getCapabilities() {
    return {
      chat: false,
      contentGeneration: false,
      embeddings: false,
      streaming: false,
      maxTokens: 0,
      contextWindow: 0,
      supportedModels: [],
    };
  }

  /**
   * Get current configuration
   * @returns {Object} - Configuration object
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - Updated configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.isInitialized = false;
  }
}

export default BaseAIProvider;
