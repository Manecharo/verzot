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

### Authentication Flow

```mermaid
flowchart TD
    Login[Login/Register] --> TokenGeneration[JWT Generation]
    TokenGeneration --> TokenStorage[Token Storage - Client]
    TokenStorage --> AuthHeader[Authorization Header]
    AuthHeader --> APIAuth[API Authentication]
    APIAuth --> AuthMiddleware[Auth Middleware]
    AuthMiddleware --> Resources[Protected Resources]
```

The authentication system uses JWT tokens:
1. Login/registration generates JWT tokens
2. Tokens are stored in the client (local storage/cookies)
3. Requests include tokens in headers
4. Backend middleware validates tokens
5. User identity and roles are verified for access control

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