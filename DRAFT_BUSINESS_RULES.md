# Draft Business Rules

**Last Updated:** January 29, 2026

This document defines the business logic and rules for the real-time draft system.

---

## Turn-Level State Machine

The draft operates on a turn-by-turn basis. Each turn progresses through the following states:

### States

1. **AWAITING_PICK** - The initial/main state for each turn
   - Timer is running
   - Waiting for the active user to make their pick
   - User may be connected or disconnected

2. **PROCESSING_PICK** - Validating and saving a user's selection
   - Check if player is available (not already drafted by this user, respects max_teams_per_player)
   - Validate draft stipulations (e.g., amateur requirement, country restrictions)
   - Save to database if valid

3. **PAUSED** - Admin has paused the draft
   - Timer is stopped
   - No picks can be made except by admin
   - All clients are notified of pause state

4. **AUTO_DRAFT_TRIGGERED** - Timer expired, executing auto-draft
   - Randomly select an available player (MVP implementation)
   - Mark pick as auto-drafted in database

5. **PICK_COMPLETE** - Transition state after successful pick
   - Broadcast pick to all connected clients
   - Check if draft is complete (all picks made)
   - Advance to next user's turn OR end draft

### State Transitions

```
AWAITING_PICK:
  ├─ User makes pick → PROCESSING_PICK
  ├─ Timer expires (no pick made) → AUTO_DRAFT_TRIGGERED
  └─ Admin pauses draft → PAUSED

PROCESSING_PICK:
  ├─ Validation fails → AWAITING_PICK (return to same user's turn, send error)
  └─ Pick is valid → PICK_COMPLETE

PAUSED:
  ├─ Admin resumes → AWAITING_PICK (timer resets to full duration)
  └─ Admin makes pick for user → PROCESSING_PICK

AUTO_DRAFT_TRIGGERED:
  └─ Random player selected → PICK_COMPLETE

PICK_COMPLETE:
  ├─ More picks remaining → AWAITING_PICK (advance to next user)
  └─ All picks complete → Update event status to "completed", end draft
```

---

## Timer Rules

### Standard Turn Timer
- Each turn has a configurable time limit (e.g., 60 seconds)
- Timer starts when turn begins (enters AWAITING_PICK state)
- Timer continues running even if user disconnects
- When timer reaches zero → AUTO_DRAFT_TRIGGERED

### Pause Behavior
- When admin pauses: timer stops, current time remaining is saved
- When admin resumes: timer continues from saved remaining time
- **Example:** If paused with 25 seconds left, resume starts timer at 25 seconds
- **Rationale:** Fair to users, intuitive behavior (pause means "stop", not "reset")

### Timer and Reconnection
- If user disconnects during their turn, timer keeps running
- User can reconnect and make pick before timer expires
- No timer penalty for disconnection/reconnection

---

## User Connection States

Users can be in one of two connection states during their turn:

### Connected
- User has active WebSocket connection
- Can make picks normally
- Timer is running

### Disconnected
- User's WebSocket connection dropped
- Timer continues running (user has until expiration to reconnect)
- Other users see "User X's turn (disconnected)" indicator
- User can reconnect and make pick if timer hasn't expired
- If timer expires while disconnected → AUTO_DRAFT_TRIGGERED

### Reconnection Flow
1. User reconnects via WebSocket
2. Server sends current draft state (whose turn, time remaining, all picks made so far)
3. If it's their turn, they can immediately make a pick
4. If not their turn, they wait and see real-time updates

---

## Admin Powers

Admins have special privileges during the draft:

### Pause/Resume
- Admin can pause the draft at any time during any user's turn
- When paused:
  - Timer stops
  - Regular users cannot make picks
  - Draft is in PAUSED state
- Admin can resume → returns to AWAITING_PICK with full timer duration

