import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // In a real app, validate token with backend here
        // For now, we'll just load user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || 'null');
        if (userData) {
          setUser(userData);
        }
      } catch (err) {
        setError('Failed to restore authentication state');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    try {
      // In a real app, make API call to backend
      // For now, we'll simulate a successful registration
      setUser({ ...userData, id: `user-${Date.now()}` });
      localStorage.setItem('authToken', 'dummy-token');
      localStorage.setItem('userData', JSON.stringify({ ...userData, id: `user-${Date.now()}` }));
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      // In a real app, make API call to backend
      // For now, we'll simulate a successful login
      const userData = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0], // Mock name from email
      };
      setUser(userData);
      localStorage.setItem('authToken', 'dummy-token');
      localStorage.setItem('userData', JSON.stringify(userData));
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  // Clear any authentication errors
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 