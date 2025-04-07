const { body, param } = require('express-validator');

/**
 * Validation rules for creating a notification
 */
exports.createNotificationValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('type')
    .notEmpty()
    .withMessage('Notification type is required')
    .isIn([
      'team_invitation',
      'tournament_invite',
      'match_scheduled',
      'match_updated',
      'match_result',
      'team_registered',
      'registration_status',
      'tournament_started',
      'tournament_ended',
      'new_message',
      'admin_announcement',
      'tournament_status',
      'system'
    ])
    .withMessage('Invalid notification type'),
  
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Message must be between 5 and 500 characters'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid date in ISO 8601 format')
    .toDate()
];

/**
 * Validation rules for marking notifications as read
 */
exports.markAsReadValidation = [
  body('notificationIds')
    .notEmpty()
    .withMessage('Notification IDs are required')
    .isArray()
    .withMessage('Notification IDs must be an array')
    .custom(ids => {
      if (!ids.every(id => typeof id === 'string')) {
        throw new Error('All notification IDs must be strings');
      }
      return true;
    })
];

/**
 * Validation rules for deleting notifications
 */
exports.deleteNotificationsValidation = [
  body('notificationIds')
    .notEmpty()
    .withMessage('Notification IDs are required')
    .isArray()
    .withMessage('Notification IDs must be an array')
    .custom(ids => {
      if (!ids.every(id => typeof id === 'string')) {
        throw new Error('All notification IDs must be strings');
      }
      return true;
    })
]; 