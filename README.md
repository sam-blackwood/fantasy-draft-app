# Fantasy Draft App

Real-time fantasy draft application with WebSocket support, built with Go, React, and PostgreSQL.

Live at [clubhousedraft.com](https://clubhousedraft.com)

## Features

- **Real-time drafting** — WebSocket-powered live updates across all connected clients
- **Turn-based picks with timer** — Configurable turn timer with auto-advance
- **Auto-draft** — Automatically picks for absent users when their timer expires
- **Player board** — Search, filter by status (professional/amateur) and country, sort by various metrics
- **Team roster visibility** — View all teams and their drafted players in real-time
- **Draft configuration** — Max picks per team, configurable duplicate player rules (traditional or Ryder Cup style)
- **Password-protected rooms** — No user accounts needed, just a username and room passkey
- **Reconnection support** — Auto-reconnect with exponential backoff; resume via localStorage or re-entering username
- **Admin console API** — Full draft control via browser console (`window.draftAdmin`)
- **Light/dark mode** — Theme toggle with system preference detection
- **Mobile-responsive** — Works on desktop and mobile devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go, Chi (router), pgx + pgxpool (PostgreSQL driver) |
| Real-time | coder/websocket |
| Database | PostgreSQL |
| Migrations | golang-migrate/migrate |
| Frontend | React, Vite, TypeScript |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Infrastructure | AWS EC2 + RDS PostgreSQL, Caddy (reverse proxy + SSL) |

## Architecture

**Monorepo** with separate `backend/` and `frontend/` directories.

The app follows a **single-draft model** — one active draft at a time, which simplifies the WebSocket architecture since all connected clients participate in the same draft.

**User identity** is managed per-draft via username (no accounts required). The draft room is password-protected, and users reconnect via localStorage on the same device or by re-entering their username on a different device.

### Backend Layers

```
Handlers (HTTP) → Services (business logic) → Repositories (data access) → PostgreSQL
                   DraftService (WebSocket)
```

## Project Structure

```
├── backend/
│   ├── cmd/server/          # Entry point (main.go) and route definitions
│   ├── internal/
│   │   ├── database/        # Database connection and pool setup
│   │   ├── draft/           # WebSocket draft service, state machine, message types
│   │   ├── handlers/        # HTTP request handlers
│   │   ├── models/          # Data models
│   │   └── repository/      # Data access layer (SQL queries)
│   ├── migrations/          # SQL migration files (000001–000007)
│   └── scripts/             # db.sh, seed files, RUNBOOK
├── frontend/
│   ├── src/
│   │   ├── pages/           # HomePage, JoinPage, DraftRoom, CountdownPage
│   │   ├── components/      # PlayerList, TeamRoster, DraftResults, DraftTimer, Lobby, etc.
│   │   ├── hooks/           # Custom hooks (useDraftAdmin console API)
│   │   ├── store/           # Zustand state management
│   │   ├── api/             # API client
│   │   └── types/           # TypeScript types
│   └── ...
├── deploy.sh                # One-command deploy to EC2
├── DEPLOYMENT.md            # Infrastructure and deployment guide
├── PROJECT_PLAN.md          # Detailed project plan and decisions
└── CONTRACTS.md             # API contracts documentation
```

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 15+
- [golang-migrate CLI](https://github.com/golang-migrate/migrate) (for running migrations)

### Database Setup

```bash
# Create the database
createdb fantasy_draft_dev

# Run migrations
cd backend
migrate -path ./migrations -database "postgres://localhost:5432/fantasy_draft_dev?sslmode=disable" up

# Seed the players table
./scripts/db.sh seed
```

### Running the Backend

```bash
cd backend
go run ./cmd/server
# Server starts on :8080
```

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
# Vite dev server starts on :5173
```

## Database Management

The `backend/scripts/db.sh` script handles all database operations:

| Command | Description |
|---------|-------------|
| `seed` | Truncate all tables and populate the global players table |
| `new-event <file>` | Create a new event instance from a per-event seed file |
| `draft-reset` | Clear draft results and reset event status (keeps users/players) |
| `clear-users` | Delete all users and draft results, reset event status |
| `migrate-up` | Run pending migrations |
| `migrate-down` | Roll back the last migration |
| `fresh` | Drop all tables and re-run migrations from scratch |

Set `DATABASE_URL` to target a specific database (defaults to local dev).

## Admin Console API

The draft is controlled via browser console commands (no admin UI). Open the draft room page and use `window.draftAdmin`:

```js
draftAdmin.startDraft(pickOrder, totalRounds, timerDuration)  // Set draft order and start
draftAdmin.pause()          // Pause the draft
draftAdmin.resume()         // Resume the draft
draftAdmin.makePick(userID, playerID)  // Force a pick for an absent user
draftAdmin.autopick()       // Auto-pick for whoever's on the clock
draftAdmin.status()         // Inspect current draft state
draftAdmin.users()          // List connected users
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/ws/draft` | WebSocket connection for real-time draft |
| `GET` | `/events` | List all events |
| `GET` | `/events/{id}` | Get event details |
| `GET` | `/events/next` | Get next upcoming event |
| `POST` | `/events` | Create event |
| `PUT` | `/events/{id}` | Update event |
| `DELETE` | `/events/{id}` | Delete event |
| `GET` | `/players` | List all players |
| `GET` | `/players/{id}` | Get player details |
| `POST` | `/players` | Create player |
| `PUT` | `/players/{id}` | Update player |
| `DELETE` | `/players/{id}` | Delete player |
| `GET` | `/users` | List all users |
| `GET` | `/users/{id}` | Get user details |
| `POST` | `/users` | Create user |
| `PUT` | `/users/{id}` | Update user |
| `DELETE` | `/users/{id}` | Delete user |
| `GET` | `/events/{id}/users` | List users for an event |
| `GET` | `/events/{id}/players` | Get players for an event |
| `POST` | `/events/{id}/players` | Add players to an event |
| `DELETE` | `/events/{id}/players/{playerID}` | Remove player from event |
| `POST` | `/events/{id}/draft-room` | Create draft room |
| `GET` | `/events/{id}/draft-room` | Get draft room info |
| `POST` | `/events/join` | Join an event |

## Deployment

The app is deployed on AWS (EC2 + RDS PostgreSQL) behind Caddy for reverse proxying and automatic SSL.

```bash
./deploy.sh  # Builds, uploads, runs migrations, and restarts the service
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full infrastructure details, SSH access, and troubleshooting.

See [backend/scripts/RUNBOOK.md](backend/scripts/RUNBOOK.md) for production event management (seeding, creating events, managing the player pool).

## License

[MIT](LICENSE)
