import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // DB BYPASS START
  const MOCK_USER = {
    id: 'mock-user-id-123',
    userId: 'mock-user-id-123',
    username: 'Demo Student',
    email: 'demo@student.com',
    role: 'student',
    credits: 100,
    avatar: 'D'
  };

  // Initialize - check if user is logged in
  useEffect(() => {
    const initAuth = async () => {
      // DB BYPASS: Always log in as mock user
      setUser(MOCK_USER);
      setIsLoading(false);

      /* ORIGINAL CODE
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Verify token and get current user
          const response = await authAPI.getMe();
          setUser(response.user);
        } catch (err) {
          console.error('Failed to verify token:', err);
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setIsLoading(false);
      */
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    // DB BYPASS: Mock login
    setUser(MOCK_USER);
    return MOCK_USER;

    /* ORIGINAL CODE
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.login({ email, password });

      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      return response.user;
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
    */
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    // DB BYPASS: Mock register
    setUser(MOCK_USER);
    return MOCK_USER;

    /* ORIGINAL CODE
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.register(userData);

      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      return response.user;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
    */
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setError(null);
  };

  /**
   * Update user profile
   */
  const updateUser = async (updates) => {
    try {
      setError(null);

      const response = await authAPI.updateProfile(updates);

      // Update local state
      const updatedUser = response.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Change password
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);

      await authAPI.changePassword({ currentPassword, newPassword });

      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to change password';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async () => {
    // DB BYPASS: Mock refresh
    return MOCK_USER;

    /* ORIGINAL CODE
    try {
      const response = await authAPI.getMe();
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      throw err;
    }
    */
  };

  /**
   * Add credits (from booking completion)
   * Note: This is handled server-side, we just refresh the user data
   */
  const addCredits = async (amount) => {
    // In the real implementation, credits are added server-side
    // when a booking is completed. We just refresh the user data.
    await refreshUser();
  };

  /**
   * Deduct credits (from booking creation)
   * Note: This is handled server-side, we just refresh the user data
   */
  const deductCredits = async (amount) => {
    // In the real implementation, credits are deducted server-side
    // when a booking is created. We just refresh the user data.
    await refreshUser();
    return true;
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    refreshUser,
    addCredits,
    deductCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
