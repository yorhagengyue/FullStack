import React, { useState, useEffect } from 'react';

const darkenColor = (hex, percent) => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const Folder = ({ 
  color = '#5227FF', 
  size = 1, 
  items = [], 
  className = '',
  autoTrigger = true,
  triggerInterval = 3000
}) => {
  const maxItems = 3;
  const [open, setOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [displayItems, setDisplayItems] = useState([]);

  // Initialize display items
  useEffect(() => {
    const initialItems = items.slice(0, maxItems);
    while (initialItems.length < maxItems) {
      initialItems.push({ title: 'Note', content: '...' });
    }
    setDisplayItems(initialItems);
  }, [items]);

  // Update display items when folder is closed to create cycling effect
  useEffect(() => {
    if (!open && items.length > maxItems) {
      // Small delay to update content while closed so user doesn't see the jump
      const timeout = setTimeout(() => {
        setCurrentItemIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % items.length;
          
          const newItems = [];
          for (let i = 0; i < maxItems; i++) {
            newItems.push(items[(nextIndex + i) % items.length]);
          }
          setDisplayItems(newItems);
          
          return nextIndex;
        });
      }, 200);
      
      return () => clearTimeout(timeout);
    }
  }, [open, items.length]); // Only depend on open state change and items length

  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  // Auto trigger effect
  useEffect(() => {
    if (!autoTrigger) return;

    const interval = setInterval(() => {
      setOpen(prev => !prev);
    }, triggerInterval);

    return () => clearInterval(interval);
  }, [autoTrigger, triggerInterval]);

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor('#ffffff', 0.1);
  const paper2 = darkenColor('#ffffff', 0.05);
  const paper3 = '#ffffff';

  const handleClick = () => {
    if (autoTrigger) return;
    setOpen(prev => !prev);
  };

  const folderStyle = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3
  };

  const scaleStyle = { transform: `scale(${size})` };

  // Enhanced transform for "further" pop out
  const getOpenTransform = (index) => {
    if (index === 0) return 'translate(-140%, -90%) rotate(-18deg)'; // Further out
    if (index === 1) return 'translate(20%, -90%) rotate(18deg)';   // Further out
    if (index === 2) return 'translate(-60%, -130%) rotate(6deg)';  // Further out (top)
    return '';
  };

  return (
    <div style={scaleStyle} className={className}>
      <div
        className={`group relative transition-all duration-200 ease-in cursor-pointer ${
          !open && !autoTrigger ? 'hover:-translate-y-2' : ''
        }`}
        style={{
          ...folderStyle,
          transform: open ? 'translateY(-8px)' : undefined
        }}
        onClick={handleClick}
      >
        {/* Back of folder */}
        <div
          className="relative w-[100px] h-[80px] rounded-tl-0 rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]"
          style={{ backgroundColor: folderBackColor }}
        >
          {/* Folder Tab */}
          <span
            className="absolute z-0 bottom-[98%] left-0 w-[30px] h-[10px] rounded-tl-[5px] rounded-tr-[5px] rounded-bl-0 rounded-br-0"
            style={{ backgroundColor: folderBackColor }}
          ></span>
          
          {/* Papers */}
          {displayItems.map((item, i) => {
            // Dynamic sizing
            let sizeClasses = '';
            if (i === 0) sizeClasses = 'w-[70%] h-[80%]';
            if (i === 1) sizeClasses = 'w-[80%] h-[80%]';
            if (i === 2) sizeClasses = 'w-[90%] h-[80%]';

            const transformStyle = open
              ? `${getOpenTransform(i)} translate(${paperOffsets[i].x}px, ${paperOffsets[i].y}px)`
              : undefined;

            return (
              <div
                key={i}
                className={`absolute z-20 bottom-[10%] left-1/2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  !open ? 'transform -translate-x-1/2 translate-y-[10%]' : ''
                } ${sizeClasses} flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden`}
                style={{
                  ...(!open ? {} : { transform: transformStyle }),
                  backgroundColor: i === 0 ? paper1 : i === 1 ? paper2 : paper3,
                  borderRadius: '10px'
                }}
              >
                {/* Text Content on Papers */}
                <div className="text-[8px] font-medium text-gray-600 text-center p-1 leading-tight select-none">
                  {item.title || item}
                </div>
              </div>
            );
          })}

          {/* Front of folder (Left Flap) */}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open && !autoTrigger ? 'group-hover:[transform:skew(15deg)_scaleY(0.6)]' : ''
            }`}
            style={{
              backgroundColor: color,
              borderRadius: '5px 10px 10px 10px',
              ...(open && { transform: 'skew(15deg) scaleY(0.6)' })
            }}
          ></div>
          
          {/* Front of folder (Right Flap) */}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open && !autoTrigger ? 'group-hover:[transform:skew(-15deg)_scaleY(0.6)]' : ''
            }`}
            style={{
              backgroundColor: color,
              borderRadius: '5px 10px 10px 10px',
              ...(open && { transform: 'skew(-15deg) scaleY(0.6)' })
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
