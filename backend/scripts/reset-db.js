require('dotenv').config();
const { sequelize } = require('../config/db.config');
const db = require('../models');

async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    
    // Drop all tables and re-create them
    console.log('Dropping and recreating all tables...');
    await sequelize.sync({ force: true });
    console.log('Database schema reset successfully.');
    
    // Initialize roles
    console.log('Creating roles...');
    const roles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Regular user' },
      { name: 'organizer', description: 'Tournament organizer' },
      { name: 'referee', description: 'Match referee' },
      { name: 'team_owner', description: 'Team owner' },
      { name: 'team_leader', description: 'Team leader' },
      { name: 'player', description: 'Player' }
    ];
    
    await db.Role.bulkCreate(roles);
    console.log(`Created ${roles.length} roles.`);
    
    // Create admin user if needed
    console.log('Creating admin user...');
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const adminUser = await db.User.create({
      email: 'admin@verzot.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true
    });
    
    // Assign admin role to the admin user
    const adminRole = await db.Role.findOne({ where: { name: 'admin' } });
    await adminUser.addRole(adminRole);
    
    console.log('Admin user created with email: admin@verzot.com and password: admin123');
    
    console.log('Database reset and initialization completed successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset function
resetDatabase()
  .then(() => {
    console.log('Database reset successful.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to reset database:', error);
    process.exit(1);
  }); 