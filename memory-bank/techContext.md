# Verzot: Technical Context

## Technology Stack

### Frontend
- **Framework**: React.js 18.2.0
- **Routing**: React Router DOM 6.10.0
- **International**: react-i18next 12.2.0 and i18next 22.4.15
- **Real-time**: Socket.io Client 4.6.1
- **HTTP Client**: Axios 1.3.6
- **State Management**: React Context API, with potential for Redux if complexity increases
- **Styling**: CSS Modules and/or Styled Components, with a focus on responsive design
- **Build Tools**: React Scripts 5.0.1 (Create React App)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Authentication**: JWT (jsonwebtoken 9.0.0)
- **Password Hashing**: bcryptjs
- **Input Validation**: express-validator 7.0.1
- **Real-time Communication**: Socket.io 4.6.1
- **Database ORM**: Sequelize 6.31.0
- **Payment Processing**: Stripe 12.2.0
- **Cross-Origin Support**: CORS
- **Environment Variables**: dotenv

### Database
- **RDBMS**: PostgreSQL
- **ORM**: Sequelize with pg and pg-hstore drivers
- **Connection Pooling**: Managed through Sequelize
- **Schema Management**: Migrations and models via Sequelize

### Hosting & Infrastructure
- **Cloud Provider**: AWS (planned)
- **Application Hosting**: AWS Elastic Beanstalk
- **Database Hosting**: AWS RDS (PostgreSQL)
- **File Storage**: AWS S3
- **Optional Caching**: AWS ElastiCache

### DevOps
- **Version Control**: Git
- **CI/CD**: To be determined
- **Logging**: Winston/Morgan
- **Monitoring**: To be determined

## Development Setup

### Local Development Environment
1. **Node.js**: Version 16.x or later
2. **PostgreSQL**: Version 14.x
3. **npm/yarn**: For package management
4. **Git**: For version control
5. **Code Editor**: VS Code recommended with ESLint/Prettier

### Required Environment Variables

#### Backend (.env file)
```
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=verzot_db

# JWT Secret for Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400

# Stripe API Keys
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# AWS S3 Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
```

