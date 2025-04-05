import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services';

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
        if (!authService.isAuthenticated()) {
          setLoading(false);
          return;
        }

        // Get user data from localStorage for immediate UI display
        const userData = authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }

        // Verify token validity by fetching user profile from server
        const response = await authService.getProfile();
        if (response.status === 'success' && response.data.user) {
          setUser(response.data.user);
          // Update localStorage with latest user data
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Session expired or invalid. Please login again.');
        // Clean up invalid auth data
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure userData has the correct structure
      const formattedUserData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        // If birthDate is required by backend but not collected in the form
        // we can set a default or handle it on the backend
        birthDate: userData.birthDate || new Date().toISOString(),
        preferredLanguage: userData.preferredLanguage || 'en'
      };

      const response = await authService.register(formattedUserData);
      
      if (response.status === 'success' && response.data.user) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Unknown registration error');
        return false;
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      
      if (response.status === 'success' && response.data.user) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.message || 'Invalid credentials');
        return false;
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
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