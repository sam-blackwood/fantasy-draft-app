# API Contracts

This document defines the contracts between the frontend client and backend server.

## HTTP REST Endpoints

Base URL: `http://localhost:8080`

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List all events |
| GET | `/events/{id}` | Get a single event |
| POST | `/events` | Create a new event |
| PUT | `/events/{id}` | Update an event |
| DELETE | `/events/{id}` | Delete an event |

**Event Object:**
```json
{
  "id": 1,
  "name": "2024 Fantasy Draft",
  "max_picks_per_team": 5,
  "max_teams_per_player": 1,
  "stipulations": {},
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z",
  "started_at": null,
  "completed_at": null
}
```

### Players

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/players` | List all players |
| GET | `/players/{id}` | Get a single player |
| POST | `/players` | Create a new player |
| PUT | `/players/{id}` | Update a player |
| DELETE | `/players/{id}` | Delete a player |

**Player Object:**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "status": "active",
  "country": "USA"
}
```

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/{id}` | Get a single user |
| POST | `/users` | Create a new user |
| PUT | `/users/{id}` | Update a user |
| DELETE | `/users/{id}` | Delete a user |

**User Object:**
```json
{
  "id": 1,
  "username": "team_alpha",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server health |

---

## WebSocket Connection

**Endpoint:** `ws://localhost:8080/ws/draft`

All messages are JSON objects with a `type` field indicating the message type.

---

## WebSocket Messages: Client to Server

### `start_draft`

Starts a new draft. Should be sent by an admin user.

```json
{
  "type": "start_draft",
  "eventID": 1,
  "pickOrder": [1, 2, 3, 4],
  "totalRounds": 5,
  "timerDuration": 60,
  "availablePlayers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `eventID` | number | ID of the event to start |
| `pickOrder` | number[] | Array of user IDs in draft order |
| `totalRounds` | number | Number of rounds in the draft |
| `timerDuration` | number | Seconds each user has to make a pick |
| `availablePlayers` | number[] | Array of player IDs available to draft |

### `make_pick`

Makes a pick during the draft.

```json
{
  "type": "make_pick",
  "userID": 1,
  "playerID": 5
}
```

| Field | Type | Description |
|-------|------|-------------|
| `userID` | number | ID of the user making the pick |
| `playerID` | number | ID of the player being drafted |

---

## WebSocket Messages: Server to Client

### `draft_started`

Broadcast when a draft begins.

```json
{
  "type": "draft_started",
  "eventID": 1,
  "currentTurn": 1,
  "roundNumber": 1,
  "turnDeadline": 1704067260
}
```

| Field | Type | Description |
|-------|------|-------------|
| `eventID` | number | ID of the event |
| `currentTurn` | number | User ID whose turn it is |
| `roundNumber` | number | Current round number |
| `turnDeadline` | number | Unix timestamp when the turn expires |

### `pick_made`

Broadcast when a pick is made (manually or via auto-draft).

```json
{
  "type": "pick_made",
  "userID": 1,
  "playerID": 5,
  "round": 1,
  "autoDraft": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `userID` | number | ID of the user who made the pick |
| `playerID` | number | ID of the player drafted |
| `round` | number | Round in which the pick was made |
| `autoDraft` | boolean | `true` if pick was auto-drafted due to timer expiry |

### `turn_changed`

Broadcast when the turn advances to the next user.

```json
{
  "type": "turn_changed",
  "currentTurn": 2,
  "roundNumber": 1,
  "turnDeadline": 1704067320
}
```

| Field | Type | Description |
|-------|------|-------------|
| `currentTurn` | number | User ID whose turn it is now |
| `roundNumber` | number | Current round number |
| `turnDeadline` | number | Unix timestamp when the turn expires |

### `draft_completed`

Broadcast when the draft finishes.

```json
{
  "type": "draft_completed",
  "eventID": 1,
  "totalPicks": 20,
  "totalRounds": 5
}
```

| Field | Type | Description |
|-------|------|-------------|
| `eventID` | number | ID of the completed event |
| `totalPicks` | number | Total number of picks made |
| `totalRounds` | number | Total rounds in the draft |

### `error`

Sent to a single client when an error occurs.

```json
{
  "type": "error",
  "error": "not your turn"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `error` | string | Error message describing what went wrong |

---

## Draft Flow

1. Clients connect to `/ws/draft`
2. Admin sends `start_draft` with configuration
3. Server broadcasts `draft_started` to all clients
4. Current user sends `make_pick` before timer expires
5. Server broadcasts `pick_made` and `turn_changed`
6. If timer expires, server auto-drafts and broadcasts `pick_made` with `autoDraft: true`
7. Repeat until all rounds complete
8. Server broadcasts `draft_completed`

## Snake Draft Order

The draft uses snake ordering:
- Round 1: User 1 -> 2 -> 3 -> 4
- Round 2: User 4 -> 3 -> 2 -> 1
- Round 3: User 1 -> 2 -> 3 -> 4
- (pattern continues...)
