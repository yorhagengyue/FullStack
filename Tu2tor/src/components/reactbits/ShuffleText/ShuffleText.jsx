import React, { useEffect, useState, useRef } from 'react';

const ShuffleText = ({ 
  texts = [],
  text,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  className = '',
  speed = 50,
  revealDuration = 3,
  rotationInterval = 3000,
  auto = true,
}) => {
  // Support both single text and multiple texts
  const textArray = texts.length > 0 ? texts : [text];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(textArray[0] || '');
  const intervalRef = useRef(null);
  const rotationTimerRef = useRef(null);

  // Shuffle effect for current text
  useEffect(() => {
    let iteration = 0;
    const targetText = textArray[currentIndex] || '';
    
    clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setDisplayText(
        targetText
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            if (char === ' ') {
              return ' ';
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= targetText.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1 / revealDuration;
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [currentIndex, textArray, characters, speed, revealDuration]);

  // Auto-rotation for multiple texts
  useEffect(() => {
    if (!auto || textArray.length <= 1) return;

    clearTimeout(rotationTimerRef.current);
    
    rotationTimerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % textArray.length);
    }, rotationInterval);

    return () => clearTimeout(rotationTimerRef.current);
  }, [currentIndex, auto, rotationInterval, textArray.length]);

  return <span className={className}>{displayText}</span>;
};

export default ShuffleText;

