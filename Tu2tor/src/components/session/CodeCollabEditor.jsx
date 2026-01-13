import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import { Play, Square, Code2, Users, Download, Upload, Terminal, X, Maximize2, Minimize2, FileText, CheckCircle } from 'lucide-react';

const CodeCollabEditor = ({ bookingId, language = 'javascript', username = 'Guest', onToggleMarkdown, showMarkdown = false, onCompleteSession, isCompleting = false }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const providerRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [isOutputMaximized, setIsOutputMaximized] = useState(false);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'typescript', label: 'TypeScript' },
  ];

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Yjs document
    const ydoc = new Y.Doc();

    // Connect to WebSocket server for collaboration
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    const provider = new WebsocketProvider(
      wsUrl,
      `code-session-${bookingId}`,
      ydoc
    );
    providerRef.current = provider;

    // Get the shared text type
    const ytext = ydoc.getText('monaco');

    // Create Monaco Editor
    const editor = monaco.editor.create(editorRef.current, {
      value: '',
      language: selectedLanguage,
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      readOnly: false,
    });
    monacoRef.current = editor;

    // Bind Yjs to Monaco
    const monacoBinding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    // Set user info for awareness (cursor and selection)
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
    });

    // Track connected users
    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states
        .filter(state => state.user)
        .map(state => state.user);
      setConnectedUsers(users);
    });

    // Cleanup
    return () => {
      monacoBinding.destroy();
      editor.dispose();
      provider.destroy();
      ydoc.destroy();
    };
  }, [bookingId, selectedLanguage, username]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    if (monacoRef.current) {
      monaco.editor.setModelLanguage(monacoRef.current.getModel(), newLanguage);
    }
  };

  const handleRunCode = async () => {
    if (!monacoRef.current) return;

    setIsRunning(true);
    setShowOutput(true);
    
    const code = monacoRef.current.getValue();
    const timestamp = new Date().toLocaleTimeString();

    // Add to execution history
    const executionEntry = {
      timestamp,
      language: selectedLanguage,
      code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
      output: 'Running...',
      isError: false
    };
    
    setExecutionHistory(prev => [...prev, executionEntry]);
    setOutput('Running code...');

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          code: code,
        }),
      });

      const data = await response.json();

      if (data.error) {
        const errorOutput = `❌ Error: ${data.error}`;
        setOutput(errorOutput);
        setExecutionHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            output: errorOutput,
            isError: true
          };
          return updated;
        });
      } else {
        const successOutput = `✓ ${data.output}`;
        setOutput(successOutput);
        setExecutionHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            output: successOutput,
            isError: false
          };
          return updated;
        });
      }
    } catch (error) {
      console.error('Execution error:', error);
      const errorOutput = '❌ Error: Failed to execute code. Server might be unreachable.';
      setOutput(errorOutput);
      setExecutionHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          output: errorOutput,
          isError: true
        };
        return updated;
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveCode = () => {
    if (!monacoRef.current) return;

    const code = monacoRef.current.getValue();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-session-${bookingId}.${getFileExtension(selectedLanguage)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadCode = (e) => {
    const file = e.target.files?.[0];
    if (!file || !monacoRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      monacoRef.current.setValue(event.target.result);
    };
    reader.readAsText(file);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      html: 'html',
      css: 'css',
    };
    return extensions[lang] || 'txt';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-semibold">Collaborative Code Editor</span>
          </div>

          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-indigo-500"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Markdown Button */}
          {onToggleMarkdown && (
            <button
              onClick={onToggleMarkdown}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                showMarkdown 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={showMarkdown ? 'Hide notes' : 'Show notes'}
            >
              <FileText className="w-4 h-4" />
              {showMarkdown ? 'Hide Notes' : 'Notes'}
            </button>
          )}

          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded" title={`Connection: ${connectionStatus}`}>
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm">
              {connectedUsers.length}
            </span>
          </div>

          {/* Save/Load Buttons */}
          <button
            onClick={handleSaveCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              onChange={handleLoadCode}
              className="hidden"
              accept=".js,.ts,.py,.java,.cpp,.html,.css,.txt"
            />
          </label>

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors font-semibold"
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run
              </>
            )}
          </button>

          {/* Toggle Output Button */}
          {executionHistory.length > 0 && !showOutput && (
            <button
              onClick={() => setShowOutput(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              title="Show output terminal"
            >
              <Terminal className="w-4 h-4" />
              ({executionHistory.length})
            </button>
          )}

          {/* Complete Session Button */}
          {onCompleteSession && (
            <button
              onClick={onCompleteSession}
              disabled={isCompleting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded transition-all font-semibold shadow-lg"
            >
              <CheckCircle className="w-4 h-4" />
              {isCompleting ? 'Completing...' : 'Complete'}
            </button>
          )}
        </div>
      </div>

      {/* Editor and Output Container */}
      <div className="flex-1 flex flex-col">
        {/* Monaco Editor */}
        <div 
          ref={editorRef} 
          className="flex-1" 
          style={{ 
            height: showOutput ? (isOutputMaximized ? '30%' : '60%') : '100%' 
          }}
        />

        {/* Enhanced Output Terminal */}
        {showOutput && (
          <div 
            className="border-t border-gray-700 bg-[#1e1e1e] flex flex-col"
            style={{ 
              height: isOutputMaximized ? '70%' : '40%' 
            }}
          >
            {/* Terminal Header */}
            <div className="bg-[#2d2d30] border-b border-gray-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-white font-semibold text-sm">Python Sandbox</span>
                <span className="text-gray-400 text-xs">
                  ({selectedLanguage})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOutput('');
                    setExecutionHistory([]);
                  }}
                  className="text-gray-400 hover:text-white text-xs px-2 py-1 hover:bg-gray-700 rounded transition-colors"
                  title="Clear all"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOutputMaximized(!isOutputMaximized)}
                  className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded transition-colors"
                  title={isOutputMaximized ? 'Minimize' : 'Maximize'}
                >
                  {isOutputMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowOutput(false)}
                  className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-sm">
              {executionHistory.length === 0 ? (
                <div className="text-gray-500 italic">
                  No execution history. Click "Run Code" to execute your code.
                </div>
              ) : (
                <div className="space-y-4">
                  {executionHistory.map((entry, index) => (
                    <div key={index} className="border-b border-gray-800 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-500 text-xs">[{entry.timestamp}]</span>
                        <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs">
                          {entry.language}
                        </span>
                      </div>
                      <div className={`whitespace-pre-wrap ${entry.isError ? 'text-red-400' : 'text-green-400'}`}>
                        {entry.output}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Current Output */}
              {isRunning && (
                <div className="flex items-center gap-2 text-yellow-400 mt-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                  <span>Executing code...</span>
                </div>
              )}
            </div>

            {/* Terminal Footer */}
            <div className="bg-[#2d2d30] border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
              <span>Execution limit: 5 seconds</span>
              <span>{executionHistory.length} execution(s)</span>
            </div>
          </div>
        )}
      </div>

      {/* Connected Users Display */}
      {connectedUsers.length > 0 && (
        <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center gap-2">
          <span className="text-gray-400 text-sm">Active collaborators:</span>
          {connectedUsers.map((user, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded text-xs text-white"
              style={{ backgroundColor: user.color || '#6366f1' }}
            >
              {user.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeCollabEditor;