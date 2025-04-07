import api from './api';

/**
 * Notification service for managing user notifications
 */
const notificationService = {
  /**
   * Get user notifications with pagination and filters
   * @param {Object} params - Query parameters 
   * @returns {Promise<Object>} Notifications with pagination
   */
  getUserNotifications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add optional parameters
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead);
      if (params.type) queryParams.append('type', params.type);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.priority) queryParams.append('priority', params.priority);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get(`/notifications${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error.response ? error.response.data : new Error('Failed to fetch notifications');
    }
  },
  
  /**
   * Get unread notification count
   * @returns {Promise<Object>} Unread count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error.response ? error.response.data : new Error('Failed to fetch unread count');
    }
  },
  
  /**
   * Mark specific notifications as read
   * @param {Array<string>} notificationIds - IDs of notifications to mark as read
   * @returns {Promise<Object>} Update result
   */
  markAsRead: async (notificationIds) => {
    try {
      const response = await api.put('/notifications/mark-read', { notificationIds });
      return response.data;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error.response ? error.response.data : new Error('Failed to mark notifications as read');
    }
  },
  
  /**
   * Mark all notifications as read
   * @param {string} type - Optional notification type filter
   * @returns {Promise<Object>} Update result
   */
  markAllAsRead: async (type = null) => {
    try {
      const query = type ? `?type=${type}` : '';
      const response = await api.put(`/notifications/mark-all-read${query}`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error.response ? error.response.data : new Error('Failed to mark all notifications as read');
    }
  },
  
  /**
   * Delete notifications
   * @param {Array<string>} notificationIds - IDs of notifications to delete
   * @returns {Promise<Object>} Delete result
   */
  deleteNotifications: async (notificationIds) => {
    try {
      const response = await api.delete('/notifications', { data: { notificationIds } });
      return response.data;
    } catch (error) {
      console.error('Error deleting notifications:', error);
      throw error.response ? error.response.data : new Error('Failed to delete notifications');
    }
  },
  
  /**
   * Create a notification (admin only)
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  createNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error.response ? error.response.data : new Error('Failed to create notification');
    }
  }
};

export default notificationService; 