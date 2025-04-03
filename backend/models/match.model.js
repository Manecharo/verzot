const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tournamentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // Home team
    homeTeamId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // Away team
    awayTeamId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // Assigned referee
    refereeId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    // Match date and time
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    // Location/Field
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Field number/name
    field: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Match status
    status: {
      type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'postponed'),
      defaultValue: 'scheduled'
    },
    // Score for home team
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    // Score for away team
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    // Half-time score
    halfTimeHomeScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    halfTimeAwayScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Match duration in minutes
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Match phase (group stage, round of 16, etc.)
    phase: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Match group (if in a group phase)
    group: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Match round
    round: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Whether the match went to penalties
    hasPenalties: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Penalty shootout result if applicable
    homePenaltyScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    awayPenaltyScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Confirmation status
    homeConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    awayConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    refereeConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Match notes
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Adds deletedAt for soft deletion
    modelName: 'match'
  });

  // Add associate method
  Match.associate = function(models) {
    Match.belongsTo(models.Tournament, {
      foreignKey: 'tournamentId'
    });
    
    Match.belongsTo(models.Team, {
      as: 'HomeTeam',
      foreignKey: 'homeTeamId'
    });
    
    Match.belongsTo(models.Team, {
      as: 'AwayTeam',
      foreignKey: 'awayTeamId'
    });
    
    Match.belongsTo(models.User, {
      as: 'Referee',
      foreignKey: 'refereeId'
    });
    
    Match.hasMany(models.MatchEvent, {
      foreignKey: 'matchId'
    });
  };

  return Match;
}; 