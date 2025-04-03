const { Tournament, User, Team, Match, sequelize } = require('../models');
const { validationResult } = require('express-validator');

/**
 * Create a new tournament
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createTournament = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      location,
      format,
      maxTeams,
      minTeams,
      registrationDeadline,
      rosterLockDate,
      isPublic,
      rules,
      tiebreakerRules,
      tournamentStructure
    } = req.body;

    // Current user from auth middleware is the organizer
    const organizerId = req.user.id;

    // Create tournament
    const tournament = await Tournament.create({
      name,
      description,
      startDate,
      endDate,
      location,
      format,
      maxTeams,
      minTeams: minTeams || 2,
      registrationDeadline,
      rosterLockDate,
      isPublic: isPublic !== undefined ? isPublic : true,
      rules,
      tiebreakerRules,
      tournamentStructure,
      organizerId,
      status: 'draft'
    });

    res.status(201).json({
      status: 'success',
      message: 'Tournament created successfully',
      data: {
        tournament
      }
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error creating tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all tournaments with filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTournaments = async (req, res) => {
  try {
    const {
      status,
      format,
      startDate,
      endDate,
      isPublic,
      organizerId,
      limit = 10,
      offset = 0
    } = req.query;

    // Build query options
    const queryOptions = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'Organizer',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    };

    // Add filters if provided
    const whereClause = {};
    if (status) whereClause.status = status;
    if (format) whereClause.format = format;
    if (startDate) whereClause.startDate = { [sequelize.Op.gte]: new Date(startDate) };
    if (endDate) whereClause.endDate = { [sequelize.Op.lte]: new Date(endDate) };
    if (isPublic !== undefined) whereClause.isPublic = isPublic === 'true';
    if (organizerId) whereClause.organizerId = organizerId;

    // If not authenticated or not specifically requesting all tournaments,
    // only show public tournaments
    if (!req.user && !req.query.includePrivate) {
      whereClause.isPublic = true;
    }

    queryOptions.where = whereClause;

    // Get tournaments
    const { count, rows: tournaments } = await Tournament.findAndCountAll(queryOptions);

    res.json({
      status: 'success',
      data: {
        tournaments,
        count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving tournaments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get tournament by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTournamentById = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findByPk(tournamentId, {
      include: [
        {
          model: User,
          as: 'Organizer',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Team,
          through: { attributes: ['status', 'group', 'stats'] }
        },
        {
          model: Match,
          include: [
            { model: Team, as: 'HomeTeam', attributes: ['id', 'name', 'logoUrl'] },
            { model: Team, as: 'AwayTeam', attributes: ['id', 'name', 'logoUrl'] }
          ]
        }
      ]
    });

    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }

    // If tournament is not public and user is not authenticated
    // or user is not the organizer, deny access
    if (!tournament.isPublic && 
        (!req.user || (req.user.id !== tournament.organizerId))) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - this tournament is private'
      });
    }

    res.json({
      status: 'success',
      data: {
        tournament
      }
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update tournament
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTournament = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { tournamentId } = req.params;
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      format,
      maxTeams,
      minTeams,
      registrationDeadline,
      rosterLockDate,
      isPublic,
      status,
      rules,
      tiebreakerRules,
      tournamentStructure
    } = req.body;

    // Find tournament by ID
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }

    // Check if user is the tournament organizer
    if (tournament.organizerId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - only the tournament organizer can update it'
      });
    }

    // Update tournament fields
    if (name) tournament.name = name;
    if (description !== undefined) tournament.description = description;
    if (startDate) tournament.startDate = startDate;
    if (endDate) tournament.endDate = endDate;
    if (location !== undefined) tournament.location = location;
    if (format) tournament.format = format;
    if (maxTeams) tournament.maxTeams = maxTeams;
    if (minTeams) tournament.minTeams = minTeams;
    if (registrationDeadline !== undefined) tournament.registrationDeadline = registrationDeadline;
    if (rosterLockDate !== undefined) tournament.rosterLockDate = rosterLockDate;
    if (isPublic !== undefined) tournament.isPublic = isPublic;
    if (status) tournament.status = status;
    if (rules) tournament.rules = rules;
    if (tiebreakerRules) tournament.tiebreakerRules = tiebreakerRules;
    if (tournamentStructure) tournament.tournamentStructure = tournamentStructure;

    // Save updated tournament
    await tournament.save();

    res.json({
      status: 'success',
      message: 'Tournament updated successfully',
      data: {
        tournament
      }
    });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete tournament
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    // Find tournament by ID
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }

    // Check if user is the tournament organizer
    if (tournament.organizerId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - only the tournament organizer can delete it'
      });
    }

    // Delete tournament (soft delete since paranoid is true)
    await tournament.destroy();

    res.json({
      status: 'success',
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error deleting tournament',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 