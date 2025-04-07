const db = require('../models');
const Match = db.Match;
const MatchEvent = db.MatchEvent;
const Player = db.Player;
const Team = db.Team;
const { Op } = db.Sequelize;

/**
 * Get all events for a match
 */
const getMatchEvents = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    // Check if match exists
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }
    
    // Retrieve all events for the match
    const events = await MatchEvent.findAll({
      where: { 
        matchId,
        deletedAt: null
      },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'firstName', 'lastName', 'number', 'position'],
        },
        {
          model: Player,
          as: 'secondaryPlayer',
          attributes: ['id', 'firstName', 'lastName', 'number', 'position'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'logo']
        }
      ],
      order: [
        ['half', 'ASC'],
        ['minute', 'ASC'],
        ['addedTime', 'ASC'],
        ['createdAt', 'ASC']
      ]
    });
    
    return res.status(200).json({
      events
    });
  } catch (error) {
    console.error('Error getting match events:', error);
    return res.status(500).json({
      message: 'Error retrieving match events',
      error: error.message
    });
  }
};

/**
 * Get a specific match event by ID
 */
const getMatchEventById = async (req, res) => {
  try {
    const { matchId, eventId } = req.params;
    
    // Check if match exists
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }
    
    // Retrieve the specific event
    const event = await MatchEvent.findOne({
      where: { 
        id: eventId,
        matchId,
        deletedAt: null
      },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'firstName', 'lastName', 'number', 'position'],
        },
        {
          model: Player,
          as: 'secondaryPlayer',
          attributes: ['id', 'firstName', 'lastName', 'number', 'position'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'logo']
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({
        message: 'Match event not found'
      });
    }
    
    return res.status(200).json({
      event
    });
  } catch (error) {
    console.error('Error getting match event:', error);
    return res.status(500).json({
      message: 'Error retrieving match event',
      error: error.message
    });
  }
};

/**
 * Create a new match event
 */
const createMatchEvent = async (req, res) => {
  try {
    const { matchId } = req.params;
    const {
      eventType,
      minute,
      addedTime,
      half,
      teamId,
      playerId,
      secondaryPlayerId,
      description,
      videoUrl,
      coordinates
    } = req.body;
    
    // Validate required fields
    if (!eventType || !teamId) {
      return res.status(400).json({
        message: 'Event type and team ID are required'
      });
    }
    
    if (!minute && minute !== 0) {
      return res.status(400).json({
        message: 'Minute is required'
      });
    }
    
    // Check if match exists
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }
    
    // Check if match is completed
    if (match.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot add events to a completed match'
      });
    }
    
    // Check if teamId is valid (must be home or away team)
    if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
      return res.status(400).json({
        message: 'Team must be home or away team for this match'
      });
    }
    
    // Check if player belongs to the team (if provided)
    if (playerId) {
      const player = await Player.findByPk(playerId);
      if (!player) {
        return res.status(404).json({
          message: 'Player not found'
        });
      }
      
      if (player.teamId !== teamId) {
        return res.status(400).json({
          message: 'Player must belong to the specified team'
        });
      }
    }
    
    // Check if secondary player belongs to a team in the match (if provided)
    if (secondaryPlayerId) {
      const player = await Player.findByPk(secondaryPlayerId);
      if (!player) {
        return res.status(404).json({
          message: 'Secondary player not found'
        });
      }
      
      // For substitutions, the secondary player must be from the same team
      if (eventType === 'substitution' && player.teamId !== teamId) {
        return res.status(400).json({
          message: 'For substitutions, both players must belong to the same team'
        });
      }
    }
    
    // Create the event
    const newEvent = await MatchEvent.create({
      matchId,
      eventType,
      minute,
      addedTime: addedTime || 0,
      half: half || 1,
      teamId,
      playerId,
      secondaryPlayerId,
      description,
      videoUrl,
      coordinates
    });
    
    // If event is a goal, update match score
    if (eventType === 'goal') {
      if (teamId === match.homeTeamId) {
        match.homeScore = (match.homeScore || 0) + 1;
      } else {
        match.awayScore = (match.awayScore || 0) + 1;
      }
      await match.save();
    }
    
    // Return the created event with associations
    const createdEvent = await MatchEvent.findByPk(newEvent.id, {
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'firstName', 'lastName', 'number', 'position'],
        },
        {
          model: Player,
          as: 'secondaryPlayer',
          attributes: ['id', 'firstName', 'lastName', 'number', 'position'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'logo']
        }
      ]
    });
    
    return res.status(201).json({
      message: 'Match event created successfully',
      event: createdEvent
    });
  } catch (error) {
    console.error('Error creating match event:', error);
    return res.status(500).json({
      message: 'Error creating match event',
      error: error.message
    });
  }
};

/**
 * Update a match event
 */