### Make Picks on Behalf of Users
- While draft is paused, admin can make a pick for the current user
- **Primary use case:** Manual priority queue implementation
  - Users send their priority-ranked player lists to admin before draft
  - When it's their turn, admin pauses and picks the highest available player from their list
  - If user provided no list → admin lets auto-draft randomize

### Reset Draft (Future)
- Not implemented in MVP
- Would allow admin to restart draft from beginning

---

## Auto-Draft Rules

### When Auto-Draft Triggers
- Timer expires (reaches zero) during AWAITING_PICK state
- User has not made a pick

### Auto-Draft Strategy (MVP)
For MVP, only **random selection** is implemented:
- Select a random player from all available players
- "Available" means:
  - Player hasn't been drafted by current user yet
  - Player respects `max_teams_per_player` limit
  - Player meets any draft stipulations (if configured)

### Priority Queue (Manual Process - MVP)
Priority queue is **not automated** in MVP. Instead:
1. Users send ranked player preferences to admin before draft (via email, chat, etc.)
2. Admin manually pauses draft when it's that user's turn
3. Admin makes the pick on behalf of user using their priority list
4. If no priority list provided → let timer expire and random auto-draft occurs

### Future Enhancement (Post-MVP)
- Add `auto_draft_preferences` table to database
- Users submit ranked preferences via frontend before draft starts
- When auto-draft triggers, check for priority queue:
  - If exists: pick highest-ranked available player
  - If none exist: fall back to random selection
- Mark picks as `is_auto_drafted: true` with strategy used

---

## Pick Validation Rules

When a user attempts to make a pick, validate:

### 1. Turn Validation
- Is it currently this user's turn?
- Is draft in AWAITING_PICK state (not PAUSED, PROCESSING, etc.)?

### 2. Player Availability
- **User hasn't already drafted this player** (hard rule, not configurable)
- **Player hasn't exceeded max_teams_per_player limit**
  - Traditional draft: `max_teams_per_player = 1` (player can only be drafted once)
  - Ryder Cup style: `max_teams_per_player = 2+` (multiple teams can draft same player)

### 3. Draft Stipulations (if configured for event)
- **Amateur requirement:** If user must draft an amateur, verify `player.status = 'amateur'`
- **Country restriction:** If user must draft from specific country, verify `player.country` matches
- Stipulations stored as JSONB in `events.stipulations` field

### 4. Pick Limit
- User hasn't exceeded `max_picks_per_team` for this event

