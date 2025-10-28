import { useState, useMemo } from 'react';
import { Flame, TrendingUp } from 'lucide-react';

/**
 * GitHub-style Activity Calendar Component
 * Displays user's learning activity over the past months
 */
const ActivityCalendar = ({ bookings, userId }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate activity data for the past 24 weeks (168 days)
  const activityData = useMemo(() => {
    const today = new Date();
    const days = [];

    // Generate 168 days of data (24 weeks)
    for (let i = 167; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Count activities on this day
      const dayActivities = bookings.filter(b => {
        const bookingDate = new Date(b.date).toISOString().split('T')[0];
        return bookingDate === dateStr &&
               (b.studentId === userId || b.tutorId === userId);
      });

      days.push({
        date: dateStr,
        count: dayActivities.length,
        activities: dayActivities,
        displayDate: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      });
    }

    return days;
  }, [bookings, userId]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < activityData.length; i += 7) {
      result.push(activityData.slice(i, i + 7));
    }
    return result;
  }, [activityData]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalActivities = activityData.reduce((sum, day) => sum + day.count, 0);
    const activeDays = activityData.filter(day => day.count > 0).length;

    // Calculate current streak
    let currentStreak = 0;
    for (let i = activityData.length - 1; i >= 0; i--) {
      if (activityData[i].count > 0) {
        currentStreak++;
      } else if (currentStreak > 0) {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    activityData.forEach(day => {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    return {
      total: totalActivities,
      activeDays,
      currentStreak,
      longestStreak
    };
  }, [activityData]);

  // Get color based on activity count
  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-400';
    if (count >= 3) return 'bg-green-600';
    return 'bg-gray-100';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Learning Activity</h2>
          <p className="text-sm text-gray-600 mt-1">
            {stats.total} sessions in the last 24 weeks
          </p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
            <Flame className="w-5 h-5 text-orange-500" />
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
              <div className="text-xs text-orange-700">day streak</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total Sessions</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.activeDays}</div>
          <div className="text-xs text-gray-600">Active Days</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.longestStreak}</div>
          <div className="text-xs text-gray-600">Best Streak</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-2">
          {/* Week day labels */}
          <div className="flex flex-col justify-around mr-3">
            {weekDays.map((day, idx) => (
              <div key={day} className="h-5 text-xs text-gray-500 flex items-center font-medium">
                {idx % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-2">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-2">
                {week.map((day, dayIdx) => (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className="relative group"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div
                      className={`w-5 h-5 rounded ${getColor(day.count)}
                        hover:ring-2 hover:ring-primary-500 hover:scale-110 transition-all cursor-pointer border border-gray-200`}
                      title={`${day.displayDate}: ${day.count} sessions`}
                    />

                    {/* Tooltip */}
                    {hoveredDay?.date === day.date && day.count > 0 && (
                      <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2
                        bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <div className="font-semibold">{day.displayDate}</div>
                        <div className="text-gray-300">{day.count} session{day.count > 1 ? 's' : ''}</div>
                        {day.activities.slice(0, 2).map((activity, idx) => (
                          <div key={idx} className="text-gray-400 text-[10px] mt-1">
                            • {activity.subject}
                          </div>
                        ))}
                        {day.activities.length > 2 && (
                          <div className="text-gray-400 text-[10px]">
                            +{day.activities.length - 2} more
                          </div>
                        )}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2
                          border-4 border-transparent border-t-gray-900" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" />
            <div className="w-3 h-3 rounded-sm bg-green-200" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-600" />
          </div>
          <span>More</span>
        </div>

        {stats.currentStreak > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <TrendingUp className="w-3 h-3" />
            <span>Keep it up!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCalendar;
