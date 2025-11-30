import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const StaggeredMenu = ({ items = [], onLogout, user }) => {
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
        staggerChildren: 0.1,
        delayChildren: 0.2
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

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="h-full w-64 bg-[#0F172A] text-white flex flex-col relative overflow-hidden shadow-2xl"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header / User Profile */}
      <div className="p-8 relative z-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center overflow-hidden">
               {user?.username ? (
                 <span className="text-lg font-bold">{user.username[0].toUpperCase()}</span>
               ) : (
                 <UserIcon />
               )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">{user?.username || 'Student'}</span>
            <span className="text-xs text-gray-400">Student Platform</span>
          </div>
        </div>
        
        {/* Profile Completion Bar */}
        {user && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1 text-gray-400">
              <span>Profile Completion</span>
              <span>{user.profileCompletion || 70}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${user.profileCompletion || 70}%` }}
                transition={{ duration: 1, delay: 1 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 relative z-10 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
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
                <Link to={item.path} className="block relative group">
                  {/* Active Background */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-2 border-blue-500 rounded-r-xl"
                    />
                  )}

                  {/* Hover Background */}
                  {!isActive && isHovered && (
                    <div className="absolute inset-0 bg-white/5 rounded-xl" />
                  )}

                  <div className={`relative flex items-center gap-4 px-4 py-3.5 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    <div className={`relative transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      {/* Glow effect on icon */}
                      {isActive && (
                        <div className="absolute inset-0 blur-md bg-blue-500/50 opacity-50"></div>
                      )}
                    </div>
                    
                    <span className="font-medium tracking-wide">{item.label}</span>

                    {/* Arrow slide in on hover */}
                    <motion.div 
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ 
                        x: isHovered || isActive ? 0 : -10, 
                        opacity: isHovered || isActive ? 1 : 0 
                      }}
                      className="ml-auto"
                    >
                      {item.badge > 0 ? (
                         <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/40">
                           {item.badge}
                         </span>
                      ) : (
                         <ArrowRight size={14} className="text-gray-500 group-hover:text-white" />
                      )}
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Logout Section */}
      <div className="p-6 relative z-10 border-t border-gray-800">
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-all group"
        >
          <div className="p-2 rounded-lg bg-gray-800 group-hover:bg-red-500/20 transition-colors">
             {/* LogOut Icon would be passed here usually, but I'll import or use slot */}
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </div>
          <span className="font-medium">Sign Out</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

export default StaggeredMenu;

