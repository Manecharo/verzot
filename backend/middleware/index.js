const auth = require('./auth');
const validation = require('./validation');

module.exports = {
  // Auth middleware
  verifyToken: auth.verifyToken,
  hasRoles: auth.hasRoles,
  isResourceOwner: auth.isResourceOwner,
  
  // Validation middleware
  validateRegistration: validation.validateRegistration,
  validateLogin: validation.validateLogin,
  validateTournament: validation.validateTournament,
  validateTeam: validation.validateTeam,
  validateMatch: validation.validateMatch,
  validateMatchEvent: validation.validateMatchEvent,
  checkValidation: validation.checkValidation
}; 