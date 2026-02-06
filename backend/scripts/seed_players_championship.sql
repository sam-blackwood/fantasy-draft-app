-- Seed script for The Players Championship 2026 event
-- Run AFTER seed_players.sql
-- Run with: psql postgres://localhost:5432/fantasy_draft_dev?sslmode=disable -f scripts/seed_players_championship.sql

-- Clear existing event data
TRUNCATE TABLE events CASCADE;

-- Create The Players 2026 event
INSERT INTO events (name, max_picks_per_team, max_teams_per_player, status, passkey, stipulations)
VALUES ('The Players Championship 2026', 6, 1, 'not_started', 'dye', '{"tournament": "The Players", "year": 2026}'::jsonb);

-- Link all players to the event
INSERT INTO event_players (event_id, player_id)
SELECT
    (SELECT id FROM events WHERE name = 'The Players Championship 2026'),
    id
FROM players;

-- Verify
SELECT 'Event created:' as info, name, status FROM events;
SELECT 'Players linked:' as info, COUNT(*) as count FROM event_players;
