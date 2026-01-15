import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Outlet } from 'react-router-dom';
import App from '../App.jsx';

const hoisted = vi.hoisted(() => ({
  authState: { isAuthenticated: false, isLoading: false },
  videoState: { floatingVideo: null, stopFloatingVideo: () => {} },
  SimpleProvider: ({ children }) => children,
  createMockPage: (label) => () => <div>{label}</div>
}));

const setAuthState = (next) => {
  Object.assign(hoisted.authState, next);
};

const setVideoState = (next) => {
  Object.assign(hoisted.videoState, next);
};


// Context mocks
vi.mock('../context/AuthContext', () => ({
  AuthProvider: hoisted.SimpleProvider,
  useAuth: () => hoisted.authState
}));

vi.mock('../context/AppContext', () => ({
  AppProvider: hoisted.SimpleProvider
}));

vi.mock('../context/ToastContext', () => ({
  ToastProvider: hoisted.SimpleProvider
}));

vi.mock('../context/AIContext', () => ({
  AIProvider: hoisted.SimpleProvider
}));

vi.mock('../context/VideoContext', () => ({
  VideoProvider: hoisted.SimpleProvider,
  useVideo: () => hoisted.videoState
}));

vi.mock('../components/session/FloatingVideoWindow', () => ({
  default: () => <div>FloatingWindow</div>
}));

vi.mock('../components/layout/Layout', () => ({
  default: () => (
    <div>
      Layout
      <Outlet />
    </div>
  )
}));

// Page mocks
vi.mock('../pages/Landing/LandingPage', () => ({ default: hoisted.createMockPage('Landing') }));
vi.mock('../pages/Auth/Login', () => ({ default: hoisted.createMockPage('Login') }));
vi.mock('../pages/Auth/Register', () => ({ default: hoisted.createMockPage('Register') }));
vi.mock('../pages/Dashboard/Dashboard', () => ({ default: hoisted.createMockPage('Dashboard') }));
vi.mock('../pages/Profile/Profile', () => ({ default: hoisted.createMockPage('Profile') }));
vi.mock('../pages/Search/SearchPage', () => ({ default: hoisted.createMockPage('Search') }));
vi.mock('../pages/TutorDetail/TutorDetailPage', () => ({ default: hoisted.createMockPage('TutorDetail') }));
vi.mock('../pages/Booking/BookingPage', () => ({ default: hoisted.createMockPage('Bookings') }));
vi.mock('../pages/Reviews/ReviewsPage', () => ({ default: hoisted.createMockPage('Reviews') }));
vi.mock('../pages/Reviews/ReviewSubmitPage', () => ({ default: hoisted.createMockPage('ReviewSubmit') }));
vi.mock('../pages/Sessions/SessionsPage', () => ({ default: hoisted.createMockPage('Sessions') }));
vi.mock('../pages/Sessions/SessionRoomPage', () => ({ default: hoisted.createMockPage('SessionRoom') }));
vi.mock('../pages/Messages/MessagesPage', () => ({ default: hoisted.createMockPage('Messages') }));
vi.mock('../pages/AIChat/AIChat', () => ({ default: hoisted.createMockPage('AIChat') }));
vi.mock('../pages/Calendar/CalendarPage', () => ({ default: hoisted.createMockPage('Calendar') }));
vi.mock('../pages/Todo/TodoPage', () => ({ default: hoisted.createMockPage('Todo') }));
vi.mock('../pages/StudyNotes/StudyNotesPage', () => ({ default: hoisted.createMockPage('StudyNotes') }));
vi.mock('../pages/KnowledgeBase/KnowledgeBaseUpload', () => ({ default: hoisted.createMockPage('KnowledgeBase') }));
vi.mock('../pages/NotFound/NotFound', () => ({ default: hoisted.createMockPage('NotFound') }));

describe('App routes', () => {
  beforeEach(() => {
    setAuthState({ isAuthenticated: false, isLoading: false });
    setVideoState({ floatingVideo: null, stopFloatingVideo: () => {} });
    window.history.pushState({}, '', '/');
  });

  it('renders loading state for protected routes', () => {
    setAuthState({ isLoading: true });
    window.history.pushState({}, '', '/app/dashboard');
    render(<App />);

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('redirects unauthenticated users to login', async () => {
    window.history.pushState({}, '', '/app/dashboard');
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('redirects authenticated users away from login', async () => {
    setAuthState({ isAuthenticated: true });
    window.history.pushState({}, '', '/login');
    render(<App />);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/dashboard');
    });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders protected routes when authenticated', () => {
    setAuthState({ isAuthenticated: true });
    window.history.pushState({}, '', '/app/dashboard');
    render(<App />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders floating video window when active', () => {
    setAuthState({ isAuthenticated: true });
    setVideoState({
      floatingVideo: {
        roomId: 'room1',
        displayName: 'User',
        sessionInfo: { id: '1' },
        onMaximize: () => {}
      },
      stopFloatingVideo: () => {}
    });
    render(<App />);

    expect(screen.getByText('FloatingWindow')).toBeInTheDocument();
  });

  it('renders 404 page for unknown routes', () => {
    window.history.pushState({}, '', '/unknown');
    render(<App />);

    expect(screen.getByText('NotFound')).toBeInTheDocument();
  });
});
