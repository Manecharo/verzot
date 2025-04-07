# Verzot Backend API

This is the backend API for the Verzot Amateur Soccer Tournament Platform. It provides RESTful API endpoints and real-time communication via Socket.io for the frontend application.

## Table of Contents

- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Technologies

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Sequelize ORM**: Object-Relational Mapping for PostgreSQL
- **PostgreSQL**: Database (via Supabase)
- **Socket.io**: Real-time communication
- **JWT**: Authentication mechanism
- **Supabase**: Authentication and Storage

## Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/           # Sequelize models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── scripts/          # Helper scripts
├── seeders/          # Database seeders
├── .env.example      # Example environment variables
└── server.js         # Entry point
```

## Local Development Setup

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Database Configuration via Supabase
DATABASE_URL=your_supabase_connection_string

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Secret for Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRATION=86400
```

See `.env.example` for a complete list of environment variables.

## Database Setup

The application uses Supabase PostgreSQL for the database. The connection is managed through the Connection Pooler in Session Mode.

For detailed information on the database connection setup, refer to `memory-bank/database-connection.md`.

## Available Scripts

- `npm start`: Start the server in production mode
- `npm run dev`: Start the server in development mode with hot-reload
- `npm run seed`: Run database seeders to populate initial data
- `npm run reset-db`: Reset the database (development only)

## API Documentation

The API provides the following main endpoints:

- `/api/v1/auth`: Authentication endpoints
- `/api/v1/users`: User management
- `/api/v1/tournaments`: Tournament management
- `/api/v1/teams`: Team management
- `/api/v1/players`: Player management
- `/api/v1/matches`: Match management
- `/api/v1/notifications`: Notification management

All endpoints are prefixed with `/api/v1`.

A simple health check endpoint is available at `/api/v1/health`.

## Production Deployment

### Prerequisites

1. Supabase project with PostgreSQL database
2. Vercel account for deployment
3. Environment variables configured in Vercel

### Deployment Steps

1. **Prepare Environment Variables**

   Ensure all required environment variables are set in your deployment platform:
   - `NODE_ENV=production`
   - `DATABASE_URL` (production database connection string)
   - `FRONTEND_URL` (production frontend URL)
   - `JWT_SECRET` (strong, unique secret)
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

2. **Configure Vercel Project**

   Make sure `vercel.json` is properly configured in the root directory with:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "backend/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "backend/server.js"
       },
       {
         "src": "/socket.io/(.*)",
         "dest": "backend/server.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy to Vercel**

   Run the following commands:
   ```
   vercel login
   vercel
   ```

   For production deployment:
   ```
   vercel --prod
   ```

4. **Verify Deployment**

   After deployment, verify the API health by visiting:
   ```
   https://your-deployment-url/api/v1/health
   ```

### Database Migration for Production

Before deploying to production, ensure your database schema is up-to-date:

1. Review and update Sequelize models if necessary
2. Set `NODE_ENV=development` temporarily to sync the database schema
3. After schema sync, switch back to `NODE_ENV=production`

## Troubleshooting

### Common Issues

1. **Database Connection Problems**
   - Verify your `DATABASE_URL` is correct
   - Check firewall settings
   - Ensure SSL configuration is correct

2. **Socket.io Connection Issues**
   - Verify CORS settings match your frontend URL
   - Check if WebSocket connections are allowed by your hosting provider

3. **JWT Authentication Issues**
   - Ensure JWT_SECRET is set and consistent across all environments
   - Verify token expiration settings

For more detailed information on database connection issues, see `memory-bank/database-connection.md`.

### Getting Help

For issues not covered in this README, please contact the development team or create a GitHub issue. 