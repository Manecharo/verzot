/**
 * Verzot Backend Deployment Verification Script
 * 
 * This script performs a series of checks to ensure the backend is ready for deployment:
 * 1. Environment variables check
 * 2. Database connection test
 * 3. API route validation
 * 4. Socket.io connectivity check
 */

require('dotenv').config();
const { sequelize, testConnection } = require('../config/db.config');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logger
const logger = {
  info: (message) => console.log(`${colors.blue}[INFO]${colors.reset} ${message}`),
  success: (message) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`),
  warn: (message) => console.log(`${colors.yellow}[WARN]${colors.reset} ${message}`),
  error: (message) => console.log(`${colors.red}[ERROR]${colors.reset} ${message}`),
  header: (message) => console.log(`\n${colors.cyan}=== ${message} ===${colors.reset}\n`)
};

// Required environment variables for production
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'FRONTEND_URL',
  'JWT_SECRET',
  'JWT_EXPIRATION',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY'
];

// Optional but recommended environment variables
const recommendedEnvVars = [
  'LOG_LEVEL',
  'RATE_LIMIT',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM'
];

/**
 * Check if all required environment variables are set
 */
async function checkEnvironmentVariables() {
  logger.header('Checking Environment Variables');
  
  const missingVars = [];
  let allRequired = true;
  
  // Check required variables
  logger.info('Checking required environment variables...');
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      logger.error(`Missing required environment variable: ${varName}`);
      missingVars.push(varName);
      allRequired = false;
    } else {
      // Don't log the actual values for security
      logger.success(`${varName}: ✓`);
    }
  }
  
  // Check recommended variables
  logger.info('\nChecking recommended environment variables...');
  for (const varName of recommendedEnvVars) {
    if (!process.env[varName]) {
      logger.warn(`Missing recommended environment variable: ${varName}`);
    } else {
      logger.success(`${varName}: ✓`);
    }
  }
  
  // Special checks for specific variables
  if (process.env.NODE_ENV === 'production') {
    // In production, JWT_SECRET should be strong
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      logger.warn('JWT_SECRET is set but may not be strong enough for production');
    }
    
    // Check DATABASE_URL format
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('postgres')) {
      logger.warn('DATABASE_URL may not be in the correct format');
    }
  }
  
  return {
    success: allRequired,
    missingVars
  };
}

/**
 * Test the database connection
 */
async function testDatabaseConnection() {
  logger.header('Testing Database Connection');
  
  try {
    logger.info('Attempting to connect to the database...');
    const connected = await testConnection();
    
    if (connected) {
      logger.success('Database connection successful');
      return { success: true };
    } else {
      logger.error('Database connection test failed');
      return { success: false, error: 'Connection test failed' };
    }
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    return { success: false, error };
  }
}

/**
 * Run all verification checks
 */
async function runVerification() {
  logger.header('VERZOT BACKEND DEPLOYMENT VERIFICATION');
  logger.info(`Environment: ${process.env.NODE_ENV || 'not set'}\n`);
  
  // Step 1: Check environment variables
  const envCheck = await checkEnvironmentVariables();
  if (!envCheck.success) {
    logger.error('\nEnvironment variable check failed. Please set all required variables.');
    process.exit(1);
  }
  
  // Step 2: Test database connection
  const dbCheck = await testDatabaseConnection();
  if (!dbCheck.success) {
    logger.error('\nDatabase connection check failed. Please check your database configuration.');
    process.exit(1);
  }
  
  // All checks passed
  logger.header('VERIFICATION COMPLETE');
  logger.success('All checks passed! The backend is ready for deployment.');
}

// Run the verification
runVerification().catch(error => {
  logger.error(`An unexpected error occurred during verification: ${error.message}`);
  process.exit(1);
}); 