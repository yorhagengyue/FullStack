import { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ChatService } from '../../ai/services/ChatService';
import aiService from '../../ai/services/AIService';
import { X, Send, Loader2, Bot, User, Sparkles, Wifi, WifiOff } from 'lucide-react';

const ChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { tutors } = useApp();
  const { isInitialized, currentProvider, isOnlineMode, isProcessing } = useAI();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.username?.split(' ')[0] || 'there'}! 👋 I'm your Tu2tor AI assistant. I can help you find tutors, book sessions, or answer any questions about the platform. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const messagesEndRef = useRef(null);
  const chatServiceRef = useRef(null);

  // Initialize chat service
  useEffect(() => {
    if (isInitialized) {
      chatServiceRef.current = new ChatService(aiService, { tutors });
    }
  }, [isInitialized, tutors]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping || !chatServiceRef.current) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setStreamingContent('');

    try {
      // Use streaming for better UX
      let fullContent = '';

      const result = await chatServiceRef.current.streamMessage(
        userMessage.content,
        user,
        tutors,
        messages.map((m) => ({ role: m.role, content: m.content })),
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
      );

      if (result.success) {
        const aiMessage = {
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
          tokens: result.tokens,
          cost: result.cost,
          provider: result.provider,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Error fallback
        const errorMessage = {
          role: 'assistant',
          content: "Sorry, I encountered an error. Please try again or rephrase your question.",
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('[ChatWidget] Send message error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setStreamingContent('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = chatServiceRef.current?.getSuggestedQuestions(user) || [];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Tu2tor AI Assistant</h3>
            <div className="flex items-center space-x-2 text-xs text-primary-100">
              {isOnlineMode ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>Online • {currentProvider}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline • {currentProvider}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div
              className={`max-w-[75%] ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isTyping && streamingContent && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 text-gray-600">
              <Bot className="w-5 h-5" />
            </div>
            <div className="max-w-[75%]">
              <div className="inline-block px-4 py-2 rounded-2xl bg-gray-100 text-gray-900">
                <p className="text-sm whitespace-pre-wrap break-words">{streamingContent}</p>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && !streamingContent && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200 text-gray-600">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {messages.length === 1 && !isTyping && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Suggested questions:</p>
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="block w-full text-left px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about tutoring..."
            rows="2"
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            disabled={isTyping || !isInitialized}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || !isInitialized}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWidget;
