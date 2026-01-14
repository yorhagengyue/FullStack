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
  Keyboard,
  Phone,
  Share,
  Layout
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
  onEndMeeting,
  bookingInfo
}) => {
  const [sessionDuration, setSessionDuration] = useState('00:00:00');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

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
        <span className="absolute -top-10 scale-0 transition-all rounded bg-gray-900 p-2 text-xs text-white group-hover:scale-100 opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className={`flex items-center gap-4 px-8 py-4 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 ${
      isFullscreen ? 'fixed bottom-6 left-1/2 -translate-x-1/2' : ''
    }`}>
      
      {/* Audio Controls */}
      <ControlButton 
        icon={micEnabled ? Mic : MicOff} 
        label={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
        variant={micEnabled ? "default" : "danger"} // Use danger style for muted state usually, or default/gray
        onClick={() => setMicEnabled(!micEnabled)}
      />
      
      <ControlButton 
        icon={cameraEnabled ? Video : VideoOff} 
        label={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
        variant={cameraEnabled ? "default" : "danger"}
        onClick={() => setCameraEnabled(!cameraEnabled)}
      />

      <div className="w-px h-8 bg-gray-200 mx-2" />

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

      {/* Screen Share & Layout */}
      <ControlButton 
        icon={Monitor} 
        label="Share Screen" 
        onClick={() => {}} 
      />

      {/* End Meeting - Big Red Button */}
      <ControlButton 
        icon={Phone} 
        label="End Meeting" 
        variant="danger"
        onClick={onEndMeeting}
      />

      <div className="w-px h-8 bg-gray-200 mx-2" />

      {/* View Controls */}
      <ControlButton 
        icon={isFullscreen ? Minimize : Maximize} 
        label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        onClick={onToggleFullscreen}
      />
      
      <ControlButton 
        icon={Settings} 
        label="Settings" 
        onClick={() => {}} 
      />

    </div>
  );
};

export default SessionControls;
