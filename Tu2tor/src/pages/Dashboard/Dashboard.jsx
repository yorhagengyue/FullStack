import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
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
  Send
} from 'lucide-react';

// --- Components ---

const TopBar = ({ user }) => {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Calendar, label: 'Calendar', active: false },
    { icon: Activity, label: 'Activity', active: false },
    { icon: MessageSquare, label: 'Messages', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-6">
      {/* Logo Area */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold">
          T
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">Tu2tor</span>
      </div>

      {/* Center Navigation Pills */}
      <div className="flex items-center bg-gray-50/80 p-1.5 rounded-full border border-gray-100 shadow-sm overflow-x-auto max-w-full">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              item.active 
                ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className={`w-4 h-4 ${item.active ? 'text-orange-500' : ''}`} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search here..." 
            className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-100 w-64 outline-none transition-all"
          />
        </div>
        <button className="p-2.5 bg-white border border-gray-100 rounded-full text-gray-500 hover:bg-gray-50 shadow-sm relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-white shadow-sm overflow-hidden">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

const HeroCard = ({ nextSession }) => {
  return (
    <div className="relative w-full h-[400px] rounded-[40px] overflow-hidden group">
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600" 
        alt="Landscape" 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute top-8 left-8">
        <div className="bg-white/90 backdrop-blur-md rounded-[30px] p-6 shadow-lg max-w-sm transform transition-all hover:-translate-y-1 duration-300">
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-2xl font-bold text-gray-900">
               {nextSession ? `Session: ${nextSession.subject || 'General'}` : 'Python Basics'}
             </h2>
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Peer" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                  +2
                </div>
             </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center gap-3 text-gray-600 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {nextSession 
                    ? new Date(nextSession.startTime).toLocaleDateString() 
                    : '11 Nov - 16 Nov'}
                </span>
                <span className="text-gray-300">|</span>
                <Clock className="w-4 h-4" />
                <span>
                  {nextSession 
                    ? new Date(nextSession.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
                    : '11:00 AM'}
                </span>
             </div>

             {/* Mini Map Preview */}
             <div className="relative h-32 bg-blue-50 rounded-2xl overflow-hidden mt-4 border border-white/50">
                <div className="absolute inset-0 bg-[url('https://docs.mapbox.com/mapbox-gl-js/assets/streets-v11.png')] bg-cover opacity-60"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-orange-500 p-2 rounded-full shadow-lg text-white animate-bounce">
                      <MapPin className="w-5 h-5" />
                   </div>
                </div>
                <button className="absolute bottom-3 right-3 p-2 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors">
                   <Maximize2 className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScheduleItem = ({ time, title, type, color, icon: Icon, duration }) => (
  <div className="grid grid-cols-[80px_1fr] gap-4 group">
     <div className="text-right pt-3">
        <span className="text-sm font-medium text-gray-500">{time}</span>
     </div>
     <div className={`relative p-5 rounded-[24px] transition-all duration-300 hover:shadow-md ${color}`}>
        <div className="flex justify-between items-start">
           <div>
              <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                 <Calendar className="w-3 h-3" />
                 <span>{duration}</span>
              </div>
           </div>
           {Icon && (
             <div className="w-10 h-10 bg-white/60 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 text-gray-700" />
             </div>
           )}
        </div>
        {/* Connect line */}
        <div className="absolute left-[-26px] top-5 w-3 h-3 bg-gray-200 rounded-full border-2 border-white ring-1 ring-gray-100 z-10 group-hover:bg-blue-500 group-hover:scale-125 transition-all"></div>
        <div className="absolute left-[-21px] top-8 bottom-[-20px] w-[2px] bg-gray-100"></div>
     </div>
  </div>
);

const GreetingCard = ({ user }) => {
  return (
    <div className="bg-white rounded-[36px] p-8 shadow-sm border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Have a Good day, <br />
        <span className="text-orange-500">{user?.username?.split(' ')[0] || 'Student'}</span> 👋
      </h2>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        Fuel your days with the boundless enthusiasm of a lifelong explorer.
      </p>
      
      <div className="bg-gray-50 rounded-3xl p-2 flex items-center gap-2 mb-6 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
         <input 
           type="text" 
           placeholder="I want to learn..." 
           className="flex-1 bg-transparent border-none px-4 text-gray-700 placeholder-gray-400 focus:outline-none"
         />
         <button className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-200 transition-all">
            <Send className="w-4 h-4" />
         </button>
      </div>

      <div className="flex flex-wrap gap-2">
         {['Now', 'Tomorrow', 'Next week', 'Custom'].map((tag, i) => (
           <span 
             key={i} 
             className={`px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors ${
               i === 0 ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
             }`}
           >
             {tag}
           </span>
         ))}
      </div>
    </div>
  );
};

const MessageItem = ({ name, time, message, unread, avatarSeed }) => (
  <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
     <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt={name} />
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
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
  const { bookings, fetchBookings } = useApp();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user?.userId]);

  // Filter bookings
  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'pending')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const nextSession = upcomingBookings[0];

  // Mock Chat Data
  const messages = [
    { id: 1, name: 'Jane Cooper', time: '15:00', message: 'Available for python?', unread: 2, seed: 'Jane' },
    { id: 2, name: 'Jenny Wilson', time: '13:45', message: 'Lets join us Wendy!', unread: 0, seed: 'Jenny' },
    { id: 3, name: 'Broklyn Simon', time: '10:20', message: 'Docs attached.', unread: 1, seed: 'Broklyn' },
    { id: 4, name: 'Theresa Angel', time: '08:30', message: 'Can we reschedule?', unread: 3, seed: 'Theresa' },
    { id: 5, name: 'Kim Minji', time: 'Monday', message: 'Thanks for the help!', unread: 0, seed: 'Kim' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F5F9] p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1600px] bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-6 md:p-10 min-h-[90vh]">
        
        <TopBar user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN (Main) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Hero Section */}
            <section>
               <HeroCard nextSession={nextSession} />
            </section>

            {/* Schedule Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-gray-900">Upcoming Schedule</h3>
                 <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                       <Clock className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm cursor-pointer hover:bg-gray-50">
                       <Calendar className="w-4 h-4 text-gray-500" />
                       <span className="text-sm font-medium text-gray-700">December 2023</span>
                    </div>
                 </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-[32px] border border-gray-100 p-6">
                 {/* Day Headers */}
                 <div className="grid grid-cols-5 gap-4 mb-8 text-center pb-4 border-b border-gray-100">
                    {['Sun 10', 'Mon 11', 'Tue 12', 'Wed 13', 'Thu 14'].map((day, i) => (
                      <div key={i} className={`flex flex-col items-center gap-1 ${i === 1 ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                         <span className="text-xs uppercase tracking-wide opacity-70">{day.split(' ')[0]}</span>
                         <span className="text-lg">{day.split(' ')[1]}</span>
                         {i === 1 && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1"></div>}
                      </div>
                    ))}
                 </div>

                 {/* Events */}
                 <div className="space-y-2">
                    {upcomingBookings.length > 0 ? (
                      upcomingBookings.slice(0, 3).map((booking, i) => (
                         <ScheduleItem 
                           key={i}
                           time={new Date(booking.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           title={`Session: ${booking.subject}`}
                           duration="1 hour"
                           color={i % 2 === 0 ? 'bg-blue-50' : 'bg-orange-50'}
                           icon={i % 2 === 0 ? null : MapPin}
                         />
                      ))
                    ) : (
                      <>
                        <ScheduleItem 
                          time="11 am" 
                          title="Python Basics: Loops" 
                          duration="10 Dec • 11:00 AM" 
                          color="bg-cyan-50" 
                        />
                         <div className="grid grid-cols-[80px_1fr] gap-4 group my-6">
                            <div className="text-right pt-12">
                               <span className="text-sm font-medium text-gray-500">12 pm</span>
                            </div>
                            <div className="relative h-[180px] rounded-[24px] overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-500">
                               <img 
                                 src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800" 
                                 alt="Camping" 
                                 className="absolute inset-0 w-full h-full object-cover"
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                               <div className="absolute bottom-6 left-6 text-white">
                                  <h4 className="font-bold text-lg mb-1">Group Study: Data Structures</h4>
                                  <div className="flex items-center gap-4 text-xs opacity-90">
                                     <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 11 Dec - 12 Dec</span>
                                     <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 11:00 AM</span>
                                  </div>
                                  <div className="flex -space-x-2 mt-3">
                                      {[1,2,3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border border-white bg-gray-200 overflow-hidden">
                                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="Peer" />
                                        </div>
                                      ))}
                                      <div className="w-6 h-6 rounded-full border border-white bg-white/20 backdrop-blur-sm text-[10px] flex items-center justify-center font-medium">
                                        +2
                                      </div>
                                   </div>
                               </div>
                               {/* Line connection */}
                               <div className="absolute left-[-26px] top-1/2 w-3 h-3 bg-gray-200 rounded-full border-2 border-white ring-1 ring-gray-100 z-10"></div>
                               <div className="absolute left-[-21px] top-[-20px] bottom-[-20px] w-[2px] bg-gray-100"></div>
                            </div>
                         </div>
                        <ScheduleItem 
                          time="02 pm" 
                          title="Calculus Review" 
                          duration="14 Dec" 
                          color="bg-orange-50" 
                        />
                      </>
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
                   <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                   </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {messages.map(msg => (
                      <MessageItem 
                        key={msg.id}
                        name={msg.name}
                        time={msg.time}
                        message={msg.message}
                        unread={msg.unread}
                        avatarSeed={msg.seed}
                      />
                   ))}
                </div>
                
                {/* Mini Chat Preview (Bottom) */}
                <div className="mt-8 bg-gray-50 rounded-[24px] p-4 border border-gray-100 relative overflow-hidden">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <div className="text-xs text-gray-400 mb-1">Morning 👋</div>
                         <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[80%]">
                            Lets join us Wendy!
                         </div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">12:49</span>
                   </div>

                   <div className="flex justify-end items-start mb-4">
                      <div className="flex flex-col items-end">
                         <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-tr-none shadow-md text-sm max-w-[80%]">
                            Sure Jenny :)
                         </div>
                         <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            13:00 <CheckCircle className="w-3 h-3 text-blue-500" />
                         </span>
                      </div>
                   </div>

                   <div className="relative mt-4">
                      <input 
                        type="text" 
                        placeholder="Enter Text..." 
                        className="w-full bg-white border-none rounded-full py-3 pl-4 pr-12 text-sm shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                      <button className="absolute right-1 top-1 p-2 bg-orange-500 rounded-full text-white shadow-md hover:bg-orange-600 transition-colors">
                         <Send className="w-3 h-3" />
                      </button>
                   </div>
                </div>
             </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
