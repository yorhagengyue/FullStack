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
  Trash2,
  Plus,
  Copy,
  Check,
  Paperclip,
  X,
  Download,
  Upload,
  Zap
} from 'lucide-react';
import ProviderSelector from '../../components/ai/ProviderSelector';
import UsageMonitor from '../../components/ai/UsageMonitor';

const AIChat = () => {
  const { user } = useAuth();
  const { tutors } = useApp();
  const { isInitialized } = useAI();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [reasoningEffort, setReasoningEffort] = useState('high'); 
  const [copiedCode, setCopiedCode] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const messagesEndRef = useRef(null);
  const chatServiceRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('ai_chat_history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeId = `code-${Math.random()}`;
      const codeString = String(children).replace(/\n$/, '');

      return !inline && match ? (
        <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-800">
          <div className="flex items-center justify-between bg-gray-900 text-gray-400 px-4 py-2 text-xs">
            <span className="font-mono uppercase">{match[1]}</span>
            <button onClick={() => handleCopyCode(codeString, codeId)} className="flex items-center gap-1 hover:text-white">
              {copiedCode === codeId ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <pre className="bg-[#0d1117] text-gray-300 p-4 overflow-x-auto m-0">
            <code className="text-sm font-mono">{codeString}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-gray-100 text-pink-500 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    // ... other components can be simplified or kept as is, styling handled by tailwind prose
  };

  useEffect(() => {
    if (isInitialized) {
      chatServiceRef.current = new ChatService(aiService, { tutors });
    }
  }, [isInitialized, tutors]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles = [];
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        const filePromises = imageFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ name: file.name, type: file.type, data: e.target.result, size: file.size });
            reader.readAsDataURL(file);
          });
        });

        const newFiles = await Promise.all(filePromises);
        setAttachedFiles(prev => [...prev, ...newFiles]);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    const filePromises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ name: file.name, type: file.type, data: e.target.result, size: file.size });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(newFiles => setAttachedFiles(prev => [...prev, ...newFiles]));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachedFiles.length === 0) || isTyping) return;
    if (!chatServiceRef.current && isInitialized) chatServiceRef.current = new ChatService(aiService, { tutors });
    if (!chatServiceRef.current) return;

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
        userMessage, user, tutors, messages,
        (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        { thinkingMode, reasoningEffort }
      );

      if (result.success) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
          // ... other meta
        }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I encountered an error.", timestamp: new Date(), isError: true }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Connection error.", timestamp: new Date(), isError: true }]);
    } finally {
      setIsTyping(false);
      setStreamingContent('');
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([]);
      localStorage.removeItem('ai_chat_history');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F5F9] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1600px] bg-white rounded-[40px] shadow-xl shadow-gray-200/50 overflow-hidden flex h-[85vh]">
        
      {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
        {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Tutor Assistant</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online & Ready
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setThinkingMode(!thinkingMode)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${thinkingMode ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <Zap className={`w-3 h-3 ${thinkingMode ? 'fill-current' : ''}`} />
                Deep Think
              </button>
              <button onClick={handleClearChat} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
          </div>
        </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <Sparkles className="w-16 h-16 text-violet-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How can I help you today?</h2>
                <p className="text-gray-500 max-w-md">I can help you solve complex problems, explain concepts, or generate code snippets for your projects.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-900' : 'bg-violet-100'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-violet-600" />}
                    </div>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-6 py-4 rounded-[24px] text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gray-900 text-white rounded-tr-none' 
                        : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      {msg.files?.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap justify-end">
                          {msg.files.map((f, i) => (
                            <img key={i} src={f.data} alt="attachment" className="w-20 h-20 object-cover rounded-lg border-2 border-white/20" />
                                  ))}
                                </div>
                              )}
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#0d1117] prose-pre:rounded-xl">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                            {msg.content}
                              </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 mx-2">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                    </div>
                <div className="bg-gray-50 px-6 py-4 rounded-[24px] rounded-tl-none border border-gray-100 max-w-[80%]">
                  {streamingContent ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                              {streamingContent}
                            </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex gap-1 h-5 items-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                          </div>
                        )}
                      </div>
              </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto relative bg-gray-50 p-2 rounded-[32px] border border-gray-200 focus-within:border-violet-300 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-violet-100/50 transition-all duration-300">
            {attachedFiles.length > 0 && (
                <div className="flex gap-2 px-4 pt-2 pb-0">
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="relative group">
                      <img src={f.data} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                      <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

              <div className="flex items-end gap-2">
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors mb-1 ml-1">
                <Paperclip className="w-5 h-5" />
              </button>

                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-4 max-h-32 text-gray-700 placeholder-gray-400"
                  rows={1}
                />
                
              <button
                onClick={handleSendMessage}
                disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isTyping}
                  className="p-3 bg-gray-900 text-white rounded-full hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-1 mr-1 shadow-md"
              >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
              </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">AI can make mistakes. Check important info.</p>
      </div>

          {/* Settings Panel Overlay */}
      {showSettings && (
            <div className="absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-xl border-l border-gray-200 shadow-2xl p-6 z-20 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900">Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <ProviderSelector />
              <div className="mt-8">
          <UsageMonitor />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
