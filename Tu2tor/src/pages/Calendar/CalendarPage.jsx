import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/layout/TopBar';

const CalendarPage = () => {
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day' - implementing month first
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState({
    confirmed: true,
    pending: true,
    completed: true,
    cancelled: false
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const toggleFilter = () => setShowFilter(!showFilter);

  const toggleStatusFilter = (status) => {
    setStatusFilter(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Get calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter bookings for the current view
  const getBookingsForDay = (day) => {
    return bookings.filter(booking => {
      // Handle different date formats (ISO string or Date object)
      const bookingDate = booking.startTime ? new Date(booking.startTime) : (booking.date ? new Date(booking.date) : null);
      if (!bookingDate) return false;
      
      // Apply date filter
      const isSameDate = isSameDay(bookingDate, day);
      if (!isSameDate) return false;
      
      // Apply status filter
      const status = booking.status || 'pending';
      return statusFilter[status] !== false;
    });
  };

  // Helper to format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="min-h-screen bg-[#F2F5F9] font-sans flex flex-col p-4">
        <div className="bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8 flex-1 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
          
          <div className="relative z-0">
            <TopBar />
          </div>

          {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 relative z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button 
                onClick={prevMonth} 
                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600 cursor-pointer relative z-20"
                type="button"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={goToToday}
                className="px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all mx-1 cursor-pointer relative z-20"
                type="button"
              >
                Today
              </button>
              <button 
                onClick={nextMonth}
                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600 cursor-pointer relative z-20"
                type="button"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-30">
             <div className="flex bg-gray-100 p-1 rounded-lg relative z-30">
                <button 
                  type="button"
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${view === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setView('month');
                  }}
                >
                  Month
                </button>
                <button 
                  type="button"
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-not-allowed opacity-50 ${view === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                  disabled
                  title="Coming soon"
                >
                  Week
                </button>
                <button 
                  type="button"
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-not-allowed opacity-50 ${view === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                  disabled
                  title="Coming soon"
                >
                  Day
                </button>
             </div>
             <div className="relative">
               <button 
                 type="button"
                 onClick={toggleFilter}
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-xl cursor-pointer ${
                   showFilter 
                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
                     : 'bg-gray-900 text-white hover:bg-gray-800'
                 }`}
               >
                  <Filter size={16} />
                  <span>Filter</span>
               </button>
               
               {/* Filter Dropdown */}
               {showFilter && (
                 <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
                   <div className="flex items-center justify-between mb-3">
                     <h3 className="text-sm font-semibold text-gray-900">Filter by Status</h3>
                     <button 
                       onClick={toggleFilter}
                       className="text-gray-400 hover:text-gray-600"
                     >
                       ×
                     </button>
                   </div>
                   <div className="space-y-2">
                     <label className="flex items-center gap-2 cursor-pointer group">
                       <input
                         type="checkbox"
                         checked={statusFilter.confirmed}
                         onChange={() => toggleStatusFilter('confirmed')}
                         className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                       />
                       <span className="text-sm text-gray-700 group-hover:text-gray-900">Confirmed</span>
                       <span className="ml-auto text-xs text-green-600 font-medium">●</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer group">
                       <input
                         type="checkbox"
                         checked={statusFilter.pending}
                         onChange={() => toggleStatusFilter('pending')}
                         className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                       />
                       <span className="text-sm text-gray-700 group-hover:text-gray-900">Pending</span>
                       <span className="ml-auto text-xs text-orange-600 font-medium">●</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer group">
                       <input
                         type="checkbox"
                         checked={statusFilter.completed}
                         onChange={() => toggleStatusFilter('completed')}
                         className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 cursor-pointer"
                       />
                       <span className="text-sm text-gray-700 group-hover:text-gray-900">Completed</span>
                       <span className="ml-auto text-xs text-gray-600 font-medium">●</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer group">
                       <input
                         type="checkbox"
                         checked={statusFilter.cancelled}
                         onChange={() => toggleStatusFilter('cancelled')}
                         className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                       />
                       <span className="text-sm text-gray-700 group-hover:text-gray-900">Cancelled</span>
                       <span className="ml-auto text-xs text-red-600 font-medium">●</span>
                     </label>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 border border-gray-200 rounded-2xl overflow-auto flex flex-col bg-white min-h-0">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr flex-1">
            {calendarDays.map((day, dayIdx) => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);
              const isSelected = isSameDay(day, selectedDate);

              return (
                <div 
                  key={day.toString()} 
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative border-b border-r border-gray-100 p-2 transition-all cursor-pointer group hover:bg-gray-50 min-h-[100px] flex flex-col
                    ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'}
                    ${isSelected ? 'bg-blue-50/30' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1 flex-shrink-0">
                    <span 
                      className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full z-10
                        ${isTodayDate 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : isSelected 
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 group-hover:bg-gray-200'}
                      `}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  {/* Events List for the Day */}
                  <div className="flex flex-col gap-1 overflow-y-auto flex-1 custom-scrollbar">
                    {dayBookings.slice(0, 3).map((booking, i) => (
                      <div 
                        key={booking._id || i}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/session/${booking._id || booking.id}`);
                        }}
                        className={`
                          px-2 py-1 rounded text-[10px] font-medium truncate flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-sm z-10
                          ${booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' 
                            : booking.status === 'pending'
                              ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                        <span className="truncate flex-1">{booking.subject}</span>
                        {booking.startTime && <span className="opacity-75 text-[9px] flex-shrink-0">{formatTime(booking.startTime)}</span>}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[9px] text-gray-400 text-center py-0.5">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        </div>
      </div>
    </>
  );
};

export default CalendarPage;

