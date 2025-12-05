import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useVideo } from '../../context/VideoContext';
import { bookingsAPI } from '../../services/api';
import JitsiMeetRoom from '../../components/session/JitsiMeetRoom';
import CodeCollabEditor from '../../components/session/CodeCollabEditor';
import MarkdownCollabEditor from '../../components/session/MarkdownCollabEditor';
import NoteSelector from '../../components/session/NoteSelector';
import DraggableVideo from '../../components/session/DraggableVideo';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';
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
  CheckCircle,
  FileText,
  X,
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
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [isCompleting, setIsCompleting] = useState(false);
  const [videoMinimized, setVideoMinimized] = useState(false);
  const [videoHidden, setVideoHidden] = useState(false);
  
  const autoCompleteTimerRef = useRef(null);

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
    // Just leave the meeting, don't mark as completed
    // Users can re-enter the meeting multiple times
    if (sessionStarted && startTime) {
      const duration = Math.floor((Date.now() - startTime) / 60000); // minutes
      console.log('Session duration so far:', duration, 'minutes');
    }
    // Don't navigate - allow re-entering
    setSessionStarted(false);
  };

  const handleCompleteSession = () => {
    setConfirmDialog({ isOpen: true });
  };

  const confirmCompleteSession = async () => {
    setIsCompleting(true);
    try {
      const actualDuration = startTime ? Math.floor((Date.now() - startTime) / 60000) : booking.duration;
      
      await bookingsAPI.completeSession(bookingId, {
        actualDuration,
        sessionNotes: 'Session completed by user'
      });

      // Clear auto-complete timer
      if (autoCompleteTimerRef.current) {
        clearTimeout(autoCompleteTimerRef.current);
      }

      setToast({ 
        isOpen: true, 
        message: 'Session completed successfully! Redirecting...', 
        type: 'success' 
      });

      // Redirect to reviews page after 2 seconds
      setTimeout(() => {
        navigate(`/app/reviews/submit/${bookingId}`);
      }, 2000);

    } catch (error) {
      console.error('Error completing session:', error);
      setToast({ 
        isOpen: true, 
        message: 'Failed to complete session', 
        type: 'error' 
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleJoinSession = async () => {
    setSessionStarted(true);
    setStartTime(Date.now());
    
    // Mark session as started in backend
    try {
      await bookingsAPI.startSession(bookingId);
    } catch (error) {
      console.error('Error starting session:', error);
    }

    // Set auto-complete timer for 2 hours
    autoCompleteTimerRef.current = setTimeout(async () => {
      try {
        await bookingsAPI.completeSession(bookingId, {
          actualDuration: 120, // 2 hours
          sessionNotes: 'Session auto-completed after 2 hours'
        });
        
        setToast({ 
          isOpen: true, 
          message: 'Session auto-completed after 2 hours. Redirecting...', 
          type: 'info' 
        });

        setTimeout(() => {
          navigate(`/app/reviews/submit/${bookingId}`);
        }, 3000);
      } catch (error) {
        console.error('Error auto-completing session:', error);
      }
    }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
  };

  // Cleanup auto-complete timer on unmount
  useEffect(() => {
    return () => {
      if (autoCompleteTimerRef.current) {
        clearTimeout(autoCompleteTimerRef.current);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleCodeEditor = () => {
    const newState = !showCodeEditor;
    setShowCodeEditor(newState);
    // Always minimize video when any editor is open during a session
    if (sessionStarted) {
      setVideoMinimized(newState || showMarkdownEditor);
    }
  };

  const toggleMarkdownEditor = () => {
    if (!selectedNote) {
      // Show note selector if no note is selected
      setShowNoteSelector(true);
    } else {
      const newState = !showMarkdownEditor;
      setShowMarkdownEditor(newState);
      // Always minimize video when any editor is open during a session
      if (sessionStarted) {
        setVideoMinimized(newState || showCodeEditor);
      }
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setShowNoteSelector(false);
    setShowMarkdownEditor(true);
    // Auto-minimize video when markdown editor opens during a session
    if (sessionStarted) {
      setVideoMinimized(true);
    }
    setToast({
      isOpen: true,
      message: `Opened: ${note.title}`,
      type: 'success'
    });
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
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmCompleteSession}
        title="Complete Session"
        message="Are you sure you want to mark this session as completed? This action will finalize the session and redirect you to submit a review."
        confirmText="Complete"
        cancelText="Cancel"
        type="info"
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />

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

      {/* Main Content Area */}
      <div className={`${isFullscreen ? 'h-full' : 'max-w-[1920px] mx-auto p-6'}`}>
        <div className={`${isFullscreen ? 'h-full' : 'h-[calc(100vh-180px)]'} relative`}>
          

          {/* Editors Container - Full Width when active */}
          {(showCodeEditor || showMarkdownEditor) && sessionStarted && (
            <div className="h-full flex gap-4">
              {/* Code Editor */}
              {showCodeEditor && (
                <div className={`${showMarkdownEditor ? 'w-1/2' : 'w-full'} h-full rounded-lg overflow-hidden transition-all duration-300`}>
                  <CodeCollabEditor
                    bookingId={bookingId}
                    language={booking.subject?.toLowerCase().includes('python') ? 'python' : 'javascript'}
                    username={user?.username || 'Guest'}
                    onToggleMarkdown={toggleMarkdownEditor}
                    showMarkdown={showMarkdownEditor}
                    onCompleteSession={handleCompleteSession}
                    isCompleting={isCompleting}
                  />
                </div>
              )}

              {/* Markdown Editor */}
              {showMarkdownEditor && selectedNote && (
                <div className={`${showCodeEditor ? 'w-1/2' : 'w-full'} h-full rounded-lg overflow-hidden transition-all duration-300`}>
                  <MarkdownCollabEditor
                    bookingId={bookingId}
                    username={user?.username || 'Guest'}
                    initialContent={selectedNote.content || ''}
                    noteTitle={selectedNote.title || 'Untitled'}
                    onToggleCode={toggleCodeEditor}
                    showCode={showCodeEditor}
                    onCompleteSession={handleCompleteSession}
                    isCompleting={isCompleting}
                  />
                </div>
              )}
            </div>
          )}

          {/* Video Window - Full screen when no editors */}
          {!videoHidden && !(showCodeEditor || showMarkdownEditor) && (
            <div className="bg-black rounded-xl overflow-hidden relative h-full">
              {sessionStarted ? (
                <>
                  <div className="h-full w-full">
                    <JitsiMeetRoom
                      roomId={booking.meetingRoomId}
                      displayName={user?.username || 'Guest'}
                      onMeetingEnd={handleMeetingEnd}
                    />
                  </div>

                  {/* Floating controls - Only show when video is full screen (no editors) */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      onClick={toggleCodeEditor}
                      className="p-3 bg-black/70 hover:bg-indigo-700 text-white rounded-lg transition-colors backdrop-blur-sm shadow-lg"
                      title="Open code editor"
                    >
                      <Code2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleMarkdownEditor}
                      className="p-3 bg-black/70 hover:bg-purple-700 text-white rounded-lg transition-colors backdrop-blur-sm shadow-lg"
                      title="Open markdown editor"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={minimizeToFloating}
                      className="p-3 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors backdrop-blur-sm shadow-lg"
                      title="Minimize to floating window"
                    >
                      <Minimize2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="p-3 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors backdrop-blur-sm shadow-lg"
                      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Session Control buttons - bottom left */}
                  <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                    <button
                      onClick={handleMeetingEnd}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors shadow-lg"
                    >
                      Leave Meeting
                    </button>
                    <button
                      onClick={handleCompleteSession}
                      disabled={isCompleting}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isCompleting ? 'Completing...' : 'Complete Session'}
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
          )}

          {/* Draggable Floating Video - Show when editors are active */}
          {(showCodeEditor || showMarkdownEditor) && sessionStarted && !videoHidden && (
            <DraggableVideo
              onClose={handleMeetingEnd}
              onMaximize={() => {
                setShowCodeEditor(false);
                setShowMarkdownEditor(false);
                setVideoMinimized(false);
              }}
            >
              <JitsiMeetRoom
                roomId={booking.meetingRoomId}
                displayName={user?.username || 'Guest'}
                onMeetingEnd={handleMeetingEnd}
              />
            </DraggableVideo>
          )}


        </div>

        {/* Note Selector Modal */}
        <NoteSelector
          isOpen={showNoteSelector}
          onClose={() => setShowNoteSelector(false)}
          onSelectNote={handleSelectNote}
        />

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
