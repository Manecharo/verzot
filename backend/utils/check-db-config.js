require('dotenv').config();
const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
const https = require('https');

console.log('======================================================');
console.log('COMPREHENSIVE DATABASE CONNECTION CHECKER');
console.log('======================================================');

// First, let's check if DATABASE_URL is properly formatted
if (!process.env.DATABASE_URL) {
  console.log('❌ ERROR: DATABASE_URL is not defined in your .env file');
  console.log('\nPlease configure your .env file with the DATABASE_URL from Supabase.');
  process.exit(1);
}

console.log('Checking DATABASE_URL format...');
const connectionString = process.env.DATABASE_URL;
console.log(`Connection string: ${connectionString.replace(/:[^:]*@/, ':******@')}`);

// Extract connection details
let dbHost, dbUser, dbPassword, dbName, dbPort, isPooler;

try {
  // Parse the connection string
  const urlPattern = /^(?:postgres|postgresql):\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const matches = connectionString.match(urlPattern);
  
  if (matches && matches.length >= 6) {
    dbUser = matches[1];
    dbPassword = matches[2];
    dbHost = matches[3];
    dbPort = parseInt(matches[4], 10);
    dbName = matches[5];
    isPooler = dbHost.includes('pooler.supabase.com');
    
    console.log('✅ Connection string format appears valid');
    console.log('\nDetected connection details:');
    console.log(`- Host: ${dbHost}`);
    console.log(`- Port: ${dbPort}`);
    console.log(`- User: ${dbUser}`);
    console.log(`- Database: ${dbName}`);
    console.log(`- Using connection pooler: ${isPooler ? 'Yes' : 'No'}`);
    
    // Check if the format is correct for pooler connection
    if (isPooler && !dbUser.includes('.')) {
      console.log('\n⚠️ WARNING: When using the connection pooler, the username should be in the format "postgres.PROJECT_REF"');
      console.log('Current username format may not be correct for connection pooler.');
    }
  } else {
    console.log('❌ ERROR: Could not parse DATABASE_URL correctly');
    console.log('Connection string should be in the format: postgresql://username:password@hostname:port/database');
  }
} catch (error) {
  console.log(`❌ ERROR parsing connection string: ${error.message}`);
}

// Function to test Sequelize connection
async function testSequelizeConnection() {
  console.log('\n======================================================');
  console.log('TESTING CONNECTION WITH SEQUELIZE');
  console.log('======================================================');
  
  const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
  
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connection successful!');
    return true;
  } catch (error) {
    console.log(`❌ Sequelize connection failed: ${error.message}`);
    if (error.original) {
      console.log(`Original error: ${error.original.code} - ${error.original.message}`);
    }
    return false;
  } finally {
    try {
      await sequelize.close();
    } catch (e) {
      // Ignore close errors
    }
  }
}

