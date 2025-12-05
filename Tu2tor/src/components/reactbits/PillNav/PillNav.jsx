import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PillNav = ({ items, className }) => {
  // We don't strictly enforce a single active state here because the buttons have different behaviors (toggle vs action)
  // But we provide the visual structure.

  return (
    <nav className={`flex items-center gap-1 p-1 bg-white border border-black/10 rounded-full shadow-lg shadow-black/5 ${className}`}>
      {items.map((item, index) => {
        const isActive = item.isActive;
        
        return (
          <button
            key={index}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`
              relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              flex items-center gap-2 select-none
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isActive ? 'text-white' : 'text-zinc-600 hover:text-black'}
            `}
            title={item.title}
          >
            {isActive && (
              <motion.div
                layoutId="pill-nav-active"
                className="absolute inset-0 bg-black rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            {!isActive && !item.disabled && (
               <div className="absolute inset-0 bg-zinc-100 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200" />
            )}

            <span className="relative z-10 flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default PillNav;

