const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // Link to user if registered
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Can be null for "ghost" players who haven't registered
      // references removed - handled by associate
      unique: false // A user can be a player in multiple teams
    },
    // Team this player belongs to
    teamId: {
      type: DataTypes.UUID,
      allowNull: false
      // references removed - handled by associate
    },
    // For unregistered players, we still need basic info
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    // Player status in the team
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending', 'suspended'),
      defaultValue: 'pending'
    },
    // Jersey number
    jerseyNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 99
      }
    },
    // Player position
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Date player joined the team
    joinedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // ID verification info (if required by tournament)
    idVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    idPhotoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Adds deletedAt for soft deletion
    modelName: 'player'
  });

  // Add associate method
  Player.associate = function(models) {
    Player.belongsTo(models.Team, {
      foreignKey: 'teamId'
    });
    
    Player.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    
    Player.hasMany(models.MatchEvent, {
      as: 'PrimaryEvents',
      foreignKey: 'playerId'
    });
    
    Player.hasMany(models.MatchEvent, {
      as: 'SecondaryEvents',
      foreignKey: 'secondaryPlayerId'
    });
  };

  return Player;
}; 