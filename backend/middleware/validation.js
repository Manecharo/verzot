const { body, param, validationResult } = require('express-validator');

/**
 * Validate registration input
 */
exports.validateRegistration = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
  body('firstName', 'First name is required').notEmpty(),
  body('lastName', 'Last name is required').notEmpty()
];

/**
 * Validate login input
 */
exports.validateLogin = [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
];

/**
 * Validate tournament creation input
 */
exports.validateTournament = [
  body('name', 'Tournament name is required').notEmpty(),
  body('startDate', 'Start date must be a valid date').isISO8601().toDate(),
  body('endDate', 'End date must be a valid date').isISO8601().toDate(),
  body('format', 'Format is required').isIn(['11', '8', '7', '5', 'penalty']),
  body('tournamentFormat', 'Tournament format is required').isIn(['league', 'groupKnockout', 'knockout', 'doubleElimination'])
];

/**
 * Validate team creation input
 */
exports.validateTeam = [
  body('name', 'Team name is required').notEmpty(),
  body('location', 'Location is required').notEmpty()
];

/**
 * Validate match creation input
 */
exports.validateMatch = [
  body('homeTeamId', 'Home team ID is required').isInt(),
  body('awayTeamId', 'Away team ID is required').isInt(),
  body('matchDate', 'Match date must be a valid date').isISO8601().toDate()
];

/**
 * Validate match event input
 */
exports.validateMatchEvent = [
  body('matchId', 'Match ID is required').isInt(),
  body('type', 'Event type is required').notEmpty(),
  body('minute', 'Minute is required').isInt({ min: 0 })
];

/**
 * Check validation results middleware
 */
exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
}; 