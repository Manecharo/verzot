const db = require('../models');
const Match = db.Match;
const Team = db.Team;
const Tournament = db.Tournament;
const MatchEvent = db.MatchEvent;
const Player = db.Player;
const Op = db.Sequelize.Op;
const NotificationService = require('../services/notification.service');
const User = db.User;

/**
 * Match controller for handling match-related operations
 */
const matchController = {
  /**
   * Get all matches with optional filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllMatches: async (req, res) => {
    try {
      const { tournamentId, status, teamId, upcoming, past } = req.query;
      const whereClause = {};
      
      if (tournamentId) {
        whereClause.tournamentId = tournamentId;
      }
      
      if (status) {
        whereClause.status = status;
      }
      
      if (teamId) {
        whereClause[Op.or] = [
          { homeTeamId: teamId },
          { awayTeamId: teamId }
        ];
      }
      
      const now = new Date();
      
      if (upcoming === 'true') {
        whereClause.scheduledDate = {
          [Op.gt]: now
        };
      }
      
      if (past === 'true') {
        whereClause.scheduledDate = {
          [Op.lt]: now
        };
      }
      
      const matches = await Match.findAll({
        where: whereClause,
        include: [
          {
            model: Team,
            as: 'homeTeam',
            attributes: ['id', 'name', 'logoUrl']
          },
          {
            model: Team,
            as: 'awayTeam',
            attributes: ['id', 'name', 'logoUrl']
          },
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name']
          }
        ],
        order: [['scheduledDate', 'ASC']]
      });
      
      res.status(200).json(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      res.status(500).json({ message: 'Failed to fetch matches', error: error.message });
    }
  },
  
  /**
   * Get a match by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getMatchById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const match = await Match.findByPk(id, {
        include: [
          {
            model: Team,
            as: 'homeTeam',
            attributes: ['id', 'name', 'logoUrl'],
            include: [
              {
                model: Player,
                as: 'players',
                attributes: ['id', 'firstName', 'lastName', 'jerseyNumber', 'position']
              }
            ]
          },
          {
            model: Team,
            as: 'awayTeam',
            attributes: ['id', 'name', 'logoUrl'],
            include: [
              {
                model: Player,
                as: 'players',
                attributes: ['id', 'firstName', 'lastName', 'jerseyNumber', 'position']
              }
            ]
          },
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name', 'ownerId', 'format']
          },
          {
            model: MatchEvent,
            as: 'events',
            include: [
              {
                model: Player,
                as: 'player',
                attributes: ['id', 'firstName', 'lastName', 'jerseyNumber']
              },
              {
                model: Player,
                as: 'secondaryPlayer',
                attributes: ['id', 'firstName', 'lastName', 'jerseyNumber']
              },
              {
                model: Team,
                as: 'team',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      res.status(200).json(match);
    } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).json({ message: 'Failed to fetch match', error: error.message });
    }
  },
  
  /**
   * Create a new match
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createMatch: async (req, res) => {
    try {
      const {
        tournamentId,
        homeTeamId,
        awayTeamId,
        scheduledDate,
        location,
        field,
        phase,
        group,
        round
      } = req.body;
      
      // Check if tournament exists
      const tournament = await Tournament.findByPk(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      
      // Check if teams exist when provided
      if (homeTeamId) {
        const homeTeam = await Team.findByPk(homeTeamId);
        if (!homeTeam) {
          return res.status(404).json({ message: 'Home team not found' });
        }
      }
      
      if (awayTeamId) {
        const awayTeam = await Team.findByPk(awayTeamId);
        if (!awayTeam) {
          return res.status(404).json({ message: 'Away team not found' });
        }
      }
      
      // Create the match
      const match = await Match.create({
        tournamentId,
        homeTeamId,
        awayTeamId,
        scheduledDate,
        location,
        field,
        phase,
        group,
        round,
        status: 'scheduled',
        homeScore: 0,
        awayScore: 0
      });
      
      res.status(201).json({
        message: 'Match created successfully',
        match
      });
    } catch (error) {
      console.error('Error creating match:', error);
      res.status(500).json({ message: 'Failed to create match', error: error.message });
    }
  },
  
  /**
   * Update a match
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateMatch: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        homeTeamId,
        awayTeamId,
        scheduledDate,
        location,
        field,
        phase,
        group,
        round
      } = req.body;
      
      const match = await Match.findByPk(id);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if status allows updates
      if (match.status === 'completed') {
        return res.status(400).json({ message: 'Cannot update a completed match' });
      }
      
      // Check if teams exist when provided
      if (homeTeamId && homeTeamId !== match.homeTeamId) {
        const homeTeam = await Team.findByPk(homeTeamId);
        if (!homeTeam) {
          return res.status(404).json({ message: 'Home team not found' });
        }
      }
      
      if (awayTeamId && awayTeamId !== match.awayTeamId) {
        const awayTeam = await Team.findByPk(awayTeamId);
        if (!awayTeam) {
          return res.status(404).json({ message: 'Away team not found' });
        }
      }
      
      // Update the match
      await match.update({
        homeTeamId: homeTeamId || match.homeTeamId,
        awayTeamId: awayTeamId || match.awayTeamId,
        scheduledDate: scheduledDate || match.scheduledDate,
        location: location || match.location,
        field: field || match.field,
        phase: phase || match.phase,
        group: group || match.group,
        round: round || match.round
      });
      
      res.status(200).json({
        message: 'Match updated successfully',
        match
      });
    } catch (error) {
      console.error('Error updating match:', error);
      res.status(500).json({ message: 'Failed to update match', error: error.message });
    }
  },
  
  /**
   * Delete a match
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteMatch: async (req, res) => {
    try {
      const { id } = req.params;
      
      const match = await Match.findByPk(id);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if status allows deletion
      if (match.status === 'completed' || match.status === 'in-progress') {
        return res.status(400).json({ message: 'Cannot delete a match that is in progress or completed' });
      }
      
      // Check for match events
      const eventCount = await MatchEvent.count({ where: { matchId: id } });
      
      if (eventCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete a match with events',
          eventCount
        });
      }
      
      // Delete the match
      await match.destroy();
      
      res.status(200).json({
        message: 'Match deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting match:', error);
      res.status(500).json({ message: 'Failed to delete match', error: error.message });
    }
  },
  
  /**
   * Update match status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateMatchStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const match = await Match.findByPk(id, {
        include: [
          {
            model: Team,
            as: 'homeTeam',
            attributes: ['id', 'name', 'ownerId'],
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id']
              }
            ]
          },
          {
            model: Team,
            as: 'awayTeam',
            attributes: ['id', 'name', 'ownerId'],
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id']
              }
            ]
          },
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name']
          }
        ]
      });
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if status is valid
      const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status',
          validStatuses
        });
      }
      
      // Check if status transition is valid
      if (match.status === 'completed' && status !== 'completed') {
        return res.status(400).json({ message: 'Cannot change status of a completed match' });
      }
      
      if (match.status === 'cancelled' && status !== 'scheduled') {
        return res.status(400).json({ message: 'Cancelled match can only be changed to scheduled' });
      }
      
      const previousStatus = match.status;

      // Update the match status
      await match.update({ status });
      
      // Send notifications based on status change
      try {
        // Only send notifications for meaningful status changes
        if (status === 'completed' && previousStatus !== 'completed') {
          // Send match result notifications to both team leaders
          if (match.homeTeam && match.awayTeam) {
            const resultDetails = {
              id: match.id,
              homeTeamName: match.homeTeam.name,
              homeScore: match.homeScore,
              awayTeamName: match.awayTeam.name,
              awayScore: match.awayScore,
              tournamentName: match.tournament ? match.tournament.name : 'Unknown Tournament'
            };
            
            // Notify home team leader
            if (match.homeTeam.TeamLeader) {
              await NotificationService.createMatchResultNotification(
                match.homeTeam.TeamLeader.id,
                resultDetails
              );
            }
            
            // Notify away team leader
            if (match.awayTeam.TeamLeader) {
              await NotificationService.createMatchResultNotification(
                match.awayTeam.TeamLeader.id,
                resultDetails
              );
            }
          }
        }
      } catch (notificationError) {
        console.error('Error sending match status notifications:', notificationError);
        // We don't want to fail the status update if notifications fail
      }
      
      res.status(200).json({
        message: 'Match status updated successfully',
        match
      });
    } catch (error) {
      console.error('Error updating match status:', error);
      res.status(500).json({ message: 'Failed to update match status', error: error.message });
    }
  },
  
  /**
   * Update match score
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateMatchScore: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        homeScore,
        awayScore,
        halfTimeHomeScore,
        halfTimeAwayScore,
        homeTeamPenaltyScore,
        awayTeamPenaltyScore,
        hasPenalties
      } = req.body;
      
      const match = await Match.findByPk(id, {
        include: [
          {
            model: Team,
            as: 'homeTeam',
            attributes: ['id', 'name', 'ownerId'],
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id']
              }
            ]
          },
          {
            model: Team,
            as: 'awayTeam',
            attributes: ['id', 'name', 'ownerId'],
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id']
              }
            ]
          },
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name', 'organizerId']
          }
        ]
      });
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if status allows score updates
      if (match.status === 'scheduled') {
        return res.status(400).json({ message: 'Cannot update score for a scheduled match' });
      }
      
      if (match.status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot update score for a cancelled match' });
      }
      
      // Reset confirmation flags if scores are changed
      let resetConfirmation = false;
      const previousScores = {
        homeScore: match.homeScore,
        awayScore: match.awayScore
      };
      
      if (
        homeScore !== undefined && homeScore !== match.homeScore ||
        awayScore !== undefined && awayScore !== match.awayScore ||
        halfTimeHomeScore !== undefined && halfTimeHomeScore !== match.halfTimeHomeScore ||
        halfTimeAwayScore !== undefined && halfTimeAwayScore !== match.halfTimeAwayScore ||
        homeTeamPenaltyScore !== undefined && homeTeamPenaltyScore !== match.homeTeamPenaltyScore ||
        awayTeamPenaltyScore !== undefined && awayTeamPenaltyScore !== match.awayTeamPenaltyScore ||
        hasPenalties !== undefined && hasPenalties !== match.hasPenalties
      ) {
        resetConfirmation = true;
      }
      
      // Update the match score
      await match.update({
        homeScore: homeScore !== undefined ? homeScore : match.homeScore,
        awayScore: awayScore !== undefined ? awayScore : match.awayScore,
        halfTimeHomeScore: halfTimeHomeScore !== undefined ? halfTimeHomeScore : match.halfTimeHomeScore,
        halfTimeAwayScore: halfTimeAwayScore !== undefined ? halfTimeAwayScore : match.halfTimeAwayScore,
        homeTeamPenaltyScore: homeTeamPenaltyScore !== undefined ? homeTeamPenaltyScore : match.homeTeamPenaltyScore,
        awayTeamPenaltyScore: awayTeamPenaltyScore !== undefined ? awayTeamPenaltyScore : match.awayTeamPenaltyScore,
        hasPenalties: hasPenalties !== undefined ? hasPenalties : match.hasPenalties,
        confirmedByHomeTeam: resetConfirmation ? false : match.confirmedByHomeTeam,
        confirmedByAwayTeam: resetConfirmation ? false : match.confirmedByAwayTeam,
        confirmedByReferee: resetConfirmation ? false : match.confirmedByReferee,
        isResultConfirmed: resetConfirmation ? false : match.isResultConfirmed
      });
      
      // Send notifications if scores were updated
      try {
        if ((homeScore !== undefined && homeScore !== previousScores.homeScore) || 
            (awayScore !== undefined && awayScore !== previousScores.awayScore)) {
          
          // Prepare notification data
          const resultDetails = {
            id: match.id,
            homeTeamName: match.homeTeam.name,
            homeScore: homeScore !== undefined ? homeScore : match.homeScore,
            awayTeamName: match.awayTeam.name,
            awayScore: awayScore !== undefined ? awayScore : match.awayScore,
            tournamentName: match.tournament ? match.tournament.name : 'Unknown Tournament'
          };
          
          // Notify home team leader
          if (match.homeTeam && match.homeTeam.TeamLeader) {
            await NotificationService.createMatchResultNotification(
              match.homeTeam.TeamLeader.id,
              resultDetails
            );
          }
          
          // Notify away team leader
          if (match.awayTeam && match.awayTeam.TeamLeader) {
            await NotificationService.createMatchResultNotification(
              match.awayTeam.TeamLeader.id,
              resultDetails
            );
          }
          
          // Notify tournament organizer
          if (match.tournament && match.tournament.organizerId) {
            await NotificationService.createMatchResultNotification(
              match.tournament.organizerId,
              resultDetails
            );
          }
        }
      } catch (notificationError) {
        console.error('Error sending score update notifications:', notificationError);
        // We don't want to fail the score update if notifications fail
      }
      
      res.status(200).json({
        message: 'Match score updated successfully',
        match,
        confirmationReset: resetConfirmation
      });
    } catch (error) {
      console.error('Error updating match score:', error);
      res.status(500).json({ message: 'Failed to update match score', error: error.message });
    }
  },
  
  /**
   * Confirm match result
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  confirmMatchResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const match = await Match.findByPk(id, {
        include: [
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name', 'ownerId']
          },
          {
            model: Team,
            as: 'homeTeam',
            attributes: ['id', 'name', 'ownerId'],
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id', 'username']
              }
            ]
          },
          {
            model: Team,
            as: 'awayTeam',
            attributes: ['id', 'name', 'ownerId'],
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id', 'username']
              }
            ]
          }
        ]
      });
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if status allows confirmation
      if (match.status !== 'completed') {
        return res.status(400).json({ message: 'Can only confirm completed matches' });
      }
      
      // Update the appropriate confirmation flag
      const updateFields = {};
      
      switch (role) {
        case 'home':
          // Check if user is authorized to confirm for home team
          if (match.homeTeam && match.homeTeam.ownerId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to confirm for the home team' });
          }
          updateFields.confirmedByHomeTeam = true;
          updateFields.homeTeamConfirmedAt = new Date();
          break;
        case 'away':
          // Check if user is authorized to confirm for away team
          if (match.awayTeam && match.awayTeam.ownerId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to confirm for the away team' });
          }
          updateFields.confirmedByAwayTeam = true;
          updateFields.awayTeamConfirmedAt = new Date();
          break;
        case 'referee':
          // Check if user is a referee or admin
          if (req.userRole !== 'referee' && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to confirm as referee' });
          }
          updateFields.confirmedByReferee = true;
          updateFields.refereeConfirmedAt = new Date();
          break;
        case 'organizer':
          // Check if user is the tournament organizer or admin
          if (match.tournament && match.tournament.ownerId !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to confirm as organizer' });
          }
          // Organizer can confirm all at once
          updateFields.confirmedByHomeTeam = true;
          updateFields.confirmedByAwayTeam = true;
          updateFields.confirmedByReferee = true;
          updateFields.homeTeamConfirmedAt = new Date();
          updateFields.awayTeamConfirmedAt = new Date();
          updateFields.refereeConfirmedAt = new Date();
          break;
        default:
          return res.status(400).json({ 
            message: 'Invalid role',
            validRoles: ['home', 'away', 'referee', 'organizer'] 
          });
      }
      
      // Update the match
      await match.update(updateFields);
      
      // Check if all parties have confirmed
      let isNowFullyConfirmed = false;
      if (
        (match.confirmedByHomeTeam || updateFields.confirmedByHomeTeam) &&
        (match.confirmedByAwayTeam || updateFields.confirmedByAwayTeam) &&
        (match.confirmedByReferee || updateFields.confirmedByReferee) &&
        !match.isResultConfirmed
      ) {
        await match.update({
          isResultConfirmed: true,
          resultConfirmedAt: new Date()
        });
        isNowFullyConfirmed = true;
      }
      
      // Get the updated match
      const updatedMatch = await Match.findByPk(id);
      
      // Send notifications for confirmations
      try {
        // Send notification based on who confirmed
        if (role === 'home' || role === 'away' || role === 'referee') {
          let confirmerName = '';
          let confirmerRole = '';
          
          if (role === 'home' && match.homeTeam) {
            confirmerName = match.homeTeam.name;
            confirmerRole = 'home team';
          } else if (role === 'away' && match.awayTeam) {
            confirmerName = match.awayTeam.name;
            confirmerRole = 'away team';
          } else if (role === 'referee') {
            confirmerName = 'The referee';
            confirmerRole = 'referee';
          }
          
          // Determine who should be notified about this confirmation
          const notifyTargets = [];
          
          // If home team confirms, notify away team and tournament organizer
          if (role === 'home' && match.awayTeam && match.awayTeam.TeamLeader) {
            notifyTargets.push({
              userId: match.awayTeam.TeamLeader.id,
              teamRole: 'away team'
            });
          }
          
          // If away team confirms, notify home team and tournament organizer
          if (role === 'away' && match.homeTeam && match.homeTeam.TeamLeader) {
            notifyTargets.push({
              userId: match.homeTeam.TeamLeader.id,
              teamRole: 'home team'
            });
          }
          
          // If referee confirms, notify both teams
          if (role === 'referee') {
            if (match.homeTeam && match.homeTeam.TeamLeader) {
              notifyTargets.push({
                userId: match.homeTeam.TeamLeader.id,
                teamRole: 'home team'
              });
            }
            if (match.awayTeam && match.awayTeam.TeamLeader) {
              notifyTargets.push({
                userId: match.awayTeam.TeamLeader.id,
                teamRole: 'away team'
              });
            }
          }
          
          // Always notify tournament organizer
          if (match.tournament && match.tournament.ownerId) {
            notifyTargets.push({
              userId: match.tournament.ownerId,
              teamRole: 'tournament organizer'
            });
          }
          
          // Send confirmation notifications
          for (const target of notifyTargets) {
            await NotificationService.createNotification({
              userId: target.userId,
              type: 'match_confirmation',
              title: 'Match Result Confirmation',
              message: `${confirmerName} has confirmed the result of the match ${match.homeTeam.name} vs ${match.awayTeam.name} as ${confirmerRole}.`,
              metadata: {
                matchId: match.id,
                homeTeamName: match.homeTeam.name,
                awayTeamName: match.awayTeam.name,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                confirmerRole: role,
                isFullyConfirmed: isNowFullyConfirmed
              },
              sendEmail: false
            });
          }
        }
        
        // If match is now fully confirmed, send a confirmation to all parties
        if (isNowFullyConfirmed) {
          const resultDetails = {
            id: match.id,
            homeTeamName: match.homeTeam.name,
            homeScore: match.homeScore,
            awayTeamName: match.awayTeam.name,
            awayScore: match.awayScore,
            tournamentName: match.tournament ? match.tournament.name : 'Unknown Tournament'
          };
          
          // Notify both team leaders
          if (match.homeTeam && match.homeTeam.TeamLeader) {
            await NotificationService.createNotification({
              userId: match.homeTeam.TeamLeader.id,
              type: 'match_result_final',
              title: 'Match Result Finalized',
              message: `The result of ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.homeScore}-${match.awayScore}) has been finalized.`,
              metadata: resultDetails,
              priority: 'high',
              sendEmail: true
            });
          }
          
          if (match.awayTeam && match.awayTeam.TeamLeader) {
            await NotificationService.createNotification({
              userId: match.awayTeam.TeamLeader.id,
              type: 'match_result_final',
              title: 'Match Result Finalized',
              message: `The result of ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.homeScore}-${match.awayScore}) has been finalized.`,
              metadata: resultDetails,
              priority: 'high',
              sendEmail: true
            });
          }
          
          // Notify tournament organizer
          if (match.tournament && match.tournament.ownerId) {
            await NotificationService.createNotification({
              userId: match.tournament.ownerId,
              type: 'match_result_final',
              title: 'Match Result Finalized',
              message: `The result of ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.homeScore}-${match.awayScore}) has been finalized.`,
              metadata: resultDetails,
              priority: 'high',
              sendEmail: true
            });
          }
        }
      } catch (notificationError) {
        console.error('Error sending match confirmation notifications:', notificationError);
        // We don't want to fail the confirmation if notifications fail
      }
      
      res.status(200).json({
        message: 'Match result confirmation updated successfully',
        match: updatedMatch,
        isFullyConfirmed: updatedMatch.isResultConfirmed
      });
    } catch (error) {
      console.error('Error confirming match result:', error);
      res.status(500).json({ message: 'Failed to confirm match result', error: error.message });
    }
  },
  
  /**
   * Get all events for a match
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getMatchEvents: async (req, res) => {
    try {
      const { id } = req.params;
      
      const match = await Match.findByPk(id);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      const events = await MatchEvent.findAll({
        where: { matchId: id },
        include: [
          {
            model: Player,
            as: 'player',
            attributes: ['id', 'firstName', 'lastName', 'jerseyNumber', 'position']
          },
          {
            model: Player,
            as: 'secondaryPlayer',
            attributes: ['id', 'firstName', 'lastName', 'jerseyNumber', 'position']
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name', 'logoUrl']
          }
        ],
        order: [['minute', 'ASC'], ['addedTime', 'ASC']]
      });
      
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching match events:', error);
      res.status(500).json({ message: 'Failed to fetch match events', error: error.message });
    }
  },
  
  /**
   * Add a match event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  addMatchEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        playerId,
        secondaryPlayerId,
        teamId,
        eventType,
        minute,
        addedTime,
        half,
        description,
        videoUrl,
        coordinates
      } = req.body;
      
      const match = await Match.findByPk(id, {
        include: [
          {
            model: Team,
            as: 'homeTeam',
            attributes: ['id', 'name', 'ownerId'],
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id', 'username']
              }
            ]
          },
          {
            model: Team,
            as: 'awayTeam',
            attributes: ['id', 'name', 'ownerId'],
            include: [
              {
                model: User,
                as: 'TeamLeader',
                attributes: ['id', 'username']
              }
            ]
          },
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name', 'organizerId']
          }
        ]
      });
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      // Check if match status allows adding events
      if (match.status === 'scheduled' || match.status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot add events to a scheduled or cancelled match' });
      }
      
      // Fetch player and team details for notifications
      let player = null;
      let team = null;
      
      // Check if player exists
      if (playerId) {
        player = await Player.findByPk(playerId, {
          attributes: ['id', 'name', 'position', 'number']
        });
        if (!player) {
          return res.status(404).json({ message: 'Player not found' });
        }
      }
      
      // Check if secondary player exists
      if (secondaryPlayerId) {
        const secondaryPlayer = await Player.findByPk(secondaryPlayerId);
        if (!secondaryPlayer) {
          return res.status(404).json({ message: 'Secondary player not found' });
        }
      }
      
      // Check if team exists
      if (teamId) {
        team = await Team.findByPk(teamId, {
          attributes: ['id', 'name', 'ownerId']
        });
        if (!team) {
          return res.status(404).json({ message: 'Team not found' });
        }
        
        // Check if team is part of the match
        if (team.id !== match.homeTeamId && team.id !== match.awayTeamId) {
          return res.status(400).json({ message: 'Team is not part of this match' });
        }
      }
      
      // Create the event
      const event = await MatchEvent.create({
        matchId: id,
        playerId,
        secondaryPlayerId,
        teamId,
        eventType,
        minute,
        addedTime: addedTime || 0,
        half,
        description,
        videoUrl,
        coordinates
      });
      
      // Send notifications for important match events
      try {
        // Determine which events should trigger notifications
        const isGoal = eventType === 'goal';
        const isRedCard = eventType === 'card' && description && description.toLowerCase().includes('red');
        const isImportantEvent = isGoal || isRedCard;
        
        if (isImportantEvent && match && team && player) {
          // Opponent team's information
          const isHomeTeam = team.id === match.homeTeamId;
          const opponentTeam = isHomeTeam ? match.awayTeam : match.homeTeam;
          
          // Create notification content
          const eventDetails = {
            matchId: match.id,
            homeTeamName: match.homeTeam.name,
            awayTeamName: match.awayTeam.name,
            eventType,
            playerName: player.name,
            playerNumber: player.number,
            teamName: team.name,
            minute,
            half,
            description
          };
          
          // Event-specific notification content
          let notificationType = '';
          if (isGoal) {
            notificationType = 'match_goal';
            // Update scores based on the team that scored
            if (isHomeTeam) {
              match.homeScore = (match.homeScore || 0) + 1;
            } else {
              match.awayScore = (match.awayScore || 0) + 1;
            }
            await match.save();
          } else if (isRedCard) {
            notificationType = 'match_red_card';
          }
          
          // Notify both team leaders
          if (match.homeTeam && match.homeTeam.TeamLeader) {
            await NotificationService.createMatchEventNotification(
              match.homeTeam.TeamLeader.id,
              notificationType,
              eventDetails
            );
          }
          
          if (match.awayTeam && match.awayTeam.TeamLeader) {
            await NotificationService.createMatchEventNotification(
              match.awayTeam.TeamLeader.id,
              notificationType,
              eventDetails
            );
          }
          
          // Notify tournament organizer
          if (match.tournament && match.tournament.organizerId) {
            await NotificationService.createMatchEventNotification(
              match.tournament.organizerId,
              notificationType,
              eventDetails
            );
          }
        }
      } catch (notificationError) {
        console.error('Error sending match event notifications:', notificationError);
        // We don't want to fail the event creation if notifications fail
      }
      
      res.status(201).json({
        message: 'Match event added successfully',
        event
      });
    } catch (error) {
      console.error('Error adding match event:', error);
      res.status(500).json({ message: 'Failed to add match event', error: error.message });
    }
  },
  
  /**
   * Update a match event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateMatchEvent: async (req, res) => {
    try {
      const { id, eventId } = req.params;
      const {
        playerId,
        secondaryPlayerId,
        teamId,
        eventType,
        minute,
        addedTime,
        half,
        description,
        videoUrl,
        coordinates
      } = req.body;
      
      const match = await Match.findByPk(id);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      const event = await MatchEvent.findOne({
        where: {
          id: eventId,
          matchId: id
        }
      });
      
      if (!event) {
        return res.status(404).json({ message: 'Match event not found' });
      }
      
      // Check if match status allows updating events
      if (match.status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot update events for a cancelled match' });
      }
      
      if (match.isResultConfirmed) {
        return res.status(400).json({ message: 'Cannot update events for a match with confirmed result' });
      }
      
      // Check if player exists
      if (playerId && playerId !== event.playerId) {
        const player = await Player.findByPk(playerId);
        if (!player) {
          return res.status(404).json({ message: 'Player not found' });
        }
      }
      
      // Check if secondary player exists
      if (secondaryPlayerId && secondaryPlayerId !== event.secondaryPlayerId) {
        const secondaryPlayer = await Player.findByPk(secondaryPlayerId);
        if (!secondaryPlayer) {
          return res.status(404).json({ message: 'Secondary player not found' });
        }
      }
      
      // Check if team exists
      if (teamId && teamId !== event.teamId) {
        const team = await Team.findByPk(teamId);
        if (!team) {
          return res.status(404).json({ message: 'Team not found' });
        }
        
        // Check if team is part of the match
        if (team.id !== match.homeTeamId && team.id !== match.awayTeamId) {
          return res.status(400).json({ message: 'Team is not part of this match' });
        }
      }
      
      // Update the event
      await event.update({
        playerId: playerId || event.playerId,
        secondaryPlayerId: secondaryPlayerId !== undefined ? secondaryPlayerId : event.secondaryPlayerId,
        teamId: teamId || event.teamId,
        eventType: eventType || event.eventType,
        minute: minute || event.minute,
        addedTime: addedTime !== undefined ? addedTime : event.addedTime,
        half: half || event.half,
        description: description !== undefined ? description : event.description,
        videoUrl: videoUrl !== undefined ? videoUrl : event.videoUrl,
        coordinates: coordinates !== undefined ? coordinates : event.coordinates
      });
      
      res.status(200).json({
        message: 'Match event updated successfully',
        event
      });
    } catch (error) {
      console.error('Error updating match event:', error);
      res.status(500).json({ message: 'Failed to update match event', error: error.message });
    }
  },
  
  /**
   * Delete a match event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteMatchEvent: async (req, res) => {
    try {
      const { id, eventId } = req.params;
      
      const match = await Match.findByPk(id);
      
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }
      
      const event = await MatchEvent.findOne({
        where: {
          id: eventId,
          matchId: id
        }
      });
      
      if (!event) {
        return res.status(404).json({ message: 'Match event not found' });
      }
      
      // Check if match status allows deleting events
      if (match.status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot delete events for a cancelled match' });
      }
      
      if (match.isResultConfirmed) {
        return res.status(400).json({ message: 'Cannot delete events for a match with confirmed result' });
      }
      
      // Delete the event
      await event.destroy();
      
      res.status(200).json({
        message: 'Match event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting match event:', error);
      res.status(500).json({ message: 'Failed to delete match event', error: error.message });
    }
  }
};

module.exports = matchController; 