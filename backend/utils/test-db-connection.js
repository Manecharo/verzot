require('dotenv').config();
const { sequelize, testConnection } = require('../config/db.config');

// Simple script to test database connection
async function testDatabaseConnection() {
  console.log('====================================');
  console.log('TESTING DATABASE CONNECTION');
  console.log('====================================');
  
  console.log(`Using connection string: ${process.env.DATABASE_URL.split(':')[0]}://*****@${process.env.DATABASE_URL.split('@')[1]}`);
  console.log(`This is using a ${process.env.DATABASE_URL.includes('pooler') ? 'connection pooler (IPv4 compatible)' : 'direct connection (IPv6 required)'}`);
  
  try {
    await testConnection();
    console.log('Connection test successful!');
    
    // Try a simple query
    try {
      const result = await sequelize.query('SELECT NOW() as current_time');
      console.log('Successfully executed query. Current database time:', result[0][0].current_time);
      console.log('====================================');
      console.log('DATABASE CONNECTION IS WORKING!');
      console.log('====================================');
    } catch (queryError) {
      console.error('Connection established but query failed:', queryError);
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Connection test failed!');
    console.log('====================================');
    console.log('TROUBLESHOOTING SUGGESTIONS:');
    console.log('====================================');
    console.log('1. Check if you have the correct project ID in your connection string');
    console.log('2. Verify that your password is correct');
    console.log('3. Make sure your network can resolve the hostname (DNS issues)');
    console.log('4. If using direct connection, confirm your network supports IPv6');
    console.log('5. Check if your IP is allowed in Supabase database settings');
    console.log('====================================');
  }
}

testDatabaseConnection(); 