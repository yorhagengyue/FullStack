import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Eye, 
  Edit3, 
  Save, 
  Download, 
  FileText, 
  Users,
  Columns2,
  Code,
  Check,
  X,
  CheckCircle
} from 'lucide-react';

const MarkdownCollabEditor = ({ bookingId, username = 'Guest', initialContent = '', noteTitle = 'Untitled', onToggleCode, showCode = false, onCompleteSession, isCompleting = false }) => {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState('split'); // 'edit', 'preview', 'split'
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  
  const textareaRef = useRef(null);

  // Debug log to verify state initialization
  useEffect(() => {
    console.log('[MarkdownCollabEditor] Initialized with connectionStatus:', connectionStatus);
  }, []);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);

  useEffect(() => {
    // Initialize Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Connect to WebSocket server for collaboration
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    const provider = new WebsocketProvider(
      wsUrl,
      `markdown-session-${bookingId}`,
      ydoc
    );
    providerRef.current = provider;

    // Get the shared text type
    const ytext = ydoc.getText('markdown');
    ytextRef.current = ytext;

    // Set initial content if provided
    if (initialContent && ytext.toString() === '') {
      ytext.insert(0, initialContent);
    }

    // Set user info for awareness
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    });

    // Track connected users
    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states
        .filter(state => state.user)
        .map(state => state.user);
      setConnectedUsers(users);
    });

    // Track connection status
    provider.on('status', ({ status }) => {
      console.log('[MarkdownCollab] Connection status:', status);
      setConnectionStatus(status);
    });

    provider.on('sync', (isSynced) => {
      console.log('[MarkdownCollab] Synced:', isSynced);
      if (isSynced) {
        setConnectionStatus('connected');
      }
    });

    // Sync content changes
    const updateContent = () => {
      setContent(ytext.toString());
    };

    ytext.observe(updateContent);
    updateContent();

    // Cleanup
    return () => {
      ytext.unobserve(updateContent);
      provider.destroy();
      ydoc.destroy();
    };
  }, [bookingId, username, initialContent]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const ytext = ytextRef.current;
    
    if (ytext) {
      const currentValue = ytext.toString();
      
      // Calculate the diff and apply changes
      if (newValue !== currentValue) {
        ytext.delete(0, currentValue.length);
        ytext.insert(0, newValue);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage as backup
      localStorage.setItem(`markdown-session-${bookingId}`, content);
      
      // TODO: Save to backend if needed
      // await api.post('/session-notes', { bookingId, content });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Error saving markdown:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.replace(/\s+/g, '-')}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      return !inline && match ? (
        <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-700">
          <div className="flex items-center justify-between bg-gray-800 text-gray-400 px-3 py-2 text-xs">
            <span className="font-mono uppercase">{match[1]}</span>
          </div>
          <pre className="bg-[#1e1e1e] text-gray-300 p-4 overflow-x-auto m-0">
            <code className="text-sm font-mono">{codeString}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-pink-900/30 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-white mb-6 pb-4 border-b-2 border-gradient-to-r from-purple-500 to-blue-500">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></span>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-gray-200 mt-6 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-300 leading-relaxed mb-3">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="space-y-1 my-3 ml-6 list-disc text-gray-300">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-1 my-3 ml-6 list-decimal text-gray-300">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-gray-300 leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-900/30 to-transparent pl-6 py-4 my-4 italic text-purple-200 rounded-r-lg">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    hr: () => (
      <hr className="my-6 border-t border-gray-700" />
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-b border-purple-500/30 p-4 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-white font-bold text-lg">{noteTitle}</span>
              <div className="text-purple-300 text-xs">Collaborative Editing</div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-xl p-1.5 border border-purple-500/20">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'edit' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/50' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title="Edit mode"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setMode('split')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'split' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-blue-500/50' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title="Split mode"
            >
              <Columns2 className="w-4 h-4" />
              Split
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'preview' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title="Preview mode"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Code Button */}
          {onToggleCode && (
            <button
              onClick={onToggleCode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                showCode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={showCode ? 'Hide code' : 'Show code'}
            >
              <Code className="w-4 h-4" />
              {showCode ? 'Hide Code' : 'Code'}
            </button>
          )}

          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 border border-purple-500/30 rounded-lg backdrop-blur-sm" title={`Connection: ${connectionStatus}`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`}></div>
            <span className="text-white text-sm font-medium">
              {connectionStatus === 'connected' ? 'Synced' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Disconnected'}
            </span>
          </div>

          {/* Connected Users */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm font-semibold">
              {connectedUsers.length}
            </span>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all shadow-lg shadow-green-500/30 font-semibold text-sm"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all backdrop-blur-sm font-semibold text-sm"
            title="Download as .md"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Complete Session Button */}
          {onCompleteSession && (
            <button
              onClick={onCompleteSession}
              disabled={isCompleting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all shadow-lg font-semibold text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              {isCompleting ? 'Completing...' : 'Complete'}
            </button>
          )}
        </div>
      </div>

      {/* Editor and Preview Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2 border-r border-purple-500/20' : 'w-full'} flex flex-col bg-[#0d1117]`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              className="flex-1 w-full p-6 bg-[#0d1117] text-gray-200 font-mono text-base leading-relaxed resize-none focus:outline-none placeholder-gray-600"
              placeholder="# Start writing your markdown here...

## Features
- Real-time collaboration
- Live preview
- Syntax highlighting

```javascript
console.log('Hello, World!');
```"
            />
          </div>
        )}

        {/* Preview */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`${mode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`}>
            {content ? (
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-20">
                <div className="inline-block p-6 bg-purple-500/10 rounded-2xl mb-6">
                  <FileText className="w-20 h-20 mx-auto text-purple-400/50" />
                </div>
                <p className="text-lg font-medium text-gray-400">No content yet</p>
                <p className="text-sm text-gray-600 mt-2">Start writing in the editor to see the preview!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connected Users Display */}
      {connectedUsers.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border-t border-purple-500/30 p-3 flex items-center gap-3 flex-shrink-0">
          <span className="text-purple-300 text-sm font-semibold">Active Collaborators:</span>
          <div className="flex items-center gap-2">
            {connectedUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-lg"
                style={{ backgroundColor: user.color || '#6366f1' }}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                {user.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownCollabEditor;

