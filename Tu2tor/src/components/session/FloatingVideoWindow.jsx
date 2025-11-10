import { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import JitsiMeetRoom from './JitsiMeetRoom';

const FloatingVideoWindow = ({
  roomId,
  displayName,
  sessionInfo,
  onClose,
  onMaximize
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  return (
    <div
      ref={windowRef}
      className="fixed z-[9999] bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-gray-700"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        height: '280px',
      }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-gray-800 px-3 py-2 flex items-center justify-between cursor-move select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium truncate max-w-[200px]">
            {sessionInfo?.subject || 'Video Call'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMaximize}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Maximize"
          >
            <Maximize2 className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-red-600 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div className="h-[calc(100%-36px)] bg-black">
        <JitsiMeetRoom
          roomId={roomId}
          displayName={displayName}
          onMeetingEnd={onClose}
        />
      </div>
    </div>
  );
};

export default FloatingVideoWindow;
