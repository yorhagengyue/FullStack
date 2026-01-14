import { useState, useEffect } from 'react';
import { 
  Code2, 
  FileText, 
  BookOpen, 
  Maximize, 
  Minimize, 
  Phone,
  Layout
} from 'lucide-react';

const SessionControls = ({
  sessionStarted,
  startTime,
  showCodeEditor,
  showMarkdownEditor,
  showKBPanel,
  isFullscreen,
  onToggleCode,
  onToggleMarkdown,
  onToggleKB,
  onToggleFullscreen,
  onEndMeeting,
}) => {
  const [sessionDuration, setSessionDuration] = useState('00:00:00');

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

  const ControlButton = ({ icon: Icon, label, isActive, onClick, variant = 'default', badge }) => {
    const baseClasses = "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-md group";
    const variants = {
      default: "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200",
      active: "bg-blue-100 text-blue-600 border border-blue-200 hover:bg-blue-200",
      danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-200",
      primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200",
      dark: "bg-gray-800 text-white hover:bg-gray-700"
    };

    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} ${isActive ? variants.active : variants[variant]}`}
        title={label}
      >
        <Icon className="w-5 h-5" />
        {badge && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {badge}
          </span>
        )}
        {/* Tooltip */}
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 transition-all rounded bg-gray-900 p-2 text-xs text-white group-hover:scale-100 opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-lg pointer-events-none">
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className={`flex items-center gap-4 px-6 py-3 bg-white rounded-full shadow-xl border border-gray-200 z-50 ${
      isFullscreen ? 'fixed bottom-6 left-1/2 -translate-x-1/2' : ''
    }`}>
      
      {/* Session Timer (Visible in control bar) */}
      <div className="mr-4 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 text-xs font-mono font-medium text-gray-500 hidden sm:block">
        {sessionDuration}
      </div>

      <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block" />

      {/* Collaboration Tools */}
      <ControlButton 
        icon={Code2} 
        label="Code Editor" 
        isActive={showCodeEditor}
        onClick={onToggleCode}
      />

      <ControlButton 
        icon={FileText} 
        label="Markdown Notes" 
        isActive={showMarkdownEditor}
        onClick={onToggleMarkdown}
      />

      <ControlButton 
        icon={BookOpen} 
        label="Knowledge Base" 
        isActive={showKBPanel}
        onClick={onToggleKB}
      />

      <div className="w-px h-8 bg-gray-200 mx-2" />

      {/* View Controls */}
      <ControlButton 
        icon={isFullscreen ? Minimize : Maximize} 
        label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        onClick={onToggleFullscreen}
      />

      {/* End Meeting - Big Red Button */}
      <ControlButton 
        icon={Phone} 
        label="End Meeting" 
        variant="danger"
        onClick={onEndMeeting}
      />

    </div>
  );
};

export default SessionControls;
