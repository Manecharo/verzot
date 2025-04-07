const express = require('express');
const authController = require('../controllers/auth.controller');
const middleware = require('../middleware');

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  middleware.validateRegistration,
  middleware.checkValidation,
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  middleware.validateLogin,
  middleware.checkValidation,
  authController.login
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get logged in user's profile
 * @access  Private
 */
router.get(
  '/profile',
  middleware.verifyToken,
  authController.getProfile
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh authentication token
 * @access  Public (with refresh token)
 */
router.post(
  '/refresh',
  authController.refreshToken
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
// router.put(
//   '/profile',
//   authMiddleware.authenticate,
//   validationMiddleware.updateProfileValidation,
//   authController.updateProfile
// );

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
// router.put(
//   '/change-password',
//   authMiddleware.authenticate,
//   validationMiddleware.changePasswordValidation,
//   authController.changePassword
// );

module.exports = router; 