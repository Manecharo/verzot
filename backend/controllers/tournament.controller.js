const { Tournament, User, Team, Match, TeamTournament, Player, MatchEvent, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const NotificationService = require('../services/notification.service');

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
    const { id } = req.params;

    const tournament = await Tournament.findByPk(id, {
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

    const { id } = req.params;
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
    const tournament = await Tournament.findByPk(id);
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
    const { id } = req.params;

    // Find tournament by ID
    const tournament = await Tournament.findByPk(id);
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

/**
 * Register a team for a tournament
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.registerTeam = async (req, res) => {
  try {
    const { id, teamId } = req.params;
    const { registerNotes } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    // Find tournament by ID
    const tournament = await Tournament.findByPk(id);
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }

    // Check if tournament is accepting registrations
    if (!['draft', 'published', 'registration-open'].includes(tournament.status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Tournament is not accepting registrations'
      });
    }

    // Check if registration deadline has passed
    if (tournament.registrationDeadline && new Date() > new Date(tournament.registrationDeadline)) {
      return res.status(400).json({
        status: 'error',
        message: 'Registration deadline has passed'
      });
    }

    // Find team by ID
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        status: 'error',
        message: 'Team not found'
      });
    }

    // Check if user is the team leader
    if (team.teamLeaderId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - only the team leader can register the team'
      });
    }

    // Check if team is already registered
    const existingRegistration = await TeamTournament.findOne({
      where: {
        teamId,
        tournamentId: id
      }
    });

    if (existingRegistration) {
      return res.status(400).json({
        status: 'error',
        message: 'Team is already registered for this tournament',
        data: {
          registration: existingRegistration
        }
      });
    }

    // Check if maximum teams limit is reached
    const registeredTeamsCount = await TeamTournament.count({
      where: {
        tournamentId: id,
        status: 'approved'
      }
    });

    if (registeredTeamsCount >= tournament.maxTeams) {
      return res.status(400).json({
        status: 'error',
        message: 'Tournament has reached maximum team limit'
      });
    }

    // Create team registration
    const registration = await TeamTournament.create({
      teamId,
      tournamentId: id,
      status: 'pending',
      registerNotes,
      stats: {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Team registered successfully',
      data: {
        registration
      }
    });
  } catch (error) {
    console.error('Register team error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error registering team',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get tournament teams
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTournamentTeams = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, group, limit = 50, offset = 0 } = req.query;

    // Find tournament by ID
    const tournament = await Tournament.findByPk(id);
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

    // Build query
    const whereClause = {
      tournamentId: id
    };

    // Add filters if provided
    if (status) whereClause.status = status;
    if (group) whereClause.group = group;

    // Get teams
    const { count, rows: registrations } = await TeamTournament.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Team,
          include: [
            {
              model: User,
              as: 'TeamLeader',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: Player,
              attributes: ['id', 'firstName', 'lastName', 'jerseyNumber', 'position']
            }
          ]
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        registrations,
        count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get tournament teams error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving tournament teams',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update team registration status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTeamRegistration = async (req, res) => {
  try {
    const { id, teamId } = req.params;
    const { status, group, notes } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    // Find tournament by ID
    const tournament = await Tournament.findByPk(id);
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
        message: 'Access denied - only the tournament organizer can update team registration'
      });
    }

    // Find registration
    const registration = await TeamTournament.findOne({
      where: {
        teamId,
        tournamentId: id
      },
      include: [
        {
          model: Team,
          attributes: ['id', 'name', 'teamLeaderId']
        }
      ]
    });

    if (!registration) {
      return res.status(404).json({
        status: 'error',
        message: 'Team registration not found'
      });
    }

    // Check if new status is valid
    const validStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
        validStatuses
      });
    }

    const previousStatus = registration.status;
    
    // Update registration
    if (status) registration.status = status;
    if (group !== undefined) registration.group = group;
    if (notes !== undefined) registration.notes = notes;

    await registration.save();

    // Send notification to team leader if status changed to approved or rejected
    if (status && ['approved', 'rejected'].includes(status) && status !== previousStatus) {
      try {
        const teamLeaderId = registration.Team.teamLeaderId;
        const teamName = registration.Team.name;

        // Create registration details for notification
        const registrationDetails = {
          teamId,
          teamName,
          tournamentId: id,
          tournamentName: tournament.name,
          status,
          group: registration.group
        };

        // Send notification to team leader
        await NotificationService.createRegistrationStatusNotification(
          teamLeaderId,
          registrationDetails,
          true // Send email too
        );
      } catch (notificationError) {
        console.error('Error sending registration status notification:', notificationError);
        // We don't want to fail the registration update if notification fails
      }
    }

    res.json({
      status: 'success',
      message: 'Team registration updated successfully',
      data: {
        registration
      }
    });
  } catch (error) {
    console.error('Update team registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating team registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Withdraw a team from a tournament
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.withdrawTeam = async (req, res) => {
  try {
    const { id, teamId } = req.params;

    // Find tournament by ID
    const tournament = await Tournament.findByPk(id);
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }

    // Find team by ID
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({
        status: 'error',
        message: 'Team not found'
      });
    }

    // Check if user is the team leader or tournament organizer
    if (team.teamLeaderId !== req.user.id && tournament.organizerId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied - only the team leader or tournament organizer can withdraw a team'
      });
    }

    // Find registration
    const registration = await TeamTournament.findOne({
      where: {
        teamId,
        tournamentId: id
      }
    });

    if (!registration) {
      return res.status(404).json({
        status: 'error',
        message: 'Team registration not found'
      });
    }

    // Check if tournament has already started
    if (tournament.status === 'in-progress' || tournament.status === 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot withdraw from a tournament that has already started or completed'
      });
    }

    // Update registration status to withdrawn
    registration.status = 'withdrawn';
    await registration.save();

    res.json({
      status: 'success',
      message: 'Team withdrawn successfully',
      data: {
        registration
      }
    });
  } catch (error) {
    console.error('Withdraw team error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error withdrawing team',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get tournament standings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTournamentStandings = async (req, res) => {
  try {
    const { id } = req.params;
    const { group } = req.query;

    // Find tournament by ID
    const tournament = await Tournament.findByPk(id);
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }

    // Build query
    const whereClause = {
      tournamentId: id,
      status: 'approved'
    };

    if (group) {
      whereClause.group = group;
    }

    // Get teams with stats
    const registrations = await TeamTournament.findAll({
      where: whereClause,
      include: [
        {
          model: Team,
          attributes: ['id', 'name', 'logoUrl']
        }
      ],
      order: [
        ['group', 'ASC'],
        [sequelize.literal('stats->>\'points\''), 'DESC'],
        [sequelize.literal('stats->>\'goalDifference\''), 'DESC'],
        [sequelize.literal('stats->>\'goalsFor\''), 'DESC']
      ]
    });

    // Group by group if tournament has groups
    let standings = [];
    if (tournament.format === 'group-stage') {
      const groups = {};
      registrations.forEach(reg => {
        const groupName = reg.group || 'Ungrouped';
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push({
          teamId: reg.Team.id,
          teamName: reg.Team.name,
          teamLogo: reg.Team.logoUrl,
          stats: reg.stats
        });
      });
      standings = Object.entries(groups).map(([group, teams]) => ({
        group,
        teams
      }));
    } else {
      // For tournaments without groups, just return a flat list
      standings = registrations.map(reg => ({
        teamId: reg.Team.id,
        teamName: reg.Team.name,
        teamLogo: reg.Team.logoUrl,
        stats: reg.stats
      }));
    }

    res.json({
      status: 'success',
      data: {
        standings,
        format: tournament.format,
        tiebreakerRules: tournament.tiebreakerRules
      }
    });
  } catch (error) {
    console.error('Get tournament standings error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving tournament standings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update tournament status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateTournamentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errors.array()
      });
    }

    // Find tournament by ID
    const tournament = await Tournament.findByPk(id);
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
        message: 'Access denied - only the tournament organizer can update tournament status'
      });
    }

    // Check if new status is valid
    const validStatuses = ['draft', 'published', 'registration-open', 'registration-closed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
        validStatuses
      });
    }

    // Check for valid status transitions
    const currentStatus = tournament.status;
    const invalidTransitions = {
      'completed': ['draft', 'published', 'registration-open', 'registration-closed', 'in-progress'],
      'cancelled': ['completed']
    };

    if (invalidTransitions[currentStatus] && invalidTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    // Additional validation for status transitions
    if (status === 'in-progress') {
      // Check if there are enough teams
      const teamsCount = await TeamTournament.count({
        where: {
          tournamentId: id,
          status: 'approved'
        }
      });

      if (teamsCount < tournament.minTeams) {
        return res.status(400).json({
          status: 'error',
          message: `Need at least ${tournament.minTeams} teams to start the tournament, but only ${teamsCount} are approved`
        });
      }

      // Check if matches are scheduled
      const matchesCount = await Match.count({
        where: {
          tournamentId: id
        }
      });

      if (matchesCount === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No matches scheduled for this tournament'
        });
      }
    }

    const previousStatus = tournament.status;
    
    // Update tournament status
    tournament.status = status;
    await tournament.save();

    // Send notification to relevant users about tournament status change
    try {
      // Get all teams registered for this tournament
      const registeredTeams = await TeamTournament.findAll({
        where: {
          tournamentId: id,
          status: 'approved'
        },
        include: [
          {
            model: Team,
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id']
              }
            ]
          }
        ]
      });

      // Prepare notification data
      const tournamentDetails = {
        id: tournament.id,
        name: tournament.name,
        status,
        previousStatus
      };

      // Notify team leaders
      const teamLeaderPromises = registeredTeams.map(registration => {
        if (registration.Team && registration.Team.TeamLeader) {
          return NotificationService.createTournamentStatusNotification(
            registration.Team.TeamLeader.id,
            tournamentDetails
          );
        }
        return Promise.resolve();
      });

      // Execute all notification creation promises
      await Promise.all(teamLeaderPromises);
    } catch (notificationError) {
      console.error('Error sending tournament status notifications:', notificationError);
      // We don't want to fail the status update if notifications fail
    }

    res.json({
      status: 'success',
      message: 'Tournament status updated successfully',
      data: {
        tournament
      }
    });
  } catch (error) {
    console.error('Update tournament status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error updating tournament status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get tournament statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTournamentStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    // Find tournament by ID
    const tournament = await Tournament.findByPk(id);
    if (!tournament) {
      return res.status(404).json({
        status: 'error',
        message: 'Tournament not found'
      });
    }

    // Get team count
    const teamsCount = await TeamTournament.count({
      where: {
        tournamentId: id,
        status: 'approved'
      }
    });

    // Get match stats
    const matches = await Match.findAll({
      where: {
        tournamentId: id
      },
      attributes: ['status', 'homeScore', 'awayScore']
    });

    const matchesCount = matches.length;
    const completedMatchesCount = matches.filter(m => m.status === 'completed').length;
    
    let totalGoals = 0;
    let avgGoalsPerMatch = 0;
    
    matches.forEach(match => {
      if (match.status === 'completed' && match.homeScore !== null && match.awayScore !== null) {
        totalGoals += (match.homeScore + match.awayScore);
      }
    });
    
    if (completedMatchesCount > 0) {
      avgGoalsPerMatch = totalGoals / completedMatchesCount;
    }

    // Get top scorers
    const topScorers = await MatchEvent.findAll({
      where: {
        eventType: { [sequelize.Op.in]: ['goal', 'penalty-goal'] }
      },
      include: [
        {
          model: Match,
          where: { tournamentId: id },
          attributes: ['id']
        },
        {
          model: Player,
          attributes: ['id', 'firstName', 'lastName', 'jerseyNumber'],
          include: [
            {
              model: Team,
              attributes: ['id', 'name', 'logoUrl']
            }
          ]
        }
      ],
      attributes: [
        'playerId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'goals']
      ],
      group: ['playerId', 'Player.id', 'Player.firstName', 'Player.lastName', 'Player.jerseyNumber', 'Player.Team.id', 'Player.Team.name', 'Player.Team.logoUrl', 'Match.id'],
      order: [[sequelize.literal('goals'), 'DESC']],
      limit: 5
    });

    // Build statistics object
    const statistics = {
      teams: teamsCount,
      matches: {
        total: matchesCount,
        completed: completedMatchesCount,
        scheduled: matches.filter(m => m.status === 'scheduled').length,
        inProgress: matches.filter(m => m.status === 'in-progress').length,
        cancelled: matches.filter(m => m.status === 'cancelled').length
      },
      goals: {
        total: totalGoals,
        average: avgGoalsPerMatch.toFixed(2)
      },
      topScorers: topScorers.map(scorer => ({
        playerId: scorer.playerId,
        playerName: `${scorer.Player.firstName} ${scorer.Player.lastName}`,
        jerseyNumber: scorer.Player.jerseyNumber,
        teamId: scorer.Player.Team.id,
        teamName: scorer.Player.Team.name,
        teamLogo: scorer.Player.Team.logoUrl,
        goals: parseInt(scorer.get('goals'))
      }))
    };

    res.json({
      status: 'success',
      data: {
        statistics
      }
    });
  } catch (error) {
    console.error('Get tournament statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving tournament statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Placeholder for tournament brackets endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTournamentBrackets = async (req, res) => {
  try {
    // Bracket generation not implemented
    res.status(200).json({
      status: 'success',
      message: 'Brackets not implemented yet',
      data: {}
    });
  } catch (error) {
    console.error('Get tournament brackets error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving tournament brackets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Placeholder for tournament player statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPlayerStats = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Tournament player stats not implemented yet',
      data: {}
    });
  } catch (error) {
    console.error('Get tournament player stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error retrieving tournament player stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
