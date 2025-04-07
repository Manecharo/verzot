# Verzot - Amateur Soccer Tournament Platform

## Project Overview
Verzot is a user-friendly, global web-based platform designed to simplify the organization, management, and participation in amateur soccer tournaments.

## Key Features
- Tournament creation and management for different soccer formats (11-a-side, 8-a-side, 7-a-side, 5-a-side, penalty shootouts)
- Team and player registration system
- Match scheduling and results tracking
- Role-based permissions (Organizers, Team Leaders, Referees, Players)
- Real-time updates for scores and standings
- Multilingual support (English and Spanish)
- User profile management with image upload
- Tournament brackets for knockout stages
- Match events recording with field position tracking
- Player statistics derived from match events
- Notification system with real-time updates

## Technical Stack
- Frontend: React.js with Context API for state management
- Backend: Node.js with Express.js
- Database: PostgreSQL via Supabase
- Authentication: Supabase Auth with JWT
- Real-time Communication: Socket.io
- File Storage: Supabase Storage
- Payments: Stripe API integration (planned)
- Deployment: Vercel

## Project Structure

```
verzot/
├── frontend/          # React.js frontend application
├── backend/           # Express.js API server
├── tests/             # Test suite for both frontend and backend
├── memory-bank/       # Project documentation
├── .gitignore         # Git ignore configuration
├── vercel.json        # Vercel deployment configuration
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Supabase account (for PostgreSQL database)
- Git

### Local Development Setup

1. **Setup Backend**

```bash
cd backend
npm install
# Create .env file based on .env.example
npm run dev
```

2. **Setup Frontend**

```bash
cd frontend
npm install
# Create .env file based on .env.example
npm start
```

3. **Access the Application**

Frontend: http://localhost:3000
Backend API: http://localhost:5000/api/v1/health

## Deployment

### Backend Deployment Preparation

1. **Verify environment setup**

```bash
cd backend
npm run verify-deployment
```

2. **Test production configuration**

Set `NODE_ENV=production` in your .env file temporarily and run:

```bash
npm start
```

Verify the API is working correctly by checking the health endpoint.

### Deploying to Vercel

The application is configured for deployment on Vercel with the `vercel.json` file in the root directory.

1. **Prepare environment variables**

Configure all required environment variables in Vercel:
- Database connection string (DATABASE_URL)
- JWT secret (JWT_SECRET)
- Supabase configuration (SUPABASE_URL, SUPABASE_SERVICE_KEY)
- Frontend URL for CORS (FRONTEND_URL)
- Set NODE_ENV to "production"

2. **Deploy with Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel
```

For production deployment:

```bash
vercel --prod
```

### Pushing to GitHub

1. **Initialize Git repository (if not already done)**

```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Create GitHub repository**

Create a new repository on GitHub.

3. **Add remote and push**

```bash
git remote add origin https://github.com/yourusername/verzot.git
git branch -M main
git push -u origin main
```

4. **For backend deployment updates**

```bash
git add .
git commit -m "Backend deployment preparation complete"
git push
```

## Documentation

For detailed documentation, see the `memory-bank` directory:

- `projectbrief.md`: Project goals and requirements
- `productContext.md`: Product purpose and problems it solves
- `techContext.md`: Technical stack details
- `systemPatterns.md`: Architecture and design patterns
- `activeContext.md`: Current work focus and recent changes
- `progress.md`: Completed and in-progress work
- `database-connection.md`: Database connection details

## License

This project is proprietary and confidential.

<!-- Trigger Vercel build --> 