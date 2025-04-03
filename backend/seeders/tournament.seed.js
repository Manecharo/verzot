const { User, Tournament } = require('../models');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/**
 * Seeds the database with test tournaments and a test user
 */
async function seedTournaments() {
  console.log('Seeding tournaments...');
  
  try {
    // Create a test admin user if not exists
    let adminUser = await User.findOne({
      where: { email: 'admin@verzot.com' }
    });
    
    if (!adminUser) {
      console.log('Creating admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      adminUser = await User.create({
        id: uuidv4(),
        email: 'admin@verzot.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        birthDate: new Date('1990-01-01'),
        preferredLanguage: 'en',
        verified: true,
        isActive: true
      });
      
      console.log('Admin user created successfully');
    }
    
    // Create some test tournaments
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const inTwoMonths = new Date(today);
    inTwoMonths.setMonth(today.getMonth() + 2);
    
    const inThreeMonths = new Date(today);
    inThreeMonths.setMonth(today.getMonth() + 3);
    
    // Define tournament data
    const tournaments = [
      {
        id: uuidv4(),
        name: 'Summer Cup 2023',
        description: 'Annual summer football tournament',
        startDate: nextMonth,
        endDate: inTwoMonths,
        location: 'City Sports Complex',
        format: '11-a-side',
        maxTeams: 16,
        minTeams: 8,
        registrationDeadline: new Date(nextMonth.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before start
        rosterLockDate: new Date(nextMonth.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before start
        isPublic: true,
        status: 'registration-open',
        organizerId: adminUser.id,
        rules: JSON.stringify({
          matchDuration: 90,
          substitutions: 5,
          pointsForWin: 3,
          pointsForDraw: 1
        }),
        tiebreakerRules: JSON.stringify({
          order: ['points', 'goalDifference', 'goalsScored', 'headToHead']
        }),
        tournamentStructure: JSON.stringify({
          format: 'group+knockout',
          groupCount: 4,
          teamsPerGroup: 4,
          advancingTeams: 2
        })
      },
      {
        id: uuidv4(),
        name: 'Fall Classic Tournament',
        description: 'Competitive autumn football event',
        startDate: inTwoMonths,
        endDate: inThreeMonths,
        location: 'Downtown Stadium',
        format: '7-a-side',
        maxTeams: 24,
        minTeams: 12,
        registrationDeadline: new Date(inTwoMonths.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks before start
        rosterLockDate: new Date(inTwoMonths.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before start
        isPublic: true,
        status: 'draft',
        organizerId: adminUser.id,
        rules: JSON.stringify({
          matchDuration: 60,
          substitutions: 'unlimited',
          pointsForWin: 3,
          pointsForDraw: 1
        }),
        tiebreakerRules: JSON.stringify({
          order: ['points', 'headToHead', 'goalDifference', 'goalsScored']
        }),
        tournamentStructure: JSON.stringify({
          format: 'knockout',
          seeded: true
        })
      }
    ];
    
    // Insert tournaments
    for (const tournamentData of tournaments) {
      // Check if tournament with this name already exists
      const existingTournament = await Tournament.findOne({
        where: { name: tournamentData.name }
      });
      
      if (!existingTournament) {
        await Tournament.create(tournamentData);
        console.log(`Tournament created: ${tournamentData.name}`);
      } else {
        console.log(`Tournament already exists: ${tournamentData.name}`);
      }
    }
    
    console.log('Tournament seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding tournaments:', error);
  }
}

module.exports = {
  seedTournaments
}; 