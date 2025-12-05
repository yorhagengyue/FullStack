import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Home, Calendar, CheckSquare, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const TopBar = () => {
  const { user } = useAuth();
  const { notifications = [] } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/app/dashboard' },
    { icon: Calendar, label: 'Calendar', path: '/app/calendar' },
    { icon: CheckSquare, label: 'Todo', path: '/app/todo' },
    { icon: BookOpen, label: 'Notes', path: '/app/study-notes' },
    { icon: Settings, label: 'Settings', path: '/app/profile' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-5">
      <div className="hidden lg:block w-24"></div>

      <div className="flex items-center bg-gray-50/80 p-1.5 rounded-full border border-gray-100 shadow-sm overflow-x-auto max-w-full">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here..." 
            className="pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-full text-xs focus:ring-2 focus:ring-blue-100 w-48 outline-none transition-all"
          />
        </form>
        <Link to="/app/messages" state={{ selectedContactId: 'system' }} className="p-2 bg-white border border-gray-100 rounded-full text-gray-500 hover:bg-gray-50 shadow-sm relative">
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
          )}
        </Link>
        <Link to="/app/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-white shadow-sm overflow-hidden">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </div>
  );
};

export default TopBar;

