const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const tournamentController = require('../controllers/tournament.controller');

/**
 * @route   POST /api/v1/tournaments
 * @desc    Create a new tournament
 * @access  Private
 */
router.post(
  '/',
  middleware.verifyToken,
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
  middleware.verifyToken,
  middleware.isResourceOwner('tournament'),
  tournamentController.updateTournament
);

/**
 * @route   DELETE /api/v1/tournaments/:id
 * @desc    Delete tournament
 * @access  Private (organizer only)
 */
router.delete(
  '/:id',
  middleware.verifyToken,
  middleware.isResourceOwner('tournament'),
  tournamentController.deleteTournament
);

/**
 * @route   POST /api/v1/tournaments/:id/register-team/:teamId
 * @desc    Register a team for a tournament
 * @access  Private (team leader only)
 */
router.post(
  '/:id/register-team/:teamId',
  middleware.verifyToken,
  tournamentController.registerTeam
);

/**
 * @route   GET /api/v1/tournaments/:id/teams
 * @desc    Get tournament teams
 * @access  Public (with restrictions based on tournament visibility)
 */
router.get('/:id/teams', tournamentController.getTournamentTeams);

/**
 * @route   PUT /api/v1/tournaments/:id/team-registration/:teamId
 * @desc    Update team registration status
 * @access  Private (organizer only)
 */
router.put(
  '/:id/team-registration/:teamId',
  middleware.verifyToken,
  middleware.isResourceOwner('tournament'),
  tournamentController.updateTeamRegistration
);

/**
 * @route   DELETE /api/v1/tournaments/:id/withdraw-team/:teamId
 * @desc    Withdraw a team from a tournament
 * @access  Private (team leader or organizer only)
 */
router.delete(
  '/:id/withdraw-team/:teamId',
  middleware.verifyToken,
  tournamentController.withdrawTeam
);

/**
 * @route   GET /api/v1/tournaments/:id/standings
 * @desc    Get tournament standings
 * @access  Public
 */
router.get('/:id/standings', tournamentController.getTournamentStandings);

/**
 * @route   PUT /api/v1/tournaments/:id/status
 * @desc    Update tournament status
 * @access  Private (organizer only)
 */
router.put(
  '/:id/status',
  middleware.verifyToken,
  middleware.isResourceOwner('tournament'),
  tournamentController.updateTournamentStatus
);

/**
 * @route   GET /api/v1/tournaments/:id/statistics
 * @desc    Get tournament statistics
 * @access  Public
 */
router.get('/:id/statistics', tournamentController.getTournamentStatistics);

/**
 * @route   GET /api/v1/tournaments/:id/brackets
 * @desc    Get tournament brackets
 * @access  Public
 */
router.get('/:id/brackets', tournamentController.getTournamentBrackets);

/**
 * @route   GET /api/v1/tournaments/:id/player-stats
 * @desc    Get tournament player statistics
 * @access  Public
 */
router.get('/:id/player-stats', tournamentController.getPlayerStats);

module.exports = router; 