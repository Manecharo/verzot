const express = require('express');
const router = express.Router();
const middleware = require('../middleware');
const matchController = require('../controllers/match.controller');
const matchEventController = require('../controllers/matchEvent.controller');

// Apply authentication middleware to all routes
router.use(middleware.verifyToken);

/**
 * @route GET /api/v1/matches
 * @desc Get all matches with optional filters
 * @access Private
 */
router.get('/', matchController.getAllMatches);

/**
 * @route GET /api/v1/matches/:id
 * @desc Get a match by ID
 * @access Private
 */
router.get('/:id', matchController.getMatchById);

/**
 * @route POST /api/v1/matches
 * @desc Create a new match
 * @access Private (Tournament Organizer)
 */
router.post('/', [middleware.hasRoles(['admin', 'organizer'])], matchController.createMatch);

/**
 * @route PUT /api/v1/matches/:id
 * @desc Update a match
 * @access Private (Tournament Organizer)
 */
router.put('/:id', [middleware.hasRoles(['admin', 'organizer'])], matchController.updateMatch);

/**
 * @route DELETE /api/v1/matches/:id
 * @desc Delete a match
 * @access Private (Tournament Organizer)
 */
router.delete('/:id', [middleware.hasRoles(['admin', 'organizer'])], matchController.deleteMatch);

/**
 * @route PUT /api/v1/matches/:id/result
 * @desc Update match result
 * @access Private (Tournament Organizer or Referee)
 */
router.put('/:id/result', [middleware.hasRoles(['admin', 'organizer', 'referee'])], matchController.updateMatchScore);

/**
 * @route PUT /api/v1/matches/:id/status
 * @desc Update match status
 * @access Private (Tournament Organizer or Referee)
 */
router.put('/:id/status', [middleware.hasRoles(['admin', 'organizer', 'referee'])], matchController.updateMatchStatus);

/**
 * @route POST /api/v1/matches/:id/confirm
 * @desc Confirm match result
 * @access Private (Team Leader, Organizer, or Referee)
 */
router.post('/:id/confirm', [middleware.hasRoles(['admin', 'organizer', 'referee', 'team_leader'])], matchController.confirmMatchResult);

/**
 * Match Event routes
 */

// Get all events for a match
router.get('/:matchId/events', matchEventController.getMatchEvents);

// Get a specific event
router.get('/:matchId/events/:eventId', matchEventController.getMatchEventById);

// Create a new match event (referee or tournament organizer only)
router.post(
  '/:matchId/events',
  [middleware.hasRoles(['admin', 'organizer', 'referee'])],
  matchEventController.createMatchEvent
);

// Update a match event (referee or tournament organizer only)
router.put(
  '/:matchId/events/:eventId',
  [middleware.hasRoles(['admin', 'organizer', 'referee'])],
  matchEventController.updateMatchEvent
);

// Delete a match event (referee or tournament organizer only)
router.delete(
  '/:matchId/events/:eventId',
  [middleware.hasRoles(['admin', 'organizer', 'referee'])],
  matchEventController.deleteMatchEvent
);

module.exports = router; 