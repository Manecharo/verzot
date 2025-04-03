const { sequelize } = require('../config/db.config');
const Sequelize = require('sequelize');

// Import model definitions in dependency order
const defineRole = require('./role.model');
const defineUser = require('./user.model');
const defineTournament = require('./tournament.model');
const defineTeam = require('./team.model');
const definePlayer = require('./player.model');
const defineUserRole = require('./userRole.model');
const defineTeamTournament = require('./teamTournament.model');
const defineMatch = require('./match.model');
const defineMatchEvent = require('./matchEvent.model');
const defineSubscription = require('./subscription.model');

// Initialize models in dependency order
const Role = defineRole(sequelize, Sequelize.DataTypes);
const User = defineUser(sequelize, Sequelize.DataTypes);
const Tournament = defineTournament(sequelize, Sequelize.DataTypes);
const Team = defineTeam(sequelize, Sequelize.DataTypes);
const Player = definePlayer(sequelize, Sequelize.DataTypes);
const UserRole = defineUserRole(sequelize, Sequelize.DataTypes);
const TeamTournament = defineTeamTournament(sequelize, Sequelize.DataTypes);
const Match = defineMatch(sequelize, Sequelize.DataTypes);
const MatchEvent = defineMatchEvent(sequelize, Sequelize.DataTypes);
const Subscription = defineSubscription(sequelize, Sequelize.DataTypes);

// Define associations
const db = {
  Role,
  User,
  Tournament,
  Team,
  Player,
  UserRole,
  TeamTournament,
  Match,
  MatchEvent,
  Subscription,
  sequelize // Include sequelize instance
};

// Initialize associations (ensure models are defined first)
Object.keys(db).forEach((modelName) => {
  // Check if the property is a model and has an associate method
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export all models and the sequelize instance
module.exports = db; 