import React, { useEffect } from 'react';
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
  Bell,
  BookOpen,
  Star,
  Settings,
  MessageSquare,
  Award,
  Sparkles,
  Home
} from 'lucide-react';
import StaggeredMenu from '../reactbits/StaggeredMenu/StaggeredMenu';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: 'Home Page', path: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    { icon: Sparkles, label: 'AI Assistant', path: '/app/ai-chat' },
    { icon: Bell, label: 'Notifications', path: '/app/notifications', badge: 0 },
    { icon: Search, label: 'Find Tutors', path: '/app/search' },
    { icon: Calendar, label: 'My Bookings', path: '/app/bookings' },
    { icon: BookOpen, label: 'Sessions', path: '/app/sessions' },
    { icon: Star, label: 'Reviews', path: '/app/reviews' },
    { icon: MessageSquare, label: 'Messages', path: '/app/messages' },
    { icon: Settings, label: 'Settings', path: '/app/profile' },
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
      {/* New Staggered Sidebar */}
      <StaggeredMenu 
        items={menuItems} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F2F5F9]">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
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
