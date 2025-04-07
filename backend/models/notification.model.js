const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'team_invitation',      // Invited to join a team
        'tournament_invite',    // Tournament invitation
        'match_scheduled',      // Match has been scheduled
        'match_updated',        // Match details updated
        'match_result',         // Match result available
        'team_registered',      // Team registered for tournament
        'registration_status',  // Registration status changed
        'tournament_started',   // Tournament has started
        'tournament_ended',     // Tournament has ended
        'new_message',          // New message received
        'admin_announcement',   // Announcement from admin
        'tournament_status',    // Tournament status changed
        'system'                // System notification
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Contains additional data relevant to the notification (e.g., tournamentId, matchId)
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    // Determines if email was sent
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Determines if push notification was sent
    pushSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // When the notification expires/should be auto-deleted
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Priority level for ordering
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft delete
    indexes: [
      {
        fields: ['userId'],
        name: 'notification_user_idx'
      },
      {
        fields: ['isRead'],
        name: 'notification_read_idx'
      },
      {
        fields: ['type'],
        name: 'notification_type_idx'
      },
      {
        fields: ['createdAt'],
        name: 'notification_date_idx'
      }
    ]
  });

  // Define associations
  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User'
    });
  };

  return Notification;
}; 