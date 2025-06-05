const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;
const Role = db.Role;
const Tournament = db.Tournament;
const Team = db.Team;
const Match = db.Match;

/**
 * JWT verification middleware
 */
const verifyToken = (req, res, next) => {
  // Get token from auth header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      message: 'No token provided'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
};

/**
 * Middleware to check if user is an admin
 */
const isAdmin = async (req, res, next) => {
  try {
    if (req.userRole === 'admin') {
      return next();
    }
    
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    const roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'admin') {
        return next();
      }
    }
    
    return res.status(403).json({
      message: 'Admin role required'
    });
  } catch (error) {
    console.error('Error checking admin role:', error);
    return res.status(500).json({
      message: 'Error checking user role'
    });
  }
};

/**
 * Middleware to check if user is an organizer
 */
const isOrganizer = async (req, res, next) => {
  try {
    // Admins can do anything
    if (req.userRole === 'admin') {
      return next();
    }
    
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    const roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'organizer' || roles[i].name === 'admin') {
        return next();
      }
    }
    
    return res.status(403).json({
      message: 'Organizer role required'
    });
  } catch (error) {
    console.error('Error checking organizer role:', error);
    return res.status(500).json({
      message: 'Error checking user role'
    });
  }
};

/**
 * Middleware to check if user is the organizer of a specific tournament
 */
const isTournamentOrganizer = async (req, res, next) => {
  try {
    // Admins can do anything
    if (req.userRole === 'admin') {
      return next();
    }
    
    let tournamentId;
    
    // Try to get tournament ID from various sources
    if (req.params.tournamentId) {
      tournamentId = req.params.tournamentId;
    } else if (req.params.id && req.baseUrl.includes('tournaments')) {
      tournamentId = req.params.id;
    } else if (req.body.tournamentId) {
      tournamentId = req.body.tournamentId;
    } else if (req.params.matchId || req.params.id) {
      // If we have a match ID, get the tournament from the match
      const matchId = req.params.matchId || req.params.id;
      const match = await Match.findByPk(matchId);
      
      if (!match) {
        return res.status(404).json({
          message: 'Match not found'
        });
      }
      
      tournamentId = match.tournamentId;
    }
    
    if (!tournamentId) {
      return res.status(400).json({
        message: 'Tournament ID not found in request'
      });
    }
    
    const tournament = await Tournament.findByPk(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        message: 'Tournament not found'
      });
    }
    
    // Check if user is the tournament organizer
    if (tournament.organizerId === req.userId) {
      return next();
    }
    
    // Check if user has organizer role for this tournament
    const userRoles = await user.getRoles({
      include: [
        {
          model: db.TournamentRole,
          where: {
            tournamentId: tournamentId,
            role: 'organizer'
          }
        }
      ]
    });
    
    if (userRoles && userRoles.length > 0) {
      return next();
    }
    
    return res.status(403).json({
      message: 'Tournament organizer role required'
    });
  } catch (error) {
    console.error('Error checking tournament organizer role:', error);
    return res.status(500).json({
      message: 'Error checking user role'
    });
  }
};

/**
 * Middleware to check if user is a referee
 */
const isReferee = async (req, res, next) => {
  try {
    // Admins can do anything
    if (req.userRole === 'admin') {
      return next();
    }
    
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    const roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'referee' || roles[i].name === 'admin') {
        return next();
      }
    }
    
    return res.status(403).json({
      message: 'Referee role required'
    });
  } catch (error) {
    console.error('Error checking referee role:', error);
    return res.status(500).json({
      message: 'Error checking user role'
    });
  }
};

/**
 * Middleware to check if user is a tournament organizer or referee
 */
const isTournamentOrganizerOrReferee = async (req, res, next) => {
  try {
    // Admins can do anything
    if (req.userRole === 'admin') {
      return next();
    }
    
    let tournamentId;
    
    // Try to get tournament ID from various sources
    if (req.params.tournamentId) {
      tournamentId = req.params.tournamentId;
    } else if (req.params.id && req.baseUrl.includes('tournaments')) {
      tournamentId = req.params.id;
    } else if (req.body.tournamentId) {
      tournamentId = req.body.tournamentId;
    } else if (req.params.matchId || req.params.id) {
      // If we have a match ID, get the tournament from the match
      const matchId = req.params.matchId || req.params.id;
      const match = await Match.findByPk(matchId);
      
      if (!match) {
        return res.status(404).json({
          message: 'Match not found'
        });
      }
      
      tournamentId = match.tournamentId;
    }
    
    if (!tournamentId) {
      return res.status(400).json({
        message: 'Tournament ID not found in request'
      });
    }
    
    const tournament = await Tournament.findByPk(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        message: 'Tournament not found'
      });
    }
    
    // Check if user is the tournament organizer
    if (tournament.organizerId === req.userId) {
      return next();
    }
    
    // Check if user has referee or organizer role
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    const roles = await user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'referee' || roles[i].name === 'organizer') {
        return next();
      }
    }
    
    // Check if user has referee role for this tournament
    const userRoles = await user.getRoles({
      include: [
        {
          model: db.TournamentRole,
          where: {
            tournamentId: tournamentId,
            role: { [db.Sequelize.Op.in]: ['referee', 'organizer'] }
          }
        }
      ]
    });
    
    if (userRoles && userRoles.length > 0) {
      return next();
    }
    
    return res.status(403).json({
      message: 'Tournament organizer or referee role required'
    });
  } catch (error) {
    console.error('Error checking tournament organizer or referee role:', error);
    return res.status(500).json({
      message: 'Error checking user role'
    });
  }
};

