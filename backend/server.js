require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { i18nextMiddleware } = require('i18next-http-middleware');
const i18next = require('i18next');
const { sequelize, testConnection } = require('./config/db.config');
const db = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const tournamentRoutes = require('./routes/tournament.routes');

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// i18n setup (to be configured)
// app.use(i18nextMiddleware.handle(i18next));

// Simple health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ message: 'Verzot API is running' });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tournaments', tournamentRoutes);
// app.use('/api/v1/teams', require('./routes/team.routes'));
// app.use('/api/v1/players', require('./routes/player.routes'));
// app.use('/api/v1/matches', require('./routes/match.routes'));
// app.use('/api/v1/subscriptions', require('./routes/subscription.routes'));

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('Database synchronized in development mode');
    } else {
      await db.sequelize.sync();
      console.log('Database synchronized in production mode');
    }
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();

module.exports = { app, server, io }; 