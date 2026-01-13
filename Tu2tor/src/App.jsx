import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { AIProvider } from './context/AIContext';
import { VideoProvider, useVideo } from './context/VideoContext';
import FloatingVideoWindow from './components/session/FloatingVideoWindow';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import SearchPage from './pages/Search/SearchPage';
import TutorDetailPage from './pages/TutorDetail/TutorDetailPage';
import BookingPage from './pages/Booking/BookingPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import ReviewSubmitPage from './pages/Reviews/ReviewSubmitPage';
import SessionsPage from './pages/Sessions/SessionsPage';
import SessionRoomPage from './pages/Sessions/SessionRoomPage';
// NotificationsPage removed - merged into MessagesPage
import MessagesPage from './pages/Messages/MessagesPage';
import AIChat from './pages/AIChat/AIChat';
import CalendarPage from './pages/Calendar/CalendarPage';
import TodoPage from './pages/Todo/TodoPage';
import StudyNotesPage from './pages/StudyNotes/StudyNotesPage';
import KnowledgeBaseUpload from './pages/KnowledgeBase/KnowledgeBaseUpload';
import NotFound from './pages/NotFound/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/app/dashboard" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="tutor/:tutorId" element={<TutorDetailPage />} />
        <Route path="bookings" element={<BookingPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="review/:bookingId" element={<ReviewSubmitPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="session/:bookingId" element={<SessionRoomPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="todo" element={<TodoPage />} />
        <Route path="study-notes" element={<StudyNotesPage />} />
        <Route path="knowledge-base" element={<KnowledgeBaseUpload />} />
        <Route path="notifications" element={<Navigate to="/app/messages" state={{ selectedContactId: 'system' }} />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="ai-chat" element={<AIChat />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Component to handle floating video
function FloatingVideoHandler() {
  const { floatingVideo, stopFloatingVideo } = useVideo();

  if (!floatingVideo) return null;

  return (
    <FloatingVideoWindow
      roomId={floatingVideo.roomId}
      displayName={floatingVideo.displayName}
      sessionInfo={floatingVideo.sessionInfo}
      onClose={stopFloatingVideo}
      onMaximize={floatingVideo.onMaximize}
    />
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <AIProvider>
              <VideoProvider>
                <AppRoutes />
                <FloatingVideoHandler />
              </VideoProvider>
            </AIProvider>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
