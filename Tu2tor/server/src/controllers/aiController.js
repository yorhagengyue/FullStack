/**
 * AI Controller (Updated)
 * Handles AI-related API requests securely from backend
 * Uses the new modular AI service architecture
 */

import aiService from '../ai/services/AIService.js';

/**
 * Initialize AI service (called once on server start)
 */
export const initializeAI = async (req, res) => {
  try {
    await aiService.initialize();
    res.json({
      success: true,
      message: 'AI service initialized successfully',
      providers: aiService.getProviders(),
      activeProvider: aiService.getActiveProviderName(),
    });
  } catch (error) {
    console.error('[AI Controller] Initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize AI service',
      message: error.message,
    });
  }
};

/**
 * Generate content using AI (non-streaming)
 */
export const generateContent = async (req, res) => {
  try {
    const { prompt, options } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    console.log('[AI Controller] Generating content for user:', req.user?._id);
    console.log('[AI Controller] Prompt length:', prompt.length, 'chars');

    const result = await aiService.generateContent(prompt, options);

    console.log('[AI Controller] Result keys:', Object.keys(result));
    console.log('[AI Controller] Has content:', !!result.content);
    console.log('[AI Controller] Content length:', result.content?.length || 0);

    const response = {
      success: true,
      ...result,
    };

    console.log('[AI Controller] Sending response keys:', Object.keys(response));

    res.json(response);
  } catch (error) {
    console.error('[AI Controller] Generate content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content',
      message: error.message,
    });
  }
};

/**
 * Chat with AI (streaming via SSE)
 */
export const chat = async (req, res) => {
  try {
    const { messages, options } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array is required' });
    }

    console.log('[AI Controller] Streaming chat for user:', req.user?._id);
    console.log('[AI Controller] Thinking mode:', !!options?.thinkingMode);

    // Set up SSE (Server-Sent Events) for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    let fullContent = '';

    try {
      // Stream from AI service
      for await (const chunk of aiService.streamChat(messages, options)) {
        fullContent += chunk;

        // Send chunk to client
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // Get current model details
      const modelInfo = aiService.getCurrentModel(options);

      // Send completion signal
      res.write(`data: ${JSON.stringify({
        done: true,
        fullContent,
        provider: aiService.getActiveProviderName(),
        model: modelInfo.model,
        isThinking: modelInfo.isThinking,
      })}\n\n`);

      res.end();
    } catch (streamError) {
      console.error('[AI Controller] Streaming error:', streamError);
      res.write(`data: ${JSON.stringify({
        error: 'Streaming failed',
        message: streamError.message,
      })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('[AI Controller] Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to process chat',
        message: error.message,
      });
    }
  }
};

/**
 * Detect academic subject from content (for study notes)
 */
export const detectSubject = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const prompt = `Analyze the following text and determine if it's related to academic study.
If yes, identify the subject/topic and return JSON with:
{
  "isStudyRelated": boolean,
  "subject": string or null,
  "confidence": number (0-100)
}

Text: ${content}`;

    const result = await aiService.generateContent(prompt, { temperature: 0.3, maxTokens: 200 });

    // Extract JSON from response
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const detection = JSON.parse(jsonMatch[0]);
      res.json({
        success: true,
        ...detection,
      });
    } else {
      res.json({
        success: true,
        isStudyRelated: false,
        subject: null,
        confidence: 0,
      });
    }
  } catch (error) {
    console.error('[AI Controller] Subject detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect subject',
      message: error.message,
    });
  }
};

/**
 * Generate study note from conversation
 */
export const generateNote = async (req, res) => {
  try {
    const { conversation, subject } = req.body;

    if (!conversation) {
      return res.status(400).json({ success: false, error: 'Conversation is required' });
    }

    const prompt = `Generate a structured study note from the following conversation.

Subject: ${subject || 'Unknown'}

Conversation:
${conversation}

Generate a note with:
1. Title
2. Key Concepts
3. Summary
4. Important Points

Format as markdown.`;

    const result = await aiService.generateContent(prompt, { temperature: 0.5, maxTokens: 1000 });

    res.json({
      success: true,
      note: result.content,
      tokens: result.tokens,
      cost: result.cost,
    });
  } catch (error) {
    console.error('[AI Controller] Note generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate note',
      message: error.message,
    });
  }
};

/**
 * Get available AI providers
 */
export const getProviders = async (req, res) => {
  try {
    const providers = aiService.getProviders();
    res.json({
      success: true,
      providers,
      activeProvider: aiService.getActiveProviderName(),
    });
  } catch (error) {
    console.error('[AI Controller] Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get providers',
      message: error.message,
    });
  }
};

/**
 * Switch AI provider
 */
export const switchProvider = async (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({ success: false, error: 'Provider name is required' });
    }

    const result = await aiService.switchProvider(provider);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[AI Controller] Switch provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to switch provider',
      message: error.message,
    });
  }
};

/**
 * Get AI usage statistics
 */
export const getUsage = async (req, res) => {
  try {
    const stats = aiService.getUsageStats();
    res.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    console.error('[AI Controller] Get usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage statistics',
      message: error.message,
    });
  }
};

/**
 * Health check for AI service
 */
export const healthCheck = async (req, res) => {
  try {
    const { provider } = req.query;
    const health = await aiService.checkHealth(provider || null);

    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AI Controller] Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
    });
  }
};
