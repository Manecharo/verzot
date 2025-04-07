import axios from "axios";
import authHeader from "./auth-header";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

class NotificationService {
  // Get all notifications with optional filters
  getNotifications(page = 1, limit = 10, filters = {}) {
    const { read, type } = filters;
    let url = `${API_URL}/notifications?page=${page}&limit=${limit}`;
    
    if (read !== undefined) {
      url += `&read=${read}`;
    }
    
    if (type) {
      url += `&type=${type}`;
    }
    
    return axios.get(url, { headers: authHeader() });
  }

  // Get the count of unread notifications
  getUnreadCount() {
    return axios.get(`${API_URL}/notifications/unread-count`, { headers: authHeader() });
  }

  // Mark a notification as read
  markAsRead(notificationId) {
    return axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      { headers: authHeader() }
    );
  }

  // Mark all notifications as read
  markAllAsRead() {
    return axios.patch(
      `${API_URL}/notifications/mark-all-read`,
      {},
      { headers: authHeader() }
    );
  }

  // Delete a notification
  deleteNotification(notificationId) {
    return axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      { headers: authHeader() }
    );
  }

  // Clear all notifications
  clearAllNotifications() {
    return axios.delete(
      `${API_URL}/notifications/clear-all`,
      { headers: authHeader() }
    );
  }

  // Get user notification preferences
  getUserPreferences() {
    return axios.get(
      `${API_URL}/notifications/preferences`,
      { headers: authHeader() }
    );
  }

  // Update user notification preferences
  updateUserPreferences(preferences) {
    return axios.put(
      `${API_URL}/notifications/preferences`,
      preferences,
      { headers: authHeader() }
    );
  }

  // Unsubscribe from a specific notification type
  unsubscribe(notificationType, token) {
    return axios.get(
      `${API_URL}/notifications/unsubscribe?type=${notificationType}&token=${token}`
    );
  }
}

export default new NotificationService(); 