import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';

const hoisted = vi.hoisted(() => ({
  mockAuthAPI: {
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn()
  }
}));

vi.mock('../services/api', () => ({
  authAPI: hoisted.mockAuthAPI
}));

const AuthProbe = ({ onReady }) => {
  const auth = useAuth();

  useEffect(() => {
    onReady(auth);
  }, [auth, onReady]);

  return (
    <div data-testid="auth-status">
      {auth.isLoading ? 'loading' : auth.isAuthenticated ? 'auth' : 'guest'}
    </div>
  );
};

describe('AuthContext', () => {
  let latest;

  beforeEach(() => {
    latest = null;
    hoisted.mockAuthAPI.getMe.mockReset();
    hoisted.mockAuthAPI.login.mockReset();
    hoisted.mockAuthAPI.register.mockReset();
    hoisted.mockAuthAPI.updateProfile.mockReset();
    hoisted.mockAuthAPI.changePassword.mockReset();
    localStorage.clear();
  });

  const renderWithProvider = () => render(
    <AuthProvider>
      <AuthProbe onReady={(auth) => { latest = auth; }} />
    </AuthProvider>
  );

  it('initializes from token and loads profile', async () => {
    localStorage.setItem('token', 'test-token');
    hoisted.mockAuthAPI.getMe.mockResolvedValueOnce({ user: { id: '1', email: 'me@example.com' } });

    renderWithProvider();

    await waitFor(() => {
      expect(latest.isLoading).toBe(false);
      expect(latest.user.email).toBe('me@example.com');
    });
  });

  it('logs in and stores user data', async () => {
    hoisted.mockAuthAPI.login.mockResolvedValueOnce({
      token: 'login-token',
      user: { id: '2', email: 'login@example.com' }
    });

    renderWithProvider();

    await waitFor(() => expect(latest.isLoading).toBe(false));
    await latest.login('login@example.com', 'Password123!');

    expect(localStorage.getItem('token')).toBe('login-token');
    expect(JSON.parse(localStorage.getItem('user')).email).toBe('login@example.com');
  });

  it('registers and updates user state', async () => {
    hoisted.mockAuthAPI.register.mockResolvedValueOnce({
      token: 'register-token',
      user: { id: '3', email: 'new@example.com' }
    });

    renderWithProvider();
    await waitFor(() => expect(latest.isLoading).toBe(false));

    await latest.register({ email: 'new@example.com', password: 'Password123!' });

    await waitFor(() => {
      expect(latest.user.email).toBe('new@example.com');
    });
  });

  it('updates profile and local storage', async () => {
    hoisted.mockAuthAPI.getMe.mockResolvedValueOnce({ user: { id: '1', email: 'me@example.com' } });
    hoisted.mockAuthAPI.updateProfile.mockResolvedValueOnce({
      user: { id: '1', email: 'me@example.com', bio: 'Updated bio' }
    });

    localStorage.setItem('token', 'token');
    renderWithProvider();

    await waitFor(() => expect(latest.isLoading).toBe(false));
    await latest.updateUser({ bio: 'Updated bio' });

    expect(JSON.parse(localStorage.getItem('user')).bio).toBe('Updated bio');
  });

  it('handles password change errors', async () => {
    hoisted.mockAuthAPI.changePassword.mockRejectedValueOnce(new Error('Nope'));

    renderWithProvider();
    await waitFor(() => expect(latest.isLoading).toBe(false));

    await expect(latest.changePassword('old', 'new')).rejects.toThrow('Nope');
  });

  it('logs out and clears storage', async () => {
    hoisted.mockAuthAPI.getMe.mockResolvedValueOnce({ user: { id: '1', email: 'me@example.com' } });
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', JSON.stringify({ id: '1' }));

    renderWithProvider();
    await waitFor(() => expect(latest.isLoading).toBe(false));

    latest.logout();

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(null);
      expect(latest.user).toBe(null);
    });
  });
});
