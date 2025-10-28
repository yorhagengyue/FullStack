import { createContext, useContext, useState, useEffect } from 'react';
import { currentUser as mockCurrentUser } from '../utils/mockData';

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

  useEffect(() => {
    // 从 localStorage 加载用户数据
    const savedUser = localStorage.getItem('tu2tor_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // 模拟登录逻辑
    // 在 Part 3 会连接到真实后端API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const userData = { ...mockCurrentUser, email };
          setUser(userData);
          localStorage.setItem('tu2tor_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const register = (userData) => {
    // 模拟注册逻辑
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...mockCurrentUser,
          ...userData,
          userId: `user_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        setUser(newUser);
        localStorage.setItem('tu2tor_user', JSON.stringify(newUser));
        resolve(newUser);
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tu2tor_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('tu2tor_user', JSON.stringify(updatedUser));
  };

  const addCredits = (amount) => {
    updateUser({ credits: user.credits + amount });
  };

  const deductCredits = (amount) => {
    if (user.credits >= amount) {
      updateUser({ credits: user.credits - amount });
      return true;
    }
    return false;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    addCredits,
    deductCredits
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
