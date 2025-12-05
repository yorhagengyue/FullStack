import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DraggableVideo = ({ children, onClose, onMaximize }) => {
  const [position, setPosition] = useState({ x: 0, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Center the video window on mount
    const updatePosition = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const videoWidth = 400; // w-[400px]
      const videoHeight = 300; // h-[300px]
      
      setPosition({
        x: (windowWidth - videoWidth) / 2,
        y: 100 // Top offset
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.video-controls')) return; // Don't drag when clicking controls
    
    setIsDragging(true);
    startPosRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - startPosRef.current.x;
    const newY = e.clientY - startPosRef.current.y;

    // Constrain to viewport
    const maxX = window.innerWidth - 400; // video width
    const maxY = window.innerHeight - 300; // video height

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <motion.div
      className="fixed z-50 w-[400px] h-[300px] bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-purple-500/50"
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Drag Handle & Controls */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/70 to-transparent p-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-semibold">Live Video</span>
            <span className="text-gray-400 text-xs">(Drag to move)</span>
          </div>
          <div className="flex items-center gap-1 video-controls">
            <button
              onClick={onMaximize}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
              title="Maximize video"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-red-600/80 hover:bg-red-700 text-white rounded transition-colors"
              title="Leave meeting"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Content */}
      <div className="w-full h-full">
        {children}
      </div>

      {/* Resize indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none"></div>
      )}
    </motion.div>
  );
};

export default DraggableVideo;

