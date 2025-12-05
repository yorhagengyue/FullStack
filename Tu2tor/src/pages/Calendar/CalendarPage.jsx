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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
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
      return isSameDay(bookingDate, day);
    });
  };

  // Helper to format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <div className="min-h-full bg-[#F2F5F9] font-sans h-full flex flex-col">
      <div className="bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8 flex-1 flex flex-col h-full overflow-hidden">
        
        <TopBar />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h1>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button 
                onClick={prevMonth} 
                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={goToToday}
                className="px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all mx-1"
              >
                Today
              </button>
              <button 
                onClick={nextMonth}
                className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setView('month')}
                >
                  Month
                </button>
                <button 
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setView('week')}
                  disabled // To be implemented
                  title="Coming soon"
                >
                  Week
                </button>
                <button 
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setView('day')}
                  disabled // To be implemented
                  title="Coming soon"
                >
                  Day
                </button>
             </div>
             <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                <Filter size={16} />
                <span>Filter</span>
             </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 border border-gray-200 rounded-2xl overflow-hidden flex flex-col bg-white">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 grid-rows-5 flex-1 h-full">
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
                    relative border-b border-r border-gray-100 p-2 transition-all cursor-pointer group hover:bg-gray-50
                    ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'}
                    ${isSelected ? 'bg-blue-50/30' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span 
                      className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
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
                        {dayBookings.length} events
                      </span>
                    )}
                  </div>

                  {/* Events List for the Day */}
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {dayBookings.map((booking, i) => (
                      <div 
                        key={booking._id || i}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/session/${booking._id || booking.id}`);
                        }}
                        className={`
                          px-2 py-1 rounded text-[10px] font-medium truncate flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02]
                          ${booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : booking.status === 'pending'
                              ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : 'bg-gray-100 text-gray-600'}
                        `}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                        <span className="truncate">{booking.subject}</span>
                        {booking.startTime && <span className="opacity-75 ml-auto">{formatTime(booking.startTime)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CalendarPage;

