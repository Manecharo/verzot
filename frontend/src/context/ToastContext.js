import React, { createContext, useState, useContext, useCallback } from 'react';
import ToastContainer from '../components/UI/ToastContainer';

// Create context
const ToastContext = createContext(null);

/**
 * Generate a unique ID for each toast
 * @returns {string} Unique ID
 */
const generateId = () => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * ToastProvider component for managing toast notifications
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a new toast notification
  const addToast = useCallback((message, options = {}) => {
    const { type = 'info', title = '', duration = 5000 } = options;
    
    // Create new toast object
    const newToast = {
      id: generateId(),
      message,
      type,
      title,
      duration
    };
    
    // Add to toasts array
    setToasts(prev => [...prev, newToast]);
    
    return newToast.id;
  }, []);

  // Remove a toast notification by ID
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Clear all toast notifications
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Helper methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'success' });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'error' });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'warning' });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'info' });
  }, [addToast]);

  // Context value
  const value = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext; 