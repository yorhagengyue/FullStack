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
  Loader2,
  Home,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Mic,
  MicOff,
  Search,
  MoreHorizontal
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
  const [wsConnection, setWsConnection] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [roomUsers, setRoomUsers] = useState([]); // List of users for right panel

  // UI State
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [showKBPanel, setShowKBPanel] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const [videoMinimized, setVideoMinimized] = useState(false);
  const [videoHidden, setVideoHidden] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('participants'); // 'participants', 'chat'

  // Dialogs
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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

  // WebSocket Connection for Presence
  useEffect(() => {
    if (!sessionStarted || !booking) return;

    const wsUrl = `${getWebSocketHost()}/${booking.meetingRoomId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Authenticate
      ws.send(JSON.stringify({
        type: 'auth',
        userId: user._id,
        username: user.username
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connection' || data.type === 'user-joined' || data.type === 'user-left' || data.type === 'user-list-updated') {
          if (data.userCount !== undefined) {
            setConnectedUsers(data.userCount);
          }
          if (data.users) {
            setRoomUsers(data.users);
          }
        }
      } catch (e) {
        // Ignore non-JSON messages (Yjs)
      }
    };

    setWsConnection(ws);

    return () => {
      ws.close();
    };
  }, [sessionStarted, booking, user]);

  const handleJoinSession = async () => {
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Join Classroom
            </button>
          </div>

          {/* Right Side - Preview */}
          <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            <div className="relative w-full aspect-video bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center text-white/80">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Camera Preview</p>
              </div>
              {/* Fake camera controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <MicOff className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-white backdrop-blur-sm">
                  <Video className="w-5 h-5" />
                </div>
              </div>
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
      {/* Left Sidebar - Navigation */}
      <aside className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-8 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-xl">T</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-8 w-full">
          <NavItem icon={Home} label="Home" onClick={() => navigate('/dashboard')} />
          <NavItem icon={Video} label="Classroom" active />
          <NavItem icon={MessageSquare} label="Chats" />
          <NavItem icon={Calendar} label="Schedule" />
          <NavItem icon={Settings} label="Settings" />
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all">
             {/* User Avatar */}
             <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs">
               {user?.username?.[0]?.toUpperCase() || 'U'}
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{booking.subject} Virtual Classroom</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Session • {booking.duration} mins
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold">
              <User className="w-4 h-4" />
              Invite Participant
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex -space-x-2">
              {roomUsers.slice(0, 3).map((u, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm" title={u.username}>
                  {u.username[0].toUpperCase()}
                </div>
              ))}
              {roomUsers.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shadow-sm">
                  +{roomUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-hidden flex gap-6 relative">
          
          {/* Central Stage */}
          <div className="flex-1 flex flex-col gap-4 relative">
            
            {/* Top Carousel (Mockup or functional if we had streams) */}
            {/* Currently purely decorative or for future stream expansion */}
            {/* <div className="h-24 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {roomUsers.map((u, i) => (
                <div key={i} className="flex-shrink-0 w-32 bg-gray-800 rounded-xl overflow-hidden relative border-2 border-transparent hover:border-blue-500 transition-all">
                  <div className="absolute inset-0 flex items-center justify-center text-white/30">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="absolute bottom-2 left-2 text-white text-xs font-medium bg-black/50 px-2 py-0.5 rounded">
                    {u.username}
                  </div>
                </div>
              ))}
            </div> */}

            {/* Main Viewport */}
            <div className="flex-1 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative group">
              
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
                connectedUsers={connectedUsers}
                showCodeEditor={showCodeEditor}
                showMarkdownEditor={showMarkdownEditor}
                showKBPanel={showKBPanel}
                isFullscreen={isFullscreen}
                onToggleCode={toggleCodeEditor}
                onToggleMarkdown={toggleMarkdownEditor}
                onToggleKB={() => setShowKBPanel(!showKBPanel)}
                onToggleFullscreen={toggleFullscreen}
                onEndMeeting={handleMeetingEnd}
                bookingInfo={{
                  subject: booking.subject,
                  duration: booking.duration
                }}
              />
            </div>
          </div>

          {/* Right Panel - Collapsible */}
          <aside className="w-80 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-center p-2 m-2 bg-gray-100 rounded-xl">
              <TabButton 
                active={activeTab === 'participants'} 
                onClick={() => setActiveTab('participants')}
                label={`Participants (${connectedUsers})`}
              />
              <TabButton 
                active={activeTab === 'chat'} 
                onClick={() => setActiveTab('chat')}
                label="Chat Room"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'participants' ? (
                <div className="space-y-4">
                  {roomUsers.map((u, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 font-bold border border-blue-50">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{u.username}</p>
                        <p className="text-xs text-blue-500">
                          {u.userId === user._id ? 'You' : 'Participant'}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">
                          <MicOff className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {roomUsers.length === 0 && (
                     <div className="text-center text-gray-400 mt-10">
                       <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                       <p>No participants yet</p>
                     </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center text-center text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Chat is handled inside the video interface</p>
                </div>
              )}
            </div>
            
            {/* Bottom Info in Right Panel */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-sm mb-2 text-gray-800">Next Class</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Advanced Physics</p>
                    <p className="text-xs">Tomorrow, 10:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
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
const NavItem = ({ icon: Icon, active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`w-full relative flex flex-col items-center gap-1 p-3 transition-all ${
      active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <div className={`p-3 rounded-xl transition-all ${active ? 'bg-blue-50 shadow-sm' : 'hover:bg-gray-100'}`}>
      <Icon className={`w-6 h-6 ${active ? 'fill-blue-600' : ''}`} strokeWidth={active ? 2.5 : 2} />
    </div>
    {/* <span className="text-[10px] font-medium">{label}</span> */}
    {active && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full"></div>
    )}
  </button>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {label}
  </button>
);

export default SessionRoomPage;
