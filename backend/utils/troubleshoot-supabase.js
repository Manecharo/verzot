require('dotenv').config();
const https = require('https');

const projectRef = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.split('postgres.')[1]?.split(':')[0] || 'iqnkstwzzymqyahlztdx'
  : 'iqnkstwzzymqyahlztdx';

console.log('======================================================');
console.log('SUPABASE PROJECT VERIFICATION');
console.log('======================================================');
console.log(`Project Reference: ${projectRef}`);

// Try to access the Supabase project REST API
console.log('\nAttempting to connect to Supabase project REST API...');

const options = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (data) => {
    const response = data.toString();
    console.log(`Response: ${response}`);
  });
  
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('✅ The Supabase project appears to be accessible!');
    console.log('\nTROUBLESHOOTING NEXT STEPS:');
    console.log('1. Double-check your Supabase project reference ID');
    console.log('2. Verify your database credentials are correct');
    console.log('3. Make sure your IP is not restricted in Supabase');
  } else if (res.statusCode === 400) {
    console.log('✅ The Supabase URL is valid, but requires authentication.');
    console.log('\nTROUBLESHOOTING NEXT STEPS:');
    console.log('1. Double-check your database credentials');
    console.log('2. Verify your connection string format is correct');
  } else {
    console.log('❌ The Supabase project could not be reached properly.');
    console.log('\nTROUBLESHOOTING NEXT STEPS:');
    console.log('1. Verify that your Supabase project ID is correct');
    console.log('2. Check if your Supabase project is active');
    console.log('3. Try creating a new Supabase project to test');
  }
});

req.on('error', (error) => {
  console.error('❌ Error accessing Supabase project:');
  console.error(`   ${error.message}`);
  
  if (error.code === 'ENOTFOUND') {
    console.log('\nThe Supabase project ID appears to be invalid or the project does not exist.');
    console.log('\nTROUBLESHOOTING SUGGESTIONS:');
    console.log('1. Verify your Supabase project reference ID');
    console.log('2. Try creating a new Supabase project');
    console.log('3. Consider using a local development database for now');
  } else {
    console.log('\nTROUBLESHOOTING SUGGESTIONS:');
    console.log('1. Check your internet connection');
    console.log('2. Verify that your Supabase project exists and is active');
    console.log('3. Try accessing the Supabase dashboard to check project status');
  }
});

req.end(); 