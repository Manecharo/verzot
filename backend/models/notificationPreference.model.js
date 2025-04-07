module.exports = (sequelize, Sequelize) => {
  const NotificationPreference = sequelize.define("notification_preference", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    emailNotifications: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    digestFrequency: {
      type: Sequelize.ENUM('realtime', 'daily', 'weekly', 'never'),
      allowNull: false,
      defaultValue: 'daily'
    },
    matchUpdates: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    tournamentUpdates: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    teamUpdates: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    systemAnnouncements: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  });

  return NotificationPreference;
}; 