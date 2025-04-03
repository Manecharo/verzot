const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Tournament = sequelize.define('Tournament', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    format: {
      type: DataTypes.ENUM('11-a-side', '8-a-side', '7-a-side', '5-a-side', 'penalty-shootout'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'draft',
        'published',
        'registration-open',
        'registration-closed',
        'in-progress',
        'completed',
        'cancelled'
      ),
      defaultValue: 'draft'
    },
    maxTeams: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2
      }
    },
    minTeams: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      validate: {
        min: 2
      }
    },
    registrationDeadline: {
      type: DataTypes.DATE
    },
    rosterLockDate: {
      type: DataTypes.DATE
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rules: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    tiebreakerRules: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    tournamentStructure: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    customBranding: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    organizerId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    timestamps: true,
    paranoid: true,
    modelName: 'tournament',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['isPublic']
      },
      {
        fields: ['startDate']
      },
      {
        fields: ['organizerId']
      }
    ]
  });

  Tournament.associate = function(models) {
    Tournament.belongsTo(models.User, {
      foreignKey: 'organizerId',
      as: 'organizer'
    });

    Tournament.hasMany(models.Team, {
      foreignKey: 'tournamentId',
      as: 'teams'
    });

    Tournament.hasMany(models.Match, {
      foreignKey: 'tournamentId',
      as: 'matches'
    });
    
    Tournament.hasMany(models.UserRole, {
      foreignKey: 'tournamentId'
    });
  };

  return Tournament;
}; 