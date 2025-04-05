# Verzot: System Patterns

## System Architecture

Verzot follows a modern web application architecture with clearly separated concerns:

```mermaid
flowchart TD
    Client[Frontend: React Application] <--> API[Backend API: Express.js]
    Client <-.-> WebSockets[Real-time: Socket.io]
    API <--> DB[(Database: PostgreSQL)]
    API <--> Auth[Authentication: JWT]
    API <--> Payments[Payment Processing: Stripe]
    WebSockets <--> DB
```

### Core Architecture Principles

1. **API-First Design**: All functionality is exposed through RESTful APIs
2. **Separation of Concerns**: Clear boundaries between frontend, backend, and database
3. **Real-time Communication**: Socket.io for live updates and notifications
4. **Stateless Authentication**: JWT-based authentication for scalability
5. **Mobile-First Responsive Design**: Frontend optimized for all devices

## Backend Design Patterns

### Core Pattern: Role-Based Access Control (RBAC)

```mermaid
flowchart TD
    User --> UserRoles[User Roles]
    UserRoles --> Permissions[Permissions]
    Permissions --> Resources[Resources]
    
    subgraph "Role Types"
    R1[Organizer]
    R2[Team Leader]
    R3[Referee]
    R4[Player]
    R5[Viewer]
    end
    
    UserRoles --> Role Types
```

The permission system uses a flexible role-based approach where:
- Roles can be context-specific (tournament-level, team-level)
- Permissions cascade based on ownership relationships
- Power levels differentiate capabilities within roles

### Data Model Structure

```mermaid
flowchart TD
    Users --> Tournaments
    Users --> Teams
    Users --> Subscriptions
    
    Teams --> TeamMembers[Team Members/Players]
    Teams --> TeamTournaments[Team Tournament Registration]
    
    Tournaments --> Matches
    Matches --> MatchEvents[Match Events]
    
    Users --> UserRoles[User Roles]
```

The database structure follows these key relationships:
- Users can have multiple roles (Organizer, Team Leader, Referee, Player)
- Teams can participate in multiple tournaments
- Players can belong to multiple teams (but only one per tournament)
- Match events record granular data about matches

### Service Layer Architecture

```mermaid
flowchart TD
    Controllers --> Services
    Services --> Repositories
    Repositories --> Models
    Services --> ExternalAPIs[External APIs]
```

The backend follows a layered architecture:
- **Controllers**: Handle HTTP requests/responses and basic validation
- **Services**: Implement business logic and orchestrate operations
- **Repositories**: Manage data access and transactions
- **Models**: Define data structure and relationships

## Frontend Architecture

### Service Layer Implementation

```mermaid
flowchart TD
    Components --> Services[Service Layer]
    Services --> API[API Module]
    API --> Backend[Backend API]
    Services --> LocalStorage[Local Storage]
    
    subgraph "Service Modules"
    AuthService[Auth Service]
    TournamentService[Tournament Service]
    TeamService[Team Service]
    end
    
    Services --> Service Modules
```

The frontend implements a comprehensive service layer that:
- Abstracts API communication from components
- Handles authentication token management
- Provides specialized services for different entity types
- Manages error handling and loading states
- Handles local storage for state persistence

#### Core Service Modules

1. **Base API Service**:
   - Manages HTTP requests using Axios
   - Configures request interceptors for authentication
   - Handles response interceptors for error processing
   - Manages authentication tokens automatically
   - Provides centralized error handling

2. **Auth Service**:
   - Handles user registration and login
   - Manages user profiles
   - Stores and retrieves tokens from local storage
   - Provides authentication state utilities

3. **Tournament Service**:
   - Implements CRUD operations for tournaments
   - Manages tournament teams and registrations
   - Handles filtering and search capabilities
   - Processes tournament-specific operations

4. **Team Service**:
   - Implements CRUD operations for teams
   - Manages team membership and players
   - Provides filtering and search capabilities
   - Handles tournament registration for teams

### Component Structure

