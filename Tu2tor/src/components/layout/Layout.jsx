import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Area Removed */}
        <div className="p-6 border-b border-gray-200">
           {/* Kept only the subtitle or removed image/brand name as requested */}
           <Link to="/app/dashboard" className="flex flex-col">
             <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Platform</span>
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative ${isActive(item.path)
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
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
