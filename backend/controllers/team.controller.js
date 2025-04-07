const db = require('../models');
const Team = db.Team;
const Player = db.Player;
const User = db.User;
const Tournament = db.Tournament;
const Match = db.Match;
const TeamTournament = db.TeamTournament;
const Op = db.Sequelize.Op;

/**
 * Team controller for handling team-related operations
 */
const teamController = {
  /**
   * Get all teams with optional filters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllTeams: async (req, res) => {
    try {
      const { name, location, userId } = req.query;
      const whereClause = {};
      
      if (name) {
        whereClause.name = { [Op.iLike]: `%${name}%` };
      }
      
      if (location) {
        whereClause.homeLocation = { [Op.iLike]: `%${location}%` };
      }
      
      if (userId) {
        whereClause.ownerId = userId;
      }
      
      const teams = await Team.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
    }
  },
  
  /**
   * Get a team by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTeamById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const team = await Team.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Player,
            as: 'players'
          }
        ]
      });
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      res.status(200).json(team);
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ message: 'Failed to fetch team', error: error.message });
    }
  },
  
  /**
   * Create a new team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createTeam: async (req, res) => {
    try {
      const { name, description, homeLocation, foundedYear, logoUrl, primaryColor, secondaryColor } = req.body;
      
      // Check if team with the same name already exists
      const existingTeam = await Team.findOne({ where: { name } });
      if (existingTeam) {
        return res.status(400).json({ message: 'Team with this name already exists' });
      }
      
      // Create the team
      const team = await Team.create({
        name,
        description,
        homeLocation,
        foundedYear,
        logoUrl,
        primaryColor,
        secondaryColor,
        ownerId: req.user.id // From JWT middleware
      });
      
      res.status(201).json({
        message: 'Team created successfully',
        team
      });
    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({ message: 'Failed to create team', error: error.message });
    }
  },
  
  /**
   * Update a team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateTeam: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, homeLocation, foundedYear, logoUrl, primaryColor, secondaryColor } = req.body;
      
      const team = await Team.findByPk(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Check if another team with the updated name already exists
      if (name && name !== team.name) {
        const existingTeam = await Team.findOne({ where: { name } });
        if (existingTeam) {
          return res.status(400).json({ message: 'Team with this name already exists' });
        }
      }
      
      // Update the team
      await team.update({
        name: name || team.name,
        description: description || team.description,
        homeLocation: homeLocation || team.homeLocation,
        foundedYear: foundedYear || team.foundedYear,
        logoUrl: logoUrl || team.logoUrl,
        primaryColor: primaryColor || team.primaryColor,
        secondaryColor: secondaryColor || team.secondaryColor
      });
      
      res.status(200).json({
        message: 'Team updated successfully',
        team
      });
    } catch (error) {
      console.error('Error updating team:', error);
      res.status(500).json({ message: 'Failed to update team', error: error.message });
    }
  },
  
  /**
   * Delete a team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteTeam: async (req, res) => {
    try {
      const { id } = req.params;
      
      const team = await Team.findByPk(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Check if team is registered in any tournaments
      const teamTournaments = await TeamTournament.findAll({
        where: { teamId: id }
      });
      
      if (teamTournaments.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete team that is registered in tournaments',
          tournaments: teamTournaments.map(tt => tt.tournamentId)
        });
      }
      
      // Delete the team
      await team.destroy();
      
      res.status(200).json({
        message: 'Team deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      res.status(500).json({ message: 'Failed to delete team', error: error.message });
    }
  },
  
  /**
   * Get all players for a team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTeamPlayers: async (req, res) => {
    try {
      const { id } = req.params;
      
      const team = await Team.findByPk(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      const players = await Player.findAll({
        where: { teamId: id },
        order: [['jerseyNumber', 'ASC']]
      });
      
      res.status(200).json(players);
    } catch (error) {
      console.error('Error fetching team players:', error);
      res.status(500).json({ message: 'Failed to fetch team players', error: error.message });
    }
  },
  
  /**
   * Add a player to a team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  addPlayerToTeam: async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, jerseyNumber, position, dateOfBirth, nationality, height, weight } = req.body;
      
      const team = await Team.findByPk(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Check if jersey number is already taken
      if (jerseyNumber) {
        const existingPlayer = await Player.findOne({
          where: {
            teamId: id,
            jerseyNumber
          }
        });
        
        if (existingPlayer) {
          return res.status(400).json({ message: 'Jersey number already taken in this team' });
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
        teamId: id
      });
      
      res.status(201).json({
        message: 'Player added to team successfully',
        player
      });
    } catch (error) {
      console.error('Error adding player to team:', error);
      res.status(500).json({ message: 'Failed to add player to team', error: error.message });
    }
  },
  
  /**
   * Remove a player from a team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  removePlayerFromTeam: async (req, res) => {
    try {
      const { id, playerId } = req.params;
      
      const team = await Team.findByPk(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      const player = await Player.findOne({
        where: {
          id: playerId,
          teamId: id
        }
      });
      
      if (!player) {
        return res.status(404).json({ message: 'Player not found in this team' });
      }
      
      // Delete the player
      await player.destroy();
      
      res.status(200).json({
        message: 'Player removed from team successfully'
      });
    } catch (error) {
      console.error('Error removing player from team:', error);
      res.status(500).json({ message: 'Failed to remove player from team', error: error.message });
    }
  },
  
  /**
   * Get all tournaments for a team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTeamTournaments: async (req, res) => {
    try {
      const { id } = req.params;
      
      const team = await Team.findByPk(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      const teamTournaments = await TeamTournament.findAll({
        where: { teamId: id },
        include: [
          {
            model: Tournament,
            as: 'tournament'
          }
        ]
      });
      
      res.status(200).json(teamTournaments.map(tt => tt.tournament));
    } catch (error) {
      console.error('Error fetching team tournaments:', error);
      res.status(500).json({ message: 'Failed to fetch team tournaments', error: error.message });
    }
  },
  
  /**
   * Get all matches for a team
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTeamMatches: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, upcoming } = req.query;
      
      const team = await Team.findByPk(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Build where clause
      const whereClause = {
        [Op.or]: [
          { homeTeamId: id },
          { awayTeamId: id }
        ]
      };
      
      if (status) {
        whereClause.status = status;
      }
      
      if (upcoming === 'true') {
        whereClause.scheduledDate = {
          [Op.gt]: new Date()
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
      console.error('Error fetching team matches:', error);
      res.status(500).json({ message: 'Failed to fetch team matches', error: error.message });
    }
  },
  
  /**
   * Get team statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getTeamStats: async (req, res) => {
    try {
      const { id } = req.params;
      const { tournamentId } = req.query;
      
      const team = await Team.findByPk(id);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Build where clause for matches
      const whereClause = {
        [Op.or]: [
          { homeTeamId: id },
          { awayTeamId: id }
        ],
        status: 'completed'
      };
      
      if (tournamentId) {
        whereClause.tournamentId = tournamentId;
      }
      
      const matches = await Match.findAll({
        where: whereClause,
        attributes: ['id', 'homeTeamId', 'awayTeamId', 'homeScore', 'awayScore', 'tournamentId']
      });
      
      // Calculate team statistics
      let stats = {
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      };
      
      matches.forEach(match => {
        stats.played++;
        
        if (match.homeTeamId.toString() === id) {
          // Team played as home team
          stats.goalsFor += match.homeScore;
          stats.goalsAgainst += match.awayScore;
          
          if (match.homeScore > match.awayScore) {
            stats.wins++;
            stats.points += 3;
          } else if (match.homeScore === match.awayScore) {
            stats.draws++;
            stats.points += 1;
          } else {
            stats.losses++;
          }
        } else {
          // Team played as away team
          stats.goalsFor += match.awayScore;
          stats.goalsAgainst += match.homeScore;
          
          if (match.awayScore > match.homeScore) {
            stats.wins++;
            stats.points += 3;
          } else if (match.awayScore === match.homeScore) {
            stats.draws++;
            stats.points += 1;
          } else {
            stats.losses++;
          }
        }
      });
      
      // Calculate goal difference
      stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
      
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error calculating team statistics:', error);
      res.status(500).json({ message: 'Failed to calculate team statistics', error: error.message });
    }
  }
};

module.exports = teamController; 