// Import seeders
const { seedTournaments } = require('./tournament.seed');

/**
 * Run all seeders in the appropriate order
 */
async function runSeeders() {
  console.log('Starting database seeding...');
  
  try {
    // Run tournament seeder
    await seedTournaments();
    
    console.log('All seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

// If this file is executed directly (not imported), run the seeders
if (require.main === module) {
  runSeeders();
}

module.exports = {
  runSeeders
}; 