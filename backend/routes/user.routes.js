const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authMiddleware.authenticate,
  validationMiddleware.updateProfileValidation,
  userController.updateProfile
);

/**
 * @route   PUT /api/v1/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  authMiddleware.authenticate,
  validationMiddleware.changePasswordValidation,
  userController.changePassword
);

/**
 * @route   GET /api/v1/users/:userId
 * @desc    Get user by ID
 * @access  Private (will add role-based access later)
 */
router.get(
  '/:userId',
  authMiddleware.authenticate,
  userController.getUserById
);

module.exports = router; 