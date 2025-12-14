import React, { useEffect, useState, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Search,
  Calendar,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Star,
  Settings,
  MessageSquare,
  Award,
  Sparkles,
  Home,
  Clock,
  CheckSquare,
  Database
} from 'lucide-react';
import StaggeredMenu from '../reactbits/StaggeredMenu/StaggeredMenu';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const collapseTimeoutRef = useRef(null);

  // Scroll to top when route changes
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Expand sidebar when clicking on it
  const expandSidebar = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
    setSidebarCollapsed(false);
  };

  // Collapse sidebar when mouse enters main content area
  const handleMainContentMouseEnter = () => {
    // Add a small delay to prevent accidental collapse
    collapseTimeoutRef.current = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 300);
  };

  // Cancel collapse if mouse leaves main content quickly
  const handleMainContentMouseLeave = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Home Page', path: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    { icon: Sparkles, label: 'AI Assistant', path: '/app/ai-chat' },
    { icon: Database, label: 'Knowledge Base', path: '/app/knowledge-base' },
    { icon: MessageSquare, label: 'Messages', path: '/app/messages' },
    { icon: Search, label: 'Find Tutors', path: '/app/search' },
    { icon: Clock, label: 'My Bookings', path: '/app/bookings' },
    { icon: BookOpen, label: 'Sessions', path: '/app/sessions' },
    { icon: Star, label: 'Reviews', path: '/app/reviews' },
  ];

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10,
      scale: 0.99
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1] // Cubic bezier for smooth finish
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.99,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Collapsible Sidebar - click to expand */}
      <StaggeredMenu 
        items={menuItems} 
        user={user} 
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onExpand={expandSidebar}
      />

      {/* Main Content - hover to collapse sidebar */}
      <div 
        className="flex-1 flex flex-col overflow-hidden bg-[#F2F5F9] transition-all duration-300"
        onMouseEnter={handleMainContentMouseEnter}
        onMouseLeave={handleMainContentMouseLeave}
      >
        {/* Page Content - larger padding for more spacious layout */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="h-full w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
