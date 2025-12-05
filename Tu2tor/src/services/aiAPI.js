/**
 * Frontend AI API Client
 * 
 * Communicates with backend AI service instead of calling AI providers directly
 * This keeps API keys secure on the server side
 */

import axios from 'axios';

// Use /api prefix for Vite proxy or full URL for production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const AI_API_URL = `${API_BASE_URL}/ai`;

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Create axios instance with auth
const createAuthAxios = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: AI_API_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
};

/**
 * AI API Client
 */
export const aiAPI = {
  /**
   * Stream chat with AI (SSE)
   * @param {Array} messages - Chat history
   * @param {Object} options - Generation options
   * @param {Function} onChunk - Callback for each chunk
   * @param {Function} onComplete - Callback when done
   * @param {Function} onError - Callback for errors
   */
  streamChat: async (messages, options, onChunk, onComplete, onError) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${AI_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, options }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Chat request failed');
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
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6)); // Remove 'data: ' prefix

            if (data.error) {
              onError?.(new Error(data.message || 'Stream error'));
              break;
            }

            if (data.chunk) {
              onChunk?.(data.chunk);
            }

            if (data.done) {
              onComplete?.({
                fullContent: data.fullContent,
                provider: data.provider,
                model: data.model,           // ✨ 新增：传递模型名称
                isThinking: data.isThinking, // ✨ 新增：传递思考模式标记
              });
            }
          } catch (e) {
            console.warn('[aiAPI] Failed to parse SSE message:', e);
          }
        }
      }
    } catch (error) {
      console.error('[aiAPI] Stream chat error:', error);
      onError?.(error);
    }
  },

  /**
   * Generate content (non-streaming)
   */
  generateContent: async (prompt, options = {}) => {
    try {
      const api = createAuthAxios();
      const response = await api.post('/generate', { prompt, options });
      return response.data;
    } catch (error) {
      console.error('[aiAPI] Generate content error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate content');
    }
  },

  /**
   * Detect academic subject from content
   */
  detectSubject: async (content) => {
    try {
      const api = createAuthAxios();
      const response = await api.post('/detect-subject', { content });
      return response.data;
    } catch (error) {
      console.error('[aiAPI] Detect subject error:', error);
      throw new Error(error.response?.data?.message || 'Failed to detect subject');
    }
  },

  /**
   * Generate study note from conversation
   */
  generateNote: async (conversation, subject) => {
    try {
      const api = createAuthAxios();
      const response = await api.post('/generate-note', { conversation, subject });
      return response.data;
    } catch (error) {
      console.error('[aiAPI] Generate note error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate note');
    }
  },

  /**
   * Get available AI providers
   */
  getProviders: async () => {
    try {
      const api = createAuthAxios();
      const response = await api.get('/providers');
      return response.data;
    } catch (error) {
      console.error('[aiAPI] Get providers error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get providers');
    }
  },

  /**
   * Switch AI provider
   */
  switchProvider: async (provider) => {
    try {
      const api = createAuthAxios();
      const response = await api.post('/providers/switch', { provider });
      return response.data;
    } catch (error) {
      console.error('[aiAPI] Switch provider error:', error);
      throw new Error(error.response?.data?.message || 'Failed to switch provider');
    }
  },

  /**
   * Get usage statistics
   */
  getUsage: async () => {
    try {
      const api = createAuthAxios();
      const response = await api.get('/usage');
      return response.data;
    } catch (error) {
      console.error('[aiAPI] Get usage error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get usage statistics');
    }
  },

  /**
   * Health check
   */
  healthCheck: async (provider = null) => {
    try {
      const api = createAuthAxios();
      const url = provider ? `/health?provider=${provider}` : '/health';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('[aiAPI] Health check error:', error);
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  },
};

export default aiAPI;

