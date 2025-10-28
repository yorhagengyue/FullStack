import { Calendar, Clock, Video, FileText } from 'lucide-react';

const SessionsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-600 mt-2">View and manage your tutoring sessions</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sessions Coming Soon</h2>
          <p className="text-gray-600 mb-8">
            This feature will allow you to manage your tutoring sessions, including virtual sessions, session materials, and attendance tracking.
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Video className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Virtual Sessions</h3>
                <p className="text-sm text-gray-600">Join video calls directly from the platform</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Session Materials</h3>
                <p className="text-sm text-gray-600">Share and access study materials</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Attendance Tracking</h3>
                <p className="text-sm text-gray-600">Automatic session attendance and duration logging</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
