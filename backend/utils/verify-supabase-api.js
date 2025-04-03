require('dotenv').config();
const https = require('https');

// This script helps verify your Supabase connection with API keys
console.log('======================================================');
console.log('SUPABASE CONNECTION VERIFICATION UTILITY');
console.log('======================================================');

// Extract project reference from DATABASE_URL if available
const projectRef = process.env.DATABASE_URL?.includes('postgres.')
  ? process.env.DATABASE_URL.split('postgres.')[1]?.split(':')[0]
  : null;

if (!projectRef) {
  console.log('❌ Error: Could not extract project reference from DATABASE_URL');
  console.log('\nPlease update your .env file with the correct DATABASE_URL from Supabase.');
  console.log('Instructions:');
  console.log('1. Go to Supabase dashboard -> Project Settings -> Database');
  console.log('2. In "Connection string" section, select "Connection pooler" and "Session mode"');
  console.log('3. Copy the connection string and update DATABASE_URL in your .env file');
  process.exit(1);
}

// Request user input for API keys if not in environment
console.log('To verify your Supabase API connection, we need your API keys.');
console.log('Please enter them below (or add them to your .env file for future use):');
console.log('\nSUPABASE_URL and SUPABASE_ANON_KEY can be found in:');
console.log('Supabase Dashboard -> Project Settings -> API -> Project URL and anon/public key');
console.log('\nIMPORTANT: Please manually enter these values below when prompted:');

// Function to read input from console
function prompt(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdin.resume();
    stdout.write(question);
    
    stdin.once('data', (data) => {
      resolve(data.toString().trim());
      stdin.pause();
    });
  });
}

// Main function to verify connection
async function verifySupabaseConnection() {
  try {
    // Get Supabase URL and API Key
    const supabaseUrl = process.env.SUPABASE_URL || await prompt('SUPABASE_URL (e.g. https://yourproject.supabase.co): ');
    const supabaseKey = process.env.SUPABASE_ANON_KEY || await prompt('SUPABASE_ANON_KEY: ');
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('\n❌ Error: Supabase URL and Anon Key are required for verification.');
      return;
    }
    
    console.log('\n======================================================');
    console.log('TESTING SUPABASE CONNECTION WITH PROVIDED CREDENTIALS');
    console.log('======================================================');
    console.log(`Project Reference: ${projectRef}`);
    console.log(`Supabase URL: ${supabaseUrl.replace(/https:\/\//, '')}`);
    console.log(`API Key: ${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}`);
    
    // Parse the URL to get hostname
    const hostname = supabaseUrl.replace(/https:\/\//, '');
    
    // Make a request to Supabase REST API
    const options = {
      hostname,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };
    
    console.log('\nTesting API connection...');
    
    const req = https.request(options, (res) => {
      console.log(`API Status Code: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          if (responseData) {
            console.log(`API Response: ${responseData}`);
          }
          
          if (res.statusCode === 200) {
            console.log('\n✅ SUCCESS: Supabase API connection successful!');
            
            console.log('\nNow testing database connection with provided DATABASE_URL...');
            console.log('Please make sure your DATABASE_URL in .env matches the connection string from Supabase.');
            
            console.log('\n======================================================');
            console.log('NEXT STEPS:');
            console.log('======================================================');
            console.log('1. Update your .env file with:');
            console.log(`   SUPABASE_URL=${supabaseUrl}`);
            console.log(`   SUPABASE_ANON_KEY=${supabaseKey}`);
            console.log('2. Make sure DATABASE_URL matches exactly what is shown in Supabase dashboard');
            console.log('3. Run your app with: npm run dev');
          } else {
            console.log('\n❌ ERROR: Could not connect to Supabase API successfully.');
            console.log('\nPossible reasons:');
            console.log('1. The API key provided is incorrect');
            console.log('2. The Supabase URL is incorrect');
            console.log('3. Your Supabase project might be paused or inaccessible');
          }
        } catch (error) {
          console.error('Error parsing response:', error.message);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`\n❌ Connection error: ${error.message}`);
      if (error.code === 'ENOTFOUND') {
        console.log('\nThe Supabase URL appears to be invalid or unreachable.');
      }
    });
    
    req.end();
    
  } catch (error) {
    console.error(`\n❌ Error during verification: ${error.message}`);
  }
}

// Run the verification
verifySupabaseConnection(); 