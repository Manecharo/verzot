const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');
const authMiddleware = require('../middleware/auth.middleware');
const tournamentValidation = require('../middleware/tournament.validation');

/**
 * @route   POST /api/v1/tournaments
 * @desc    Create a new tournament
 * @access  Private
 */
router.post(
  '/',
  authMiddleware.authenticate,
  tournamentValidation.createTournamentValidation,
  tournamentController.createTournament
);

/**
 * @route   GET /api/v1/tournaments
 * @desc    Get all tournaments with optional filters
 * @access  Public (with restrictions based on tournament visibility)
 */
router.get('/', tournamentController.getTournaments);

/**
 * @route   GET /api/v1/tournaments/:id
 * @desc    Get tournament by ID
 * @access  Public (with restrictions based on tournament visibility)
 */
router.get('/:id', tournamentController.getTournamentById);

/**
 * @route   PUT /api/v1/tournaments/:id
 * @desc    Update tournament
 * @access  Private (organizer only)
 */
router.put(
  '/:id',
  authMiddleware.authenticate,
  tournamentValidation.updateTournamentValidation,
  tournamentController.updateTournament
);

/**
 * @route   DELETE /api/v1/tournaments/:id
 * @desc    Delete tournament
 * @access  Private (organizer only)
 */
router.delete(
  '/:id',
  authMiddleware.authenticate,
  tournamentController.deleteTournament
);

module.exports = router; 