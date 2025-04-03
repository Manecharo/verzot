const jwt = require('jsonwebtoken');
const { User, Role, UserRole } = require('../models');

/**
 * Middleware to authenticate JWT token
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No authentication token, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user data to request
    req.user = decoded.user;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired'
      });
    }
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

/**
 * Middleware to check if user has a specific role
 * @param {string} roleName - Role name to check for
 */
exports.hasRole = (roleName) => {
  return async (req, res, next) => {
    try {
      // User should be authenticated first
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized - authentication required'
        });
      }

      // Get user with roles
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Role,
          where: { name: roleName }
        }]
      });

      if (!user || user.Roles.length === 0) {
        return res.status(403).json({
          status: 'error',
          message: `Access denied - ${roleName} role required`
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error checking permissions'
      });
    }
  };
};

/**
 * Middleware to check if user has specific tournament-level role
 * @param {string} roleName - Role name to check for
 * @param {string} tournamentIdParam - Parameter name containing tournament ID
 */
exports.hasTournamentRole = (roleName, tournamentIdParam = 'tournamentId') => {
  return async (req, res, next) => {
    try {
      // User should be authenticated first
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized - authentication required'
        });
      }

      const tournamentId = req.params[tournamentIdParam];

      if (!tournamentId) {
        return res.status(400).json({
          status: 'error',
          message: 'Tournament ID is required'
        });
      }

      // Check if user has the required role for this tournament
      const userRole = await UserRole.findOne({
        where: {
          userId: req.user.id,
          tournamentId
        },
        include: [{
          model: Role,
          where: { name: roleName }
        }]
      });

      if (!userRole) {
        return res.status(403).json({
          status: 'error',
          message: `Access denied - ${roleName} role required for this tournament`
        });
      }

      next();
    } catch (error) {
      console.error('Tournament role check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error checking tournament permissions'
      });
    }
  };
};

/**
 * Middleware to check if user has specific team-level role
 * @param {string} roleName - Role name to check for
 * @param {string} teamIdParam - Parameter name containing team ID
 */
exports.hasTeamRole = (roleName, teamIdParam = 'teamId') => {
  return async (req, res, next) => {
    try {
      // User should be authenticated first
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized - authentication required'
        });
      }

      const teamId = req.params[teamIdParam];

      if (!teamId) {
        return res.status(400).json({
          status: 'error',
          message: 'Team ID is required'
        });
      }

      // Check if user has the required role for this team
      const userRole = await UserRole.findOne({
        where: {
          userId: req.user.id,
          teamId
        },
        include: [{
          model: Role,
          where: { name: roleName }
        }]
      });

      if (!userRole) {
        return res.status(403).json({
          status: 'error',
          message: `Access denied - ${roleName} role required for this team`
        });
      }

      next();
    } catch (error) {
      console.error('Team role check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error checking team permissions'
      });
    }
  };
}; 