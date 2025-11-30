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
    <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-6">
      <div className="hidden lg:block w-32"></div>

      <div className="flex items-center bg-gray-50/80 p-1.5 rounded-full border border-gray-100 shadow-sm overflow-x-auto max-w-full">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              item.active 
                ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className={`w-4 h-4 ${item.active ? 'text-orange-500' : ''}`} />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search here..." 
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-100 w-64 outline-none transition-all"
          />
        </form>
        <Link to="/app/notifications" className="p-2.5 bg-white border border-gray-100 rounded-full text-gray-500 hover:bg-gray-50 shadow-sm relative">
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>
        <Link to="/app/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-white shadow-sm overflow-hidden">
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
    <div className="w-full h-full p-8 flex flex-col justify-between bg-black/30">
      <div className="bg-white/90 backdrop-blur-md rounded-[30px] p-6 shadow-lg max-w-sm transform transition-all">
        <div className="flex justify-between items-start mb-4">
           <h2 className="text-2xl font-bold text-gray-900">
             {nextSession ? `Session: ${nextSession.subject}` : 'No Upcoming Session'}
           </h2>
           {nextSession && (
             <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nextSession.tutor?.username || 'Tutor'}`} alt="Tutor" />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                  Tutor
                </div>
             </div>
           )}
        </div>
        
        <div className="space-y-3">
           <div className="flex items-center gap-3 text-gray-600 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {nextSession && nextSession.startTime && !isNaN(new Date(nextSession.startTime).getTime())
                  ? new Date(nextSession.startTime).toLocaleDateString() 
                  : 'Check back later'}
              </span>
              {nextSession && nextSession.startTime && !isNaN(new Date(nextSession.startTime).getTime()) && (
                <>
                  <span className="text-gray-300">|</span>
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(nextSession.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </span>
                </>
              )}
           </div>

           <div className="mt-4">
              {nextSession ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/app/session/${nextSession.id}`); }}
                  disabled={!isStartingSoon}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl shadow-lg transition-all ${
                    isStartingSoon 
                      ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  {isStartingSoon ? 'Enter Classroom' : 'Classroom Not Open'}
                </button>
              ) : (
                 <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/app/search'); }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg transition-all"
                >
                  <Search className="w-4 h-4" />
                  Browse Tutors
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-[400px] rounded-[40px] overflow-hidden group">
      <TiltedCard
        imageSrc={bgImage}
        altText="Session Background"
        containerHeight="400px"
        containerWidth="100%"
        imageHeight="100%"
        imageWidth="100%"
        scaleOnHover={1.05}
        rotateAmplitude={8}
        showTooltip={false}
        displayOverlayContent={true}
        overlayContent={overlayContent}
      />
    </div>
  );
};