// Function to test direct pg connection
async function testPgConnection() {
  console.log('\n======================================================');
  console.log('TESTING CONNECTION WITH PG DIRECTLY');
  console.log('======================================================');
  
  const pool = new Pool({
    connectionString,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ PG connection successful!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ Query executed. Current time: ${result.rows[0].current_time}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ PG connection failed: ${error.message}`);
    try {
      await pool.end();
    } catch (e) {
      // Ignore close errors
    }
    return false;
  }
}

// Function to check DNS resolution for the host
async function checkDnsResolution() {
  console.log('\n======================================================');
  console.log('CHECKING DNS RESOLUTION');
  console.log('======================================================');
  
  if (!dbHost) {
    console.log('❌ Host information not available');
    return false;
  }
  
  return new Promise((resolve) => {
    const dns = require('dns');
    dns.lookup(dbHost, (err, address, family) => {
      if (err) {
        console.log(`❌ DNS resolution failed: ${err.message}`);
        if (err.code === 'ENOTFOUND') {
          console.log(`The hostname '${dbHost}' could not be resolved.`);
          console.log('This could be due to:');
          console.log('1. The hostname is incorrect');
          console.log('2. DNS resolution issues on your network');
          console.log('3. The Supabase project might not exist');
        }
        resolve(false);
      } else {
        console.log(`✅ DNS resolution successful: ${dbHost} -> ${address} (IPv${family})`);
        if (family === 6 && !process.env.NODE_ENV?.includes('test')) {
          console.log('⚠️ NOTE: This is an IPv6 address. If your environment does not support IPv6, connection might fail.');
          console.log('Consider using the connection pooler option in Supabase which supports IPv4.');
        }
        resolve(true);
      }
    });
  });
}

// Function to test network connectivity to the host
async function testNetworkConnectivity() {
  console.log('\n======================================================');
  console.log('TESTING NETWORK CONNECTIVITY');
  console.log('======================================================');
  
  if (!dbHost || !dbPort) {
    console.log('❌ Host or port information not available');
    return false;
  }
  
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(5000); // 5 second timeout
    
    socket.on('connect', () => {
      console.log(`✅ Successfully connected to ${dbHost}:${dbPort}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Connection to ${dbHost}:${dbPort} timed out`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (error) => {
      console.log(`❌ Connection error: ${error.message}`);
      resolve(false);
    });
    
    console.log(`Attempting to connect to ${dbHost}:${dbPort}...`);
    socket.connect(dbPort, dbHost);
  });
}

// Function to verify project reference
async function verifyProjectReference() {
  console.log('\n======================================================');
  console.log('VERIFYING SUPABASE PROJECT');
  console.log('======================================================');
  
  if (!dbHost) {
    console.log('❌ Host information not available');
    return false;
  }
  
  // Extract project reference
  let projectRef;
  if (dbHost.includes('db.') && dbHost.includes('.supabase.co')) {
    // Format: db.PROJECT_REF.supabase.co
    projectRef = dbHost.split('db.')[1].split('.supabase.co')[0];
  } else if (isPooler && dbUser.includes('.')) {
    // Format: postgres.PROJECT_REF
    projectRef = dbUser.split('.')[1];
  } else {
    console.log('❌ Could not extract project reference from connection string');
    return false;
  }
  
  console.log(`Detected project reference: ${projectRef}`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    console.log(`Checking if project exists at ${projectRef}.supabase.co...`);
    
    const req = https.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      if (res.statusCode === 401 || res.statusCode === 400) {
        console.log('✅ Project exists! (Requires authentication)');
        
        console.log('\nTo access your Supabase project, you need:');
        console.log('1. Go to Supabase dashboard -> Project Settings -> API');
        console.log('2. Copy the URL and anon/public key');
        console.log('3. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
        
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('❌ Project does not exist or is not accessible');
        resolve(false);
      } else {
        console.log(`Received unexpected status code: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error verifying project: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

// Comprehensive test function
async function runTests() {
  try {
    // Step 1: Check DNS resolution
    const dnsResolved = await checkDnsResolution();
    
    // Step 2: If DNS resolves, check network connectivity
    let networkConnected = false;
    if (dnsResolved) {
      networkConnected = await testNetworkConnectivity();
    }
    
    // Step 3: Verify project reference
    await verifyProjectReference();
    
    // Step 4: If network connects, test Sequelize connection
    let sequelizeConnected = false;
    if (networkConnected) {
      sequelizeConnected = await testSequelizeConnection();
    }
    
    // Step 5: If Sequelize fails, try direct PG connection
    if (networkConnected && !sequelizeConnected) {
      await testPgConnection();
    }
    
    // Summary
    console.log('\n======================================================');
    console.log('CONNECTION TEST SUMMARY');
    console.log('======================================================');
    console.log(`DNS Resolution: ${dnsResolved ? '✅ Success' : '❌ Failed'}`);
    console.log(`Network Connectivity: ${networkConnected ? '✅ Success' : '❌ Failed'}`);
    console.log(`Database Connection: ${sequelizeConnected ? '✅ Success' : '❌ Failed'}`);
    
    if (!dnsResolved || !networkConnected || !sequelizeConnected) {
      console.log('\nRECOMMENDATIONS:');
      
      if (!dnsResolved) {
        console.log('1. Verify your Supabase project reference ID is correct');
        console.log('2. Make sure you copied the exact connection string from Supabase dashboard');
        console.log('3. Check if your Supabase project is active');
      }
      
      if (dnsResolved && !networkConnected) {
        console.log('1. Check if your network blocks outbound connections to Supabase');
        console.log('2. Verify firewall settings are not blocking the connection');
        console.log('3. If you are using IPv6, ensure your network supports it');
      }
      
      if (networkConnected && !sequelizeConnected) {
        console.log('1. Verify your database credentials (username, password)');
        console.log('2. For connection pooler, ensure username is in format postgres.PROJECT_REF');
        console.log('3. Check if your IP is allowed in Supabase dashboard -> Settings -> Database -> Network');
      }
    } else {
      console.log('\n✅ All tests passed! Your Supabase connection is working correctly.');
    }
    
  } catch (error) {
    console.error(`An error occurred during testing: ${error.message}`);
  }
}

// Run the tests
runTests(); 