import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { ChatService } from '../../ai/services/ChatService';
import aiService from '../../ai/services/AIService';
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Settings,
  MessageSquare,
  Trash2,
  Plus,
} from 'lucide-react';
import ProviderSelector from '../../components/ai/ProviderSelector';
import UsageMonitor from '../../components/ai/UsageMonitor';

const AIChat = () => {
  const { user } = useAuth();
  const { tutors } = useApp();
  const { isInitialized, currentProvider, isOnlineMode } = useAI();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);

  const messagesEndRef = useRef(null);
  const chatServiceRef = useRef(null);
  const textareaRef = useRef(null);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    // Initialize chat service if not already done
    if (!chatServiceRef.current && isInitialized) {
      chatServiceRef.current = new ChatService(aiService, { tutors });
    }

    if (!chatServiceRef.current) {
      alert('AI service is still initializing. Please wait a moment and try again.');
      return;
    }

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
      let fullContent = '';

      const result = await chatServiceRef.current.streamMessage(
        userMessage.content,
        user,
        tutors,
        messages.map((m) => ({ role: m.role, content: m.content })),
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        { thinkingMode } // Pass thinking mode option
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
        const errorMessage = {
          role: 'assistant',
          content: "Sorry, I encountered an error. Please try again or rephrase your question.",
          timestamp: new Date(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('[AIChat] Send message error:', error);
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

  const handleClearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      setStreamingContent('');
    }
  };

  const handleNewChat = () => {
    handleClearChat();
  };

  const suggestedQuestions = chatServiceRef.current?.getSuggestedQuestions(user) || [
    "What subjects can I get help with?",
    "How do I book a tutoring session?",
    "How does the credit system work?",
    "Can you recommend a tutor for me?",
    "What are the most popular subjects?",
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tu2tor AI Assistant</h1>
                <p className="text-sm text-gray-600">
                  {isOnlineMode ? '🟢' : '🔵'} {currentProvider} • {isOnlineMode ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleNewChat}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="New Chat"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleClearChat}
                disabled={messages.length === 0}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear Chat"
              >
                <Trash2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="text-center space-y-8">
                <div className="inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Hi, {user?.username?.split(' ')[0] || 'there'}! 👋
                  </h2>
                  <p className="text-gray-600 text-lg">
                    I'm your AI assistant for the Tu2tor platform. How can I help you today?
                  </p>
                </div>

                {/* Suggested Questions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                  {suggestedQuestions.slice(0, 6).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary-50 hover:to-purple-50 border border-gray-200 hover:border-primary-300 rounded-xl text-left transition-all group"
                    >
                      <MessageSquare className="w-5 h-5 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm text-gray-900 font-medium">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-primary-600'
                          : 'bg-gradient-to-r from-primary-600 to-purple-600'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-6 h-6 text-white" />
                      ) : (
                        <Bot className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`inline-block max-w-full ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`px-6 py-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-primary-600 text-white'
                              : message.isError
                              ? 'bg-red-50 text-red-900 border border-red-200'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-base whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 px-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Streaming message */}
                {isTyping && streamingContent && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-primary-600 to-purple-600">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block max-w-full">
                        <div className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-900">
                          <p className="text-base whitespace-pre-wrap break-words leading-relaxed">
                            {streamingContent}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Typing indicator */}
                {isTyping && !streamingContent && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-primary-600 to-purple-600">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-gray-100">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Thinking Mode Toggle */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setThinkingMode(!thinkingMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    thinkingMode ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      thinkingMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div className="flex items-center space-x-2">
                  <Sparkles className={`w-4 h-4 ${thinkingMode ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${thinkingMode ? 'text-primary-600' : 'text-gray-600'}`}>
                    深度思考模式
                  </span>
                </div>
              </div>
              {thinkingMode && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  使用 Gemini 2.5 Pro
                </span>
              )}
            </div>

            <div className="flex items-end space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={!isInitialized ? "AI is initializing..." : "Ask me anything about tutoring..."}
                  rows="1"
                  className="w-full resize-none border border-gray-300 rounded-2xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base max-h-40 overflow-y-auto"
                  disabled={isTyping}
                  style={{ minHeight: '56px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="w-14 h-14 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors flex items-center justify-center flex-shrink-0"
              >
                {isTyping ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      {showSettings && (
        <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <ProviderSelector />
          <UsageMonitor />
        </div>
      )}
    </div>
  );
};

export default AIChat;
