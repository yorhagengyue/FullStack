import { useState } from 'react';
import { useAI } from '../../context/AIContext';
import { Wifi, WifiOff, Loader2, Check, AlertCircle } from 'lucide-react';

const ProviderSelector = () => {
  const {
    currentProvider,
    isOnlineMode,
    availableProviders,
    switchProvider,
    isProcessing,
    getCapabilities,
  } = useAI();

  const [checking, setChecking] = useState(false);

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
                  <h4 className="font-semibold text-gray-900">Google Gemini</h4>
                  {currentProvider === 'gemini' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Online • Fast & powerful responses
                </p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                  <span>Chat ✓</span>
                  <span>Embeddings ✓</span>
                  <span>Streaming ✓</span>
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Ollama (Offline) */}
        <button
          onClick={() => handleSwitchProvider('ollama')}
          disabled={checking || isProcessing}
          className={`w-full p-4 rounded-lg border-2 transition-all ${
            currentProvider === 'ollama'
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          } ${checking || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentProvider === 'ollama'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <WifiOff className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">Ollama</h4>
                  {currentProvider === 'ollama' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Offline • Private & free
                </p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                  <span>Chat ✓</span>
                  <span>Local ✓</span>
                  <span>Free ✓</span>
                </div>
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

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          {isOnlineMode
            ? 'Using online AI requires internet connection and may incur costs.'
            : 'Offline mode requires Ollama to be installed and running on your computer.'}
        </p>
      </div>
    </div>
  );
};

export default ProviderSelector;
