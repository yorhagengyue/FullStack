import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Home, 
  Calendar, 
  Activity, 
  MessageSquare, 
  Settings, 
  MapPin, 
  Maximize2,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Smile,
  Send,
  Video,
  BookOpen
} from 'lucide-react';

// ReactBits Components
import TiltedCard from '../../components/reactbits/TiltedCard/TiltedCard';
import SplitText from '../../components/reactbits/SplitText/SplitText';
import Particles from '../../components/reactbits/Particles/Particles';

// --- Components ---

const TopBar = ({ user, notifications = [] }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/app/dashboard', active: true },
    { icon: Calendar, label: 'Calendar', path: '/app/sessions', active: false },
    { icon: Activity, label: 'Activity', path: '/app/bookings', active: false },
    { icon: MessageSquare, label: 'Messages', path: '/app/messages', active: false },
    { icon: Settings, label: 'Settings', path: '/app/profile', active: false },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between mb-4 gap-3">
      <div className="hidden lg:block w-24"></div>

      <div className="flex items-center bg-gray-50/80 p-1 rounded-full border border-gray-100 shadow-sm overflow-x-auto max-w-full">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              item.active 
                ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className={`w-3.5 h-3.5 ${item.active ? 'text-orange-500' : ''}`} />
            {item.label}
          </Link>
        ))}
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

const HeroCard = ({ nextSession }) => {
  const navigate = useNavigate();
  
  const isStartingSoon = nextSession && nextSession.startTime &&
    !isNaN(new Date(nextSession.startTime).getTime()) &&
    (new Date(nextSession.startTime) - new Date() < 15 * 60 * 1000) &&
    (new Date() < new Date(nextSession.endTime));

  const bgImage = nextSession?.subject?.toLowerCase().includes('python') 
      ? "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1600"
      : nextSession?.subject?.toLowerCase().includes('math')
        ? "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1600"
        : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1600";

  const overlayContent = (
    <div className="w-full h-full p-4 flex flex-col justify-between bg-black/30">
      <div className="bg-white/90 backdrop-blur-md rounded-[20px] p-4 shadow-lg max-w-xs transform transition-all">
        <div className="flex justify-between items-start mb-2">
           <h2 className="text-base font-bold text-gray-900">
             {nextSession ? `Session: ${nextSession.subject}` : 'No Upcoming Session'}
           </h2>
           {nextSession && (
             <div className="flex -space-x-1">
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nextSession.tutor?.username || 'Tutor'}`} alt="Tutor" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-900 text-white text-[10px] flex items-center justify-center font-medium">
                  T
                </div>
             </div>
           )}
        </div>
        
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-gray-600 text-xs">
              <Calendar className="w-3 h-3" />
              <span>
                {nextSession && nextSession.startTime && !isNaN(new Date(nextSession.startTime).getTime())
                  ? new Date(nextSession.startTime).toLocaleDateString() 
                  : 'Check back later'}
              </span>
              {nextSession && nextSession.startTime && !isNaN(new Date(nextSession.startTime).getTime()) && (
                <>
                  <span className="text-gray-300">|</span>
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(nextSession.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </span>
                </>
              )}
           </div>

           <div className="mt-2">
              {nextSession ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/app/session/${nextSession.id}`); }}
                  disabled={!isStartingSoon}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium shadow transition-all ${
                    isStartingSoon 
                      ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  {isStartingSoon ? 'Enter Classroom' : 'Classroom Not Open'}
                </button>
              ) : (
                 <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/app/search'); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-medium shadow transition-all"
                >
                  <Search className="w-3 h-3" />
                  Browse Tutors
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[280px] rounded-[24px] overflow-hidden group">
      <TiltedCard
        imageSrc={bgImage}
        altText="Session Background"
        containerHeight="280px"
        containerWidth="100%"
        imageHeight="100%"
        imageWidth="100%"
        scaleOnHover={1.03}
        rotateAmplitude={6}
        showTooltip={false}
        displayOverlayContent={true}
        overlayContent={overlayContent}
      />
    </div>
  );
};

