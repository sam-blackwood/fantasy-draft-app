# Fantasy Draft App - Project Plan

## Project Purpose
Real-time fantasy draft application built as Portfolio Project #1 to demonstrate backend development capabilities for transitioning into backend/full-stack roles in the Denver area.

**Target Completion:** March 2026 (Players Championship)

## Why This Project?
- Demonstrate real-time systems (WebSockets)
- Show database design and optimization skills
- Build production-ready REST APIs
- Align with Denver market demands (Go, React, PostgreSQL)
- Solve a real problem I care about (playing fantasy drafts with friends)

---

## Tech Stack

### Backend
- **Language:** Go
- **Web Framework:** Chi (lightweight, idiomatic Go)
- **Database:** PostgreSQL
- **Database Layer:** pgx + pgxpool (PostgreSQL-native driver)
- **WebSockets:** nhooyr.io/websocket (modern, context-based API)
- **Migrations:** golang-migrate/migrate (SQL-based versioning)
- **Testing:** Go standard testing + PostgreSQL dev database

### Frontend
- **Framework:** React
- **State Management:** TBD (Context API, Redux, or Zustand)
- **Build Tool:** Vite
- **Styling:** TBD (Tailwind CSS or styled-components)

### Infrastructure
- **Hosting:** Render.com (or similar cost-effective platform)
- **Database:** Managed PostgreSQL (Render or similar)
- **Version Control:** Git + GitHub

---

## MVP Feature Set

### Core Features (Must Have)
1. **Real-time Draft Mechanics**
   - Live draft room with WebSocket connections
   - Turn-based selection system
   - Auto-advance turns with timer
   - Reconnection support for dropped connections
   - Draft status tracking (not started, in progress, completed)

2. **Team Roster Visibility**
   - View all teams and their drafted players in real-time
   - See current team rosters during the draft
   - Display draft order and team names
   - Track picks remaining per team

3. **Player Board**
   - Display all available players
   - Search functionality
   - Filter by status (professional/amateur) and country
   - Sort by various metrics
   - Real-time updates when players are drafted
   - Support for draft stipulations (e.g., "must draft an amateur", "must draft someone from outside US")

4. **Admin Event Management**
   - Create new events
   - Upload player pool (CSV or manual entry)
   - Configure draft settings:
     - Number of teams and draft timer duration
     - Max picks per team (e.g., 6 players)
     - Max teams that can draft the same player (1 for traditional, 2+ for Ryder Cup style)
   - Start/pause/reset drafts
   - View draft results

5. **Group Access**
   - Password-protected draft rooms
   - No user accounts required
   - Session management for reconnections

### Explicitly Out of Scope for MVP
- Score tracking/live scoring
- User accounts/authentication system
- Mobile apps
- League management across multiple events
- Historical statistics/analytics

---

## Architecture Design

### Sport-Agnostic Data Model
- Flexible JSONB metadata fields for sport-specific attributes
- Generic "player" and "event" entities
- Extensible to football, basketball, etc. beyond golf

### Draft Configuration Flexibility
Each event/draft supports configurable rules to accommodate different draft styles:
- **Pick Limits:** Max picks per team (e.g., 6 players required)
- **Player Availability:** Max teams that can draft the same player
  - Traditional style: 1 (each player can only be drafted once, then off the board)
  - Ryder Cup style: 2+ or unlimited (multiple teams can draft the same player)
  - Note: Each team can only draft a player once (hard rule, not configurable)
- **Player Attributes:** Status (professional/amateur) and country for draft stipulations
- **Draft Stipulations:** Support rules like "must draft an amateur" or "must draft someone from outside US"

### Database Schema
- **Events:** Draft configuration (max picks, duplicate rules, status)
- **Players:** Core info (name) + attributes (status, country) for filtering
- **Users:** Team/participant info
- **Draft_Results:** Picks made during the draft (linked to event, user, player)

### Key Technical Challenges
1. **Real-time Synchronization** - Keep all clients in sync during draft
2. **Connection Resilience** - Handle disconnects/reconnects gracefully
3. **Concurrency** - Prevent race conditions in draft selections
4. **Draft Rule Validation** - Enforce event-specific configuration rules
5. **Performance** - Sub-100ms response times for 12 concurrent users

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Initialize Go project structure
- [ ] Set up PostgreSQL database (local dev + Render)
- [ ] Create database schema and migrations
- [ ] Implement basic REST API (health check, CRUD for events)
- [ ] Set up React project with basic routing
- [ ] Deploy "hello world" to Render to validate hosting

