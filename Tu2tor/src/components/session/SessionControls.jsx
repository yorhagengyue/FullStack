import { useState, useEffect } from 'react';
import { 
  Code2, 
  FileText, 
  BookOpen, 
  Minimize2, 
  Maximize, 
  Minimize, 
  Users,
  Clock,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Settings,
  MessageSquare,
  MoreVertical,
  Info,
  Keyboard
} from 'lucide-react';

const SessionControls = ({
  sessionStarted,
  startTime,
  connectedUsers,
  showCodeEditor,
  showMarkdownEditor,
  showKBPanel,
  isFullscreen,
  onToggleCode,
  onToggleMarkdown,
  onToggleKB,
  onMinimize,
  onToggleFullscreen,
  bookingInfo
}) => {
  const [sessionDuration, setSessionDuration] = useState('00:00:00');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Update session duration timer
  useEffect(() => {
    if (!sessionStarted || !startTime) return;

    const updateDuration = () => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      setSessionDuration(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [sessionStarted, startTime]);

  const shortcuts = [
    { key: 'C', action: 'Toggle Code Editor' },
    { key: 'M', action: 'Toggle Markdown Editor' },
    { key: 'K', action: 'Toggle Knowledge Base' },
    { key: 'F', action: 'Toggle Fullscreen' },
    { key: 'ESC', action: 'Exit Editors' },
  ];

  return (
    <>
      {/* Main Control Bar */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
        {/* Top Stats Bar */}
        <div className="flex items-center gap-2">
          {/* Session Timer */}
          {sessionStarted && (
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/20 flex items-center gap-2">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-mono font-bold">{sessionDuration}</span>
            </div>
          )}

          {/* Participant Count */}
          {sessionStarted && (
            <div className="px-4 py-2 bg-gradient-to-r from-green-600/90 to-emerald-600/90 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/20 flex items-center gap-2 group hover:scale-105 transition-transform">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <Users className="w-4 h-4" />
              <span className="text-sm font-bold">{connectedUsers}</span>
              <span className="text-xs hidden group-hover:inline ml-1 transition-all">
                {connectedUsers === 1 ? 'participant' : 'participants'}
              </span>
            </div>
          )}

          {/* Session Info Tooltip */}
          <button
            className="p-2 bg-black/60 backdrop-blur-md text-white rounded-xl shadow-lg border border-white/10 hover:bg-black/80 transition-all group"
            title="Session Information"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Tool Controls */}
        <div className="flex items-center gap-2">
          {/* Code Editor Button */}
          <button
            onClick={onToggleCode}
            className={`group relative p-3 backdrop-blur-md rounded-xl transition-all duration-300 shadow-lg border ${
              showCodeEditor 
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 border-indigo-400/50 scale-105' 
                : 'bg-black/60 border-white/10 hover:bg-black/80 hover:scale-105'
            }`}
            title="Code Editor (C)"
          >
            <Code2 className={`w-5 h-5 transition-colors ${showCodeEditor ? 'text-white' : 'text-gray-300'}`} />
            {showCodeEditor && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full"></div>
            )}
          </button>

          {/* Markdown Editor Button */}
          <button
            onClick={onToggleMarkdown}
            className={`group relative p-3 backdrop-blur-md rounded-xl transition-all duration-300 shadow-lg border ${
              showMarkdownEditor 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400/50 scale-105' 
                : 'bg-black/60 border-white/10 hover:bg-black/80 hover:scale-105'
            }`}
            title="Markdown Editor (M)"
          >
            <FileText className={`w-5 h-5 transition-colors ${showMarkdownEditor ? 'text-white' : 'text-gray-300'}`} />
            {showMarkdownEditor && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            )}
          </button>

          {/* Knowledge Base Button */}
          <button
            onClick={onToggleKB}
            className={`group relative p-3 backdrop-blur-md rounded-xl transition-all duration-300 shadow-lg border ${
              showKBPanel 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-400/50 scale-105' 
                : 'bg-black/60 border-white/10 hover:bg-black/80 hover:scale-105'
            }`}
            title="Knowledge Base (K)"
          >
            <BookOpen className={`w-5 h-5 transition-colors ${showKBPanel ? 'text-white' : 'text-gray-300'}`} />
            {showKBPanel && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-white/20"></div>

          {/* Minimize Button */}
          <button
            onClick={onMinimize}
            className="p-3 bg-black/60 backdrop-blur-md text-white rounded-xl shadow-lg border border-white/10 hover:bg-black/80 hover:scale-105 transition-all"
            title="Minimize to Floating (Esc)"
          >
            <Minimize2 className="w-5 h-5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            className="p-3 bg-black/60 backdrop-blur-md text-white rounded-xl shadow-lg border border-white/10 hover:bg-black/80 hover:scale-105 transition-all"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`p-3 backdrop-blur-md text-white rounded-xl shadow-lg border transition-all ${
                showMoreMenu 
                  ? 'bg-white/20 border-white/30' 
                  : 'bg-black/60 border-white/10 hover:bg-black/80'
              }`}
              title="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* More Menu Dropdown */}
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => {
                    setShowShortcuts(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Keyboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Keyboard Shortcuts</span>
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Video Settings</span>
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Chat History</span>
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm font-medium">Screen Share</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Session Info Card (collapsed by default) */}
        {bookingInfo && bookingInfo.subject && bookingInfo.duration && (
          <div className="mt-2 p-3 bg-black/60 backdrop-blur-md text-white rounded-xl shadow-lg border border-white/10 text-xs space-y-1 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Subject:</span>
              <span className="font-semibold">{bookingInfo.subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Duration:</span>
              <span className="font-semibold">{bookingInfo.duration} min</span>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <Keyboard className="w-8 h-8 text-indigo-400" />
              <h3 className="text-2xl font-bold text-white">Keyboard Shortcuts</h3>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-gray-300">{shortcut.action}</span>
                  <kbd className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded border border-white/20 shadow-lg">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionControls;

