import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AIAssistantButton from '../ai/AIAssistantButton';
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
  Award
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
    { icon: Bell, label: 'Notifications', path: '/app/notifications', badge: 0 },
    { icon: Search, label: 'Find Tutors', path: '/app/search' },
    { icon: Calendar, label: 'My Bookings', path: '/app/bookings' },
    { icon: BookOpen, label: 'Sessions', path: '/app/sessions' },
    { icon: Star, label: 'Reviews', path: '/app/reviews' },
    { icon: MessageSquare, label: 'Messages', path: '/app/messages' },
    { icon: Settings, label: 'Settings', path: '/app/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/app/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Tu2tor</span>
              <p className="text-xs text-gray-500">Student Platform</p>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Menu</p>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute right-4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Profile Completion */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">Complete Profile</p>
            <p className="text-xs text-gray-600 mb-3">
              Your profile is {user?.profileCompletion || 70}% complete
            </p>
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${user?.profileCompletion || 70}%` }}
              />
            </div>
            <Link to="/app/profile" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Complete your profile now
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">Quick Stats</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 px-4 py-2 bg-yellow-50 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-xs text-gray-600">Credits</p>
                  <p className="font-bold text-gray-900">{user?.credits || 0}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 px-4 py-2 bg-green-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Sessions</p>
                  <p className="font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tutors, courses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4 ml-6">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <MessageSquare className="w-6 h-6" />
              </button>
              <Link to="/app/profile" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>

        {/* AI Assistant Button */}
        <AIAssistantButton />
      </div>
    </div>
  );
};

export default Layout;
