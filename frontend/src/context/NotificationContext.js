import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import NotificationService from '../services/notification.service';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await NotificationService.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

  // Fetch notifications with pagination and filters
  const fetchNotifications = useCallback(async (page = 1, limit = 10, filters = {}) => {
    if (!isAuthenticated) return { notifications: [], total: 0 };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await NotificationService.getNotifications(page, limit, filters);
      setNotifications(response.data.notifications);
      return {
        notifications: response.data.notifications,
        total: response.data.total
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      return { notifications: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
      
      // If the notification was unread, update the count
      const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
      if (wasUnread) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [notifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await NotificationService.clearAllNotifications();
      
      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      return false;
    }
  }, []);

  // Fetch user notification preferences
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) return null;
    
    try {
      const response = await NotificationService.getUserPreferences();
      setPreferences(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      return null;
    }
  }, [isAuthenticated]);

  // Update user notification preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      await NotificationService.updateUserPreferences(newPreferences);
      setPreferences(newPreferences);
      return true;
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      return false;
    }
  }, []);

  // Set up polling for unread notifications when the user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchUnreadCount]);

  const contextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    preferences,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchPreferences,
    updatePreferences
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 