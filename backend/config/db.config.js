const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Important for connecting to Supabase
    }
  }
});

// Test the connection with comprehensive error handling
const testConnection = async () => {
  try {
    console.log('Attempting to connect to the database...');
    console.log(`Connection string format: ${process.env.DATABASE_URL.split('@')[1].split(':')[0]}`);
    
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    
    // More detailed error information
    if (error.original && error.original.code) {
      console.error(`Error code: ${error.original.code}`);
      
      if (error.original.code === 'ENOTFOUND') {
        console.error('DNS resolution failed. Check your connection string or internet connection.');
        console.error('Make sure your network can resolve the hostname in the connection string.');
      } else if (error.original.code === 'ETIMEDOUT') {
        console.error('Connection timed out. Check your firewall or network settings.');
      } else if (error.original.code === 'ECONNREFUSED') {
        console.error('Connection refused. The database server might be down or not accepting connections.');
      }
    }
    
    throw error; // Rethrow the error to be caught by the caller
  }
};

// Initialize models and their relationships
const initializeModels = async () => {
  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({ alter: true }); // This will alter tables to match models
    console.log('Database synced in development mode (alter: true)');
  } else {
    await sequelize.sync(); // This will not drop tables
    console.log('Database synced in production mode');
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeModels
}; 