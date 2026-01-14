import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Signal, WifiOff } from 'lucide-react';

/**
 * Enhanced Jitsi Meet integration with loading states and better configuration
 * Uses public Jitsi server (meet.jit.si) - No server configuration needed!
 */
const JitsiMeetRoom = ({ 
  roomId, 
  displayName, 
  onMeetingEnd,
  showControls = true,
  quality = 'auto' // 'low', 'medium', 'high', 'auto'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good'); // 'good', 'medium', 'poor'

  useEffect(() => {
    // Simulate iframe load detection
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Monitor connection quality (simulated)
    const qualityInterval = setInterval(() => {
      // In production, this would come from Jitsi API events
      const qualities = ['good', 'medium', 'poor'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(qualityInterval);
    };
  }, [roomId]);

  // Build Jitsi URL with enhanced configuration
  const buildJitsiUrl = () => {
    const baseUrl = import.meta.env.VITE_JITSI_DOMAIN 
      ? `https://${import.meta.env.VITE_JITSI_DOMAIN}` 
      : 'https://meet.jit.si';

    // Enhanced Jitsi configuration
    const config = {
      // Prejoin settings - Enable to show camera preview before joining
      prejoinPageEnabled: true,
      
      // Audio/Video settings
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      requireDisplayName: false,
      
      // UI customization
      disableDeepLinking: true,
      hideConferenceSubject: false,
      hideConferenceTimer: false,
      
      // Quality settings
      resolution: quality === 'high' ? 720 : quality === 'medium' ? 360 : quality === 'low' ? 180 : undefined,
      
      // Features
      enableWelcomePage: false,
      enableClosePage: false,
      
      // Toolbox settings
      toolbarButtons: [
        'microphone',
        'camera',
        'closedcaptions',
        'desktop',
        'fullscreen',
        'fodeviceselection',
        'hangup',
        'profile',
        'chat',
        'recording',
        'livestreaming',
        'etherpad',
        'sharedvideo',
        'settings',
        'raisehand',
        'videoquality',
        'filmstrip',
        'invite',
        'feedback',
        'stats',
        'shortcuts',
        'tileview',
        'videobackgroundblur',
        'download',
        'help',
        'mute-everyone',
        'security'
      ],
      
      // Notifications
      disableJoinLeaveSounds: false,
      enableNoAudioDetection: true,
      enableNoisyMicDetection: true,
      
      // Media constraints
      constraints: {
        video: {
          height: { ideal: quality === 'high' ? 720 : quality === 'medium' ? 360 : 180 },
          width: { ideal: quality === 'high' ? 1280 : quality === 'medium' ? 640 : 320 }
        }
      },
      
      // Enable camera preview in prejoin
      disableInitialGUM: false,
    };

    // Build config string
    const configString = Object.entries(config)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `config.${key}=${JSON.stringify(value)}`;
        }
        return `config.${key}=${value}`;
      })
      .join('&');

    // Use Jitsi's standard room name format for display name
    // Format: baseUrl/roomName/displayName
    const roomPath = displayName 
      ? `${roomId}/${encodeURIComponent(displayName.replace(/\s+/g, '_'))}`
      : roomId;

    return `${baseUrl}/${roomPath}#${configString}`;
  };

  // Handle iframe load error
  const handleIframeError = () => {
    setLoadError(true);
    setIsLoading(false);
  };

  // Get quality indicator color
  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'good':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Get quality icon
  const QualityIcon = () => {
    if (connectionQuality === 'poor') {
      return <WifiOff className={`w-4 h-4 ${getQualityColor()}`} />;
    }
    return <Signal className={`w-4 h-4 ${getQualityColor()}`} />;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg overflow-hidden relative shadow-2xl">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connecting to Video Conference</h3>
            <p className="text-indigo-200 text-sm">Please wait while we set up your meeting room...</p>
            <div className="mt-6 flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/90 to-gray-900/90 backdrop-blur-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Video Conference</h3>
          <p className="text-red-200 text-sm mb-4">There was an error connecting to the meeting room.</p>
          <button
            onClick={() => {
              setLoadError(false);
              setIsLoading(true);
              window.location.reload();
            }}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Connection Quality Indicator */}
      {!isLoading && !loadError && (
        <div className="absolute top-4 left-4 z-40">
          <div className="px-3 py-2 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-2 shadow-lg border border-white/10">
            <QualityIcon />
            <span className={`text-xs font-semibold ${getQualityColor()}`}>
              {connectionQuality === 'good' ? 'Excellent' : 
               connectionQuality === 'medium' ? 'Good' : 
               'Poor'} Connection
            </span>
          </div>
        </div>
      )}

      {/* Jitsi Meet iframe */}
      <iframe
        src={buildJitsiUrl()}
        allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *; clipboard-read; clipboard-write; compute-pressure *; geolocation *"
        allowFullScreen
        className="w-full h-full border-0"
        title="Video Conference"
        onError={handleIframeError}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-presentation"
        style={{
          colorScheme: 'dark'
        }}
      />

      {/* Decorative Border Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-lg animate-pulse"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-xl"></div>
      </div>
    </div>
  );
};

export default JitsiMeetRoom;
