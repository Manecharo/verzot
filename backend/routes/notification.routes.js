const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const notificationController = require('../controllers/notification.controller');
const notificationValidation = require('../middleware/notification.validation');

// Apply authentication middleware to all routes except unsubscribe
router.use((req, res, next) => {
  if (req.path === '/unsubscribe') {
    return next();
  }
  middleware.verifyToken(req, res, next);
});

/**
 * @route   GET /api/v1/notifications
 * @desc    Get authenticated user's notifications with pagination and filters
 * @access  Private
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get count of unread notifications for authenticated user
 * @access  Private
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * @route   POST /api/v1/notifications
 * @desc    Create a notification
 * @access  Private (Admin only for other users)
 */
router.post(
  '/',
  [middleware.hasRoles(['admin'])],
  notificationController.createNotification
);

/**
 * @route   PUT /api/v1/notifications/mark-read
 * @desc    Mark specific notifications as read
 * @access  Private
 */
router.put('/mark-read', notificationController.markNotificationsAsRead);

/**
 * @route   PUT /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', notificationController.markAllAsRead);

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Delete notifications
 * @access  Private
 */
router.delete('/', notificationController.deleteNotifications);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', notificationController.deleteNotification);

/**
 * @route   DELETE /api/v1/notifications/clear-all
 * @desc    Clear all notifications
 * @access  Private
 */
router.delete('/clear-all', notificationController.clearAllNotifications);

/**
 * @route   GET /api/v1/notifications/preferences
 * @desc    Get user notification preferences
 * @access  Private
 */
router.get('/preferences', notificationController.getUserPreferences);

/**
 * @route   PUT /api/v1/notifications/preferences
 * @desc    Update user notification preferences
 * @access  Private
 */
router.put('/preferences', notificationController.updatePreferences);

/**
 * @route   GET /api/v1/notifications/unsubscribe
 * @desc    Unsubscribe from notifications (public endpoint with token)
 * @access  Public
 */
router.get('/unsubscribe', notificationController.unsubscribe);

module.exports = router; 