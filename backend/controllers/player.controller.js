const db = require('../models');
const Player = db.Player;
const Team = db.Team;
const Match = db.Match;
const MatchEvent = db.MatchEvent;
const Tournament = db.Tournament;
const Op = db.Sequelize.Op;

/**
 * Player controller for handling player-related operations
 */
const playerController = {
  /**
   * Get all players with optional filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllPlayers: async (req, res) => {
    try {
      const { name, teamId, position, nationality } = req.query;
      const whereClause = {};
      
      if (name) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${name}%` } },
          { lastName: { [Op.iLike]: `%${name}%` } }
        ];
      }
      
      if (teamId) {
        whereClause.teamId = teamId;
      }
      
      if (position) {
        whereClause.position = position;
      }
      
      if (nationality) {
        whereClause.nationality = { [Op.iLike]: `%${nationality}%` };
      }
      
      const players = await Player.findAll({
        where: whereClause,
        include: [
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name', 'logoUrl']
          }
        ],
        order: [['lastName', 'ASC'], ['firstName', 'ASC']]
      });
      
      res.status(200).json(players);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ message: 'Failed to fetch players', error: error.message });
    }
  },
  
  /**
   * Get a player by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPlayerById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const player = await Player.findByPk(id, {
        include: [
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name', 'logoUrl', 'homeLocation']
          }
        ]
      });
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      res.status(200).json({
        status: 'success',
        data: player
      });
    } catch (error) {
      console.error('Error fetching player:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to fetch player', 
        error: error.message 
      });
    }
  },
  
  /**
   * Create a new player
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createPlayer: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        jerseyNumber,
        position,
        dateOfBirth,
        nationality,
        height,
        weight,
        teamId
      } = req.body;
      
      // Check if team exists
      if (teamId) {
        const team = await Team.findByPk(teamId);
        if (!team) {
          return res.status(404).json({ message: 'Team not found' });
        }
        
        // Check if team owner is current user or user is admin
        if (team.ownerId !== req.userId && req.userRole !== 'admin') {
          return res.status(403).json({ message: 'You are not authorized to add players to this team' });
        }
        
        // Check if jersey number is already taken
        if (jerseyNumber) {
          const existingPlayer = await Player.findOne({
            where: {
              teamId,
              jerseyNumber
            }
          });
          
          if (existingPlayer) {
            return res.status(400).json({ message: 'Jersey number already taken in this team' });
          }
        }
      }
      
      // Create the player
      const player = await Player.create({
        firstName,
        lastName,
        jerseyNumber,
        position,
        dateOfBirth,
        nationality,
        height,
        weight,
        teamId
      });
      
      res.status(201).json({
        message: 'Player created successfully',
        player
      });
    } catch (error) {
      console.error('Error creating player:', error);
      res.status(500).json({ message: 'Failed to create player', error: error.message });
    }
  },
  
  /**
   * Update a player
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updatePlayer: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        jerseyNumber,
        position,
        dateOfBirth,
        nationality,
        height,
        weight,
        teamId
      } = req.body;
      
      const player = await Player.findByPk(id);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      // Check if new team exists and if jersey number is available in new team
      if (teamId && teamId !== player.teamId) {
        const team = await Team.findByPk(teamId);
        if (!team) {
          return res.status(404).json({ message: 'Team not found' });
        }
        
        // Check if team owner is current user or user is admin
        if (team.ownerId !== req.userId && req.userRole !== 'admin') {
          return res.status(403).json({ message: 'You are not authorized to add players to this team' });
        }
        
        // Check if jersey number is already taken in new team
        if (jerseyNumber) {
          const existingPlayer = await Player.findOne({
            where: {
              teamId,
              jerseyNumber,
              id: { [Op.ne]: id } // Exclude current player
            }
          });
          
          if (existingPlayer) {
            return res.status(400).json({ message: 'Jersey number already taken in this team' });
          }
        }
      } else if (jerseyNumber !== player.jerseyNumber && player.teamId) {
        // Check if new jersey number is available in current team
        const existingPlayer = await Player.findOne({
          where: {
            teamId: player.teamId,
            jerseyNumber,
            id: { [Op.ne]: id } // Exclude current player
          }
        });
        
        if (existingPlayer) {
          return res.status(400).json({ message: 'Jersey number already taken in this team' });
        }
      }
      
      // Update the player
      await player.update({
        firstName: firstName || player.firstName,
        lastName: lastName || player.lastName,
        jerseyNumber: jerseyNumber || player.jerseyNumber,
        position: position || player.position,
        dateOfBirth: dateOfBirth || player.dateOfBirth,
        nationality: nationality || player.nationality,
        height: height || player.height,
        weight: weight || player.weight,
        teamId: teamId || player.teamId
      });
      
      res.status(200).json({
        message: 'Player updated successfully',
        player
      });
    } catch (error) {
      console.error('Error updating player:', error);
      res.status(500).json({ message: 'Failed to update player', error: error.message });
    }
  },
  
  /**
   * Delete a player
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deletePlayer: async (req, res) => {
    try {
      const { id } = req.params;
      
      const player = await Player.findByPk(id);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      // Check if player has match events
      const matchEvents = await MatchEvent.findAll({
        where: { playerId: id }
      });
      
      if (matchEvents.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete player with match events. Consider marking as inactive instead.',
          eventCount: matchEvents.length
        });
      }
      
      // Delete the player
      await player.destroy();
      
      res.status(200).json({
        message: 'Player deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting player:', error);
      res.status(500).json({ message: 'Failed to delete player', error: error.message });
    }
  },
  
  /**
   * Get player statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPlayerStats: async (req, res) => {
    try {
      const { id } = req.params;
      
      const player = await Player.findByPk(id, {
        include: [
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name', 'logoUrl']
          }
        ]
      });
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      // Get all player events
      const events = await MatchEvent.findAll({
        where: { playerId: id },
        include: [
          {
            model: Match,
            as: 'match',
            include: [
              {
                model: Tournament,
                as: 'tournament',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });
      
      // Calculate statistics
      let stats = {
        matches: new Set(),
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        tournaments: new Set(),
        eventsByType: {}
      };
      
      events.forEach(event => {
        stats.matches.add(event.matchId);
        stats.tournaments.add(event.match.tournamentId);
        
        // Count events by type
        if (!stats.eventsByType[event.eventType]) {
          stats.eventsByType[event.eventType] = 0;
        }
        stats.eventsByType[event.eventType]++;
        
        // Calculate specific stats
        switch (event.eventType) {
          case 'goal':
          case 'penalty-goal':
            stats.goals++;
            break;
          case 'assist':
            stats.assists++;
            break;
          case 'yellow-card':
            stats.yellowCards++;
            break;
          case 'red-card':
          case 'second-yellow':
            stats.redCards++;
            break;
          default:
            break;
        }
      });
      
      // Convert sets to counts
      stats.matchesPlayed = stats.matches.size;
      stats.tournamentsPlayed = stats.tournaments.size;
      delete stats.matches;
      delete stats.tournaments;
      
      res.status(200).json({
        player: {
          id: player.id,
          firstName: player.firstName,
          lastName: player.lastName,
          jerseyNumber: player.jerseyNumber,
          teamId: player.teamId,
          teamName: player.team?.name,
          teamLogo: player.team?.logoUrl
        },
        stats
      });
    } catch (error) {
      console.error('Error calculating player statistics:', error);
      res.status(500).json({ message: 'Failed to calculate player statistics', error: error.message });
    }
  },
  
  /**
   * Get player statistics for a specific tournament
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPlayerTournamentStats: async (req, res) => {
    try {
      const { id, tournamentId } = req.params;
      
      const player = await Player.findByPk(id, {
        include: [
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name', 'logoUrl']
          }
        ]
      });
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      const tournament = await Tournament.findByPk(tournamentId);
      
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      
      // Get all player events for the tournament
      const events = await MatchEvent.findAll({
        where: { playerId: id },
        include: [
          {
            model: Match,
            as: 'match',
            where: { tournamentId },
            include: [
              {
                model: Team,
                as: 'homeTeam',
                attributes: ['id', 'name']
              },
              {
                model: Team,
                as: 'awayTeam',
                attributes: ['id', 'name']
              }
            ]
          },
          {
            model: Player,
            as: 'secondaryPlayer',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });
      
      // Calculate statistics
      let stats = {
        matches: new Set(),
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        eventsByType: {}
      };
      
      // Process events to create detailed event list and calculate stats
      const processedEvents = events.map(event => {
        stats.matches.add(event.matchId);
        
        // Count events by type
        if (!stats.eventsByType[event.eventType]) {
          stats.eventsByType[event.eventType] = 0;
        }
        stats.eventsByType[event.eventType]++;
        
        // Calculate specific stats
        switch (event.eventType) {
          case 'goal':
          case 'penalty-goal':
            stats.goals++;
            break;
          case 'assist':
            stats.assists++;
            break;
          case 'yellow-card':
            stats.yellowCards++;
            break;
          case 'red-card':
          case 'second-yellow':
            stats.redCards++;
            break;
          default:
            break;
        }
        
        // Create processed event object with additional context
        return {
          id: event.id,
          matchId: event.matchId,
          eventType: event.eventType,
          minute: event.minute,
          addedTime: event.addedTime,
          half: event.half,
          description: event.description,
          coordinates: event.coordinates,
          matchDate: event.match.scheduledDate,
          homeTeamId: event.match.homeTeamId,
          homeTeamName: event.match.homeTeam.name,
          awayTeamId: event.match.awayTeamId,
          awayTeamName: event.match.awayTeam.name,
          secondaryPlayerId: event.secondaryPlayerId,
          secondaryPlayerName: event.secondaryPlayer ? 
            `${event.secondaryPlayer.firstName} ${event.secondaryPlayer.lastName}` : null
        };
      });
      
      // Convert sets to counts
      stats.appearances = stats.matches.size;
      delete stats.matches;
      
      res.status(200).json({
        player: {
          id: player.id,
          firstName: player.firstName,
          lastName: player.lastName,
          jerseyNumber: player.jerseyNumber,
          teamId: player.teamId,
          teamName: player.team?.name,
          teamLogo: player.team?.logoUrl
        },
        tournament: {
          id: tournament.id,
          name: tournament.name
        },
        ...stats,
        events: processedEvents
      });
    } catch (error) {
      console.error('Error calculating player tournament statistics:', error);
      res.status(500).json({ message: 'Failed to calculate player tournament statistics', error: error.message });
    }
  },
  
  /**
   * Get all matches for a player
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPlayerMatches: async (req, res) => {
    try {
      const { id } = req.params;
      const { tournamentId } = req.query;
      
      const player = await Player.findByPk(id);
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
      
      // Get all player events to find matches they participated in
      const whereClause = { playerId: id };
      
      // Get matches for the player
      const matches = await Match.findAll({
        include: [
          {
            model: MatchEvent,
            as: 'events',
            where: whereClause,
            required: true
          },
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
        order: [['scheduledDate', 'DESC']]
      });
      
      // Process matches to add player stats per match
      const processedMatches = matches.map(match => {
        const playerEvents = match.events.filter(event => event.playerId === parseInt(id));
        
        // Calculate player stats for this match
        let matchStats = {
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 0
        };
        
        playerEvents.forEach(event => {
          switch (event.eventType) {
            case 'goal':
            case 'penalty-goal':
              matchStats.goals++;
              break;
            case 'assist':
              matchStats.assists++;
              break;
            case 'yellow-card':
              matchStats.yellowCards++;
              break;
            case 'red-card':
            case 'second-yellow':
              matchStats.redCards++;
              break;
            default:
              break;
          }
        });
        
        return {
          id: match.id,
          scheduledDate: match.scheduledDate,
          homeTeamId: match.homeTeamId,
          homeTeamName: match.homeTeam.name,
          homeTeamLogo: match.homeTeam.logoUrl,
          awayTeamId: match.awayTeamId,
          awayTeamName: match.awayTeam.name,
          awayTeamLogo: match.awayTeam.logoUrl,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          status: match.status,
          tournamentId: match.tournamentId,
          tournamentName: match.tournament.name,
          location: match.location,
          field: match.field,
          phase: match.phase,
          group: match.group,
          playerStats: matchStats,
          events: playerEvents
        };
      });
      
      res.status(200).json(processedMatches);
    } catch (error) {
      console.error('Error fetching player matches:', error);
      res.status(500).json({ message: 'Failed to fetch player matches', error: error.message });
    }
  }
};

module.exports = playerController; 