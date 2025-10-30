import { useState } from 'react';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import ChatWidget from './ChatWidget';

const AIAssistantButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-40 ${
          isChatOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:shadow-xl hover:scale-110'
        }`}
        aria-label="AI Assistant"
      >
        {isChatOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-white" />
            <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}
      </button>

      {/* Tooltip */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-24 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-40 animate-fade-in pointer-events-none">
          Ask AI Assistant
          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default AIAssistantButton;
