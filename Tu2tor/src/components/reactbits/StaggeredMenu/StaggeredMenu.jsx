import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const StaggeredMenu = ({ items = [], onLogout, user, isCollapsed, onExpand }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const location = useLocation();

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Smooth content fade variants
  const contentVariants = {
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    hidden: { opacity: 0, x: -10, transition: { duration: 0.15 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      onClick={onExpand}
      className="h-full bg-[#0F172A] text-white flex flex-col relative overflow-hidden shadow-2xl cursor-pointer"
      style={{ 
        width: isCollapsed ? 64 : 224,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header / User Profile */}
      <div 
        className="relative z-10 transition-all duration-300 ease-out"
        style={{ padding: isCollapsed ? '12px' : '20px' }}
      >
        <div className="flex items-center transition-all duration-300" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', gap: isCollapsed ? 0 : '12px' }}>
          <div 
            className="rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px] flex-shrink-0 transition-all duration-300"
            style={{ width: isCollapsed ? 32 : 40, height: isCollapsed ? 32 : 40 }}
          >
            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden">
               {user?.username ? (
                 <span 
                   className="font-bold transition-all duration-300"
                   style={{ fontSize: isCollapsed ? '12px' : '14px' }}
                 >
                   {user.username[0].toUpperCase()}
                 </span>
               ) : (
                 <UserIcon size={isCollapsed ? 14 : 18} />
               )}
            </div>
          </div>
          
          {/* User info - animate with overflow hidden */}
          <div 
            className="flex flex-col min-w-0 overflow-hidden transition-all duration-300"
            style={{ 
              width: isCollapsed ? 0 : 'auto',
              opacity: isCollapsed ? 0 : 1,
            }}
          >
            <span className="font-bold text-sm tracking-tight truncate whitespace-nowrap">{user?.username || 'Student'}</span>
            <span className="text-[10px] text-gray-400 whitespace-nowrap">Student Platform</span>
          </div>
        </div>
        
        {/* Profile Completion Bar - animate height and opacity */}
        <div 
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{ 
            maxHeight: isCollapsed ? 0 : 40,
            opacity: isCollapsed ? 0 : 1,
            marginTop: isCollapsed ? 0 : 12
          }}
        >
          {user && (
            <div>
              <div className="flex justify-between text-[10px] mb-1 text-gray-400">
                <span>Profile Completion</span>
                <span>{user.profileCompletion || 80}%</span>
              </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${user.profileCompletion || 80}%` }}
                  transition={{ duration: 1, delay: 1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav 
        className="flex-1 relative z-10 overflow-y-auto custom-scrollbar transition-all duration-300"
        style={{ padding: isCollapsed ? '0 8px' : '0 12px' }}
      >
        <div className="space-y-1">
          {items.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredIndex === idx;

            return (
              <motion.div
                key={item.path}
                variants={itemVariants}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Link to={item.path} className="block relative group" title={isCollapsed ? item.label : ''} onClick={(e) => e.stopPropagation()}>
                  {/* Active Background */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className={`absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-2 border-blue-500 ${isCollapsed ? 'rounded-lg' : 'rounded-r-lg'}`}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Hover Background */}
                  {!isActive && isHovered && (
                    <div className="absolute inset-0 bg-white/5 rounded-lg" />
                  )}

                  <div 
                    className="relative flex items-center transition-all duration-300"
                    style={{
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      padding: isCollapsed ? '10px 8px' : '10px 12px',
                      gap: isCollapsed ? 0 : '12px'
                    }}
                  >
                    <div className={`relative transition-transform duration-300 ${isHovered ? 'scale-110' : ''} ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      <item.icon size={isCollapsed ? 18 : 16} strokeWidth={isActive ? 2.5 : 2} />
                      {isActive && (
                        <div className="absolute inset-0 blur-md bg-blue-500/50 opacity-50"></div>
                      )}
                    </div>
                    
                    {/* Label - animate with overflow */}
                    <div 
                      className="flex-1 flex items-center overflow-hidden transition-all duration-300"
                      style={{ 
                        width: isCollapsed ? 0 : 'auto',
                        opacity: isCollapsed ? 0 : 1,
                      }}
                    >
                      <span className={`font-medium text-xs tracking-wide whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                        {item.label}
                      </span>

                      <motion.div 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ 
                          x: isHovered || isActive ? 0 : -10, 
                          opacity: isHovered || isActive ? 1 : 0 
                        }}
                        className="ml-auto"
                      >
                        {item.badge > 0 ? (
                           <span className="flex items-center justify-center min-w-[16px] h-4 px-1 text-[8px] font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40">
                             {item.badge}
                           </span>
                        ) : (
                           <ArrowRight size={12} className="text-gray-500 group-hover:text-white" />
                        )}
                      </motion.div>
                    </div>
                  </div>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && isHovered && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50 shadow-lg border border-gray-700">
                      {item.label}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Logout Section */}
      <div 
        className="relative z-10 border-t border-gray-800 transition-all duration-300"
        style={{ padding: isCollapsed ? '8px' : '16px' }}
      >
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => { e.stopPropagation(); onLogout(); }}
          title={isCollapsed ? 'Sign Out' : ''}
          className="w-full flex items-center rounded-lg bg-gray-800/50 hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-all group"
          style={{
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '8px' : '8px 12px',
            gap: isCollapsed ? 0 : '8px'
          }}
        >
          <div 
            className="rounded-md group-hover:bg-red-500/20 transition-all duration-300"
            style={{ 
              padding: isCollapsed ? 0 : '6px',
              backgroundColor: isCollapsed ? 'transparent' : 'rgba(31, 41, 55, 1)'
            }}
          >
             <svg 
               xmlns="http://www.w3.org/2000/svg" 
               width={isCollapsed ? 18 : 14} 
               height={isCollapsed ? 18 : 14} 
               viewBox="0 0 24 24" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="2" 
               strokeLinecap="round" 
               strokeLinejoin="round"
             >
               <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
               <polyline points="16 17 21 12 16 7"></polyline>
               <line x1="21" y1="12" x2="9" y2="12"></line>
             </svg>
          </div>
          <span 
            className="font-medium text-xs overflow-hidden whitespace-nowrap transition-all duration-300"
            style={{ 
              width: isCollapsed ? 0 : 'auto',
              opacity: isCollapsed ? 0 : 1,
            }}
          >
            Sign Out
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const UserIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export default StaggeredMenu;

