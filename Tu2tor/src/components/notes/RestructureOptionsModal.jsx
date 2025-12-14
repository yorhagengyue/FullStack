import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Zap, Clock, Check, Loader2 } from 'lucide-react';

/**
 * Restructure Options Modal
 * Let users choose intensity level when saving AI-restructured notes
 */
const RestructureOptionsModal = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  const [selectedIntensity, setSelectedIntensity] = useState('medium');
  const [options, setOptions] = useState(null);

  useEffect(() => {
    // Pre-defined options (could be fetched from API)
    setOptions({
      intensities: [
        {
          value: 'light',
          label: 'Light',
          description: 'Quick summary with basic structure',
          estimatedTime: '10-15 seconds',
          features: [
            'Brief definitions',
            'One example per concept',
            'Key takeaways',
            'Concise format'
          ],
          icon: Zap
        },
        {
          value: 'medium',
          label: 'Medium',
          description: 'Full concept analysis with knowledge graph',
          estimatedTime: '20-30 seconds',
          features: [
            'Detailed explanations',
            'Multiple examples',
            'Common pitfalls',
            'Related concepts',
            'Structured sections'
          ],
          recommended: true,
          icon: Sparkles
        },
        {
          value: 'deep',
          label: 'Deep',
          description: 'Complete restructuring with supplemental content',
          estimatedTime: '40-60 seconds',
          features: [
            'Comprehensive background',
            'Technical deep dive',
            'Best practices',
            'Multiple use cases',
            'Practice exercises',
            'Further reading',
            'Complete knowledge graph'
          ],
          icon: Sparkles
        }
      ]
    });
  }, []);

  const handleConfirm = () => {
    onConfirm(selectedIntensity);
  };

  if (!isOpen || !options) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">AI-Powered Note Restructuring</h2>
            </div>
            <p className="text-sm text-gray-600">Choose how deeply AI should analyze and restructure your conversation</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {options.intensities.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedIntensity === option.value;
            
            return (
              <motion.button
                key={option.value}
                onClick={() => setSelectedIntensity(option.value)}
                disabled={isProcessing}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all relative overflow-hidden disabled:opacity-50 ${
                  isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                whileHover={!isProcessing ? { scale: 1.01 } : {}}
                whileTap={!isProcessing ? { scale: 0.99 } : {}}
              >
                {/* Recommended Badge */}
                {option.recommended && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                    Recommended
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{option.label}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {option.estimatedTime}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2">
                      {option.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                          <Check className={`w-3 h-3 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'border-green-600 bg-green-600'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Note:</span> You can re-restructure later with a different intensity
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Note
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RestructureOptionsModal;

