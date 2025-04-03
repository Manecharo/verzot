require('dotenv').config();
const { Sequelize } = require('sequelize');

// Delay helper function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test a database connection with the given configuration
 * @param {string} name - Name of the connection configuration
 * @param {string} connectionString - Database connection string
 * @param {Object} options - Sequelize connection options
 * @returns {Promise<boolean>} - True if connection successful, false otherwise
 */
async function testConnection(name, connectionString, options) {
  console.log(`\n=== Testing Connection: ${name} ===`);
  console.log(`Connection String (masked): ${connectionString.replace(/:[^:]*@/, ':******@')}`);
  
  const sequelize = new Sequelize(connectionString, options);
  
  try {
    await sequelize.authenticate();
    console.log(`✅ SUCCESS: ${name} connection established successfully.`);
    
    try {
      const result = await sequelize.query('SELECT NOW() as current_time');
      console.log(`✅ Query executed successfully. Current time: ${result[0][0].current_time}`);
    } catch (queryError) {
      console.error(`❌ Connection established but query failed: ${queryError.message}`);
    }
    
    await sequelize.close();
    return true;
  } catch (error) {
    console.error(`❌ ERROR: ${name} connection failed:`);
    console.error(`   Message: ${error.message}`);
    
    if (error.original) {
      console.error(`   Original Error: ${error.original.code || ''} - ${error.original.message || ''}`);
    }
    
    try {
      await sequelize.close();
    } catch (closeError) {
      // Ignore close errors
    }
    
    return false;
  }
}

/**
 * Main function to test various connection configurations
 */
async function testConnectionVariants() {
  console.log('======================================================');
  console.log('TESTING DIFFERENT SUPABASE CONNECTION CONFIGURATIONS');
  console.log('======================================================');
  
  // Extract connection parts from environment variable
  const url = process.env.DATABASE_URL || '';
  const projectRef = url.includes('postgres.') 
    ? url.split('postgres.')[1].split(':')[0] 
    : 'iqnkstwzzymqyahlztdx';
  const password = process.env.DB_PASSWORD || '123Verzot123!';
  
  // Base configuration for all connections
  const baseOptions = {
    dialect: 'postgres',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  };
  
  // Different connection string variants to test
  const connectionVariants = [
    // Connection Pooler - Session Mode (IPv4) - different username formats
    {
      name: 'Connection Pooler (Session) - Standard Format',
      connectionString: `postgres://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
    },
    {
      name: 'Connection Pooler (Session) - Without Project Ref',
      connectionString: `postgres://postgres:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
    },
    {
      name: 'Connection Pooler (Session) - postgresql:// Protocol',
      connectionString: `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
    },
    
    // Connection Pooler - Transaction Mode (IPv4)
    {
      name: 'Connection Pooler (Transaction)',
      connectionString: `postgres://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    },
    
    // Direct Connection (IPv6)
    {
      name: 'Direct Connection',
      connectionString: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`
    }
  ];
  
  // Test each connection variant
  let successfulConnections = 0;
  for (const variant of connectionVariants) {
    const success = await testConnection(variant.name, variant.connectionString, baseOptions);
    if (success) successfulConnections++;
    
    // Add a delay between connection attempts to avoid rate limiting
    await delay(1000);
  }
  
  // Summary
  console.log('\n======================================================');
  console.log(`SUMMARY: ${successfulConnections}/${connectionVariants.length} connections successful`);
  console.log('======================================================');
  
  if (successfulConnections === 0) {
    console.log('\nTROUBLESHOOTING SUGGESTIONS:');
    console.log('1. Verify your Supabase project is active');
    console.log('2. Check if your IP address is allowed in Supabase settings');
    console.log('3. Verify your password is correct');
    console.log('4. Check if your network allows outbound connections to the required ports');
    console.log('5. Consider contacting Supabase support with the error details');
  } else {
    console.log('\nRECOMMENDATION:');
    console.log('Update your .env file to use the connection string that worked successfully');
  }
}

// Run the tests
testConnectionVariants().catch(error => {
  console.error('Unhandled error during testing:', error);
}); 