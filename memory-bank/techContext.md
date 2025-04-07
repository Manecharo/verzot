# Verzot: Technical Context

## Technology Stack

### Frontend
- **Framework**: React.js
- **Type System**: JavaScript with PropTypes
- **Styling**: CSS Modules
- **State Management**: Context API
- **Routing**: React Router 6
- **Internationalization**: i18next with React-i18next
- **Authentication**: Supabase Auth
- **API Communication**: Axios
- **Real-time Updates**: Socket.io client
- **Build Tool**: Create React App
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Architecture**: RESTful with versioning
- **Database ORM**: Sequelize with PostgreSQL
- **Authentication**: JWT (to be integrated with Supabase Auth)
- **Real-time Communication**: Socket.io
- **Validation**: Express Validator
- **File Storage**: (Planned) Supabase Storage

### Database
- **Primary Database**: PostgreSQL (via Supabase)
- **Connection**: Supabase connection pooler
- **Schema Management**: Sequelize migrations
- **Authentication Store**: Supabase Auth

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Linting**: ESLint
- **Code Formatting**: Prettier
- **Testing**: (Planned) Jest, React Testing Library
- **API Testing**: (Planned) Supertest
- **CI/CD**: (Planned) GitHub Actions

## Key Technologies

### React.js
React is used for building the user interface with a component-based architecture. The application uses functional components with hooks for state management and side effects.

### Supabase
Supabase provides the authentication and database services for the application:
- **Supabase Auth**: Used for user authentication, providing email/password authentication
- **Supabase PostgreSQL**: PostgreSQL database for storing application data
- **Supabase Storage**: (Planned) For storing user uploads like profile pictures and team logos

### Vercel
Vercel is used for frontend deployment, providing:
- **CI/CD**: Automatic deployments from the GitHub repository
- **Environment Variables**: Secure storage of configuration values
- **Edge Network**: Global content delivery for fast loading times
- **Preview Deployments**: For testing changes before production release

### Express.js
Express serves as the backend framework, providing:
- RESTful API endpoints
- Middleware for authentication, validation, and error handling
- Route organization for various resources
- Integration with Socket.io for real-time features

### Socket.io
Socket.io enables real-time communication features:
- Live match updates
- Real-time notifications
- Tournament status changes

### Sequelize
Sequelize is the ORM for database interactions:
- Model definitions
- Associations between models
- Migrations for schema changes
- Seeding for test data

### Internationalization (i18next)
i18next with React-i18next provides multilingual support:
- Translation files for different languages
- Language detection
- Locale formatting

## Architecture

### Frontend Architecture
The frontend follows a component-based architecture:
- **Pages**: High-level components representing different routes
- **Components**: Reusable UI elements
- **Context**: For global state management
- **Services**: For API communication
- **Hooks**: For shared logic
- **Assets**: Static resources

### Repository Structure

```
verzot/
├── backend/              # Backend code
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── .env.example      # Example environment variables
│   ├── package.json      # Backend dependencies
│   └── server.js         # Entry point
│
├── frontend/             # Frontend code
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── context/      # React context (state)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── locales/      # Translation files
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── utils/        # Utility functions
│   │   ├── App.js        # Main App component
│   │   ├── i18n.js       # i18n configuration
│   │   └── index.js      # Entry point
│   ├── .env.example      # Example environment variables
│   └── package.json      # Frontend dependencies
│
└── README.md             # Project documentation
```

## Technical Constraints

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 not supported
- Mobile browsers (iOS Safari, Android Chrome)

### Performance Requirements
- Page load times under 2 seconds
- API response times under 500ms for common operations
- Socket event propagation under 1 second

### Scalability Considerations
- Stateless API design for horizontal scaling
- Session management via JWT tokens, not server-side sessions
- Connection pooling for database
- Potential for read replicas as the application scales

### Security Requirements
- HTTPS for all communications
- XSS protection
- CSRF protection
- Input validation/sanitization
- Rate limiting on sensitive endpoints
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Data encryption for sensitive information

### Internationalization
- All UI text in translation files
- Multi-language support from initial release
- Date/time formatting respecting locale
- Number formatting respecting locale
- Right-to-left (RTL) support consideration for future languages

### Accessibility
- Target WCAG 2.1 AA compliance
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Text resizing support

## Dependencies and Third-Party Services

### External APIs
- **Stripe**: Payment processing
- **AWS S3**: File storage (for uploaded images)

### Key Frontend Dependencies
- React ecosystem (React, React Router, React DOM)
- i18next for translations
- Socket.io client for real-time updates
- Axios for HTTP requests

### Key Backend Dependencies
- Express.js for the API server
- Sequelize ORM for database operations
- Socket.io for real-time capabilities
- JWT for authentication
- BCrypt for password hashing
- Stripe SDK for payment processing

### Development Dependencies
- ESLint for code linting
- Prettier for code formatting
- Nodemon for backend development
- Jest for testing
- Supertest for API testing

## Future Technical Considerations

### Potential Enhancements
- Transition to TypeScript for improved type safety
- Implement GraphQL for more efficient data fetching
- Add Redis for caching frequently accessed data
- Consider server-side rendering for improved SEO
- Implement progressive web app capabilities
- Develop native mobile applications
- Add WebRTC for direct communication between clients

