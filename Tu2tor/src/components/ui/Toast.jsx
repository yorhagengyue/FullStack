import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';

const Toast = ({ isOpen, onClose, message, type = 'success', duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const typeConfig = {
    success: {
      icon: Check,
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    },
    error: {
      icon: X,
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500',
      textColor: 'text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-6 left-1/2 z-[200] pointer-events-auto"
        >
          <div className={`${config.bgColor} ${config.textColor} rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px]`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm flex-1">{message}</span>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

