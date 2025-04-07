const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const playerController = require('../controllers/player.controller');

// Apply authentication middleware to all routes
router.use(middleware.verifyToken);

/**
 * @route GET /api/v1/players
 * @desc Get all players or search players
 * @access Private
 */
router.get('/', playerController.getAllPlayers);

/**
 * @route GET /api/v1/players/:id
 * @desc Get a player by ID
 * @access Private
 */
router.get('/:id', playerController.getPlayerById);

/**
 * @route GET /api/v1/players/:id/stats
 * @desc Get player statistics
 * @access Private
 */
router.get('/:id/stats', playerController.getPlayerStats);

/**
 * @route POST /api/v1/players
 * @desc Create a new player
 * @access Private
 */
router.post('/', playerController.createPlayer);

/**
 * @route PUT /api/v1/players/:id
 * @desc Update a player
 * @access Private (Team Owner or Admin)
 */
router.put('/:id', [middleware.hasRoles(['admin', 'team_owner'])], playerController.updatePlayer);

/**
 * @route DELETE /api/v1/players/:id
 * @desc Delete a player
 * @access Private (Team Owner or Admin)
 */
router.delete('/:id', [middleware.hasRoles(['admin', 'team_owner'])], playerController.deletePlayer);

/**
 * @route GET /api/v1/players/:id/tournament/:tournamentId/stats
 * @desc Get player statistics for a specific tournament
 * @access Private
 */
router.get('/:id/tournament/:tournamentId/stats', playerController.getPlayerTournamentStats);

/**
 * @route GET /api/v1/players/:id/matches
 * @desc Get all matches for a player
 * @access Private
 */
router.get('/:id/matches', playerController.getPlayerMatches);

module.exports = router; 