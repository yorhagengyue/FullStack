import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import { Play, Square, Code2, Users, Download, Upload } from 'lucide-react';

const CodeCollabEditor = ({ bookingId, language = 'javascript', username = 'Guest' }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const providerRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [connectedUsers, setConnectedUsers] = useState([]);

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
    setOutput('Running code...');

    const code = monacoRef.current.getValue();

    try {
      // Using Judge0 API for code execution
      // For demo purposes, we'll simulate execution
      // In production, you'd send to your backend which calls Judge0

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
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput(data.output);
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error: Failed to execute code. Server might be unreachable.');
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
          {/* Connected Users */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm">
              {connectedUsers.length} {connectedUsers.length === 1 ? 'user' : 'users'}
            </span>
          </div>

          {/* Save/Load Buttons */}
          <button
            onClick={handleSaveCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            title="Download code"
          >
            <Download className="w-4 h-4" />
            Save
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Load
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
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor and Output Container */}
      <div className="flex-1 flex flex-col">
        {/* Monaco Editor */}
        <div ref={editorRef} className="flex-1" />

        {/* Output Panel */}
        {output && (
          <div className="h-48 border-t border-gray-700 bg-gray-900 p-4 overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Output:</h3>
              <button
                onClick={() => setOutput('')}
                className="text-gray-400 hover:text-white text-sm"
              >
                Clear
              </button>
            </div>
            <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
              {output}
            </pre>
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
