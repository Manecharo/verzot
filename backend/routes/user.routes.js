const express = require('express');
const userController = require('../controllers/user.controller');
const middleware = require('../middleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes in this file require authentication
router.use(middleware.verifyToken);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  middleware.validateRegistration,
  middleware.checkValidation,
  userController.updateProfile
);

/**
 * @route   PUT /api/v1/users/password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/password',
  userController.changePassword
);

/**
 * @route   POST /api/v1/users/profile/image
 * @desc    Upload profile image
 * @access  Private
 */
router.post(
  '/profile/image',
  upload.single('image'),
  userController.uploadProfileImage
);

/**
 * @route   GET /api/v1/users/teams
 * @desc    Get current user's teams
 * @access  Private
 */
router.get(
  '/teams',
  userController.getUserTeams
);

/**
 * @route   GET /api/v1/users/tournaments
 * @desc    Get current user's tournaments
 * @access  Private
 */
router.get(
  '/tournaments',
  userController.getUserTournaments
);

/**
 * @route   GET /api/v1/users/statistics
 * @desc    Get current user's statistics
 * @access  Private
 */
router.get(
  '/statistics',
  userController.getUserStatistics
);

/**
 * @route   GET /api/v1/users/:userId
 * @desc    Get user by ID
 * @access  Private (will add role-based access later)
 */
router.get(
  '/:userId',
  userController.getUserById
);

/**
 * @route   GET /api/v1/users/:userId/teams
 * @desc    Get user's teams by user ID
 * @access  Private
 */
router.get(
  '/:userId/teams',
  userController.getUserTeams
);

/**
 * @route   GET /api/v1/users/:userId/tournaments
 * @desc    Get user's tournaments by user ID
 * @access  Private
 */
router.get(
  '/:userId/tournaments',
  userController.getUserTournaments
);

/**
 * @route   GET /api/v1/users/:userId/statistics
 * @desc    Get user's statistics by user ID
 * @access  Private
 */
router.get(
  '/:userId/statistics',
  userController.getUserStatistics
);

module.exports = router; 