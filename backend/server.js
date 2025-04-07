// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { i18nextMiddleware } = require('i18next-http-middleware');
const i18next = require('i18next');
const { sequelize, testConnection } = require('./config/db.config');
const db = require('./models');
const fs = require('fs');
const path = require('path');

// Logging setup
const logLevel = process.env.LOG_LEVEL || 'info';
const isProd = process.env.NODE_ENV === 'production';

// Simple logger function
const logger = {
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  info: (message, ...args) => {
    if (['info', 'debug'].includes(logLevel)) console.info(`[INFO] ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (logLevel === 'debug') console.debug(`[DEBUG] ${message}`, ...args);
  }
};

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tournamentRoutes = require('./routes/tournament.routes');
const teamRoutes = require('./routes/team.routes');
const playerRoutes = require('./routes/player.routes');
const matchRoutes = require('./routes/match.routes');
const notificationRoutes = require('./routes/notification.routes');

// Initialize the Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for non-production environments
if (!isProd) {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// i18n setup (to be configured)
// app.use(i18nextMiddleware.handle(i18next));

// Simple health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ 
    message: 'Verzot API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tournaments', tournamentRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/players', playerRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/notifications', notificationRoutes);
// app.use('/api/v1/subscriptions', require('./routes/subscription.routes'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Resource not found',
    path: req.originalUrl
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  // Join user-specific room if authenticated
  socket.on('auth', (userId) => {
    if (userId) {
      socket.join(`user-${userId}`);
      logger.debug(`Socket joined room: user-${userId}`);
    }
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  // Log the error
  logger.error('Server error:', err);
  
  // Send appropriate response based on environment
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: isProd ? 'See server logs for details' : {
      stack: err.stack,
      details: err
    }
  });
});

// Process handling for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  logger.info('Starting graceful shutdown...');
  
  // Close the HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    sequelize.close().then(() => {
      logger.info('Database connection closed');
      process.exit(0);
    }).catch((err) => {
      logger.error('Error closing database connection:', err);
      process.exit(1);
    });
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Graceful shutdown timeout, forcing exit...');
    process.exit(1);
  }, 10000);
}

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('Database synchronized in development mode');
    } else {
      await db.sequelize.sync();
      logger.info('Database synchronized in production mode');
    }
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`Health check available at: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();

module.exports = { app, server, io }; 