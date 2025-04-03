# Verzot Backend

Backend server for the Verzot sports tournament management application.

## Features

- User authentication and profile management
- Tournament creation and management
- Team registration and management
- Match scheduling and result tracking
- Real-time updates using Socket.io

## Tournament Functionality

The tournament system allows organizers to:

1. Create tournaments with detailed configuration
2. Manage team registrations
3. Configure tournament structure (groups, knockout stages)
4. Schedule matches
5. Track results and standings
6. Communicate with participants

### Tournament API Endpoints

All tournament endpoints are available under `/api/v1/tournaments`

#### Public Endpoints

- `GET /api/v1/tournaments` - List all public tournaments with optional filters
- `GET /api/v1/tournaments/:id` - Get details for a specific tournament

#### Private Endpoints (Authentication Required)

- `POST /api/v1/tournaments` - Create a new tournament
- `PUT /api/v1/tournaments/:id` - Update tournament details (organizer only)
- `DELETE /api/v1/tournaments/:id` - Delete a tournament (organizer only)

## Getting Started

### Prerequisites

- Node.js v14+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd verzot/backend
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=verzot
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=86400
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. Initialize the database:
   ```bash
   npm run dev
   ```

5. Seed the database with test data:
   ```bash
   npm run seed
   ```

### Development

Run the server in development mode:
```bash
npm run dev
```

The server will restart automatically when you make changes.

## API Documentation

For detailed API documentation, visit `/api-docs` after starting the server.

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Submit a pull request

## License

This project is proprietary and confidential. 