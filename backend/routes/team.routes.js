const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const teamController = require('../controllers/team.controller');

// Apply authentication middleware to all routes
router.use(middleware.verifyToken);

/**
 * @route GET /api/v1/teams
 * @desc Get all teams with optional filters
 * @access Private
 */
router.get('/', teamController.getAllTeams);

/**
 * @route GET /api/v1/teams/:id
 * @desc Get a team by ID
 * @access Private
 */
router.get('/:id', teamController.getTeamById);

/**
 * @route POST /api/v1/teams
 * @desc Create a new team
 * @access Private
 */
router.post('/', teamController.createTeam);

/**
 * @route PUT /api/v1/teams/:id
 * @desc Update a team
 * @access Private (Team Owner or Admin)
 */
router.put('/:id', [middleware.isResourceOwner('team')], teamController.updateTeam);

/**
 * @route DELETE /api/v1/teams/:id
 * @desc Delete a team
 * @access Private (Team Owner or Admin)
 */
router.delete('/:id', [middleware.isResourceOwner('team')], teamController.deleteTeam);

/**
 * @route GET /api/v1/teams/:id/players
 * @desc Get all players for a team
 * @access Private
 */
router.get('/:id/players', teamController.getTeamPlayers);

/**
 * @route POST /api/v1/teams/:id/players
 * @desc Add a player to a team
 * @access Private (Team Owner or Admin)
 */
router.post('/:id/players', [middleware.isResourceOwner('team')], teamController.addPlayerToTeam);

/**
 * @route DELETE /api/v1/teams/:id/players/:playerId
 * @desc Remove a player from a team
 * @access Private (Team Owner or Admin)
 */
router.delete('/:id/players/:playerId', [middleware.isResourceOwner('team')], teamController.removePlayerFromTeam);

/**
 * @route GET /api/v1/teams/:id/tournaments
 * @desc Get all tournaments for a team
 * @access Private
 */
router.get('/:id/tournaments', teamController.getTeamTournaments);

/**
 * @route GET /api/v1/teams/:id/matches
 * @desc Get all matches for a team
 * @access Private
 */
router.get('/:id/matches', teamController.getTeamMatches);

/**
 * @route GET /api/v1/teams/:id/stats
 * @desc Get team statistics
 * @access Private
 */
router.get('/:id/stats', teamController.getTeamStats);

module.exports = router; 