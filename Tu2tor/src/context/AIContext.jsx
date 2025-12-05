/**
 * AIContext - Simplified for Backend API
 * 
 * This context now acts as a thin wrapper around the backend AI API
 * instead of managing local AI providers
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Initialize - Check backend AI service health
   */
  useEffect(() => {
    const initAI = async () => {
      try {
        // Import aiAPI dynamically
        const { default: aiAPI } = await import('../services/aiAPI.js');
        
        // Check backend health
        const healthResponse = await aiAPI.healthCheck();
        
        if (healthResponse.success && healthResponse.health) {
          setIsInitialized(true);
          console.log('[AIContext] Backend AI service ready');
          
          // Get available providers
          try {
            const providersResponse = await aiAPI.getProviders();
            if (providersResponse.success) {
              setAvailableProviders(providersResponse.providers || []);
              setCurrentProvider(providersResponse.activeProvider || 'gemini');
            }
          } catch (err) {
            console.warn('[AIContext] Could not fetch providers:', err.message);
          }
        }
      } catch (error) {
        console.error('[AIContext] Failed to initialize:', error);
        toast?.error('AI service unavailable. Please check server connection.');
      }
    };

    initAI();
  }, [toast]);

  /**
   * Switch AI provider
   */
  const switchProvider = useCallback(async (providerName) => {
    try {
      setIsProcessing(true);
      
      const { default: aiAPI } = await import('../services/aiAPI.js');
      const result = await aiAPI.switchProvider(providerName);

      if (result.success) {
        setCurrentProvider(providerName);
        toast?.success(`Switched to ${providerName}`);
        return result;
      }
    } catch (error) {
      console.error('[AIContext] Failed to switch provider:', error);
      toast?.error(error.message || 'Failed to switch provider');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  /**
   * Check provider health
   */
  const checkProviderHealth = useCallback(async (providerName) => {
    try {
      const { default: aiAPI } = await import('../services/aiAPI.js');
      const result = await aiAPI.healthCheck(providerName);
      
      if (result.success && result.health) {
        return result.health[providerName] || result.health;
      }
      return { available: false, message: 'Health check failed' };
    } catch (error) {
      console.error('[AIContext] Health check failed:', error);
      return { available: false, message: error.message };
    }
  }, []);

  /**
   * Get capabilities (simplified - returns basic info)
   */
  const getCapabilities = useCallback(() => {
    return {
      chat: true,
      streaming: true,
      providers: availableProviders.length,
    };
  }, [availableProviders]);

  /**
   * Get usage statistics
   */
  const getUsageStats = useCallback(async () => {
    try {
      const { default: aiAPI } = await import('../services/aiAPI.js');
      const result = await aiAPI.getUsage();
      return result;
    } catch (error) {
      console.error('[AIContext] Failed to get usage stats:', error);
      return null;
    }
  }, []);

  const value = {
    // State
    isInitialized,
    currentProvider,
    availableProviders,
    isProcessing,
    isOnlineMode: true, // Backend is always "online"
    
    // Actions
    switchProvider,
    checkProviderHealth,
    getCapabilities,
    getUsageStats,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export default AIContext;
