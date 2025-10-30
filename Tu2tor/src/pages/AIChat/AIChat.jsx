import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { ChatService } from '../../ai/services/ChatService';
import aiService from '../../ai/services/AIService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Copy,
  Check,
  Wifi,
  WifiOff,
  Globe,
  HardDrive,
  Paperclip,
  X,
  Image as ImageIcon,
  Download,
  Upload,
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
  const [reasoningEffort, setReasoningEffort] = useState('high'); // low, medium, high
  const [copiedCode, setCopiedCode] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const chatServiceRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null); // For importing conversations

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai_chat_history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
        console.log('[AIChat] Loaded conversation history:', messagesWithDates.length, 'messages');
      } catch (error) {
        console.error('[AIChat] Failed to load conversation history:', error);
      }
    }
  }, []);

  // Save conversation history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('ai_chat_history', JSON.stringify(messages));
        console.log('[AIChat] Saved conversation history:', messages.length, 'messages');
      } catch (error) {
        console.error('[AIChat] Failed to save conversation history:', error);
      }
    }
  }, [messages]);

  // Monitor network status and auto-switch providers
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Optionally: switch back to Gemini when online
      console.log('[AIChat] Network online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Optionally: switch to Ollama when offline
      console.log('[AIChat] Network offline - consider switching to Ollama if available');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Copy code to clipboard
  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Markdown components with styled code blocks
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeId = `code-${Math.random()}`;
      const codeString = String(children).replace(/\n$/, '');

      return !inline && match ? (
        <div className="relative group my-4">
          <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg">
            <span className="text-xs font-mono uppercase">{match[1]}</span>
            <button
              onClick={() => handleCopyCode(codeString, codeId)}
              className="flex items-center space-x-1 text-xs hover:text-white transition-colors"
            >
              {copiedCode === codeId ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
            <code className="text-sm font-mono">{codeString}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-gray-200 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    p({ children }) {
      return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
    },
    ul({ children }) {
      return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
    },
    li({ children }) {
      return <li className="ml-2">{children}</li>;
    },
    h1({ children }) {
      return <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-xl font-bold mb-3 mt-4">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-lg font-bold mb-2 mt-3">{children}</h3>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-primary-500 pl-4 py-1 my-3 italic text-gray-700">
          {children}
        </blockquote>
      );
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 underline"
        >
          {children}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-gray-300">{children}</table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-gray-50">{children}</thead>;
    },
    th({ children }) {
      return <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">{children}</th>;
    },
    td({ children }) {
      return <td className="px-4 py-2 text-sm text-gray-700 border-t border-gray-200">{children}</td>;
    },
  };

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

  // Handle file upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Please select image files only (PNG, JPG, GIF, WebP)');
      return;
    }

    // Limit file size to 4MB each
    const validFiles = imageFiles.filter(file => file.size <= 4 * 1024 * 1024);

    if (validFiles.length !== imageFiles.length) {
      alert(`Some files were too large. Maximum size is 4MB per image.`);
    }

    // Convert to base64
    const filePromises = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            type: file.type,
            data: e.target.result,
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(newFiles => {
      setAttachedFiles(prev => [...prev, ...newFiles]);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isTyping) return;

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
      content: inputMessage.trim() || '(Image attached)',
      files: attachedFiles.length > 0 ? attachedFiles : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setAttachedFiles([]);
    setIsTyping(true);
    setStreamingContent('');

    try {
      let fullContent = '';

      const result = await chatServiceRef.current.streamMessage(
        userMessage, // Pass the complete user message object with files
        user,
        tutors,
        messages, // Pass complete message history with files
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        {
          thinkingMode,
          reasoningEffort // Pass reasoning effort level
        }
      );

      if (result.success) {
        const aiMessage = {
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
          tokens: result.tokens,
          reasoningTokens: result.reasoningTokens, // Add reasoning tokens
          cost: result.cost,
          provider: result.provider,
          model: result.model, // Add model name
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
    if (window.confirm('Clear all messages? This will delete the conversation history.')) {
      setMessages([]);
      setStreamingContent('');
      localStorage.removeItem('ai_chat_history');
      console.log('[AIChat] Cleared conversation history');
    }
  };

  const handleNewChat = () => {
    handleClearChat();
  };

  // Export conversation to JSON file
  const handleExportConversation = () => {
    if (messages.length === 0) {
      alert('No conversation to export');
      return;
    }

    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `tu2tor-chat-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('[AIChat] Exported conversation:', messages.length, 'messages');
  };

  // Import conversation from JSON file
  const handleImportConversation = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = imported.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
        console.log('[AIChat] Imported conversation:', messagesWithDates.length, 'messages');
      } catch (error) {
        console.error('[AIChat] Failed to import conversation:', error);
        alert('Failed to import conversation. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Clear the input
    event.target.value = '';
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
                <h1 className="text-2xl font-bold text-gray-900">Tu2tor Assistant</h1>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  {/* Network Status */}
                  <div className="flex items-center space-x-1">
                    {isOnline ? (
                      <><Wifi className="w-4 h-4 text-green-600" /> <span className="text-green-600">Online</span></>
                    ) : (
                      <><WifiOff className="w-4 h-4 text-red-600" /> <span className="text-red-600">Offline</span></>
                    )}
                  </div>
                  <span>•</span>
                  {/* Provider */}
                  <div className="flex items-center space-x-1">
                    {currentProvider === 'gemini' ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <HardDrive className="w-4 h-4" />
                    )}
                    <span>{currentProvider}</span>
                  </div>
                </div>
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
                onClick={handleExportConversation}
                disabled={messages.length === 0}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export Conversation"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportConversation}
              />
              <button
                onClick={() => importInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Import Conversation"
              >
                <Upload className="w-5 h-5 text-gray-600" />
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
              <div className="text-center space-y-6 mt-20">
                <div className="inline-block">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Hello, {user?.username?.split(' ')[0] || 'there'}
                  </h2>
                  <p className="text-gray-600">
                    Ask me anything about the Tu2tor platform
                  </p>
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
                          {message.role === 'user' ? (
                            <div className="space-y-2">
                              {/* Attached Images */}
                              {message.files && message.files.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {message.files.map((file, idx) => (
                                    <img
                                      key={idx}
                                      src={file.data}
                                      alt={file.name}
                                      className="max-w-xs rounded-lg border-2 border-white/20"
                                    />
                                  ))}
                                </div>
                              )}
                              {/* Text Content */}
                              {message.content && (
                                <p className="text-base whitespace-pre-wrap break-words leading-relaxed">
                                  {message.content}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-base prose prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={MarkdownComponents}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 px-2 flex items-center space-x-3">
                          <span>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {message.reasoningTokens > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <Sparkles className="w-3 h-3 text-purple-500" />
                                <span className="text-purple-600 font-medium">
                                  {message.reasoningTokens.toLocaleString()} reasoning tokens
                                </span>
                              </span>
                            </>
                          )}
                          {message.model && (
                            <>
                              <span>•</span>
                              <span className="text-gray-400">{message.model}</span>
                            </>
                          )}
                        </div>
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
                          <div className="text-base prose prose-sm max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={MarkdownComponents}
                            >
                              {streamingContent}
                            </ReactMarkdown>
                          </div>
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
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                        {thinkingMode && (
                          <div className="flex items-center space-x-1 text-purple-600">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span className="text-xs font-medium">Deep reasoning...</span>
                          </div>
                        )}
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
            {/* Reasoning Mode Toggle */}
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
                    Deep Reasoning
                  </span>
                </div>
              </div>
              {thinkingMode && currentProvider === 'openai' && (
                <div className="flex items-center space-x-2">
                  <select
                    value={reasoningEffort}
                    onChange={(e) => setReasoningEffort(e.target.value)}
                    className="text-xs bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Best)</option>
                  </select>
                  <span className="text-xs text-gray-500">o3</span>
                </div>
              )}
              {thinkingMode && currentProvider === 'gemini' && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Gemini 2.5 Pro
                </span>
              )}
            </div>

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group bg-gray-100 rounded-lg p-2 flex items-center space-x-2 max-w-[200px]"
                  >
                    <img
                      src={file.data}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)}KB</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end space-x-4">
              {/* File Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isTyping}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-600 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
                title="Attach image"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={!isInitialized ? "Initializing..." : "Type your question..."}
                  rows="1"
                  className="w-full resize-none border border-gray-300 rounded-2xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base max-h-40 overflow-y-auto"
                  disabled={isTyping}
                  style={{ minHeight: '56px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isTyping}
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
