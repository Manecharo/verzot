const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    teamLeaderId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // A unique identifier code for team invites
    inviteCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    // Additional team information
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    colors: {
      type: DataTypes.JSONB, // Primary and secondary colors
      allowNull: true
    },
    homeLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    foundedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1800,
        max: new Date().getFullYear()
      }
    },
    // Status of the team
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Adds deletedAt for soft deletion
    modelName: 'team'
  });

  // Add associate method
  Team.associate = function(models) {
    Team.belongsTo(models.User, { 
      as: 'TeamLeader', 
      foreignKey: 'teamLeaderId' 
    });
    
    Team.belongsToMany(models.Tournament, { 
      through: models.TeamTournament, 
      foreignKey: 'teamId' 
    });
    
    Team.hasMany(models.Player, { 
      foreignKey: 'teamId' 
    });
    
    Team.hasMany(models.Match, { 
      as: 'HomeMatches', 
      foreignKey: 'homeTeamId' 
    });
    
    Team.hasMany(models.Match, { 
      as: 'AwayMatches', 
      foreignKey: 'awayTeamId' 
    });
    
    Team.hasMany(models.UserRole, { 
      foreignKey: 'teamId' 
    });
  };

  return Team;
}; 