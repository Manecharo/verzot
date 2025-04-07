const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

/**
 * Middleware to authenticate JWT token
 */
exports.verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No token provided'
    });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        error: err.message
      });
    }

    // Set user ID in request
    req.user = { id: decoded.id };
    next();
  });
};

/**
 * Middleware to check user roles
 * @param {Array} roles - Array of role names to check
 */
exports.hasRoles = (roles) => {
  return async (req, res, next) => {
    try {
      // Check if user ID exists in request
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized - No user ID'
        });
      }

      // Get user with roles
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Role,
          through: { attributes: [] }
        }]
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Get user roles
      const userRoles = user.Roles.map(role => role.name);

      // Check if user has at least one of the required roles
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (hasRequiredRole) {
        next();
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions',
          requiredRoles: roles,
          userRoles: userRoles
        });
      }
    } catch (error) {
      console.error('Role verification error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error checking user permissions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Middleware to validate that a user has permission to access a specific resource
 * For example, to check if a user is the owner of a team
 */
exports.isResourceOwner = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id;
      
      let isOwner = false;
      
      switch (resourceType) {
        case 'team':
          // Check if user is the team owner
          const team = await Team.findByPk(resourceId);
          isOwner = team && team.ownerId === userId;
          break;
        
        case 'tournament':
          // Check if user is the tournament organizer
          const tournament = await Tournament.findByPk(resourceId);
          isOwner = tournament && tournament.organizerId === userId;
          break;
          
        default:
          return res.status(400).json({
            status: 'error',
            message: `Invalid resource type: ${resourceType}`
          });
      }
      
      if (isOwner) {
        next();
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to perform this action'
        });
      }
    } catch (error) {
      console.error('Resource ownership verification error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error checking resource ownership',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}; 