const updateMatchEvent = async (req, res) => {
  try {
    const { matchId, eventId } = req.params;
    const {
      eventType,
      minute,
      addedTime,
      half,
      teamId,
      playerId,
      secondaryPlayerId,
      description,
      videoUrl,
      coordinates
    } = req.body;
    
    // Check if match exists
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }
    
    // Check if match is completed
    if (match.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot modify events of a completed match'
      });
    }
    
    // Find the event
    const event = await MatchEvent.findOne({
      where: {
        id: eventId,
        matchId,
        deletedAt: null
      }
    });
    
    if (!event) {
      return res.status(404).json({
        message: 'Match event not found'
      });
    }
    
    // If changing team, validate it belongs to the match
    if (teamId && teamId !== event.teamId) {
      if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
        return res.status(400).json({
          message: 'Team must be home or away team for this match'
        });
      }
    }
    
    // Check if new player belongs to the team (if provided and changed)
    if (playerId && playerId !== event.playerId) {
      const player = await Player.findByPk(playerId);
      if (!player) {
        return res.status(404).json({
          message: 'Player not found'
        });
      }
      
      if (player.teamId !== (teamId || event.teamId)) {
        return res.status(400).json({
          message: 'Player must belong to the specified team'
        });
      }
    }
    
    // Check if new secondary player is valid (if provided and changed)
    if (secondaryPlayerId && secondaryPlayerId !== event.secondaryPlayerId) {
      const player = await Player.findByPk(secondaryPlayerId);
      if (!player) {
        return res.status(404).json({
          message: 'Secondary player not found'
        });
      }
      
      // For substitutions, the secondary player must be from the same team
      if ((eventType || event.eventType) === 'substitution' && 
          player.teamId !== (teamId || event.teamId)) {
        return res.status(400).json({
          message: 'For substitutions, both players must belong to the same team'
        });
      }
    }
    
    // Update score if changing event type to/from goal
    const wasGoal = event.eventType === 'goal';
    const willBeGoal = eventType === 'goal';
    const teamChanged = teamId && teamId !== event.teamId;
    
    if ((wasGoal && !willBeGoal) || (wasGoal && teamChanged)) {
      // Removing a goal or changing team of a goal, decrement score
      if (event.teamId === match.homeTeamId) {
        match.homeScore = Math.max((match.homeScore || 0) - 1, 0);
      } else {
        match.awayScore = Math.max((match.awayScore || 0) - 1, 0);
      }
      await match.save();
    }
    
    if ((!wasGoal && willBeGoal) || (wasGoal && teamChanged)) {
      // Adding a goal or changing team of a goal, increment new team's score
      const targetTeamId = teamId || event.teamId;
      if (targetTeamId === match.homeTeamId) {
        match.homeScore = (match.homeScore || 0) + 1;
      } else {
        match.awayScore = (match.awayScore || 0) + 1;
      }
      await match.save();
    }
    
    // Update the event
    await event.update({
      eventType: eventType || event.eventType,
      minute: minute !== undefined ? minute : event.minute,
      addedTime: addedTime !== undefined ? addedTime : event.addedTime,
      half: half || event.half,
      teamId: teamId || event.teamId,
      playerId: playerId !== undefined ? playerId : event.playerId,
      secondaryPlayerId: secondaryPlayerId !== undefined ? secondaryPlayerId : event.secondaryPlayerId,
      description: description !== undefined ? description : event.description,
      videoUrl: videoUrl !== undefined ? videoUrl : event.videoUrl,
      coordinates: coordinates !== undefined ? coordinates : event.coordinates
    });
    
    // Fetch the updated event with associations
    const updatedEvent = await MatchEvent.findByPk(event.id, {
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'firstName', 'lastName', 'number', 'position'],
        },
        {
          model: Player,
          as: 'secondaryPlayer',
          attributes: ['id', 'firstName', 'lastName', 'number', 'position'],
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'logo']
        }
      ]
    });
    
    return res.status(200).json({
      message: 'Match event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating match event:', error);
    return res.status(500).json({
      message: 'Error updating match event',
      error: error.message
    });
  }
};

/**
 * Delete a match event
 */
const deleteMatchEvent = async (req, res) => {
  try {
    const { matchId, eventId } = req.params;
    
    // Check if match exists
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({
        message: 'Match not found'
      });
    }
    
    // Check if match is completed
    if (match.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot delete events of a completed match'
      });
    }
    
    // Find the event
    const event = await MatchEvent.findOne({
      where: {
        id: eventId,
        matchId,
        deletedAt: null
      }
    });
    
    if (!event) {
      return res.status(404).json({
        message: 'Match event not found'
      });
    }
    
    // Update score if deleting a goal
    if (event.eventType === 'goal') {
      if (event.teamId === match.homeTeamId) {
        match.homeScore = Math.max((match.homeScore || 0) - 1, 0);
      } else {
        match.awayScore = Math.max((match.awayScore || 0) - 1, 0);
      }
      await match.save();
    }
    
    // Soft delete the event
    await event.update({ deletedAt: new Date() });
    
    return res.status(200).json({
      message: 'Match event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting match event:', error);
    return res.status(500).json({
      message: 'Error deleting match event',
      error: error.message
    });
  }
};

module.exports = {
  getMatchEvents,
  getMatchEventById,
  createMatchEvent,
  updateMatchEvent,
  deleteMatchEvent
}; 