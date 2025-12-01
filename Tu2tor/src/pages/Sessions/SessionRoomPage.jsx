import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useVideo } from '../../context/VideoContext';
import JitsiMeetRoom from '../../components/session/JitsiMeetRoom';
import CodeCollabEditor from '../../components/session/CodeCollabEditor';
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Video,
  AlertCircle,
  Maximize,
  Minimize,
  Minimize2,
  BookOpen,
  Code2,
  SplitSquareHorizontal,
} from 'lucide-react';

const SessionRoomPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, tutors, fetchBookings } = useApp();
  const { startFloatingVideo, stopFloatingVideo } = useVideo();

  const [booking, setBooking] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  // Helper to get booking ID consistently
  const getBookingId = (b) => b._id || b.id || b.bookingId;

  // Fetch booking details
  useEffect(() => {
    const loadBooking = async () => {
      await fetchBookings();
      const foundBooking = bookings.find(b => {
        const bid = getBookingId(b);
        return String(bid) === String(bookingId);
      });

      if (foundBooking) {
        setBooking(foundBooking);

        // Find tutor - check multiple ID formats
        const tutorId = foundBooking.tutor?.userId || foundBooking.tutor?.id || foundBooking.tutorId;
        const foundTutor = tutors.find(t => 
          String(t.userId) === String(tutorId) || 
          String(t._id) === String(tutorId) || 
          String(t.id) === String(tutorId)
        );
        setTutor(foundTutor || foundBooking.tutor);
      }
    };

    loadBooking();

    // Close floating window when entering full session view
    stopFloatingVideo();
  }, [bookingId, bookings, tutors]);

  // Check if user can join
  const canJoin = () => {
    if (!booking) return false;
    if (booking.status !== 'confirmed') return false;

    // Check if session time is within ±15 minutes of scheduled time
    // const bookingTime = new Date(booking.date).getTime();
    // const now = Date.now();
    // const fifteenMinutes = 15 * 60 * 1000;

    // return Math.abs(now - bookingTime) <= fifteenMinutes;
    return true; // Allow joining anytime for testing
  };

  const handleMeetingEnd = () => {
    // Just log the session, don't navigate away
    // Users can re-enter the meeting multiple times
    if (sessionStarted && startTime) {
      const duration = Math.floor((Date.now() - startTime) / 60000); // minutes
      console.log('Session duration so far:', duration, 'minutes');
    }
    // Don't navigate - allow re-entering
    setSessionStarted(false);
  };

  const handleJoinSession = () => {
    setSessionStarted(true);
    setStartTime(Date.now());
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor);
  };

  const minimizeToFloating = () => {
    if (!sessionStarted || !booking) return;

    // Start floating video
    startFloatingVideo({
      roomId: booking.meetingRoomId,
      displayName: user?.username || 'Guest',
      sessionInfo: {
        subject: booking.subject,
        date: booking.date,
        tutor: tutor?.username,
      },
      onMaximize: () => {
        // Navigate back to this page
        navigate(`/app/session/${bookingId}`);
      },
    });

    // Navigate back to sessions
    navigate('/app/sessions');
  };

  // Validation
  if (!booking) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
        <p className="text-gray-600 mb-6">The session you're trying to join doesn't exist.</p>
        <button onClick={() => navigate('/app/sessions')} className="btn-primary">
          Back to Sessions
        </button>
      </div>
    );
  }

  if (booking.status !== 'confirmed') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Available</h2>
        <p className="text-gray-600 mb-6">
          This session is {booking.status}. Only confirmed sessions can be joined.
        </p>
        <button onClick={() => navigate('/app/sessions')} className="btn-primary">
          Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen bg-gray-900'}`}>
      {/* Header - hide in fullscreen */}
      {!isFullscreen && (
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/sessions')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{booking.subject}</h1>
              </div>
            </div>

            {sessionStarted && startTime && (
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Video Content */}
      <div className={`${isFullscreen ? 'h-full' : 'max-w-[1920px] mx-auto p-6'}`}>
        <div className={`${isFullscreen ? 'h-full' : 'h-[calc(100vh-180px)]'} relative flex gap-4`}>
          {/* Video Window */}
          <div className={`bg-black ${isFullscreen ? 'h-full' : 'h-full rounded-lg'} overflow-hidden relative ${showCodeEditor ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
            {sessionStarted ? (
              <>
                <div className="h-full w-full">
                  <JitsiMeetRoom
                    roomId={booking.meetingRoomId}
                    displayName={user?.username || 'Guest'}
                    onMeetingEnd={handleMeetingEnd}
                  />
                </div>

                {/* Floating controls */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={toggleCodeEditor}
                    className={`p-3 ${showCodeEditor ? 'bg-indigo-600' : 'bg-black/70'} hover:bg-indigo-700 text-white rounded-lg transition-colors backdrop-blur-sm`}
                    title={showCodeEditor ? 'Hide code editor' : 'Show code editor'}
                  >
                    {showCodeEditor ? <SplitSquareHorizontal className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={minimizeToFloating}
                    className="p-3 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors backdrop-blur-sm"
                    title="Minimize to floating window"
                  >
                    <Minimize2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-3 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors backdrop-blur-sm"
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>

                {/* End Session button - bottom left */}
                <div className="absolute bottom-4 left-4 z-10">
                  <button
                    onClick={handleMeetingEnd}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Leave Meeting
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="w-24 h-24 mx-auto mb-6 opacity-90" />
                  <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
                  <p className="text-white/90 mb-8 max-w-md mx-auto">
                    Click the button below to start your video session
                  </p>
                  {canJoin() ? (
                    <button
                      onClick={handleJoinSession}
                      className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-colors inline-flex items-center space-x-2"
                    >
                      <Video className="w-6 h-6" />
                      <span>Join Session Now</span>
                    </button>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm px-8 py-4 rounded-lg inline-block">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm">
                        Session can be joined 15 minutes before or after scheduled time
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor Panel */}
          {showCodeEditor && sessionStarted && (
            <div className={`${isFullscreen ? 'h-full' : 'h-full rounded-lg'} w-1/2 overflow-hidden`}>
              <CodeCollabEditor
                bookingId={bookingId}
                language={booking.subject?.toLowerCase().includes('python') ? 'python' : 'javascript'}
                username={user?.username || 'Guest'}
              />
            </div>
          )}
        </div>

        {/* Session Info - Below video */}
        <div className="mt-4">
          {!isFullscreen && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                    <span className="text-sm">• {booking.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{booking.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{booking.location}</span>
                  </div>
                </div>
                {tutor && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {tutor.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm">{tutor.username}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionRoomPage;
