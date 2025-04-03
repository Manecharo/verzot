const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    profilePicture: {
      type: DataTypes.STRING, // URL to profile picture
      allowNull: true
    },
    preferredLanguage: {
      type: DataTypes.STRING,
      defaultValue: 'en' // English by default
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true, // Adds createdAt and updatedAt
    paranoid: true,   // Soft delete (adds deletedAt)
    // Model tableName will be the same as the model name
    modelName: 'user'
  });

  // Method to exclude password when returning user data
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  // Add associate method
  User.associate = function(models) {
    User.hasMany(models.Tournament, { 
      as: 'OrganizedTournaments', 
      foreignKey: 'organizerId' 
    });
    
    User.hasOne(models.Subscription, { 
      foreignKey: 'userId' 
    });
    
    User.belongsToMany(models.Role, { 
      through: models.UserRole, 
      foreignKey: 'userId' 
    });
  };

  return User;
}; 