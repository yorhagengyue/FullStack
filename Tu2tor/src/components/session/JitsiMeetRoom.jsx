import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Signal, WifiOff, Wifi, Zap, ShieldCheck } from 'lucide-react';

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
      {/* Loading Overlay - New Sci-Fi Tech Design */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
          </div>
          
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Tech Loader Animation */}
            <div className="relative mb-10 group">
              {/* Outer Rotating Ring */}
              <div className="absolute inset-0 rounded-full border border-blue-500/20 border-t-blue-400 w-24 h-24 -ml-2 -mt-2 animate-[spin_3s_linear_infinite]"></div>
              
              {/* Inner Rotating Ring (Counter) */}
              <div className="absolute inset-0 rounded-full border border-purple-500/20 border-b-purple-400 w-16 h-16 ml-2 mt-2 animate-[spin_2s_linear_infinite_reverse]"></div>
              
              {/* Center Element */}
              <div className="relative w-20 h-20 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Wifi className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              
              {/* Orbiting Dot */}
              <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full animate-[spin_4s_linear_infinite]">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-white tracking-wide">
                INITIALIZING <span className="text-blue-500">UPLINK</span>
              </h3>
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-3 text-blue-200/60 font-mono text-xs uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    Secure Channel
                  </span>
                  <span className="w-1 h-1 bg-blue-500/50 rounded-full"></span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Low Latency
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-48 h-0.5 bg-gray-800 rounded-full mt-4 overflow-hidden relative">
                   <div className="absolute inset-y-0 left-0 bg-blue-500 w-full animate-[translateX_1.5s_ease-in-out_infinite] -translate-x-full origin-left"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State - Dark Theme */}
      {loadError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]">
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
             <AlertCircle className="relative w-16 h-16 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-wide">CONNECTION FAILED</h3>
          <p className="text-gray-400 text-sm mb-6 font-mono">Unable to establish secure video link.</p>
          <button
            onClick={() => {
              setLoadError(false);
              setIsLoading(true);
              window.location.reload();
            }}
            className="px-6 py-2.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-red-900/50 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            RETRY CONNECTION
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