### Phase 2: Core Backend (Weeks 3-4)
- [ ] Build player management endpoints
- [ ] Implement draft room creation/configuration
- [ ] Create WebSocket server infrastructure
- [ ] Draft state machine logic
- [ ] Write unit tests for business logic
- [ ] Database seed scripts and reset utilities

### Phase 3: Real-time Features (Weeks 5-6)
- [ ] WebSocket draft room implementation
- [ ] Turn management and timer logic
- [ ] Real-time player selection sync
- [ ] Reconnection handling
- [ ] Integration testing for WebSocket flows

### Phase 4: Frontend Development (Weeks 7-8)
- [ ] Admin dashboard (create events, upload players)
- [ ] Draft room UI
- [ ] Player board with search/filter/sort
- [ ] Real-time updates via WebSocket
- [ ] Mobile-responsive design

### Phase 5: Polish & Deploy (Weeks 9-10)
- [ ] End-to-end testing with real draft scenarios
- [ ] Performance optimization
- [ ] Error handling and user feedback
- [ ] Documentation (README, API docs)
- [ ] Production deployment
- [ ] Test with friends (dry run before Players Championship)

---

## Learning Goals

### Backend Skills to Demonstrate
- Go proficiency (goroutines, channels, error handling)
- RESTful API design
- WebSocket real-time communication
- Database design and optimization (indexes, query performance)
- Concurrent programming and race condition prevention
- Testing strategies (unit, integration, manual)

### Portfolio Presentation
- Clean, well-documented code
- Thoughtful commit history
- Clear README with setup instructions
- Live demo available
- Architecture decisions documented

---

## Success Criteria

### Technical
- [ ] Successfully run a 12-person draft with <100ms latency
- [ ] Handle disconnects/reconnects without losing state
- [ ] Zero race conditions in concurrent draft selections
- [ ] Database queries under 50ms for player searches
- [ ] 90%+ test coverage on business logic

### Business
- [ ] Friends can actually use it for Players Championship
- [ ] Deploy with <$20/month hosting costs
- [ ] Ready to present to potential employers

### Personal
- [ ] Confident discussing backend architecture in interviews
- [ ] Portfolio piece I'm genuinely proud of
- [ ] Solid foundation for future backend projects

---

## Technical Decisions

### Backend Stack (Decided - Jan 28, 2026)
1. **Go Web Framework:** Chi
   - Lightweight, idiomatic Go built on stdlib
   - No magic - explicit middleware and routing
   - Best for learning Go patterns and WebSocket integration
2. **Database Layer:** pgx + pgxpool
   - PostgreSQL-native driver with best performance
   - Full control over SQL queries (portfolio-worthy)
   - Excellent connection pooling and JSONB support
3. **WebSocket Library:** nhooyr.io/websocket
   - Modern, context-based API
   - Active maintenance and better testing support
   - Production-grade (gorilla/websocket in maintenance mode)
4. **Database Migrations:** golang-migrate/migrate
   - Industry standard, SQL-based
   - CLI tool + Go library integration
   - Works seamlessly with pgx

5. **Project Structure:** Monorepo with separate backend/frontend directories
   - Single repository with clear separation
   - `backend/` contains all Go code (cmd/, internal/, migrations/, go.mod)
   - `frontend/` will contain React app (src/, package.json, vite.config.js)
   - Clean organization for portfolio presentation

### Still To Decide:
1. **React State Management:** Context API vs Redux vs Zustand?
2. **Frontend Styling:** Tailwind CSS vs styled-components?

---

## Notes & Considerations

### Testing Strategy
- **Unit Tests:** Go standard testing for business logic
- **Integration Tests:** Test database interactions with real PostgreSQL
- **Manual Testing:** Separate dev database with easy reset scripts + seed data
- Keep dev database separate from test database to avoid pollution

### Database Management
- Easy reset scripts to restore clean state when testing gets messy
- Seed data for quick local development
- Migrations tracked in version control

### Timeline Flexibility
- March 2026 is target, but quality > deadline
- This is a portfolio piece, not a client project
- Better to ship it polished in April than rushed in March

---

## Resources & References
- Go documentation: https://go.dev/doc/
- PostgreSQL best practices: https://wiki.postgresql.org/wiki/Don't_Do_This
- WebSocket protocol: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- React docs: https://react.dev/

---

**Last Updated:** January 28, 2026