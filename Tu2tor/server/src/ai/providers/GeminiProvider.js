/**
 * GeminiProvider - Google Gemini AI implementation (Backend)
 *
 * Provides integration with Google's Gemini AI models (Gemini Flash, Gemini Pro)
 * Uses process.env for secure server-side API key storage
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './BaseAIProvider.js';

export class GeminiProvider extends BaseAIProvider {
  constructor(config) {
    super(config);
    this.providerName = 'gemini';
    this.isOnline = true;
    // Use process.env instead of import.meta.env (backend)
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.modelName = config.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.thinkingModelName = config.thinkingModel || process.env.GEMINI_THINKING_MODEL || 'gemini-2.5-pro';
    this.visionModelName = config.visionModel || process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash'; // 支持图片的模型
    this.genAI = null;
    this.model = null;
    this.thinkingModel = null;
    this.visionModel = null; // 新增 vision 模型
    this.embeddingModel = null;

    // Gemini pricing (per 1000 characters)
    this.pricing = {
      'gemini-2.5-flash': {
        input: 0.0003,
        output: 0.0006,
      },
      'gemini-2.5-pro': {
        input: 0.0015,
        output: 0.003,
      },
      'gemini-2.0-flash-exp': {
        input: 0.00025,
        output: 0.0005,
      },
      'gemini-2.0-flash': {
        input: 0.00025,
        output: 0.0005,
      },
      'gemini-exp-1206': {
        input: 0.002,
        output: 0.004,
      },
      'gemini-pro': {
        input: 0.00025,
        output: 0.0005,
      },
    };
  }

  /**
   * Initialize Gemini AI
   */
  async initialize() {
    try {
      console.log('[Backend GeminiProvider] Initializing...', {
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none',
        modelName: this.modelName,
        thinkingModelName: this.thinkingModelName,
        visionModelName: this.visionModelName,
      });

      if (!this.apiKey) {
        throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in server .env');
      }

      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      this.thinkingModel = this.genAI.getGenerativeModel({ model: this.thinkingModelName });
      this.visionModel = this.genAI.getGenerativeModel({ model: this.visionModelName });
      this.embeddingModel = this.genAI.getGenerativeModel({ model: 'embedding-001' });

      this.isInitialized = true;
      console.log('[Backend GeminiProvider] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[Backend GeminiProvider] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check Gemini API health
   */
  async checkHealth() {
    try {
      if (!this.apiKey) {
        return {
          available: false,
          message: 'Gemini API key not configured',
          error: 'Missing API key',
        };
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

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

      // Build config for chat
      const chatConfig = {
        history,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2000,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
        },
      };

      // Add Google Search grounding if enabled
      if (options.enableGrounding) {
        chatConfig.tools = [{
          googleSearch: {}  // New API format for Google Search
        }];
        console.log('[Backend GeminiProvider] Web Search enabled (Google Search) for chat');
      }

      // Start chat with history
      const chat = this.model.startChat(chatConfig);

      // Enhance message with web search instruction if enabled
      let messageToSend = lastMessage.content;
      if (options.enableGrounding) {
        messageToSend = `🌐 You have access to real-time web search. Use it when needed.\n\n${lastMessage.content}`;
      }

      const result = await chat.sendMessage(messageToSend);
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
      console.error('[Backend GeminiProvider] Chat failed:', error);
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

      // Enhance prompt with web search instruction if enabled
      let enhancedPrompt = prompt;
      if (options.enableGrounding) {
        enhancedPrompt = `🌐 You have access to real-time web search via Google Search. Use it when needed for current information.\n\n${prompt}`;
      }

      // Build config for content generation
      const generateConfig = {
        contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2000,
          topP: options.topP || 0.95,
          topK: options.topK || 40,
        },
      };

      // Add Google Search grounding if enabled
      if (options.enableGrounding) {
        generateConfig.tools = [{
          googleSearch: {}  // New API format for Google Search
        }];
        console.log('[Backend GeminiProvider] Web Search enabled (Google Search) for content generation');
      }

      const result = await this.model.generateContent(generateConfig);

      const response = await result.response;
      
      console.log('[Backend GeminiProvider] Response candidates:', response.candidates?.length || 0);
      console.log('[Backend GeminiProvider] Finish reason:', response.candidates?.[0]?.finishReason);
      
      const content = response.text();

      console.log('[Backend GeminiProvider] Generated content length:', content.length);
      if (!content || content.trim() === '') {
        console.warn('[Backend GeminiProvider] Empty content returned!');
        console.log('[Backend GeminiProvider] Prompt length:', prompt.length);
        console.log('[Backend GeminiProvider] Safety ratings:', JSON.stringify(response.candidates?.[0]?.safetyRatings));
      }

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
      console.error('[Backend GeminiProvider] Content generation failed:', error);
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
      console.error('[Backend GeminiProvider] Embedding failed:', error);
      throw new Error(`Gemini embedding failed: ${error.message}`);
    }
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

      // Filter out system messages (Gemini doesn't support system role)
      const filteredMessages = messages.filter(msg => msg.role !== 'system');

      // Convert message history to Gemini format
      const history = filteredMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const lastMessage = filteredMessages[filteredMessages.length - 1];

      // Select model based on thinking mode (both models support vision)
      let modelToUse, modelNameUsed;
      
      if (options.thinkingMode) {
        // Use Pro model for deep thinking (supports images too)
        modelToUse = this.thinkingModel;
        modelNameUsed = this.thinkingModelName;
        console.log('[Backend GeminiProvider] 🧠 Deep Think mode:', modelNameUsed);
      } else {
        // Use Flash model for normal mode (supports images too)
        modelToUse = this.model;
        modelNameUsed = this.modelName;
        console.log('[Backend GeminiProvider] 💬 Normal mode:', modelNameUsed);
      }
      
      // Check if message contains images (for logging)
      const hasImages = lastMessage.files && lastMessage.files.length > 0;
      if (hasImages) {
        console.log('[Backend GeminiProvider] Images detected:', lastMessage.files.length, 'file(s)');
      }

      // Build config for chat
      const chatConfig = {
        history,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2500,
        },
      };

      // Add Google Search grounding if enabled
      if (options.enableGrounding) {
        chatConfig.tools = [{
          googleSearch: {}  // New API format for Google Search
        }];
        console.log('[Backend GeminiProvider] Web Search enabled (Google Search)');
      }

      const chat = modelToUse.startChat(chatConfig);

      // Prepare message content with appropriate system prompt
      let messageContent = lastMessage.content;
      
      if (options.thinkingMode) {
        // Deep Thinking Mode: Structured reasoning prompt
        let thinkingPrompt = `You are Tu2tor AI in Deep Thinking Mode. You MUST follow this EXACT format:

First, write "**Thinking:**" and then show your detailed reasoning process (analyze step by step, consider different approaches, explain your thought process).

Then, write "**Answer:**" and provide your final comprehensive answer.

CRITICAL: You must include BOTH sections. Do not skip the "**Answer:**" section.

Example format:
**Thinking:**
Let me break this down... [your reasoning here]

**Answer:**
Based on my analysis above... [your final answer here]`;

        // Add web search instruction if enabled
        if (options.enableGrounding) {
          thinkingPrompt += `\n\nIMPORTANT: You have access to real-time web search via Google Search. When you need current information, latest news, or facts that may have changed recently, use the Google Search tool to get accurate, up-to-date information. Don't say you cannot access the internet - you can!`;
        }

        thinkingPrompt += `\n\nNow, answer this question following the format above:\n${messageContent}`;
        
        messageContent = thinkingPrompt;
        console.log('[Backend GeminiProvider] Added deep thinking prompt');
      } else {
        // Normal Mode: Educational assistant prompt
        let normalPrompt = `You are Tu2tor AI, a friendly and knowledgeable educational assistant.

**Your Role**:
- Help students learn and understand concepts
- Provide clear, accurate, and helpful explanations
- Be encouraging and supportive
- Use examples when helpful
- Break down complex topics into simpler parts

**Guidelines**:
- Keep responses concise but thorough
- Use appropriate language for the student's level
- Encourage critical thinking
- If you don't know something, say so honestly`;

        // Add web search instruction if enabled
        if (options.enableGrounding) {
          normalPrompt += `\n\n**🌐 Web Search Available**: You have access to real-time web search via Google Search. When students ask about current events, latest information, or facts that may have changed recently, use the Google Search tool to provide accurate, up-to-date information. Don't say you cannot access the internet - you can and should use it when needed!`;
        }

        normalPrompt += `\n\n**Student's Question**: ${messageContent}`;
        
        messageContent = normalPrompt;
        console.log('[Backend GeminiProvider] Added normal mode prompt');
      }

      // Prepare message parts (text + images if any)
      let messageParts;
      if (lastMessage.files && lastMessage.files.length > 0) {
        // Include images in the message
        messageParts = [
          { text: messageContent || 'What do you see in these images?' }
        ];
        
        for (const file of lastMessage.files) {
          // Extract base64 data and mime type
          const matches = file.data.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            
            messageParts.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            });
            
            console.log('[Backend GeminiProvider] 📎 Added image:', mimeType);
          }
        }
        
        const result = await chat.sendMessageStream(messageParts);
        
        // Stream response
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          yield chunkText;
        }
      } else {
        // Text-only message
        const result = await chat.sendMessageStream(messageContent);
        
        // Stream response
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          yield chunkText;
        }
      }
    } catch (error) {
      console.error('[Backend GeminiProvider] Stream chat failed:', error);
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
      vision: false, // Backend doesn't support image processing for now
      maxTokens: 2500,
      contextWindow: 30720,
      supportedModels: ['gemini-2.5-flash', 'gemini-exp-1206', 'gemini-2.0-flash-exp'],
      pricing: this.pricing[this.modelName],
    };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    this.genAI = null;
    this.model = null;
    this.thinkingModel = null;
    this.embeddingModel = null;
    await super.cleanup();
  }
}

export default GeminiProvider;

