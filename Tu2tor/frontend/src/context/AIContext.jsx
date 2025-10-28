import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import aiService from '../ai/services/AIService';
import usageTracker from '../ai/utils/tokenCounter';
import { handleAIError } from '../ai/utils/errorHandler';
import { useToast } from './ToastContext';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const toast = useToast();

  // AI Service state
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [availableProviders, setAvailableProviders] = useState([]);

  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Usage tracking
  const [usageStats, setUsageStats] = useState(usageTracker.getDailyStats());

  // Features enabled flags
  const [aiEnabled, setAiEnabled] = useState({
    chat: import.meta.env.VITE_ENABLE_AI_CHAT === 'true',
    recommendations: import.meta.env.VITE_ENABLE_AI_RECOMMENDATIONS === 'true',
    contentGeneration: import.meta.env.VITE_ENABLE_CONTENT_GENERATION === 'true',
    semanticSearch: import.meta.env.VITE_ENABLE_SEMANTIC_SEARCH === 'true',
  });

  /**
   * Initialize AI service on mount
   */
  useEffect(() => {
    const initAI = async () => {
      try {
        await aiService.initialize();

        const providers = aiService.getProviders();
        setAvailableProviders(providers);

        const activeProvider = aiService.getActiveProviderName();
        setCurrentProvider(activeProvider);

        const mode = aiService.mode;
        setIsOnlineMode(mode === 'online');

        setIsInitialized(true);

        console.log('[AIContext] AI service initialized successfully');
      } catch (error) {
        console.error('[AIContext] Failed to initialize AI service:', error);
        const errorInfo = handleAIError(error);
        toast.error(errorInfo.userMessage);
      }
    };

    initAI();

    // Cleanup on unmount
    return () => {
      aiService.cleanup();
    };
  }, []);

  /**
   * Switch AI provider
   */
  const switchProvider = useCallback(async (providerName) => {
    try {
      setIsProcessing(true);

      const result = await aiService.switchProvider(providerName);

      if (result.success) {
        setCurrentProvider(providerName);
        setIsOnlineMode(result.mode === 'online');

        toast.success(`Switched to ${providerName} ${result.mode === 'online' ? '(Online)' : '(Offline)'}`);

        return result;
      }
    } catch (error) {
      console.error('[AIContext] Failed to switch provider:', error);
      const errorInfo = handleAIError(error, providerName);
      toast.error(errorInfo.userMessage);

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  /**
   * Switch to online mode (Gemini)
   */
  const switchToOnline = useCallback(async () => {
    return await switchProvider('gemini');
  }, [switchProvider]);

  /**
   * Switch to offline mode (Ollama)
   */
  const switchToOffline = useCallback(async () => {
    return await switchProvider('ollama');
  }, [switchProvider]);

  /**
   * Send a chat message
   */
  const sendChatMessage = useCallback(async (message, options = {}) => {
    if (!isInitialized) {
      throw new Error('AI service not initialized');
    }

    try {
      setIsProcessing(true);

      // Add user message to history
      const userMessage = { role: 'user', content: message };
      const updatedHistory = [...chatHistory, userMessage];
      setChatHistory(updatedHistory);

      // Send to AI
      const result = await aiService.chat(updatedHistory, options);

      // Add AI response to history
      const aiMessage = { role: 'assistant', content: result.content };
      const finalHistory = [...updatedHistory, aiMessage];
      setChatHistory(finalHistory);

      // Track usage
      usageTracker.trackRequest(result.provider, result.tokens, result.cost, {
        model: result.model,
      });
      setUsageStats(usageTracker.getDailyStats());

      return result;
    } catch (error) {
      console.error('[AIContext] Chat failed:', error);
      const errorInfo = handleAIError(error, currentProvider);
      toast.error(errorInfo.userMessage);

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, chatHistory, currentProvider, toast]);

  /**
   * Generate content
   */
  const generateContent = useCallback(async (prompt, options = {}) => {
    if (!isInitialized) {
      throw new Error('AI service not initialized');
    }

    try {
      setIsProcessing(true);

      // Check usage limit
      const estimatedTokens = Math.ceil(prompt.length / 4);
      const limitCheck = usageTracker.checkLimit(estimatedTokens);

      if (!limitCheck.allowed) {
        if (limitCheck.wouldExceedDaily) {
          toast.warning('Daily token limit reached. Switching to offline mode...');
          await switchToOffline();
        }
      }

      const result = await aiService.generateContent(prompt, options);

      // Track usage
      usageTracker.trackRequest(result.provider, result.tokens, result.cost, {
        model: result.model,
      });
      setUsageStats(usageTracker.getDailyStats());

      return result;
    } catch (error) {
      console.error('[AIContext] Content generation failed:', error);
      const errorInfo = handleAIError(error, currentProvider);
      toast.error(errorInfo.userMessage);

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, currentProvider, toast, switchToOffline]);

  /**
   * Generate embeddings for semantic search
   */
  const generateEmbedding = useCallback(async (text) => {
    if (!isInitialized) {
      throw new Error('AI service not initialized');
    }

    try {
      return await aiService.embed(text);
    } catch (error) {
      console.error('[AIContext] Embedding generation failed:', error);
      // Don't show toast for embedding errors (they're background operations)
      return null;
    }
  }, [isInitialized]);

  /**
   * Stream chat responses
   */
  const streamChatMessage = useCallback(async (message, onChunk, options = {}) => {
    if (!isInitialized) {
      throw new Error('AI service not initialized');
    }

    try {
      setIsProcessing(true);

      const userMessage = { role: 'user', content: message };
      const updatedHistory = [...chatHistory, userMessage];
      setChatHistory(updatedHistory);

      const result = await aiService.streamChat(updatedHistory, onChunk, options);

      const aiMessage = { role: 'assistant', content: result.content };
      const finalHistory = [...updatedHistory, aiMessage];
      setChatHistory(finalHistory);

      usageTracker.trackRequest(result.provider, result.tokens, result.cost, {
        model: result.model,
      });
      setUsageStats(usageTracker.getDailyStats());

      return result;
    } catch (error) {
      console.error('[AIContext] Stream chat failed:', error);
      const errorInfo = handleAIError(error, currentProvider);
      toast.error(errorInfo.userMessage);

      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, chatHistory, currentProvider, toast]);

  /**
   * Clear chat history
   */
  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  /**
   * Check provider availability
   */
  const checkProviderHealth = useCallback(async (providerName) => {
    try {
      return await aiService.isProviderAvailable(providerName);
    } catch (error) {
      console.error('[AIContext] Health check failed:', error);
      return false;
    }
  }, []);

  /**
   * Get current capabilities
   */
  const getCapabilities = useCallback(() => {
    return aiService.getCapabilities();
  }, []);

  /**
   * Toggle AI feature
   */
  const toggleFeature = useCallback((feature, enabled) => {
    setAiEnabled(prev => ({ ...prev, [feature]: enabled }));
  }, []);

  const value = {
    // State
    isInitialized,
    currentProvider,
    isOnlineMode,
    availableProviders,
    chatHistory,
    isChatOpen,
    isProcessing,
    usageStats,
    aiEnabled,

    // Provider management
    switchProvider,
    switchToOnline,
    switchToOffline,
    checkProviderHealth,
    getCapabilities,

    // Chat operations
    sendChatMessage,
    streamChatMessage,
    clearChatHistory,
    setIsChatOpen,

    // Content generation
    generateContent,
    generateEmbedding,

    // Feature toggles
    toggleFeature,

    // Usage tracking
    usageTracker,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export default AIContext;