### Validation Failure Behavior
- Return to AWAITING_PICK state (same user's turn)
- Send error message to user via WebSocket
- Timer continues from where it was (no reset, no penalty)

---

## Draft Completion

The draft ends when **all required picks have been made**.

### Completion Check (in PICK_COMPLETE state)
```
total_required_picks = num_teams * max_picks_per_team
total_picks_made = count(draft_results for this event)

if total_picks_made >= total_required_picks:
  → Update event.status to "completed"
  → Set event.completed_at timestamp
  → Broadcast "draft_complete" message to all clients
  → Close draft room
```

### Draft Order (Snake Draft)
- Draft operates in rounds with **snake order** (default)
- Each round: every team gets one pick
- Odd rounds (1, 3, 5...): forward order
- Even rounds (2, 4, 6...): reverse order

**Example for 6 teams, 6 picks each:**
- Round 1: Team 1, Team 2, Team 3, Team 4, Team 5, Team 6
- Round 2: Team 6, Team 5, Team 4, Team 3, Team 2, Team 1 (reverse!)
- Round 3: Team 1, Team 2, Team 3, Team 4, Team 5, Team 6
- Round 4: Team 6, Team 5, Team 4, Team 3, Team 2, Team 1
- ... (alternates each round)

**Rationale:** Snake draft is fairer - Team 6 gets first pick in Round 2 to compensate for picking last in Round 1.

### Linear Draft Order (Future Enhancement)
- Alternative mode: same order every round (Team 1, 2, 3... repeats)
- Not implemented in MVP (snake only)

---

## Concurrency and Race Conditions

### Pick Submission Race Condition
**Scenario:** Two users try to pick the same player simultaneously in different turns.

**Prevention:**
- Use database-level unique constraint: `UNIQUE(event_id, user_id, player_id)` on `draft_results` table
- Check available player count before allowing pick
- Validate pick within a database transaction

### Timer Expiration Race Condition
**Scenario:** User submits pick at exact moment timer expires (both auto-draft and manual pick triggered)

**Prevention:**
- Check current state before processing pick
- If state is AUTO_DRAFT_TRIGGERED or PICK_COMPLETE, reject manual pick attempt
- Use mutex/lock on draft room state changes

---

## WebSocket Message Types

### Client → Server
- `join_draft` - User joins draft room
- `make_pick` - User selects a player
- `submit_preferences` - (Future) User submits auto-draft priority queue
- `pause_draft` - Admin pauses draft
- `resume_draft` - Admin resumes draft
- `admin_make_pick` - Admin makes pick on behalf of user

### Server → Client
- `draft_state` - Full draft state (on join/reconnect)
- `turn_change` - New user's turn started
- `pick_made` - Pick was successfully made (broadcast to all)
- `timer_update` - Timer tick (every second)
- `draft_paused` - Draft was paused by admin
- `draft_resumed` - Draft was resumed by admin
- `draft_complete` - All picks made, draft ended
- `error` - Validation error or other issue
- `user_connected` - User joined/reconnected
- `user_disconnected` - User left/disconnected

---

## Edge Cases

### User Never Connects
- If user never joins draft room when their turn comes → timer runs and auto-draft triggers
- Draft continues normally

### All Users Disconnect
- Draft room state persists in server memory
- Timers keep running
- When anyone reconnects, they receive full current state

### Server Restart During Draft
- **MVP behavior:** Draft state is lost (in-memory only)
- **Future enhancement:** Persist draft state to database/Redis for recovery

### Admin Disconnects While Draft is Paused
- Draft remains paused indefinitely
- Admin must reconnect to resume
- **Future:** Add timeout to auto-resume after X minutes

---

## Database Schema Requirements

### Events Table (existing)
- `max_picks_per_team` - How many picks each team makes
- `max_teams_per_player` - How many teams can draft the same player (1 = traditional, 2+ = Ryder Cup)
- `stipulations` (JSONB) - Draft rules like amateur requirements, country restrictions
- `status` - 'not_started' | 'in_progress' | 'completed'
- `timer_duration` (Future) - Seconds per turn

### Draft Results Table (existing)
- `event_id`, `user_id`, `player_id` - The pick
- `pick_number` - Overall pick number (1, 2, 3...)
- `round` - Which round (1-based)
- `is_auto_drafted` (Future) - Boolean flag if this was auto-drafted
- `created_at` - Timestamp of pick

### Auto Draft Preferences Table (Future)
```sql
CREATE TABLE auto_draft_preferences (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    priority_rank INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id, player_id),
    UNIQUE(event_id, user_id, priority_rank)
);
```

---

## MVP Simplifications

For the initial MVP, the following are simplified or deferred:

1. **Auto-draft priority queue:** Manual admin process, not automated
2. **Configurable draft order:** Snake draft only (cannot switch to linear mode)
3. **Timer duration config:** Hardcoded (e.g., 60 seconds per turn)
4. **Multiple admins:** Single admin assumed, no role enforcement
5. **Draft state persistence:** In-memory only, lost on server restart

These can be enhanced post-MVP based on user feedback.

---

## Success Criteria

A successful draft implementation must:

- ✅ Support 12 concurrent users with <100ms latency
- ✅ Handle disconnects/reconnects without losing state
- ✅ Prevent race conditions (no duplicate picks that violate rules)
- ✅ Enforce all validation rules consistently
- ✅ Complete a full 12-team, 6-picks-each draft without errors
- ✅ Provide real-time updates to all connected clients
- ✅ Allow admin to pause and make picks on behalf of users
