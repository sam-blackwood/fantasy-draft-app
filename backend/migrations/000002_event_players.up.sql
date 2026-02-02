-- Create event_players join table
CREATE TABLE event_players (
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_id, player_id)
);

-- Create index for querying players by event
CREATE INDEX idx_event_players_event ON event_players(event_id);
