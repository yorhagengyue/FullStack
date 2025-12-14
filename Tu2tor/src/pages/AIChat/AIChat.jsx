import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  Save,
  RefreshCw,
  FileText
} from 'lucide-react';
import ProviderSelector from '../../components/ai/ProviderSelector';
import UsageMonitor from '../../components/ai/UsageMonitor';
import { studyNotesAPI, knowledgeBaseAPI, ragAPI } from '../../services/api';
import { detectAcademicSubject, generateStudyNote, shouldSaveAsStudyNote, getConversationId } from '../../utils/studyNoteHelper';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';
import ShinyText from '../../components/reactbits/ShinyText/ShinyText';
import ShuffleText from '../../components/reactbits/ShuffleText/ShuffleText';
import PillNav from '../../components/reactbits/PillNav/PillNav';
import ThinkingDisplay from '../../components/ai/ThinkingDisplay';
import NoteSelectionModal from '../../components/notes/NoteSelectionModal';
import RestructureOptionsModal from '../../components/notes/RestructureOptionsModal';
import RestructuredNoteView from '../../components/notes/RestructuredNoteView';

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
  const [enableWebSearch, setEnableWebSearch] = useState(false); // Grounding功能 
  const [copiedCode, setCopiedCode] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [detectedSubject, setDetectedSubject] = useState(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContentToSave, setNoteContentToSave] = useState('');
  const [noteSourcesToSave, setNoteSourcesToSave] = useState([]);
  
  // AI Restructure states
  const [showRestructureModal, setShowRestructureModal] = useState(false);
  const [isRestructuring, setIsRestructuring] = useState(false);
  const [restructuredNote, setRestructuredNote] = useState(null);
  const [showRestructuredView, setShowRestructuredView] = useState(false);

  // RAG/知识库模式
  const [mode, setMode] = useState('chat'); // 'chat' | 'kb'
  const [kbDocs, setKbDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [ragSources, setRagSources] = useState([]);
  const [isRagLoading, setIsRagLoading] = useState(false);

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

  // Load knowledge base documents (current user)
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await knowledgeBaseAPI.list({ status: 'completed' });
        if (res.success) {
          setKbDocs(res.documents || []);
        }
      } catch (err) {
        console.warn('[AIChat] load docs failed', err);
      }
    };
    loadDocs();
  }, []);

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
    setRagSources([]);

    try {
      // 知识库模式：直接调用 RAG 接口
      if (mode === 'kb') {
        console.log('[AIChat] ========== RAG QUERY ==========');
        console.log('[AIChat] Question:', userMessage.content);
        console.log('[AIChat] Selected Doc IDs:', selectedDocIds);
        console.log('[AIChat] Mode:', mode);
        console.log('[AIChat] KB Docs available:', kbDocs.length);
        console.log('[AIChat] ====================================');
        
        if (selectedDocIds.length === 0) {
          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: 'Please select at least one document from the list below before asking questions.',
            timestamp: new Date(),
            isError: true
          }]);
          setIsTyping(false);
          return;
        }
        
        setIsRagLoading(true);
        try {
          const res = await ragAPI.query({
            question: userMessage.content,
            documentIds: selectedDocIds
          });
          
          console.log('[AIChat] RAG Response:', res);

          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: res.answer || 'No relevant content found in the materials.',
            timestamp: new Date(),
            provider: 'gemini',
            model: 'rag + gemini',
            sources: res.sources || []
          }]);
          setRagSources(res.sources || []);
        } catch (err) {
          console.error('[AIChat] RAG query failed:', err);
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: "RAG查询失败: " + (err.message || '未知错误'), 
            timestamp: new Date(), 
            isError: true 
          }]);
        } finally {
          setIsTyping(false);
          setIsRagLoading(false);
        }
        return;
      }

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
          enableGrounding: enableWebSearch, // 启用网络搜索
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

  const handleRegenerateResponse = async (messageIndex) => {
    // Find the user message before this assistant message
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') {
      console.error('[AIChat] Cannot regenerate: no user message found');
      return;
    }

    const userMsg = messages[userMessageIndex];
    
    // Remove the assistant's response
    setMessages(prev => prev.slice(0, messageIndex));
    
    // Resend the user's message
    setIsTyping(true);
    setStreamingContent('');
    setStreamingThinking('');
    setRagSources([]);
    
    try {
      // Knowledge Base mode
      if (mode === 'kb') {
        setIsRagLoading(true);
        try {
          const res = await ragAPI.query({
            question: userMsg.content,
            documentIds: selectedDocIds
          });

          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: res.answer || 'No relevant content found in the materials.',
            timestamp: new Date(),
            provider: 'gemini',
            model: 'rag + gemini',
            sources: res.sources || []
          }]);
          setRagSources(res.sources || []);
        } catch (err) {
          console.error('[AIChat] RAG query failed:', err);
          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: 'RAG query failed: ' + err.message,
            timestamp: new Date(),
            isError: true
          }]);
        } finally {
          setIsRagLoading(false);
          setIsTyping(false);
        }
      } else {
        // Normal chat mode
        // Import aiAPI
        const { default: aiAPI } = await import('../../services/aiAPI.js');
        
        let fullContent = '';
        let fullThinking = '';
        
        await aiAPI.streamChat(
          messages.slice(0, userMessageIndex + 1),
          {
            thinkingMode,
            reasoningEffort,
            temperature: 0.7,
            maxTokens: thinkingMode ? 2500 : 2000,
            enableGrounding: enableWebSearch, // 启用网络搜索
          },
          (chunk) => {
            fullContent += chunk;
            
            // In thinking mode, parse in real-time
            if (thinkingMode) {
              const thinkMatch = fullContent.match(/\*\*Thinking:\*\*([\s\S]*?)(?:\*\*Answer:\*\*|$)/i);
              const answerMatch = fullContent.match(/\*\*Answer:\*\*([\s\S]*?)$/i);
              
              if (thinkMatch) {
                setStreamingThinking(thinkMatch[1].trim());
              } else {
                setStreamingThinking(fullContent);
              }
              
              if (answerMatch) {
                setStreamingContent(answerMatch[1].trim());
              }
            } else {
              setStreamingContent(fullContent);
            }
          },
          (completeData) => {
            // Complete callback
            console.log('[AIChat] Regenerate complete:', completeData);
            
            let finalContent = completeData.fullContent || fullContent;
            let finalThinking = '';

            if (thinkingMode && finalContent) {
              const thinkingMatch = finalContent.match(/\*\*Thinking:\*\*([\s\S]*?)(?:\*\*Answer:\*\*|$)/i);
              const answerMatch = finalContent.match(/\*\*Answer:\*\*([\s\S]*?)$/i);
              
              if (thinkingMatch) {
                finalThinking = thinkingMatch[1].trim();
              }
              
              if (answerMatch) {
                finalContent = answerMatch[1].trim();
              } else if (thinkingMatch) {
                finalContent = '';
              }
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
      }
    } catch (error) {
      console.error('[AIChat] Regenerate error:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: "Failed to regenerate: " + error.message, 
        timestamp: new Date(), 
        isError: true 
      }]);
      setIsTyping(false);
      setStreamingContent('');
      setStreamingThinking('');
    }
  };

  const handleSaveToNote = (content, sources) => {
    setNoteContentToSave(content);
    setNoteSourcesToSave(sources);
    setShowNoteModal(true);
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

  const handleSaveAsStudyNote = async (manualSave = false, useRestructure = false) => {
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

    // If user explicitly requested AI restructure, show options modal
    if (manualSave && useRestructure) {
      setShowRestructureModal(true);
      return;
    }
    
    // Otherwise use old simple save method
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

  // Handle AI Restructure with selected intensity
  const handleRestructureSave = async (intensity) => {
    let subject = detectedSubject;
    
    if (!subject && messages.length >= 2) {
      const userMessages = messages.filter(m => m.role === 'user');
      if (userMessages.length > 0) {
        subject = await detectAcademicSubject(userMessages[userMessages.length - 1].content);
        if (!subject) {
          subject = 'General IT';
        }
        setDetectedSubject(subject);
      }
    }

    setIsRestructuring(true);
    try {
      console.log('[AIChat] Creating restructured note with intensity:', intensity);
      
      // Prepare messages for API
      const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || new Date()
      }));

      // Debug: Check request payload size
      const payload = {
        messages: formattedMessages,
        subject: subject,
        intensity: intensity,
        conversationId: getConversationId(messages),
        sources: ragSources.length > 0 ? ragSources.map(s => ({
          docId: s.docId || s._id,
          title: s.title,
          pages: s.pages || []
        })) : undefined
      };
      
      const payloadSize = JSON.stringify(payload).length;
      console.log('[AIChat] Payload size:', (payloadSize / 1024).toFixed(2), 'KB');
      console.log('[AIChat] Message count:', formattedMessages.length);
      console.log('[AIChat] Total content length:', formattedMessages.reduce((sum, m) => sum + m.content.length, 0));

      // Call API to create restructured note
      const response = await studyNotesAPI.createRestructuredNote(payload);

      console.log('[AIChat] API response:', response);

      if (response.success && response.note) {
        console.log('[AIChat] Restructured note created:', response.note._id);
        
        setRestructuredNote(response.note);
        setShowRestructureModal(false);
        setShowRestructuredView(true);
        lastSavedMessageCount.current = messages.length;
        setShowSavePrompt(false);
        
        setToast({ 
          isOpen: true, 
          message: `✨ AI-restructured note created successfully! (${intensity} intensity)`, 
          type: 'success' 
        });
      } else {
        // Response received but something unexpected
        console.warn('[AIChat] Unexpected response format:', response);
        setToast({ 
          isOpen: true, 
          message: 'Note may have been created. Please check Study Notes page.', 
          type: 'warning' 
        });
      }
    } catch (error) {
      console.error('[AIChat] Error creating restructured note:', error);
      
      // If network error (status 0), note might have been created
      if (error.message?.includes('Network error') || error.status === 0) {
        setToast({ 
          isOpen: true, 
          message: '⚠️ Connection interrupted. Note may have been saved - check Study Notes page.', 
          type: 'warning' 
        });
        
        // Close modal to let user check notes
        setShowRestructureModal(false);
      } else {
        setToast({ 
          isOpen: true, 
          message: `Failed to create restructured note: ${error.message}`, 
          type: 'error' 
        });
      }
    } finally {
      setIsRestructuring(false);
    }
  };

  // Handle re-restructure from note view
  const handleReRestructure = async () => {
    if (!restructuredNote) return;
    
    // Could show modal to select new intensity
    setToast({ 
      isOpen: true, 
      message: 'Re-restructure feature coming soon!', 
      type: 'info' 
    });
  };

  const handleDismissSavePrompt = () => {
    setShowSavePrompt(false);
    lastSavedMessageCount.current = messages.length;
  };

  const handleToggleDoc = (docId, checked) => {
    setSelectedDocIds(prev => {
      if (checked) return [...prev, docId];
      return prev.filter(id => id !== docId);
    });
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
              <div className="flex items-center gap-2">
                {/* Clean, minimal AI branding */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-gray-900">
                    AI
                  </span>
                  <ShuffleText
                    texts={['Tu2tor', 'Assistant', 'Guide', 'Mentor']}
                    className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent"
                    speed={30}
                    revealDuration={3}
                    rotationInterval={3500}
                    characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
                  />
                </div>
                {/* Subtle accent dot */}
                <motion.div 
                  className="w-1.5 h-1.5 rounded-full bg-green-500"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
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
                    label: 'Notes',
                    icon: <BookOpen className="w-3.5 h-3.5" />,
                    onClick: () => navigate('/app/study-notes'),
                    title: 'View all study notes',
                    isActive: false
                  }
                ]}
              />
              
              {/* Save Note with AI Restructure Option */}
              <div className="relative group">
                <button
                  onClick={() => handleSaveAsStudyNote(true, false)}
                  disabled={isSaving || isRestructuring || messages.length < 2}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  title="Save as simple note"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Note
                </button>
                
                <button
                  onClick={() => handleSaveAsStudyNote(true, true)}
                  disabled={isSaving || isRestructuring || messages.length < 2}
                  className="absolute right-0 top-0 bottom-0 px-2 bg-green-600 hover:bg-green-700 text-white rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center opacity-0 group-hover:opacity-100"
                  title="Save with AI restructure"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="w-px h-6 bg-gray-200 mx-1"></div>

              <motion.button 
                onClick={handleClearChat} 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors group" 
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </motion.button>

              <motion.button 
                onClick={() => setShowSettings(!showSettings)} 
                whileHover={{ scale: 1.1, rotate: 45 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition-colors group" 
                title="Settings"
              >
                <Settings className="w-4 h-4 transition-transform duration-500" />
              </motion.button>
            </div>
        </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-16 h-16 text-gray-400 mb-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-500 max-w-md">Ask anything, or switch to Knowledge Base mode to query your documents</p>
              </motion.div>
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
                      {msg.role === 'assistant' && msg.sources?.length > 0 && (() => {
                        // 按文档分组页码
                        const docGroups = {};
                        msg.sources.forEach(s => {
                          const docTitle = s.title || 'Document';
                          if (!docGroups[docTitle]) {
                            docGroups[docTitle] = [];
                          }
                          docGroups[docTitle].push(s.pageNumber);
                        });

                        // 格式化页码范围
                        const formatPages = (pages) => {
                          pages.sort((a, b) => a - b);
                          const ranges = [];
                          let start = pages[0];
                          let prev = pages[0];

                          for (let i = 1; i <= pages.length; i++) {
                            if (i === pages.length || pages[i] !== prev + 1) {
                              if (start === prev) {
                                ranges.push(`${start}`);
                              } else if (prev === start + 1) {
                                ranges.push(`${start}, ${prev}`);
                              } else {
                                ranges.push(`${start}-${prev}`);
                              }
                              if (i < pages.length) {
                                start = pages[i];
                                prev = pages[i];
                              }
                            } else {
                              prev = pages[i];
                            }
                          }
                          return ranges.join(', ');
                        };

                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="mt-4 pt-3 border-t border-gray-100"
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-0.5">
                                <BookOpen className="w-3 h-3" />
                                <span>References</span>
                              </div>
                              <div className="flex-1 flex flex-col gap-1.5">
                                {Object.entries(docGroups).map(([title, pages], idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.1 }}
                                    className="text-xs text-gray-700"
                                  >
                                    <span className="font-semibold">{title}</span>
                                    <span className="text-gray-500 ml-1.5">p.{formatPages(pages)}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between mt-2 mx-2">
                      <p className="text-[10px] text-gray-400 flex items-center gap-2">
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
                      {msg.role === 'assistant' && !isTyping && (
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => handleRegenerateResponse(idx)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-gray-700 hover:text-white bg-gray-100 hover:bg-gray-900 rounded-full transition-all duration-200 group shadow-sm hover:shadow-md"
                            title="Regenerate response"
                          >
                            <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                            <span>Regenerate</span>
                          </motion.button>
                          
                          {(mode === 'kb' || msg.sources?.length > 0) && (
                            <motion.button
                              onClick={() => handleSaveToNote(msg.content, msg.sources)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-gray-700 hover:text-white bg-gray-100 hover:bg-gray-900 rounded-full transition-all duration-200 group shadow-sm hover:shadow-md"
                              title="Save to Note"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save to Note</span>
                            </motion.button>
                          )}
                        </div>
                      )}
                    </div>
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

        {/* Knowledge Base Mode Control */}
        <div className="px-8 pb-4 bg-gradient-to-b from-white to-gray-50/50 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <PillNav
                items={[
                  {
                    label: 'Chat',
                    isActive: mode === 'chat',
                    onClick: () => setMode('chat'),
                  },
                  {
                    label: 'Knowledge Base',
                    isActive: mode === 'kb',
                    onClick: () => setMode('kb'),
                  }
                ]}
              />
              
              {/* Web Search Toggle */}
              <motion.button
                onClick={() => setEnableWebSearch(!enableWebSearch)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-all duration-200
                  ${enableWebSearch 
                    ? 'bg-green-500 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title={enableWebSearch ? 'Web Search Enabled' : 'Web Search Disabled'}
              >
                <Zap className={`w-3.5 h-3.5 ${enableWebSearch ? 'animate-pulse' : ''}`} />
                <span>Web Search</span>
              </motion.button>
            </div>
            
            <AnimatePresence>
              {mode === 'kb' && selectedDocIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold"
                  style={{ borderRadius: '8px' }}
                >
                  <Check className="w-3 h-3" />
                  {selectedDocIds.length} selected
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {mode === 'kb' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="max-h-40 overflow-y-auto mb-3 space-y-2">
                  {kbDocs.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full text-center py-8 px-4 cursor-pointer bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
                      onClick={() => navigate('/app/knowledge-base')}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <BookOpen className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-700">No materials available yet</p>
                      <p className="text-xs text-gray-400 mt-1.5">Click to upload documents</p>
                    </motion.div>
                  ) : (
                    kbDocs.map((doc, index) => (
                      <motion.label
                        key={doc._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className={`group relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-l-4 ${
                          selectedDocIds.includes(doc._id)
                            ? 'bg-gray-900 border-green-500 text-white shadow-md'
                            : 'bg-white border-gray-200 hover:border-gray-400 text-gray-700 hover:shadow-sm'
                        }`}
                        style={{ borderRadius: '8px' }}
                        whileHover={{ x: selectedDocIds.includes(doc._id) ? 0 : 4 }}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          selectedDocIds.includes(doc._id)
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 group-hover:border-gray-500'
                        }`}>
                          <input
                            type="checkbox"
                            checked={selectedDocIds.includes(doc._id)}
                            onChange={(e) => handleToggleDoc(doc._id, e.target.checked)}
                            className="sr-only"
                          />
                          {selectedDocIds.includes(doc._id) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-sm truncate">{doc.title}</span>
                            {doc.metadata?.pageCount && (
                              <span className={`text-[10px] font-medium flex-shrink-0 ${
                                selectedDocIds.includes(doc._id) ? 'text-green-300' : 'text-gray-400'
                              }`}>
                                {doc.metadata.pageCount}p
                              </span>
                            )}
                          </div>
                        </div>
                        <FileText className={`w-4 h-4 flex-shrink-0 ${
                          selectedDocIds.includes(doc._id) ? 'text-green-300' : 'text-gray-400'
                        }`} />
                      </motion.label>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                disabled={(!inputMessage.trim() && attachedFiles.length === 0) || isTyping || isRagLoading}
                  className="p-3 bg-gray-900 text-white rounded-full hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-1 mr-1 shadow-md"
              >
                  {(isTyping || isRagLoading) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
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
        
        <NoteSelectionModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          contentToSave={noteContentToSave}
          sourcesToSave={noteSourcesToSave}
          onSaveSuccess={() => setToast({ isOpen: true, message: 'Note saved successfully!', type: 'success' })}
        />

        {/* AI Restructure Options Modal */}
        <RestructureOptionsModal
          isOpen={showRestructureModal}
          onClose={() => setShowRestructureModal(false)}
          onConfirm={handleRestructureSave}
          isProcessing={isRestructuring}
        />

        {/* Restructured Note View */}
        {showRestructuredView && restructuredNote && (
          <RestructuredNoteView
            note={restructuredNote}
            onClose={() => {
              setShowRestructuredView(false);
              setRestructuredNote(null);
            }}
            onRestructure={handleReRestructure}
            onDownload={() => {
              // Download logic
              const blob = new Blob([restructuredNote.content], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${restructuredNote.title.replace(/[^a-z0-9]/gi, '_')}.md`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            isRestructuring={isRestructuring}
          />
        )}
      </div>
    </div>
  );
};

export default AIChat;
