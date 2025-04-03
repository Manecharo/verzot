const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    modelName: 'role'
  });

  // Add associate method
  Role.associate = function(models) {
    Role.belongsToMany(models.User, { 
      through: models.UserRole, 
      foreignKey: 'roleId' 
    });
  };

  return Role;
}; 