const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // Subscription plan type
    planType: {
      type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
      defaultValue: 'free',
      allowNull: false
    },
    // Stripe subscription ID
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Stripe customer ID
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Subscription status
    status: {
      type: DataTypes.ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing'),
      defaultValue: 'active',
      allowNull: false
    },
    // Subscription start date
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Subscription end date
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Billing frequency
    billingFrequency: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'annual'),
      defaultValue: 'monthly',
      allowNull: false
    },
    // Latest payment amount
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    // Currency
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
      allowNull: false
    },
    // Auto-renew flag
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Cancellation date (if applicable)
    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Plan features and limitations (stored as JSON)
    features: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Adds deletedAt for soft deletion
    modelName: 'subscription'
  });

  // Add associate method
  Subscription.associate = function(models) {
    Subscription.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return Subscription;
}; 