/**
 * Middleware to check if user is a team owner or admin
 */
const isTeamOwnerOrAdmin = async (req, res, next) => {
  try {
    // Admins can do anything
    if (req.userRole === 'admin') {
      return next();
    }
    
    let teamId;
    
    // Try to get team ID from various sources
    if (req.params.teamId) {
      teamId = req.params.teamId;
    } else if (req.params.id && req.baseUrl.includes('teams')) {
      teamId = req.params.id;
    } else if (req.body.teamId) {
      teamId = req.body.teamId;
    } else if (req.params.playerId) {
      // If we have a player ID, get the team from the player
      const playerId = req.params.playerId;
      const player = await db.Player.findByPk(playerId);
      
      if (!player) {
        return res.status(404).json({
          message: 'Player not found'
        });
      }
      
      teamId = player.teamId;
    }
    
    if (!teamId) {
      return res.status(400).json({
        message: 'Team ID not found in request'
      });
    }
    
    const team = await Team.findByPk(teamId);
    
    if (!team) {
      return res.status(404).json({
        message: 'Team not found'
      });
    }
    
    // Check if user is the team leader
    if (team.teamLeaderId === req.userId) {
      return next();
    }
    
    // Check if user has manager role for this team
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    const userRoles = await user.getRoles({
      include: [
        {
          model: db.TeamRole,
          where: {
            teamId: teamId,
            role: 'manager'
          }
        }
      ]
    });
    
    if (userRoles && userRoles.length > 0) {
      return next();
    }
    
    return res.status(403).json({
      message: 'Team owner or manager role required'
    });
  } catch (error) {
    console.error('Error checking team owner role:', error);
    return res.status(500).json({
      message: 'Error checking user role'
    });
  }
};

/**
 * Middleware to check if user has team leader, organizer, or referee role
 */
const isTeamLeaderOrganizerOrReferee = async (req, res, next) => {
  try {
    // Admins can do anything
    if (req.userRole === 'admin') {
      return next();
    }
    
    const matchId = req.params.id;
    if (!matchId) {
      return res.status(400).json({
        message: 'Match ID not found in request'
      });
    }
    
    const match = await Match.findByPk(matchId, {
      include: [
        {
          model: Tournament,
          as: 'tournament'
        }
      ]
    });
    
    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }
    
    // Check tournament organizer
    if (match.tournament.organizerId === req.userId) {
      return next();
    }
    
    // Check if user is a team owner or leader
    const { homeTeamId, awayTeamId } = match;
    
    // If role is specified, check for specific team
    const { role } = req.body;
    if (role === 'home' || role === 'away') {
      const teamId = role === 'home' ? homeTeamId : awayTeamId;
      const team = await Team.findByPk(teamId);
      
      if (!team) {
        return res.status(404).json({
          message: 'Team not found'
        });
      }
      
      if (team.teamLeaderId === req.userId) {
        return next();
      }
      
      // Check if user has leader role for this team
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      
      const userRoles = await user.getRoles({
        include: [
          {
            model: db.TeamRole,
            where: {
              teamId: teamId,
              role: 'leader'
            }
          }
        ]
      });
      
      if (userRoles && userRoles.length > 0) {
        return next();
      }
      
      return res.status(403).json({
        message: 'Team leader role required'
      });
    }
    
    // Check if referee role
    if (role === 'referee') {
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      
      const roles = await user.getRoles();
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === 'referee') {
          return next();
        }
      }
      
      return res.status(403).json({
        message: 'Referee role required'
      });
    }
    
    // Check if organizer role
    if (role === 'organizer') {
      if (match.tournament.organizerId === req.userId) {
        return next();
      }
      
      return res.status(403).json({
        message: 'Tournament organizer role required'
      });
    }
    
    return res.status(403).json({
      message: 'Team leader, organizer, or referee role required'
    });
  } catch (error) {
    console.error('Error checking team leader/organizer/referee role:', error);
    return res.status(500).json({
      message: 'Error checking user role'
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isOrganizer,
  isTournamentOrganizer,
  isReferee,
  isTournamentOrganizerOrReferee,
  isTeamOwnerOrAdmin,
  isTeamLeaderOrganizerOrReferee
};

module.exports = authJwt; 