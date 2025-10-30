import { useState, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { Wifi, WifiOff, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';

const ProviderSelector = () => {
  const {
    currentProvider,
    isOnlineMode,
    availableProviders,
    switchProvider,
    isProcessing,
    getCapabilities,
    isInitialized,
    checkProviderHealth,
  } = useAI();

  const [checking, setChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState({
    gemini: null,
    openai: null,
    ollama: null,
  });

  // Check provider health on mount (only after AI is initialized)
  useEffect(() => {
    if (isInitialized) {
      checkProvidersHealth();
    }
  }, [isInitialized]);

  const checkProvidersHealth = async () => {
    if (!isInitialized) {
      console.warn('[ProviderSelector] AI not initialized yet');
      return;
    }

    try {
      const geminiHealth = await checkProviderHealth('gemini');
      const openaiHealth = await checkProviderHealth('openai');
      const ollamaHealth = await checkProviderHealth('ollama');

      setHealthStatus({
        gemini: geminiHealth,
        openai: openaiHealth,
        ollama: ollamaHealth,
      });

      console.log('[ProviderSelector] Health check:', { geminiHealth, openaiHealth, ollamaHealth });
    } catch (error) {
      console.error('[ProviderSelector] Health check failed:', error);
    }
  };

  const handleSwitchProvider = async (providerName) => {
    try {
      setChecking(true);
      await switchProvider(providerName);
    } catch (error) {
      console.error('[ProviderSelector] Switch failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const capabilities = getCapabilities();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AI Provider</h3>

      <div className="space-y-3">
        {/* Gemini (Online) */}
        <button
          onClick={() => handleSwitchProvider('gemini')}
          disabled={checking || isProcessing}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            currentProvider === 'gemini'
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          } ${checking || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentProvider === 'gemini'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Wifi className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">Gemini</h4>
                  {currentProvider === 'gemini' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Online</p>
              </div>
            </div>
          </div>
        </button>

        {/* OpenAI (Online) */}
        <button
          onClick={() => handleSwitchProvider('openai')}
          disabled={checking || isProcessing}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            currentProvider === 'openai'
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          } ${checking || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentProvider === 'openai'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Wifi className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">OpenAI</h4>
                  {currentProvider === 'openai' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Online</p>
              </div>
            </div>
          </div>
        </button>

        {/* Ollama (Offline) */}
        <button
          onClick={() => handleSwitchProvider('ollama')}
          disabled={checking || isProcessing || !healthStatus.ollama?.available}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            currentProvider === 'ollama'
              ? 'border-primary-600 bg-primary-50'
              : healthStatus.ollama?.available
              ? 'border-gray-200 hover:border-primary-300 bg-white'
              : 'border-red-200 bg-red-50'
          } ${checking || isProcessing || !healthStatus.ollama?.available ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentProvider === 'ollama'
                    ? 'bg-primary-600 text-white'
                    : healthStatus.ollama?.available
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">Ollama</h4>
                  {currentProvider === 'ollama' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                  {!healthStatus.ollama?.available && healthStatus.ollama && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {healthStatus.ollama?.available ? 'Local' : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {checking && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center space-x-3">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          <p className="text-sm text-primary-700">Switching provider...</p>
        </div>
      )}

      {/* Current Status */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Current Mode:</span>
          <span className="font-medium text-gray-900">
            {isOnlineMode ? (
              <span className="flex items-center space-x-1 text-green-600">
                <Wifi className="w-4 h-4" />
                <span>Online</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-blue-600">
                <WifiOff className="w-4 h-4" />
                <span>Offline</span>
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={checkProvidersHealth}
        disabled={checking}
        className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm font-medium text-gray-700"
      >
        <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>
  );
};

export default ProviderSelector;