const ScheduleItem = ({ time, title, duration, color, icon: Icon, onClick }) => (
  <div className="grid grid-cols-[60px_1fr] gap-3 group cursor-pointer" onClick={onClick}>
     <div className="text-right pt-2">
        <span className="text-xs font-medium text-gray-500">{time}</span>
     </div>
     <div className={`relative p-3 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${color}`}>
        <div className="flex justify-between items-start">
           <div>
              <h4 className="font-semibold text-gray-900 text-xs mb-0.5">{title}</h4>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                 <Calendar className="w-2.5 h-2.5" />
                 <span>{duration}</span>
              </div>
           </div>
           {Icon && (
             <div className="w-7 h-7 bg-white/60 rounded-full flex items-center justify-center shadow-sm">
                <Icon className="w-3.5 h-3.5 text-gray-700" />
             </div>
           )}
        </div>
        <div className="absolute left-[-18px] top-3 w-2 h-2 bg-gray-200 rounded-full border-2 border-white ring-1 ring-gray-100 z-10 group-hover:bg-blue-500 group-hover:scale-125 transition-all"></div>
        <div className="absolute left-[-15px] top-5 bottom-[-12px] w-[2px] bg-gray-100"></div>
     </div>
  </div>
);

const GreetingCard = ({ user }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 overflow-hidden">
      {/* Subtle Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={30}
          particleColors={['#FFA500', '#3B82F6', '#E5E7EB']}
          particleSpread={10}
          speed={0.2}
          moveParticlesOnHover={true}
          particleHoverFactor={1.5}
          alphaParticles={true}
          particleBaseSize={40}
          sizeRandomness={0.8}
        />
      </div>

      <div className="relative z-10">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          <SplitText 
             text="Have a Good day," 
             className="block text-sm"
             delay={50}
          />
          <span className="text-orange-500">{user?.username?.split(' ')[0] || 'Student'}</span> 👋
        </h2>
        <p className="text-gray-500 text-xs mb-4 leading-relaxed">
          Fuel your days with the boundless enthusiasm of a lifelong explorer.
        </p>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1.5 flex items-center gap-1.5 mb-4 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
           <input 
             type="text" 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
             placeholder="I want to learn..." 
             className="flex-1 bg-transparent border-none px-3 py-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
           />
           <button 
             onClick={handleSearch}
             className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow shadow-orange-200 transition-all"
           >
              <Send className="w-3 h-3" />
           </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
           {['Python', 'Calculus', 'History', 'Biology'].map((tag, i) => (
             <span 
               key={i} 
               onClick={() => navigate(`/app/search?q=${tag}`)}
               className={`px-3 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors z-10 ${
                 i === 0 ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
               }`}
             >
               {tag}
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};

const MessageItem = ({ name, time, message, unread, avatarSeed, onClick }) => (
  <div onClick={onClick} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
     <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt={name} />
        </div>
        {unread > 0 && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></span>}
     </div>
     <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
           <h4 className="font-semibold text-gray-900 text-xs truncate">{name}</h4>
           <span className="text-[10px] text-gray-400">{time}</span>
        </div>
        <p className={`text-[10px] truncate ${unread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
           {message}
        </p>
     </div>
     {unread > 0 && (
       <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
         {unread}
       </div>
     )}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { bookings, fetchBookings, messages = [], notifications = [] } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user?.userId, user?.id]);

  // Helper to get session time consistently
  const getSessionTime = (booking) => {
    if (booking.startTime) return new Date(booking.startTime);
    if (booking.date) return new Date(booking.date);
    return null;
  };

  // Helper to get booking ID consistently
  const getBookingId = (booking) => booking._id || booking.id || booking.bookingId;

  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .sort((a, b) => {
      const timeA = getSessionTime(a);
      const timeB = getSessionTime(b);
      if (!timeA || !timeB) return 0;
      return timeA - timeB;
    });

  const nextSession = upcomingBookings[0];

  // Helper to format message time safely
  const formatMessageTime = (msg) => {
    const timestamp = msg.timestamp || msg.createdAt;
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  };

  // Helper to get sender name
  const getSenderName = (msg) => {
    const currentUserId = user?.id || user?.userId;
    const senderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
    
    if (String(senderId) === String(currentUserId)) {
      return 'You';
    }
    // Try to get name from populated sender or senderName field
    if (typeof msg.senderId === 'object' && msg.senderId?.username) {
      return msg.senderId.username;
    }
    return msg.senderName || msg.senderUsername || 'User';
  };

  const recentMessages = messages.slice(0, 3); // Only show 3 messages
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-full bg-[#F2F5F9] font-sans">
      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8">
        
        <TopBar user={user} notifications={notifications} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (Main) */}
          <div className="lg:col-span-8 space-y-6">
            
            <section>
               <HeroCard nextSession={nextSession} />
            </section>

            <section>
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-sm font-bold text-gray-900">Upcoming Schedule</h3>
                 <Link to="/app/sessions" className="flex gap-1.5 group">
                    <button className="p-1.5 group-hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                       <Clock className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2.5 py-1 shadow-sm cursor-pointer group-hover:bg-gray-50">
                       <Calendar className="w-3 h-3 text-gray-500" />
                       <span className="text-xs font-medium text-gray-700">
                         {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
                       </span>
                    </div>
                 </Link>
              </div>

              <div className="bg-white rounded-[20px] border border-gray-100 p-4">
                 <div className="grid grid-cols-5 gap-2 mb-4 text-center pb-3 border-b border-gray-100">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNum = date.getDate();
                      const isToday = i === 0;

                      return (
                        <div key={i} className={`flex flex-col items-center gap-0.5 ${isToday ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                           <span className="text-[10px] uppercase tracking-wide opacity-70">{dayName}</span>
                           <span className="text-sm">{dayNum}</span>
                           {isToday && <div className="w-1 h-1 bg-orange-500 rounded-full"></div>}
                        </div>
                      );
                    })}
                 </div>

                 <div className="space-y-1.5">
                    {upcomingBookings.length > 0 ? (
                      upcomingBookings.slice(0, 3).map((booking, i) => {
                        const sessionTime = getSessionTime(booking);
                        const bookingId = getBookingId(booking);
                        return (
                         <ScheduleItem 
                           key={bookingId || i}
                           onClick={() => navigate(`/app/session/${bookingId}`)}
                           time={sessionTime ? sessionTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : booking.timeSlot || 'TBD'}
                           title={`Session: ${booking.subject}`}
                           duration={sessionTime ? sessionTime.toLocaleDateString() : 'TBD'}
                           color={i % 2 === 0 ? 'bg-blue-50' : 'bg-orange-50'}
                           icon={booking.sessionType === 'online' ? Video : BookOpen}
                         />
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                           <Calendar className="w-5 h-5 text-gray-300" />
                        </div>
                        <h4 className="text-gray-900 font-medium text-xs mb-1">No upcoming sessions</h4>
                        <p className="text-gray-500 text-[10px] max-w-xs mb-3">You are all caught up! Ready to learn something new?</p>
                        <button 
                          onClick={() => navigate('/app/search')}
                          className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors"
                        >
                          Find a Tutor
                        </button>
                      </div>
                    )}
                 </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="lg:col-span-4 space-y-4">
             <GreetingCard user={user} />

             {/* System Notifications */}
             <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-100">
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-purple-500" />
                      <h3 className="text-xs font-bold text-gray-900">System Notifications</h3>
                   </div>
                   <Link to="/app/messages" state={{ selectedContactId: 'system' }} className="text-purple-500 hover:text-purple-600 text-[10px] font-medium">
                      View All
                   </Link>
                </div>
                {notifications.length > 0 ? (
                  <div className="space-y-1.5">
                     {notifications.slice(0, 2).map((notif, i) => (
                        <div key={notif._id || i} className="bg-white/70 rounded-lg p-2 text-[10px]">
                           <div className="font-medium text-gray-900 truncate">{notif.title}</div>
                           <div className="text-gray-500 truncate">{notif.message}</div>
                        </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-400 text-[10px]">
                     No notifications
                  </div>
                )}
                {unreadNotifications > 0 && (
                  <div className="mt-2 text-center">
                     <span className="text-[10px] text-purple-600 font-medium">{unreadNotifications} unread</span>
                  </div>
                )}
             </div>

             {/* Messages - Click anywhere to go to Messages page */}
             <div 
               className="bg-white rounded-xl p-2 border border-gray-100 cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all"
               onClick={() => navigate('/app/messages')}
             >
                <div className="flex justify-between items-center mb-2 px-1">
                   <h3 className="text-xs font-bold text-gray-900">Messages</h3>
                   <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                </div>

                <div className="space-y-0.5">
                   {recentMessages.length > 0 ? (
                     recentMessages.map(msg => (
                        <MessageItem 
                          key={msg.messageId || msg._id || msg.id}
                          name={getSenderName(msg)}
                          time={formatMessageTime(msg)}
                          message={msg.content || msg.message}
                          unread={msg.isRead === false ? 1 : 0}
                          avatarSeed={getSenderName(msg)}
                          onClick={() => navigate('/app/messages')}
                        />
                     ))
                   ) : (
                     <div className="text-center py-3 text-gray-400 text-[10px]">
                       Click to view messages
                     </div>
                   )}
                </div>

                <div className="w-full mt-2 bg-gray-50 rounded-lg py-1.5 px-2 text-[10px] text-gray-500 font-medium flex items-center justify-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Open Messages
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