const ScheduleItem = ({ time, title, duration, color, icon: Icon, onClick }) => (
  <div className="grid grid-cols-[80px_1fr] gap-4 group cursor-pointer" onClick={onClick}>
     <div className="text-right pt-3">
        <span className="text-sm font-medium text-gray-500">{time}</span>
     </div>
     <div className={`relative p-5 rounded-[24px] transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${color}`}>
        <div className="flex justify-between items-start">
           <div>
              <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                 <Calendar className="w-3 h-3" />
                 <span>{duration}</span>
              </div>
           </div>
           {Icon && (
             <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5 text-gray-700" />
             </div>
           )}
        </div>
        <div className="absolute left-[-26px] top-5 w-3 h-3 bg-gray-200 rounded-full border-2 border-white ring-1 ring-gray-100 z-10 group-hover:bg-blue-500 group-hover:scale-125 transition-all"></div>
        <div className="absolute left-[-21px] top-8 bottom-[-20px] w-[2px] bg-gray-100"></div>
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
    <div className="relative bg-white rounded-[36px] p-8 shadow-sm border border-gray-100 overflow-hidden">
      {/* Subtle Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={50}
          particleColors={['#FFA500', '#3B82F6', '#E5E7EB']}
          particleSpread={10}
          speed={0.2}
          moveParticlesOnHover={true}
          particleHoverFactor={1.5}
          alphaParticles={true}
          particleBaseSize={60}
          sizeRandomness={0.8}
        />
      </div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          <SplitText 
             text="Have a Good day," 
             className="block"
             delay={50}
          />
          <span className="text-orange-500">{user?.username?.split(' ')[0] || 'Student'}</span> 👋
        </h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Fuel your days with the boundless enthusiasm of a lifelong explorer.
        </p>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-2 flex items-center gap-2 mb-6 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
           <input 
             type="text" 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
             placeholder="I want to learn..." 
             className="flex-1 bg-transparent border-none px-4 text-gray-700 placeholder-gray-400 focus:outline-none"
           />
           <button 
             onClick={handleSearch}
             className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-200 transition-all"
           >
              <Send className="w-4 h-4" />
           </button>
        </div>

        <div className="flex flex-wrap gap-2">
           {['Python', 'Calculus', 'History', 'Biology'].map((tag, i) => (
             <span 
               key={i} 
               onClick={() => navigate(`/app/search?q=${tag}`)}
               className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors z-10 ${
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
  <div onClick={onClick} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
     <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt={name} />
        </div>
        {unread > 0 && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
     </div>
     <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
           <h4 className="font-bold text-gray-900 text-sm truncate">{name}</h4>
           <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className={`text-xs truncate ${unread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
           {message}
        </p>
     </div>
     {unread > 0 && (
       <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm mt-1">
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
  }, [user?.userId]);

  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const nextSession = upcomingBookings[0];

  const recentMessages = messages.slice(0, 5); 

  return (
    <div className="min-h-screen bg-[#F2F5F9] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1600px] bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-6 md:p-10 min-h-[90vh]">
        
        <TopBar user={user} notifications={notifications} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN (Main) */}
          <div className="lg:col-span-8 space-y-10">
            
            <section>
               <HeroCard nextSession={nextSession} />
            </section>

            <section>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-gray-900">Upcoming Schedule</h3>
                 <Link to="/app/sessions" className="flex gap-2 group">
                    <button className="p-2 group-hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                       <Clock className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm cursor-pointer group-hover:bg-gray-50">
                       <Calendar className="w-4 h-4 text-gray-500" />
                       <span className="text-sm font-medium text-gray-700">
                         {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                       </span>
            </div>
                 </Link>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-100 p-6">
                 <div className="grid grid-cols-5 gap-4 mb-8 text-center pb-4 border-b border-gray-100">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      const dayNum = date.getDate();
                      const isToday = i === 0;

                      return (
                        <div key={i} className={`flex flex-col items-center gap-1 ${isToday ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                           <span className="text-xs uppercase tracking-wide opacity-70">{dayName}</span>
                           <span className="text-lg">{dayNum}</span>
                           {isToday && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1"></div>}
            </div>
                      );
                    })}
          </div>

                 <div className="space-y-2">
                    {upcomingBookings.length > 0 ? (
                      upcomingBookings.slice(0, 3).map((booking, i) => (
                         <ScheduleItem 
                           key={i}
                           onClick={() => navigate(`/app/session/${booking.id}`)}
                           time={new Date(booking.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           title={`Session: ${booking.subject}`}
                           duration={`${new Date(booking.startTime).toLocaleDateString()}`}
                           color={i % 2 === 0 ? 'bg-blue-50' : 'bg-orange-50'}
                           icon={booking.type === 'video' ? Video : BookOpen}
                         />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                           <Calendar className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-gray-900 font-medium mb-2">No upcoming sessions</h4>
                        <p className="text-gray-500 text-sm max-w-xs mb-6">You are all caught up! Ready to learn something new?</p>
                        <button 
                          onClick={() => navigate('/app/search')}
                          className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
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
          <div className="lg:col-span-4 space-y-8">
             <GreetingCard user={user} />

             <div className="bg-white p-2">
                <div className="flex justify-between items-center mb-6 px-2">
                   <h3 className="text-xl font-bold text-gray-900">Messages</h3>
                   <Link to="/app/messages" className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                   </Link>
              </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {recentMessages.length > 0 ? (
                     recentMessages.map(msg => (
                        <MessageItem 
                          key={msg.messageId || msg.id}
                          name={msg.senderId === user?.userId ? 'You' : (msg.senderName || 'User')}
                          time={new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          message={msg.content || msg.message}
                          unread={msg.isRead === false ? 1 : 0}
                          avatarSeed={msg.senderName || 'User'}
                          onClick={() => navigate(`/app/messages/${msg.senderId === user?.userId ? msg.receiverId : msg.senderId}`)}
                        />
                     ))
                   ) : (
                     <div className="text-center py-8 text-gray-400 text-sm">
                       No messages yet.
                  </div>
                   )}
              </div>

                {recentMessages.length > 0 && (
                  <div className="mt-8 bg-gray-50 rounded-[24px] p-4 border border-gray-100 relative overflow-hidden">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                           <div className="text-xs text-gray-400 mb-1">Recent</div>
                           <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[80%] truncate">
                              {recentMessages[0]?.content || recentMessages[0]?.message}
              </div>
            </div>
          </div>

                     <div className="relative mt-4">
                        <button 
                          onClick={() => navigate('/app/messages')}
                          className="w-full bg-white border-none rounded-full py-3 px-4 text-sm shadow-sm text-left text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          Open Messages...
                        </button>
                        <div className="absolute right-1 top-1 p-2 bg-orange-500 rounded-full text-white shadow-md pointer-events-none">
                           <Send className="w-3 h-3" />
              </div>
                </div>
              </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
