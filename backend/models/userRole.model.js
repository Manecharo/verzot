const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // For tournament-specific roles
    tournamentId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    // For team-specific roles
    teamId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    // Power level for permissions (higher number = more permissions)
    powerLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    }
  }, {
    timestamps: true,
    modelName: 'userRole'
  });

  // Add associate method
  UserRole.associate = function(models) {
    UserRole.belongsTo(models.User, {
      foreignKey: 'userId'
    });
    
    UserRole.belongsTo(models.Role, {
      foreignKey: 'roleId'
    });
    
    UserRole.belongsTo(models.Tournament, {
      foreignKey: 'tournamentId'
    });
    
    UserRole.belongsTo(models.Team, {
      foreignKey: 'teamId'
    });
  };

  return UserRole;
}; 