#### Frontend (.env file)
```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

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

### Database Schema

The primary entities in our database include:

1. **Users**: Application users including players, team managers, and tournament organizers
2. **Roles**: User roles for permission management
3. **Tournaments**: Tournament details including format, dates, and visibility
4. **Teams**: Team information including roster and contact details
5. **Players**: Individual player profiles
6. **Matches**: Match scheduling and results
7. **Match Events**: Key events during matches (goals, fouls, etc.)
8. **Subscriptions**: User subscriptions to tournaments or teams

## API Structure

### Authentication Endpoints
- `POST /api/v1/auth/register`: User registration
- `POST /api/v1/auth/login`: User authentication
- `GET /api/v1/auth/profile`: Get current user profile
- `PUT /api/v1/auth/profile`: Update user profile
- `PUT /api/v1/auth/change-password`: Change user password

### User Management Endpoints
- `GET /api/v1/users/:userId`: Get user by ID
- `PUT /api/v1/users/profile`: Update user profile
- `PUT /api/v1/users/change-password`: Change user password

### Tournament Management Endpoints
- `GET /api/v1/tournaments`: List tournaments with filtering
- `POST /api/v1/tournaments`: Create a new tournament
- `GET /api/v1/tournaments/:id`: Get tournament details
- `PUT /api/v1/tournaments/:id`: Update tournament
- `DELETE /api/v1/tournaments/:id`: Delete tournament

### Team Management Endpoints
- `GET /api/v1/teams`: List teams
- `POST /api/v1/teams`: Create a new team
- `GET /api/v1/teams/:id`: Get team details
- `PUT /api/v1/teams/:id`: Update team
- `DELETE /api/v1/teams/:id`: Delete team

### Match Management Endpoints
- `GET /api/v1/matches`: List matches
- `POST /api/v1/matches`: Create a new match
- `GET /api/v1/matches/:id`: Get match details
- `PUT /api/v1/matches/:id`: Update match
- `DELETE /api/v1/matches/:id`: Delete match

## Authentication and Authorization

- **JWT-based authentication**: Tokens stored in HTTP-only cookies
- **Role-based access control**: Different permissions for players, team managers, and tournament organizers
- **Password security**: Bcrypt hashing with appropriate salt rounds
- **Token refresh mechanism**: Automatically refresh tokens before expiry

## Real-time Features

- **Socket.io implementation**: Real-time updates for match events
- **Room-based subscriptions**: Users subscribe to specific tournaments or matches
- **Event broadcasting**: Server broadcasts events to subscribed clients

## Internationalization

- **i18next integration**: Translation resources for multiple languages
- **Language detection**: Automatically detect user's preferred language
- **Fallback mechanism**: Default to English when translation is not available

## Development Workflow

- **Git workflow**: Feature branches and pull requests
- **Code style**: ESLint and Prettier for consistent code formatting
- **Testing**: Jest for unit tests, Supertest for API tests
- **Documentation**: JSDoc for code documentation

## Deployment Considerations

- **Environment variables**: Configuration via environment variables
- **Database migrations**: Sequelize migrations for database schema changes
- **CI/CD pipeline**: Automated testing and deployment
- **Containerization**: Docker for consistent development and production environments
- **Monitoring**: Error tracking and performance monitoring

## Security Considerations

- **Input validation**: Express-validator for request validation
- **SQL injection protection**: Parameterized queries via Sequelize
- **XSS protection**: Content Security Policy headers
- **CSRF protection**: Anti-CSRF tokens
- **Rate limiting**: Prevent brute force attacks

## Performance Optimizations

- **Database indexing**: Appropriate indexes for frequently queried fields
- **Query optimization**: Efficient Sequelize queries with proper includes
- **Connection pooling**: Reuse database connections for better performance
- **Caching**: Redis for caching frequently accessed data
- **Pagination**: Limit results for list endpoints 

## UI Implementation and Best Practices

### Theme System

The application implements a consistent theming approach using CSS variables:

```css
:root {
  /* Core theme colors */
  --primary-red: #e63946;
  --primary-red-dark: #c1121f;
  --primary-red-light: #ff6b6b;
  
  /* Background colors */
  --dark-bg-primary: #121212;
  --dark-bg-secondary: #1e1e1e;
  --dark-bg-elevated: #2d2d2d;
  
  /* Text colors */
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-tertiary: #737373;
  
  /* Utility colors */
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --info: #2196f3;
  
  /* Additional variables */
  --border-radius: 4px;
  --shadow-color: rgba(0, 0, 0, 0.2);
  --transition-speed: 0.3s;
}
```

These variables are utilized throughout the application to maintain visual consistency and enable potential theme swapping.

### Form Handling

Form components follow these principles:
- Controlled inputs with React state management
- Comprehensive validation with feedback messages
- Loading states during form submission
- Error handling with user-friendly messages
- Consistent styling across all forms
- Placeholder text for improved user guidance

Example approach:
```jsx
const [formData, setFormData] = useState({
  email: '',
  password: ''
});

const [formErrors, setFormErrors] = useState({});
const [isProcessing, setIsProcessing] = useState(false);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });
  
  // Clear field-specific error when user types
  if (formErrors[name]) {
    setFormErrors({
      ...formErrors,
      [name]: ''
    });
  }
};
```

### Internationalization Implementation

The application uses i18next for internationalization with these best practices:
- Structured translation keys organized by feature
- Proper namespacing to avoid key collisions
- Translation fallbacks for missing keys
- Key naming conventions follow dot notation for hierarchy
- Consistent interpolation patterns

Key organization example:
```json
{
  "common": {
    "loading": "Loading...",
    "teams": "teams",
    "members": "members"
  },
  "auth": {
    "email": "Email",
    "password": "Password",
    "login": "Sign In"
  },
  "teams_section": {
    "search_placeholder": "Search teams by name or location",
    "no_teams_found": "No teams found"
  }
}
```

### UI Component Structure

Components follow these organizational patterns:
- **Atomic Design Principles**: Building complex components from simpler ones
- **Component Composition**: Using composition over inheritance
- **Predictable Props**: Clear prop interfaces with defaults and validation
- **Container/Presentation Split**: Separating data management from presentation
- **Consistent Styling**: Using CSS modules scoped to components

### Error Handling Strategy

UI error handling follows a consistent pattern:
- Form validation with specific error messages per field
- Global error handling for API failures
- User-friendly error messages with suggestions
- Console logging for development debugging
- Error boundaries for component-level failures

### Mobile Responsiveness

Mobile-first design implemented through:
- Flexbox and CSS Grid for adaptive layouts
- Media queries for breakpoint-specific styling
- Touch-friendly UI elements with appropriate sizing
- Responsive typography with relative units (rem/em)
- Content prioritization for small screens

### Accessibility Considerations

The application implements these accessibility features:
- Semantic HTML elements (nav, main, section, etc.)
- ARIA attributes where appropriate
- Keyboard navigability
- Sufficient color contrast
- Focus management
- Screen reader support 