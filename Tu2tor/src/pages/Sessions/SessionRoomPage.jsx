import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useVideo } from '../../context/VideoContext';
import { bookingsAPI, knowledgeBaseAPI, ragAPI } from '../../services/api';
import JitsiMeetRoom from '../../components/session/JitsiMeetRoom';
import CodeCollabEditor from '../../components/session/CodeCollabEditor';
import MarkdownCollabEditor from '../../components/session/MarkdownCollabEditor';
import NoteSelector from '../../components/session/NoteSelector';
import DraggableVideo from '../../components/session/DraggableVideo';
import SessionControls from '../../components/session/SessionControls';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Video,
  VideoOff,
  Mic,
  MicOff,
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
  Loader2,
  Home
} from 'lucide-react';

const SessionRoomPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, tutors, fetchBookings } = useApp();
  const { startFloatingVideo, stopFloatingVideo } = useVideo();

  // Session State
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Connection State
  const [connectedUsers, setConnectedUsers] = useState(0);

  // Media Permissions State (for Pre-join)
  const [mediaStream, setMediaStream] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const videoPreviewRef = useRef(null);

  // UI State
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [showKBPanel, setShowKBPanel] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const [videoMinimized, setVideoMinimized] = useState(false);
  const [videoHidden, setVideoHidden] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dialogs & Toasts
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Helper function to get WebSocket URL
  const getWebSocketHost = () => {
    return import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
  };

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await bookingsAPI.getBookingById(bookingId);
        setBooking(data);
        
        // Restore session state if needed
        if (data.status === 'confirmed' && data.actualStartTime) {
          setSessionStarted(true);
          setStartTime(new Date(data.actualStartTime).getTime());
        }
      } catch (err) {
        setError('Failed to load session details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingId]);

  // Handle Media Permissions & Preview for Pre-join screen
  useEffect(() => {
    if (!sessionStarted && !loading && booking) {
      const getMedia = async () => {
        try {
          // Request camera and microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setMediaStream(stream);
          setPermissionStatus('granted');
          if (videoPreviewRef.current) {
              videoPreviewRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing media devices:", err);
          setPermissionStatus('denied');
        }
      };
      
      // Attempt to get media
      getMedia();
    }
    
    // Cleanup function
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [sessionStarted, loading, booking]);


  const handleJoinSession = async () => {
    // Stop local preview stream before joining so Jitsi can take over
    if (mediaStream) {
       mediaStream.getTracks().forEach(track => track.stop());
       setMediaStream(null);
    }

    try {
      // API call to start session
      const updatedBooking = await bookingsAPI.startSession(bookingId);
      setSessionStarted(true);
      setStartTime(Date.now());
      setBooking(updatedBooking); // Update booking with new status
    } catch (err) {
      console.error('Failed to start session:', err);
      // Fallback if API fails but we want to allow joining for demo
      setSessionStarted(true);
      setStartTime(Date.now());
    }
  };

  const handleMeetingEnd = () => {
    setShowEndDialog(true);
  };

  const confirmEndMeeting = () => {
    // If not completing, just leave
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    navigate('/dashboard');
  };

  const handleCompleteSession = () => {
    setShowCompleteDialog(true);
  };

  const confirmCompleteSession = async () => {
    setIsCompleting(true);
    try {
      await bookingsAPI.completeSession(bookingId);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete session:', err);
      setIsCompleting(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor);
    if (!showCodeEditor) {
      setShowMarkdownEditor(false); // Mutually exclusive
    }
  };

  const toggleMarkdownEditor = () => {
    if (!selectedNote && !showMarkdownEditor) {
      setShowNoteSelector(true);
    } else {
      setShowMarkdownEditor(!showMarkdownEditor);
      if (!showMarkdownEditor) {
        setShowCodeEditor(false);
      }
    }
  };

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    setShowNoteSelector(false);
    setShowMarkdownEditor(true);
    setShowCodeEditor(false);
  };


  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!booking) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
      Session not found
    </div>
  );

  // New "Join Session" Screen Design
  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row min-h-[500px]">
          {/* Left Side - Info */}
          <div className="flex-1 p-10 flex flex-col justify-center bg-white">
            <div className="mb-8">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold tracking-wide uppercase">
                {booking.subject} Class
              </span>
              <h1 className="text-4xl font-bold mt-4 text-gray-900 leading-tight">
                Ready to join the session?
              </h1>
              <p className="text-gray-500 mt-4 text-lg">
                Your tutor is waiting. Check your audio and video before joining.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-gray-600">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Duration</p>
                  <p className="text-sm">{booking.duration} minutes</p>
                </div>
              </div>
              {booking.location && (
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm">{booking.location}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleJoinSession}
              disabled={permissionStatus !== 'granted'}
              className={`w-full text-white text-lg font-semibold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                permissionStatus === 'granted' 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 cursor-pointer' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Video className="w-5 h-5" />
              {permissionStatus === 'granted' ? 'Join Classroom' : 'Allow Camera to Join'}
            </button>
          </div>

          {/* Right Side - Preview & Check */}
          <div className="flex-1 bg-gray-900 p-8 flex flex-col items-center justify-center relative overflow-hidden text-white">
              {/* Video Preview */}
              <div className="w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden relative shadow-2xl border border-gray-800 mb-6 group">
                  {permissionStatus === 'granted' ? (
                      <>
                        <video
                            ref={videoPreviewRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover transform scale-x-[-1]" // 镜像
                        />
                        <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-xs backdrop-blur-md flex items-center gap-1">
                           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                           Camera Active
                        </div>
                      </>
                  ) : (
                      <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500">
                          <div className="w-12 h-12 border-2 border-gray-600 rounded-full flex items-center justify-center mb-2">
                               <VideoOff className="w-6 h-6" />
                          </div>
                          <span className="text-sm">Camera preview unavailable</span>
                      </div>
                  )}
              </div>

              {/* Permission Status Text (No Card/Icon container) */}
              <div className="text-center space-y-2 max-w-xs">
                  <h3 className="font-medium text-lg">System Check</h3>
                  <p className={`text-sm leading-relaxed ${permissionStatus === 'granted' ? 'text-green-400' : 'text-gray-400'}`}>
                      {permissionStatus === 'granted'
                          ? "Camera and microphone are ready."
                          : permissionStatus === 'denied'
                          ? "Permission denied. Please enable access in browser settings."
                          : "Waiting for camera and microphone permissions..."}
                  </p>
              </div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Active Session Layout
  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Left Sidebar - Navigation */}
      <aside className="w-16 bg-white border-r border-gray-100 flex flex-col items-center py-6 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
            <span className="text-white font-bold text-lg">T</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-6 w-full">
          <NavItem icon={Home} label="Home" onClick={() => navigate('/dashboard')} compact />
          <NavItem icon={Video} label="Classroom" active compact />
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
             {/* User Avatar - Display only */}
             <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs">
               {user?.username?.[0]?.toUpperCase() || 'U'}
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header - Simplified */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <h1 className="text-lg font-bold text-gray-800 truncate max-w-xl" title={booking.subject}>
              {booking.subject}
            </h1>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live • {booking.duration}m
            </p>
          </div>
          
        </header>

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-hidden flex gap-4 relative">
          
          {/* Central Stage */}
          <div className="flex-1 flex flex-col gap-3 relative">
            {/* Main Viewport */}
            <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden relative group">
              
              {/* Editor Split View */}
              {(showCodeEditor || showMarkdownEditor) ? (
                 <div className="flex h-full w-full">
                    {/* Editor Area */}
                    <div className="flex-1 h-full bg-gray-900">
                      {showCodeEditor && (
                        <CodeCollabEditor
                          bookingId={bookingId}
                          language={booking.subject?.toLowerCase().includes('python') ? 'python' : 'javascript'}
                          username={user?.username || 'Guest'}
                          onToggleMarkdown={toggleMarkdownEditor}
                          showMarkdown={showMarkdownEditor}
                          onCompleteSession={handleCompleteSession}
                          isCompleting={isCompleting}
                        />
                      )}
                      {showMarkdownEditor && selectedNote && (
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
                      )}
                    </div>
                    
                    {/* Small Video Sidebar */}
                    <div className="w-80 border-l border-gray-800 bg-black relative">
                       <JitsiMeetRoom
                          roomId={booking.meetingRoomId}
                          displayName={user?.username || 'Guest'}
                          onMeetingEnd={handleMeetingEnd}
                          showControls={false} // Hide controls in mini mode if possible
                          quality="low"
                        />
                    </div>
                 </div>
              ) : (
                /* Full Video View */
                <JitsiMeetRoom
                  roomId={booking.meetingRoomId}
                  displayName={user?.username || 'Guest'}
                  onMeetingEnd={handleMeetingEnd}
                  quality="high"
                />
              )}
            </div>

            {/* Session Controls - Bar */}
            <div className="flex justify-center pb-2">
              <SessionControls
                sessionStarted={sessionStarted}
                startTime={startTime}
                showCodeEditor={showCodeEditor}
                showMarkdownEditor={showMarkdownEditor}
                showKBPanel={showKBPanel}
                isFullscreen={isFullscreen}
                onToggleCode={toggleCodeEditor}
                onToggleMarkdown={toggleMarkdownEditor}
                onToggleKB={() => setShowKBPanel(!showKBPanel)}
                onToggleFullscreen={toggleFullscreen}
                onEndMeeting={handleMeetingEnd}
              />
            </div>
          </div>

        </div>
      </main>

      {/* Note Selector Modal */}
      {showNoteSelector && (
        <NoteSelector
          onSelect={handleNoteSelect}
          onClose={() => setShowNoteSelector(false)}
        />
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={showEndDialog}
        onClose={() => setShowEndDialog(false)}
        onConfirm={confirmEndMeeting}
        title="End Meeting"
        message="Are you sure you want to end this meeting? You can rejoin later if needed."
        confirmText="End Meeting"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirm={confirmCompleteSession}
        title="Complete Session"
        message="This will mark the session as completed. This action cannot be undone."
        confirmText="Complete Session"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

// Sub-components
const NavItem = ({ icon: Icon, active, onClick, label, compact }) => (
  <button 
    onClick={onClick}
    className={`w-full relative flex flex-col items-center gap-1 transition-all ${
      compact ? 'p-2' : 'p-3'
    } ${
      active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
    }`}
    title={label}
  >
    <div className={`${compact ? 'p-2 rounded-lg' : 'p-3 rounded-xl'} transition-all ${active ? 'bg-blue-50 shadow-sm' : 'hover:bg-gray-100'}`}>
      <Icon className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} ${active ? 'fill-blue-600' : ''}`} strokeWidth={active ? 2.5 : 2} />
    </div>
    {active && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-600 rounded-l-full"></div>
    )}
  </button>
);


export default SessionRoomPage;
