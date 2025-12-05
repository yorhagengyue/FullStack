import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ShinyText from '../reactbits/ShinyText/ShinyText';

const ThinkingDisplay = ({ thinkingContent, isComplete = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse when complete
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 1500); // 1.5s delay before auto-collapse
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  if (!thinkingContent) return null;

  return (
    <div className="mb-3">
      {/* Dropdown Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
      >
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
        <ShinyText 
          text={isComplete ? "Thinking complete" : "Thinking..."} 
          disabled={isComplete}
          speed={2}
          className="text-sm font-medium"
        />
      </button>

      {/* Thinking Content - streaming creates natural typewriter effect */}
      {isExpanded && (
        <div className="mt-2 ml-6">
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-500">
            {thinkingContent}
            {!isComplete && <span className="inline-block w-1 h-4 ml-1 bg-gray-400 animate-pulse"></span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThinkingDisplay;

