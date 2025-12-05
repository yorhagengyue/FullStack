/**
 * Simple Jitsi Meet integration using iframe
 * Uses public Jitsi server (meet.jit.si) - No server configuration needed!
 */
const JitsiMeetRoom = ({ roomId, displayName, onMeetingEnd }) => {
  // Build Jitsi URL with room name and configuration
  const buildJitsiUrl = () => {
    const baseUrl = 'https://meet.jit.si';
    // Use hash parameters to configure Jitsi
    const config = {
      prejoinPageEnabled: false,
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      disableDeepLinking: true,
    };

    const userInfo = {
      displayName: displayName || 'Guest',
    };

    const configString = Object.entries(config)
      .map(([key, value]) => `config.${key}=${value}`)
      .join('&');

    const userInfoString = Object.entries(userInfo)
      .map(([key, value]) => `userInfo.${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `${baseUrl}/${roomId}#${configString}&${userInfoString}`;
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
      <iframe
        src={buildJitsiUrl()}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        allowFullScreen
        className="w-full h-full border-0"
        title="Video Conference"
      />
    </div>
  );
};

export default JitsiMeetRoom;
