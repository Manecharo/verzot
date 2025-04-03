const { body } = require('express-validator');

/**
 * Validation rules for creating a tournament
 */
exports.createTournamentValidation = [
  body('name')
    .notEmpty()
    .withMessage('Tournament name is required')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Tournament name must be between 3 and 100 characters'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO 8601 format (YYYY-MM-DD)')
    .toDate(),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date in ISO 8601 format (YYYY-MM-DD)')
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('format')
    .notEmpty()
    .withMessage('Tournament format is required')
    .isIn(['11-a-side', '8-a-side', '7-a-side', '5-a-side', 'penalty-shootout'])
    .withMessage('Invalid tournament format'),
  
  body('maxTeams')
    .notEmpty()
    .withMessage('Maximum number of teams is required')
    .isInt({ min: 2 })
    .withMessage('Maximum teams must be at least 2'),
  
  body('minTeams')
    .optional()
    .isInt({ min: 2 })
    .withMessage('Minimum teams must be at least 2'),
  
  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Registration deadline must be a valid date in ISO 8601 format')
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) >= new Date(req.body.startDate)) {
        throw new Error('Registration deadline must be before tournament start date');
      }
      return true;
    }),
  
  body('rosterLockDate')
    .optional()
    .isISO8601()
    .withMessage('Roster lock date must be a valid date in ISO 8601 format')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.registrationDeadline && new Date(value) < new Date(req.body.registrationDeadline)) {
        throw new Error('Roster lock date must be after registration deadline');
      }
      return true;
    }),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  
  body('rules')
    .optional()
    .isJSON()
    .withMessage('Rules must be valid JSON')
    .customSanitizer(value => JSON.parse(value)),
  
  body('tiebreakerRules')
    .optional()
    .isJSON()
    .withMessage('Tiebreaker rules must be valid JSON')
    .customSanitizer(value => JSON.parse(value)),
  
  body('tournamentStructure')
    .optional()
    .isJSON()
    .withMessage('Tournament structure must be valid JSON')
    .customSanitizer(value => JSON.parse(value))
];

/**
 * Validation rules for updating a tournament
 */
exports.updateTournamentValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Tournament name must be between 3 and 100 characters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO 8601 format (YYYY-MM-DD)')
    .toDate(),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date in ISO 8601 format (YYYY-MM-DD)')
    .toDate()
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('format')
    .optional()
    .isIn(['11-a-side', '8-a-side', '7-a-side', '5-a-side', 'penalty-shootout'])
    .withMessage('Invalid tournament format'),
  
  body('maxTeams')
    .optional()
    .isInt({ min: 2 })
    .withMessage('Maximum teams must be at least 2'),
  
  body('minTeams')
    .optional()
    .isInt({ min: 2 })
    .withMessage('Minimum teams must be at least 2'),
  
  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Registration deadline must be a valid date in ISO 8601 format')
    .toDate(),
  
  body('rosterLockDate')
    .optional()
    .isISO8601()
    .withMessage('Roster lock date must be a valid date in ISO 8601 format')
    .toDate(),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'registration-open', 'registration-closed', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid tournament status'),
  
  body('rules')
    .optional()
    .isJSON()
    .withMessage('Rules must be valid JSON')
    .customSanitizer(value => JSON.parse(value)),
  
  body('tiebreakerRules')
    .optional()
    .isJSON()
    .withMessage('Tiebreaker rules must be valid JSON')
    .customSanitizer(value => JSON.parse(value)),
  
  body('tournamentStructure')
    .optional()
    .isJSON()
    .withMessage('Tournament structure must be valid JSON')
    .customSanitizer(value => JSON.parse(value))
]; 