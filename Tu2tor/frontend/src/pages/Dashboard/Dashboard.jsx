import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { CheckCircle, Calendar, Eye, Star, TrendingUp } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import ActivityCalendar from '../../components/common/ActivityCalendar';

const Dashboard = () => {
  const { user } = useAuth();
  const { bookings, reviews } = useApp();

  // Get user's bookings
  const userBookings = bookings.filter(
    b => b.studentId === user?.userId || b.tutorId === user?.userId
  );

  const completedSessions = userBookings.filter(b => b.status === 'completed').length;
  const upcomingBookings = userBookings.filter(
    b => b.status === 'confirmed' || b.status === 'pending'
  ).length;

  // Get user's reviews received (as tutor)
  const userReviews = reviews.filter(r => r.tutorId === user?.userId);
  const averageRating = userReviews.length > 0
    ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
    : 0;

  // Recent activities
  const recentActivities = [
    ...userBookings.slice(0, 2).map(b => ({
      type: 'booking',
      message: `Your session for ${b.subject} has been ${b.status}`,
      time: new Date(b.createdAt).toLocaleDateString(),
      icon: CheckCircle,
      color: 'green'
    })),
    ...userReviews.slice(0, 1).map(r => ({
      type: 'review',
      message: `You received a ${r.rating}-star review`,
      time: new Date(r.createdAt).toLocaleDateString(),
      icon: Star,
      color: 'yellow'
    }))
  ].slice(0, 3);

  return (
    <div>
      {/* Overview Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Overview</h1>
        <div className="w-16 h-1 bg-red-500"></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.username?.split(' ')[0]}! 👋
            </h2>
            <p className="text-gray-600 mb-4">
              Here's your tutoring activity summary. Keep up the great work!
            </p>
            <p className="text-sm text-gray-500">
              You have <span className="font-semibold text-primary-600">{upcomingBookings}</span> upcoming sessions scheduled this week.
              {completedSessions > 0 && (
                <> You've completed <span className="font-semibold text-green-600">{completedSessions}</span> sessions so far.</>
              )}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sessions Completed */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white">
              <div className="text-5xl font-bold mb-2">{completedSessions}</div>
              <div className="text-primary-100 text-sm">Sessions Completed</div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-5xl font-bold text-gray-900 mb-2">{upcomingBookings}</div>
              <div className="text-gray-600 text-sm">Upcoming Bookings</div>
            </div>

            {/* Profile Views */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {user?.profileViews || 0}
              </div>
              <div className="text-gray-600 text-sm">Profile Views</div>
            </div>
          </div>

          {/* Last Activities */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Last Activities</h2>
              <Link to="/app/bookings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                See All
              </Link>
            </div>

            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.color === 'green' ? 'bg-green-100' :
                      activity.color === 'yellow' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      <activity.icon className={`w-5 h-5 ${
                        activity.color === 'green' ? 'text-green-600' :
                        activity.color === 'yellow' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activities</p>
              </div>
            )}
          </div>

          {/* Activity Calendar */}
          <ActivityCalendar bookings={bookings} userId={user?.userId} />

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              to="/app/search"
              className="bg-white border-2 border-primary-200 rounded-xl p-6 hover:border-primary-400 hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find a Tutor</h3>
              <p className="text-sm text-gray-600">Browse and book tutoring sessions</p>
            </Link>

            <Link
              to="/app/bookings"
              className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manage Bookings</h3>
              <p className="text-sm text-gray-600">View and manage your sessions</p>
            </Link>
          </div>
        </div>

        {/* Right Column - User Profile Card */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{user?.username}</h3>
            <p className="text-sm text-gray-600 uppercase tracking-wide mt-1">
              {user?.major || 'Student'}
            </p>

            {/* Circular Progress Indicators with Animation */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {/* Profile Progress */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      barSize={8}
                      data={[{ value: user?.profileCompletion || 70, fill: '#6366f1' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background={{ fill: '#e5e7eb' }}
                        dataKey="value"
                        cornerRadius={10}
                        animationDuration={1500}
                        animationBegin={0}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">
                      {user?.profileCompletion || 70}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Profile</p>
              </div>

              {/* Progress */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      barSize={8}
                      data={[{ value: completedSessions > 0 ? Math.min(completedSessions * 10, 100) : 0, fill: '#10b981' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background={{ fill: '#e5e7eb' }}
                        dataKey="value"
                        cornerRadius={10}
                        animationDuration={1500}
                        animationBegin={200}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">
                      {completedSessions > 0 ? Math.min(completedSessions * 10, 100) : 0}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Progress</p>
              </div>

              {/* Rating */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      barSize={8}
                      data={[{ value: averageRating > 0 ? Math.round((averageRating / 5) * 100) : 0, fill: '#06b6d4' }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background={{ fill: '#e5e7eb' }}
                        dataKey="value"
                        cornerRadius={10}
                        animationDuration={1500}
                        animationBegin={400}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-cyan-600">
                      {averageRating > 0 ? Math.round((averageRating / 5) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Rating</p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Credits</span>
                <span className="font-bold text-gray-900">{user?.credits || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sessions</span>
                <span className="font-bold text-gray-900">{completedSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Rating</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-bold text-gray-900">{averageRating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Badges Earned</span>
                <span className="font-bold text-gray-900">{user?.badges?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