```mermaid
flowchart TD
    App --> Router
    Router --> RouteGuards[Route Guards/Auth]
    RouteGuards --> Pages
    
    Pages --> SharedComponents[Shared Components]
    Pages --> FeatureComponents[Feature-specific Components]
    
    FeatureComponents --> TournamentComponents[Tournament Components]
    FeatureComponents --> TeamComponents[Team Components]
    FeatureComponents --> UserComponents[User Components]
    FeatureComponents --> MatchComponents[Match Components]
```

The frontend follows a modular component hierarchy:
- Core layout components are reused across pages
- Feature-specific components encapsulate business logic
- Components are organized by domain (tournaments, teams, matches)
- Presentational components are separated from container components

### State Management

```mermaid
flowchart TD
    API[API Calls] --> StateManagement[State Management]
    LocalStorage[Local Storage] --> StateManagement
    SocketEvents[Socket Events] --> StateManagement
    
    StateManagement --> UIComponents[UI Components]
```

State is managed through:
- Context API for global application state
- Local state for component-specific concerns
- Service modules for API interactions
- Local storage for offline capabilities and persistence

### Data Flow Pattern

```mermaid
flowchart LR
    APIService[API Service] --> AppState[Application State]
    AppState --> Components
    UserActions[User Actions] --> Components
    Components --> UserActions
    Components --> APIService
```

The frontend follows a unidirectional data flow:
1. User actions trigger API calls or state updates
2. State changes propagate to components
3. Components render based on current state
4. Socket events can update state directly

## Integration Patterns

### Authentication Flow

```mermaid
flowchart TD
    Login[Login/Register Form] --> Validation[Form Validation]
    Validation --> AuthService[Auth Service]
    AuthService --> APIRequest[API Request]
    APIRequest --> JWT[JWT Token]
    JWT --> TokenStorage[Local Storage]
    TokenStorage --> APIInterceptor[API Interceptor]
    APIInterceptor --> AuthHeader[Authorization Header]
    AuthHeader --> BackendAuth[Backend Authentication]
```

The enhanced authentication flow:
1. User enters credentials in login/register form
2. Form validates inputs client-side
3. Auth service sends credentials to API
4. API returns JWT token on success
5. Token stored in local storage
6. API interceptor attaches token to all subsequent requests
7. Expired tokens trigger redirect to login

### Real-Time Updates

```mermaid
flowchart TD
    DBChange[Database Change] --> EventEmitter[Event Emitter]
    EventEmitter --> SocketServer[Socket.io Server]
    SocketServer --> SocketClients[Socket.io Clients]
    SocketClients --> ClientState[Client State Update]
    ClientState --> UIUpdate[UI Update]
```

Real-time updates follow this pattern:
1. Changes to database records trigger events
2. Events are broadcast to relevant clients via socket rooms
3. Clients update their local state
4. UI components re-render with updated data

### Offline Capability Pattern

```mermaid
flowchart TD
    UserAction[User Action] --> ConnCheck[Connectivity Check]
    ConnCheck -->|Online| NormalRequest[Normal API Request]
    ConnCheck -->|Offline| QueueAction[Queue Action in IndexedDB]
    
    OnlineEvent[Device Online Event] --> ProcessQueue[Process Queued Actions]
    ProcessQueue --> ConflictCheck[Check for Conflicts]
    ConflictCheck -->|No Conflicts| SyncChanges[Sync Changes]
    ConflictCheck -->|Conflicts| ConflictResolution[Conflict Resolution UI]
```

Offline functionality follows this approach:
1. Check connectivity before API requests
2. Queue actions locally when offline
3. Sync when connectivity is restored
4. Handle conflicts with resolution strategies

## Design Patterns in Use

1. **Repository Pattern**: Abstraction layer between data models and business logic
2. **Dependency Injection**: Services and repositories are injected where needed
3. **Observer Pattern**: For real-time updates via Socket.io
4. **Factory Pattern**: Creating model instances and DTOs
5. **Adapter Pattern**: Integration with external services (Stripe, etc.)
6. **Strategy Pattern**: Different rules for tournament formats
7. **Command Pattern**: For queueing offline actions
8. **Decorator Pattern**: For adding features to entities based on subscription tier
9. **Module Pattern**: For organizing frontend service layer
10. **Interceptor Pattern**: For handling authentication in API requests
11. **Facade Pattern**: Service layer providing simplified interface to backend API 