### Technical Debt Awareness
- Monitor database query performance as data grows
- Plan for potential ORM limitations with complex queries
- Review authentication strategy as user base scales
- Consider microservices architecture if monolith becomes unwieldy
- Maintain test coverage as features expand 

## Database Architecture

### Supabase PostgreSQL Integration

We're using Supabase's hosted PostgreSQL database for data persistence. The integration includes:

1. **Connection Methods**:
   - **Direct Connection**: Uses IPv6 addressing (`postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`)
   - **Connection Pooler** (Session Mode): Uses IPv4 addressing for better compatibility (`postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`)
   - **Connection Pooler** (Transaction Mode): For temporary connections in serverless environments (`postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`)

2. **Connection Configuration**:
   - SSL enabled with `rejectUnauthorized: false` for development
   - Connection pooling with optimal settings
   - Comprehensive error handling with detailed diagnostic information

3. **Sequelize ORM Integration**:
   - Models defined with Sequelize DataTypes
   - Associations handled through Sequelize relationships
   - Database syncing with `alter: true` in development mode
### Backend Architecture
The backend follows a layered architecture:
- **Routes**: Define API endpoints
- **Controllers**: Handle request processing
- **Services**: Implement business logic
- **Models**: Define data structure
- **Middleware**: Cross-cutting concerns
- **Utils**: Helper functions
### Database Schema
The database schema is composed of several interconnected models:
- **User**: Stores user information and authentication details
- **Role**: Defines user roles (Admin, Organizer, TeamLeader, Referee, Player)
- **UserRole**: Junction table for user-role relationship
- **Tournament**: Stores tournament details and configuration
- **Team**: Represents a team with its details
- **Player**: Stores player information
- **TeamTournament**: Junction table for team-tournament relationships
- **Match**: Represents a match between teams
- **MatchEvent**: Records events during matches (goals, cards, etc.)
- **Subscription**: Stores subscription information for premium features

### Authentication Flow

The authentication system now uses Supabase Auth:

1. **Registration**:
   - User submits registration form
   - Form data is validated on the client side
   - Supabase Auth API is called to create a new user
   - User information is stored in Supabase Auth
   - JWT token is returned and stored in localStorage
   - User is redirected to dashboard

2. **Login**:
   - User submits login form
   - Credentials are validated on the client side
   - Supabase Auth API is called to authenticate the user
   - JWT token is returned and stored in localStorage
   - User is redirected to dashboard

3. **Authentication State**:
   - AuthContext maintains the authentication state
   - Supabase session is checked on app initialization
   - Protected routes verify authentication status
   - Logout clears the Supabase session and local storage

4. **JWT Validation**:
   - Backend API will validate JWT tokens from Supabase
   - Role-based authorization will be implemented

## Development Setup

### Prerequisites
- Node.js (v14+)
- npm (v6+)
- PostgreSQL (via Supabase)
- Git

### Frontend Setup
1. Clone the repository
2. Navigate to the `frontend` directory
3. Install dependencies with `npm install`
4. Create a `.env` file with required environment variables
5. Start the development server with `npm start`

### Backend Setup
1. Navigate to the `backend` directory
2. Install dependencies with `npm install`
3. Create a `.env` file with required environment variables
4. Start the development server with `npm run dev`

### Environment Variables

#### Frontend Environment Variables
```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=<your-supabase-url>
REACT_APP_SUPABASE_ANON_KEY=<your-supabase-anon-key>
REACT_APP_USE_SUPABASE=true
```

#### Backend Environment Variables
```
PORT=5000
NODE_ENV=development
DATABASE_URL=<supabase-connection-string>
JWT_SECRET=<jwt-secret>
JWT_EXPIRES_IN=1d
```

## Deployment

### Frontend Deployment (Vercel)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings:
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: npm run vercel-build
   - Output Directory: build
4. Set environment variables in Vercel dashboard
5. Deploy

### Backend Deployment (Planned)
1. Configure backend for production
2. Deploy to suitable platform (Heroku, AWS, etc.)
3. Set up environment variables
4. Configure domain and SSL

## External Services

### Supabase
- **Auth**: User authentication and management
- **Database**: PostgreSQL database for data storage
- **Storage**: (Planned) File storage for user uploads

### Stripe (Planned)
- Payment processing for subscription plans
- Webhook integration for payment events
- Subscription management

## Technical Constraints

1. **Browser Compatibility**: Supporting modern browsers (last 2 versions)
2. **Mobile Responsiveness**: Mobile-first design approach
3. **Performance**: Optimizing bundle size and load times
4. **SEO**: Proper metadata and optimizations for search engines
5. **Accessibility**: Following WCAG guidelines for accessibility
6. **Security**: Implementing best practices for secure authentication and data protection

## Future Technical Roadmap

1. **Mobile Apps**: Native mobile applications using React Native
2. **Performance Optimizations**: 
   - Code splitting
   - Server-side rendering
   - Image optimization
3. **Enhanced Analytics**: Integration with analytics platforms
4. **Advanced Search**: Implementing full-text search for tournaments and teams
5. **Machine Learning**: Recommendations for tournaments based on user preferences
6. **Offline Support**: Enhanced offline functionality for critical features
7. **Social Integration**: Integration with social media platforms 