const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TeamTournament = sequelize.define('TeamTournament', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tournamentId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // Registration status in the tournament
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'withdrawn'),
      defaultValue: 'pending'
    },
    // Registration date
    registrationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Flag to indicate if roster is locked
    isRosterLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Tournament-specific team info
    group: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Team statistics in the tournament
    stats: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      }
    },
    // Team payment status for tournaments that require entry fees
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'waived', 'refunded'),
      defaultValue: 'pending'
    },
    // Notes from tournament organizer
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Adds deletedAt for soft deletion
    modelName: 'teamTournament',
    // Ensure a team can only be registered once in a tournament
    indexes: [
      {
        unique: true,
        fields: ['teamId', 'tournamentId']
      }
    ]
  });

  // Add associate method
  TeamTournament.associate = function(models) {
    TeamTournament.belongsTo(models.Team, {
      foreignKey: 'teamId'
    });
    
    TeamTournament.belongsTo(models.Tournament, {
      foreignKey: 'tournamentId'
    });
  };

  return TeamTournament;
}; 