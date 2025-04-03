const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const MatchEvent = sequelize.define('MatchEvent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    matchId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // Player who is the primary subject of the event
    playerId: {
      type: DataTypes.UUID,
      allowNull: true, // Can be null for team events
    },
    // Secondary player (e.g., for assists)
    secondaryPlayerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    // Team ID
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Type of event
    eventType: {
      type: DataTypes.ENUM(
        'goal', 
        'own-goal', 
        'yellow-card', 
        'red-card', 
        'second-yellow', 
        'penalty-goal', 
        'penalty-missed', 
        'penalty-saved', 
        'substitution-in', 
        'substitution-out',
        'injury'
      ),
      allowNull: false
    },
    // Minute of the event
    minute: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    // Additional time (e.g., 45+2)
    addedTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    // Half (1 for first half, 2 for second half, 3+ for extra time periods)
    half: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 4 // Supporting up to 2nd extra time period
      }
    },
    // Description of the event
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Video URL or reference if available
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Coordinates on the field where the event happened (stored as JSON)
    coordinates: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Adds deletedAt for soft deletion
    modelName: 'matchEvent'
  });

  // Add associate method
  MatchEvent.associate = function(models) {
    MatchEvent.belongsTo(models.Match, {
      foreignKey: 'matchId'
    });
    
    MatchEvent.belongsTo(models.Player, {
      as: 'Player',
      foreignKey: 'playerId'
    });
    
    MatchEvent.belongsTo(models.Player, {
      as: 'SecondaryPlayer',
      foreignKey: 'secondaryPlayerId'
    });
    
    MatchEvent.belongsTo(models.Team, {
      foreignKey: 'teamId'
    });
  };

  return MatchEvent;
}; 