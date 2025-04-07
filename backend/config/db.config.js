const { Sequelize } = require('sequelize');

// Logger based on environment
const isProd = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

// Custom logging function that respects log level
const logger = {
  error: (message, ...args) => console.error(`[DB ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[DB WARN] ${message}`, ...args),
  info: (message, ...args) => {
    if (['info', 'debug'].includes(logLevel)) console.info(`[DB INFO] ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (logLevel === 'debug') console.debug(`[DB DEBUG] ${message}`, ...args);
  }
};

// Custom sequelize logging based on environment
const customLogging = (msg) => {
  if (process.env.NODE_ENV === 'development' && logLevel === 'debug') {
    logger.debug(msg);
  }
};

// Connection pool configuration based on environment
const poolConfig = isProd 
  ? {
      max: 20,     // Increased for production
      min: 5,      // Keep some connections active
      acquire: 60000, // Increased timeout for production
      idle: 10000
    }
  : {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    };

// Create a new Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: customLogging,
  pool: poolConfig,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: isProd // True in production, false in development
    },
    // Add connection timeout
    connectTimeout: 60000 // 60 seconds
  },
  retry: {
    max: 3 // Retry connection attempts
  }
});

// Test the connection with comprehensive error handling
const testConnection = async () => {
  try {
    logger.info('Attempting to connect to the database...');
    
    if (process.env.NODE_ENV !== 'production') {
      // Only log connection string format in non-production environments
      const connectionString = process.env.DATABASE_URL || '';
      const sanitizedString = connectionString.includes('@')
        ? `${connectionString.split('@')[0].split(':')[0]}:***@${connectionString.split('@')[1]}`
        : 'Invalid connection string format';
      
      logger.info(`Connection string format (credentials hidden): ${sanitizedString}`);
    }
    
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    
    // More detailed error information
    if (error.original && error.original.code) {
      logger.error(`Error code: ${error.original.code}`);
      
      if (error.original.code === 'ENOTFOUND') {
        logger.error('DNS resolution failed. Check your connection string or internet connection.');
        logger.error('Make sure your network can resolve the hostname in the connection string.');
      } else if (error.original.code === 'ETIMEDOUT') {
        logger.error('Connection timed out. Check your firewall or network settings.');
      } else if (error.original.code === 'ECONNREFUSED') {
        logger.error('Connection refused. The database server might be down or not accepting connections.');
      }
    }
    
    if (isProd) {
      // In production, retry with fallback strategies or exit
      logger.error('Fatal database connection error in production environment');
      process.exit(1);
    }
    
    throw error; // Rethrow the error to be caught by the caller
  }
};

// Initialize models and their relationships
const initializeModels = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true }); // This will alter tables to match models
      logger.info('Database synced in development mode (alter: true)');
    } else {
      await sequelize.sync(); // This will not drop tables
      logger.info('Database synced in production mode');
    }
  } catch (error) {
    logger.error('Error initializing database models:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeModels
}; 