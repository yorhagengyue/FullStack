import { createContext, useContext, useState } from 'react';
import Toast from '../components/common/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [recentMessages, setRecentMessages] = useState(new Map());

  const addToast = (message, type = 'info', duration = 3000) => {
    // 防重复：检查相同消息是否在最近 2 秒内显示过
    const now = Date.now();
    const messageKey = `${type}-${message}`;
    const lastShown = recentMessages.get(messageKey);
    
    if (lastShown && now - lastShown < 2000) {
      return; // 跳过重复消息
    }

    // 记录此消息的显示时间
    setRecentMessages((prev) => {
      const newMap = new Map(prev);
      newMap.set(messageKey, now);
      return newMap;
    });

    // 清理过期的消息记录（超过 5 秒）
    setTimeout(() => {
      setRecentMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(messageKey);
        return newMap;
      });
    }, 5000);

    const id = now;
    setToasts((prev) => {
      // 限制同时显示的 toast 数量为 3 个
      const newToasts = [...prev, { id, message, type, duration }];
      if (newToasts.length > 3) {
        return newToasts.slice(-3); // 只保留最新的 3 个
      }
      return newToasts;
    });
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
