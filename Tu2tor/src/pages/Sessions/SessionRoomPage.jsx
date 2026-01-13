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
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [wsConnection, setWsConnection] = useState(null);
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
  const [showKBPanel, setShowKBPanel] = useState(false);
  const [kbQuery, setKbQuery] = useState('');
  const [kbDocs, setKbDocs] = useState([]);
  const [kbSelected, setKbSelected] = useState([]);
  const [kbResults, setKbResults] = useState([]);
  const [kbLoading, setKbLoading] = useState(false);
  
  const autoCompleteTimerRef = useRef(null);

  // Helper to get booking ID consistently
  const getBookingId = (b) => b._id || b.id || b.bookingId;

  // Fetch booking details and restore session state
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

        // ✅ Restore session state from backend data
        if (foundBooking.actualStartTime && foundBooking.status === 'confirmed') {
          const backendStartTime = new Date(foundBooking.actualStartTime).getTime();
          setSessionStarted(true);
          setStartTime(backendStartTime);
          
          // Set up auto-complete timer based on elapsed time
          const elapsed = Date.now() - backendStartTime;
          const twoHours = 2 * 60 * 60 * 1000;
          const remaining = twoHours - elapsed;
          
          if (remaining > 0) {
            console.log(`[Session] Restored session state. ${Math.floor(remaining / 60000)} minutes until auto-complete`);
            autoCompleteTimerRef.current = setTimeout(async () => {
              try {
                await bookingsAPI.completeSession(bookingId, {
                  actualDuration: 120,
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
                console.error('[Session] Error auto-completing session:', error);
              }
            }, remaining);
          } else {
            // Session has exceeded 2 hours, should auto-complete
            console.log('[Session] Session exceeded 2 hours, auto-completing...');
            handleAutoComplete();
          }
        }
      }
    };

    loadBooking();

    // Close floating window when entering full session view
    stopFloatingVideo();
  }, [bookingId, bookings, tutors]);

  // Load knowledge base docs for the booking subject
  useEffect(() => {
    const loadKB = async () => {
      if (!booking?.subjectId) return;
      try {
        const res = await knowledgeBaseAPI.list({ subjectId: booking.subjectId, status: 'completed' });
        if (res.success) {
          setKbDocs(res.documents || []);
        }
      } catch (err) {
        console.warn('[SessionRoom] load KB failed', err);
      }
    };
    loadKB();
  }, [booking?.subjectId]);

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

  const handleAutoComplete = async () => {
    try {
      await bookingsAPI.completeSession(bookingId, {
        actualDuration: 120,
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
      console.error('[Session] Error auto-completing session:', error);
    }
  };

  const handleJoinSession = async () => {
    // Mark session as started in backend first
    try {
      const response = await bookingsAPI.startSession(bookingId);
      const startedBooking = response.booking;
      
      // Update local state with backend data
      setBooking(startedBooking);
      setSessionStarted(true);
      
      // Use the server's timestamp for consistency
      const backendStartTime = new Date(startedBooking.actualStartTime).getTime();
      setStartTime(backendStartTime);
      
      console.log('[Session] Session started at:', new Date(backendStartTime).toISOString());

      // Set auto-complete timer for 2 hours
      autoCompleteTimerRef.current = setTimeout(async () => {
        await handleAutoComplete();
      }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
      
      setToast({ 
        isOpen: true, 
        message: 'Session started successfully!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('[Session] Error starting session:', error);
      setToast({ 
        isOpen: true, 
        message: 'Failed to start session. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Setup WebSocket connection for presence tracking
  useEffect(() => {
    if (!booking?.meetingRoomId || !sessionStarted) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    const presenceRoom = `presence-${booking.meetingRoomId}`;
    
    try {
      const ws = new WebSocket(`${wsUrl}/${presenceRoom}`);
      
      ws.onopen = () => {
        console.log('[Presence] Connected to presence tracking');
        // Authenticate with server
        ws.send(JSON.stringify({
          type: 'auth',
          userId: user._id,
          username: user.username
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connection' || data.type === 'user-joined' || data.type === 'user-left') {
            setConnectedUsers(data.userCount || 1);
            console.log(`[Presence] Users in session: ${data.userCount}`);
          }

          if (data.type === 'user-list-updated') {
            setConnectedUsers(data.userCount || 1);
          }
        } catch (e) {
          // Not JSON, ignore
        }
      };

      ws.onerror = (error) => {
        console.error('[Presence] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[Presence] Disconnected from presence tracking');
      };

      setWsConnection(ws);

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('[Presence] Failed to connect:', error);
    }
  }, [booking?.meetingRoomId, sessionStarted, user]);

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

  const toggleKBSelection = (docId, checked) => {
    setKbSelected((prev) => {
      if (checked) return [...prev, docId];
      return prev.filter(id => id !== docId);
    });
  };

  const handleKBSearch = async () => {
    if (!kbQuery.trim()) return;
    setKbLoading(true);
    try {
      const res = await ragAPI.query({
        question: kbQuery,
        subjectId: booking?.subjectId,
        documentIds: kbSelected
      });
      if (res.success) {
        setKbResults(res.sources || []);
      }
    } catch (err) {
      console.error('[SessionRoom] KB search failed', err);
      setKbResults([]);
    } finally {
      setKbLoading(false);
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
          {/* Knowledge Base Panel */}
          {showKBPanel && (
            <div className="absolute top-4 left-4 z-20 w-80 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800">Knowledge Base Search</div>
                <button onClick={() => setShowKBPanel(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={kbQuery}
                  onChange={(e) => setKbQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleKBSearch(); }}
                  placeholder="Enter your question..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  onClick={handleKBSearch}
                  disabled={kbLoading || !kbQuery.trim()}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  {kbLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {kbDocs.length === 0 && (
                  <p className="text-xs text-gray-500">No materials</p>
                )}
                {kbDocs.map(doc => (
                  <label key={doc._id} className="flex items-center gap-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={kbSelected.includes(doc._id)}
                      onChange={(e) => toggleKBSelection(doc._id, e.target.checked)}
                    />
                    <span className="font-semibold">{doc.title}</span>
                    {doc.metadata?.pageCount && <span className="text-gray-400">({doc.metadata.pageCount} pages)</span>}
                  </label>
                ))}
              </div>
              {kbResults.length > 0 && (
                <div className="border-t border-gray-200 pt-2 space-y-2">
                  <div className="text-xs font-semibold text-gray-600">References</div>
                  {kbResults.map((r, i) => (
                    <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <span>{r.title || 'Document'}{r.pageNumber ? ` - Page ${r.pageNumber}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                    {/* Participant count badge */}
                    {sessionStarted && (
                      <div className="px-3 py-2 bg-black/70 text-white rounded-lg backdrop-blur-sm shadow-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">{connectedUsers} {connectedUsers === 1 ? 'participant' : 'participants'}</span>
                      </div>
                    )}
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
                      onClick={() => setShowKBPanel(!showKBPanel)}
                      className={`p-3 text-white rounded-lg transition-colors backdrop-blur-sm shadow-lg ${showKBPanel ? 'bg-purple-700' : 'bg-black/70 hover:bg-purple-700'}`}
                      title="Knowledge base panel"
                    >
                      <BookOpen className="w-5 h-5" />
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