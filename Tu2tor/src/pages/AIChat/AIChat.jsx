import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
// Old AI services removed - now using backend API via aiAPI
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
  Zap,
  BookOpen,
  Save
} from 'lucide-react';
import ProviderSelector from '../../components/ai/ProviderSelector';
import UsageMonitor from '../../components/ai/UsageMonitor';
import { studyNotesAPI } from '../../services/api';
import { detectAcademicSubject, generateStudyNote, shouldSaveAsStudyNote, getConversationId } from '../../utils/studyNoteHelper';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';
import ShinyText from '../../components/reactbits/ShinyText/ShinyText';
import Magnet from '../../components/reactbits/Magnet/Magnet';
import ShuffleText from '../../components/reactbits/ShuffleText/ShuffleText';
import PillNav from '../../components/reactbits/PillNav/PillNav';
import ThinkingDisplay from '../../components/ai/ThinkingDisplay';

const AIChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tutors } = useApp();
  const { isInitialized } = useAI();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingThinking, setStreamingThinking] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [reasoningEffort, setReasoningEffort] = useState('high'); 
  const [copiedCode, setCopiedCode] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [detectedSubject, setDetectedSubject] = useState(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const messagesEndRef = useRef(null);
  const chatServiceRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);
  const lastSavedMessageCount = useRef(0);

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
        
        // Check if we should prompt to save as study note (using AI detection)
        if (messages.length >= 2 && messages.length > lastSavedMessageCount.current) {
          const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
          if (lastUserMessage && messages[messages.length - 1].role === 'assistant') {
            // Use AI to detect if this is a study-related question
            detectAcademicSubject(lastUserMessage.content).then(subject => {
              if (subject) {
                setDetectedSubject(subject);
                setShowSavePrompt(true);
              }
            }).catch(err => {
              // Silently ignore if AI service is not ready yet
              console.log('[AIChat] Subject detection skipped:', err.message);
            });
          }
        }
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

  // ChatService initialization removed - now using backend API directly

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

    console.log('[AIChat] ========== SENDING MESSAGE (Backend API) ==========');
    console.log('[AIChat] Thinking Mode:', thinkingMode);
    console.log('[AIChat] Message:', inputMessage.trim());
    console.log('[AIChat] =======================================================');

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
    setStreamingThinking('');

    try {
      // Import aiAPI
      const { default: aiAPI } = await import('../../services/aiAPI.js');
      
      let fullContent = '';
      let fullThinking = '';
      let isInThinkingSection = false;
      let hasFoundAnswerMarker = false;
      
      // Call backend API for streaming chat
      await aiAPI.streamChat(
        [...messages, userMessage],
        { 
          thinkingMode, 
          reasoningEffort,
          temperature: 0.7,
          maxTokens: thinkingMode ? 2500 : 2000,
        },
        (chunk) => {
          fullContent += chunk;
          
          // In thinking mode, parse in real-time
          if (thinkingMode) {
            // Check if we're entering thinking section
            if (!isInThinkingSection && /\*\*Thinking:\*\*/i.test(chunk)) {
              isInThinkingSection = true;
              console.log('[AIChat] ✓ Detected Thinking section start');
            }
            
            // Check if we're entering answer section
            if (!hasFoundAnswerMarker && /\*\*Answer:\*\*/i.test(chunk)) {
              hasFoundAnswerMarker = true;
              isInThinkingSection = false;
              console.log('[AIChat] ✓ Detected Answer section start');
            }
            
            // Parse current state
            const thinkMatch = fullContent.match(/\*\*Thinking:\*\*([\s\S]*?)(?:\*\*Answer:\*\*|$)/i);
            const answerMatch = fullContent.match(/\*\*Answer:\*\*([\s\S]*?)$/i);
            
            if (thinkMatch) {
              const thinkingText = thinkMatch[1].trim();
              setStreamingThinking(thinkingText);
              console.log('[AIChat] Thinking update:', thinkingText.length, 'chars');
            } else if (!hasFoundAnswerMarker) {
              // Before we find any marker, treat all content as thinking
              setStreamingThinking(fullContent);
              console.log('[AIChat] Pre-marker thinking:', fullContent.length, 'chars');
            }
            
            if (answerMatch) {
              const answerText = answerMatch[1].trim();
              setStreamingContent(answerText);
              console.log('[AIChat] Answer update:', answerText.length, 'chars');
            }
          } else {
            setStreamingContent(fullContent);
          }
        },
        (completeData) => {
          // Stream complete callback
          console.log('[AIChat] Stream complete from backend');
          console.log('[AIChat] Full content length:', fullContent.length);
          console.log('[AIChat] Complete data:', {
            provider: completeData.provider,
            model: completeData.model,
            isThinking: completeData.isThinking,
          });
          
          // Final parsing for saved message
          let finalThinking = '';
          let finalContent = completeData.fullContent || fullContent;
          
          if (thinkingMode && fullContent) {
            const thinkMatch = fullContent.match(/\*\*Thinking:\*\*([\s\S]*?)(?:\*\*Answer:\*\*|$)/i);
            const answerMatch = fullContent.match(/\*\*Answer:\*\*([\s\S]*?)$/i);
            
            if (thinkMatch) {
              finalThinking = thinkMatch[1].trim();
            }
            if (answerMatch) {
              finalContent = answerMatch[1].trim();
            } else if (!thinkMatch) {
              // No markers found at all, treat all as answer
              finalContent = fullContent;
            }
            
            console.log('[AIChat] Final parsing:', {
              hasThinking: !!finalThinking,
              thinkingLength: finalThinking.length,
              answerLength: finalContent.length
            });
          }

          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: finalContent,
            thinkingContent: finalThinking || undefined,
            timestamp: new Date(),
            provider: completeData.provider || 'gemini',
            model: completeData.model || 'gemini-2.0-flash',
            isThinking: completeData.isThinking || thinkingMode,
          }]);
          
          setStreamingContent('');
          setStreamingThinking('');
          setIsTyping(false);
        },
        (error) => {
          // Error callback
          console.error('[AIChat] Stream error:', error);
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: "Connection error: " + error.message, 
            timestamp: new Date(), 
            isError: true 
          }]);
          setIsTyping(false);
        }
      );
    } catch (error) {
      console.error('[AIChat] Send message error:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: "Failed to send message: " + error.message, 
        timestamp: new Date(), 
        isError: true 
      }]);
      setIsTyping(false);
      setStreamingContent('');
      setStreamingThinking('');
    }
  };

  const handleClearChat = () => {
    setConfirmDialog({ isOpen: true });
  };

  const confirmClearChat = () => {
    setMessages([]);
    localStorage.removeItem('ai_chat_history');
    setDetectedSubject(null);
    setShowSavePrompt(false);
    lastSavedMessageCount.current = 0;
    setToast({ isOpen: true, message: 'Conversation cleared', type: 'info' });
  };

  const handleImportChat = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported) && imported.length > 0) {
          const messagesWithDates = imported.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp || Date.now()),
          }));
          setMessages(messagesWithDates);
          localStorage.setItem('ai_chat_history', JSON.stringify(messagesWithDates));
          setToast({ isOpen: true, message: 'Conversation imported successfully', type: 'success' });
        } else {
          setToast({ isOpen: true, message: 'Invalid conversation file', type: 'error' });
        }
      } catch (error) {
        console.error('Import error:', error);
        setToast({ isOpen: true, message: 'Failed to import conversation', type: 'error' });
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = '';
  };

  const handleSaveAsStudyNote = async (manualSave = false) => {
    // If manual save and no detected subject, try to detect now
    let subject = detectedSubject;
    
    if (manualSave && !subject && messages.length >= 2) {
      const userMessages = messages.filter(m => m.role === 'user');
      if (userMessages.length > 0) {
        subject = await detectAcademicSubject(userMessages[userMessages.length - 1].content);
        if (!subject) {
          // If still no subject detected, use a generic one
          subject = 'General IT';
        }
        setDetectedSubject(subject);
      }
    }
    
    if (!subject || messages.length < 2) {
      if (manualSave) {
        alert('No conversation to save. Please have at least one Q&A exchange.');
      }
      return;
    }
    
    setIsSaving(true);
    try {
      // Generate note with AI summary
      const noteData = await generateStudyNote(messages, subject);
      if (noteData) {
        noteData.conversationId = getConversationId(messages);
        await studyNotesAPI.createStudyNote(noteData);
        lastSavedMessageCount.current = messages.length;
        setShowSavePrompt(false);
        // Show success feedback
        setToast({ isOpen: true, message: 'Study note with AI summary saved successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error saving study note:', error);
      setToast({ isOpen: true, message: 'Failed to save study note', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismissSavePrompt = () => {
    setShowSavePrompt(false);
    lastSavedMessageCount.current = messages.length;
  };

  return (
    <div className="h-full bg-[#F2F5F9] font-sans">
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmClearChat}
        title="Clear Conversation"
        message="Are you sure you want to clear all conversation history? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        type="warning"
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 overflow-hidden flex h-[calc(100vh-80px)]">
        
      {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
        {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                  AI
                </span>
                <ShuffleText
                  texts={['Tu2tor', 'Assistant', 'Guide', 'Mentor']}
                  className="px-5 py-2.5 bg-black text-white rounded-xl text-2xl font-bold tracking-wide shadow-lg shadow-black/20"
                  speed={30}
                  revealDuration={3}
                  rotationInterval={3500}
                  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <PillNav 
                items={[
                  {
                    label: 'Import',
                    icon: <Upload className="w-3.5 h-3.5" />,
                    onClick: () => importInputRef.current?.click(),
                    title: 'Import conversation history',
                    isActive: false
                  },
                  {
                    label: 'Save Note',
                    icon: <Save className="w-3.5 h-3.5" />,
                    onClick: () => handleSaveAsStudyNote(true),
                    disabled: isSaving || messages.length < 2,
                    title: 'Save conversation as study note',
                    isActive: false
                  },
                  {
                    label: 'Notes',
                    icon: <BookOpen className="w-3.5 h-3.5" />,
                    onClick: () => navigate('/app/study-notes'),
                    title: 'View all study notes',
                    isActive: false
                  }
                ]}
              />
              
              <div className="w-px h-6 bg-gray-200 mx-1"></div>

              <Magnet padding={40} magnetStrength={2}>
                <button onClick={handleClearChat} className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors group" title="Clear chat">
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </Magnet>

              <Magnet padding={40} magnetStrength={2}>
                <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition-colors group" title="Settings">
                  <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
                </button>
              </Magnet>
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
                    {/* Show thinking process for assistant messages in thinking mode */}
                    {msg.role === 'assistant' && msg.thinkingContent && (
                      <ThinkingDisplay 
                        thinkingContent={msg.thinkingContent} 
                        isComplete={true}
                      />
                    )}
                    
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
                    <p className="text-[10px] text-gray-400 mt-2 mx-2 flex items-center gap-2">
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.role === 'assistant' && msg.model && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${
                          msg.isThinking 
                            ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border border-purple-200' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          {msg.model}
                          {msg.isThinking && <span className="ml-0.5 text-pink-500">deep</span>}
                        </span>
                      )}
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
                <div className="max-w-[80%]">
                  {/* Show thinking display during streaming if in thinking mode */}
                  {thinkingMode && (
                    <ThinkingDisplay 
                      thinkingContent={streamingThinking || 'Analyzing the problem...'} 
                      isComplete={false}
                    />
                  )}
                  
                  {/* Only show answer box if we have content or not in thinking-only phase */}
                  {(!thinkingMode || streamingContent) && (
                    <div className="bg-gray-50 px-6 py-4 rounded-[24px] rounded-tl-none border border-gray-100">
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
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Save Study Note Prompt */}
        {showSavePrompt && detectedSubject && (
          <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Save this as a study note?
                  </p>
                  <p className="text-xs text-gray-500">
                    Detected subject: <span className="font-medium text-blue-600">{detectedSubject}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDismissSavePrompt}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={() => handleSaveAsStudyNote(false)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
                <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImportChat} />
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
                onClick={() => setThinkingMode(!thinkingMode)}
                className={`flex items-center gap-2 rounded-full transition-all duration-300 ease-out mb-1 ${
                  thinkingMode 
                    ? 'bg-black text-white hover:bg-gray-800 shadow-lg px-4 py-3 scale-105' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-3 scale-100'
                }`}
                title="Toggle Deep Think mode"
              >
                <Zap className={`w-5 h-5 transition-transform duration-300 ${thinkingMode ? 'fill-current rotate-12' : ''}`} />
                {thinkingMode && (
                  <span className="text-sm font-bold whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    Deep Think
                  </span>
                )}
              </button>

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
