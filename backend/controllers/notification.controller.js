const { Notification, User, NotificationPreference } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Controller for handling notification-related operations
 */
const notificationController = {
  /**
   * Get notifications for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.userId;
      
      // Parse pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Parse filter parameters
      const filters = {};
      
      if (req.query.read !== undefined) {
        filters.read = req.query.read === 'true';
      }
      
      if (req.query.type) {
        filters.type = req.query.type;
      }
      
      // Build the query
      const query = {
        where: {
          userId,
          ...filters
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset
      };
      
      // Get notifications
      const { count, rows } = await Notification.findAndCountAll(query);
      
      // Return response
      res.status(200).json({
        notifications: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
  },
  
  /**
   * Get count of unread notifications for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.userId;
      
      // Count unread notifications
      const count = await Notification.count({
        where: {
          userId,
          read: false
        }
      });
      
      // Return response
      res.status(200).json({ count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
    }
  },
  
  /**
   * Mark a notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  markAsRead: async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      // Find the notification
      const notification = await Notification.findOne({
        where: {
          id,
          userId
        }
      });
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      // Update the notification
      await notification.update({ read: true, readAt: new Date() });
      
      // Return success response
      res.status(200).json({
        message: 'Notification marked as read',
        notification
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
    }
  },
  
  /**
   * Mark all notifications as read for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.userId;
      
      // Update all unread notifications for the user
      const [updatedCount] = await Notification.update(
        { read: true, readAt: new Date() },
        {
          where: {
            userId,
            read: false
          }
        }
      );
      
      // Return success response
      res.status(200).json({
        message: 'All notifications marked as read',
        count: updatedCount
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
    }
  },
  
  /**
   * Delete a notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteNotification: async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;
      
      // Find the notification
      const notification = await Notification.findOne({
        where: {
          id,
          userId
        }
      });
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      // Delete the notification
      await notification.destroy();
      
      // Return success response
      res.status(200).json({
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
  },
  
  /**
   * Clear all notifications for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  clearAllNotifications: async (req, res) => {
    try {
      const userId = req.userId;
      
      // Delete all notifications for the user
      const deletedCount = await Notification.destroy({
        where: {
          userId
        }
      });
      
      // Return success response
      res.status(200).json({
        message: 'All notifications cleared',
        count: deletedCount
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      res.status(500).json({ message: 'Failed to clear notifications', error: error.message });
    }
  },
  
  /**
   * Get user notification preferences
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUserPreferences: async (req, res) => {
    try {
      const userId = req.userId;
      
      // Find or create user preferences
      let [preferences, created] = await NotificationPreference.findOrCreate({
        where: { userId },
        defaults: {
          userId,
          emailNotifications: true,
          digestFrequency: 'daily',
          matchUpdates: true,
          tournamentUpdates: true,
          teamUpdates: true,
          systemAnnouncements: true
        }
      });
      
      // Return the preferences
      res.status(200).json(preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ message: 'Failed to fetch notification preferences', error: error.message });
    }
  },
  
  /**
   * Update user notification preferences
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updatePreferences: async (req, res) => {
    try {
      const userId = req.userId;
      const {
        emailNotifications,
        digestFrequency,
        matchUpdates,
        tournamentUpdates,
        teamUpdates,
        systemAnnouncements
      } = req.body;
      
      // Find the user preferences
      let preferences = await NotificationPreference.findOne({
        where: { userId }
      });
      
      // If no preferences exist, create new ones
      if (!preferences) {
        preferences = await NotificationPreference.create({
          userId,
          emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
          digestFrequency: digestFrequency || 'daily',
          matchUpdates: matchUpdates !== undefined ? matchUpdates : true,
          tournamentUpdates: tournamentUpdates !== undefined ? tournamentUpdates : true,
          teamUpdates: teamUpdates !== undefined ? teamUpdates : true,
          systemAnnouncements: systemAnnouncements !== undefined ? systemAnnouncements : true
        });
      } else {
        // Update existing preferences
        await preferences.update({
          emailNotifications: emailNotifications !== undefined ? emailNotifications : preferences.emailNotifications,
          digestFrequency: digestFrequency || preferences.digestFrequency,
          matchUpdates: matchUpdates !== undefined ? matchUpdates : preferences.matchUpdates,
          tournamentUpdates: tournamentUpdates !== undefined ? tournamentUpdates : preferences.tournamentUpdates,
          teamUpdates: teamUpdates !== undefined ? teamUpdates : preferences.teamUpdates,
          systemAnnouncements: systemAnnouncements !== undefined ? systemAnnouncements : preferences.systemAnnouncements
        });
      }
      
      // Return the updated preferences
      res.status(200).json({
        message: 'Notification preferences updated',
        preferences
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ message: 'Failed to update notification preferences', error: error.message });
    }
  },
  
  /**
   * Unsubscribe from notifications
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  unsubscribe: async (req, res) => {
    try {
      const { token, type } = req.query;
      
      // Validate token
      if (!token) {
        return res.status(400).json({ message: 'Unsubscribe token is required' });
      }
      
      // Find the user by unsubscribe token
      const user = await User.findOne({
        where: { unsubscribeToken: token }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'Invalid unsubscribe token' });
      }
      
      // Get user preferences
      const [preferences, created] = await NotificationPreference.findOrCreate({
        where: { userId: user.id },
        defaults: {
          userId: user.id,
          emailNotifications: true,
          digestFrequency: 'daily',
          matchUpdates: true,
          tournamentUpdates: true,
          teamUpdates: true,
          systemAnnouncements: true
        }
      });
      
      // Update preferences based on unsubscribe type
      if (type === 'all') {
        // Unsubscribe from all email notifications
        await preferences.update({ emailNotifications: false });
      } else if (['match', 'tournament', 'team', 'system'].includes(type)) {
        // Map type to preference field
        const preferenceMap = {
          match: 'matchUpdates',
          tournament: 'tournamentUpdates',
          team: 'teamUpdates',
          system: 'systemAnnouncements'
        };
        
        // Update the specific preference
        const updateData = {};
        updateData[preferenceMap[type]] = false;
        await preferences.update(updateData);
      } else {
        return res.status(400).json({
          message: 'Invalid unsubscribe type',
          validTypes: ['all', 'match', 'tournament', 'team', 'system']
        });
      }
      
      // Return success message
      res.status(200).json({
        message: `Successfully unsubscribed from ${type === 'all' ? 'all notifications' : `${type} notifications`}`
      });
    } catch (error) {
      console.error('Error processing unsubscribe request:', error);
      res.status(500).json({ message: 'Failed to process unsubscribe request', error: error.message });
    }
  }
};

module.exports = notificationController; 