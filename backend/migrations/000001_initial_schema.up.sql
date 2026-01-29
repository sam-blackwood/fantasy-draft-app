-- Create events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    max_picks_per_team INTEGER NOT NULL DEFAULT 6,
    max_teams_per_player INTEGER NOT NULL DEFAULT 1,
    stipulations JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('professional', 'amateur')),
    country VARCHAR(100) NOT NULL
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create draft_results table
CREATE TABLE draft_results (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    pick_number INTEGER NOT NULL,
    round INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id, player_id)
);

-- Create indexes for performance
CREATE INDEX idx_draft_results_pick_number ON draft_results(event_id, pick_number);
CREATE INDEX idx_draft_results_event_user ON draft_results(event_id, user_id);
CREATE INDEX idx_draft_results_event_player ON draft_results(event_id, player_id);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_country ON players(country);
