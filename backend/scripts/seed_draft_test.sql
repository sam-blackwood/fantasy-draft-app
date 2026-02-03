-- Seed script for draft testing
-- Resets draft results and event_players, then seeds fresh data

-- Clean up existing draft data
DELETE FROM draft_results;
DELETE FROM event_players;

-- Reset event status
UPDATE events SET status = 'not_started', started_at = NULL, completed_at = NULL WHERE id = 1;

-- Add players 1-10 to event 1
INSERT INTO event_players (event_id, player_id) VALUES
    (1, 1),  -- Tiger Woods
    (1, 2),  -- Rory McIlroy
    (1, 3),  -- Jon Rahm
    (1, 4),  -- Scottie Scheffler
    (1, 5),  -- Brooks Koepka
    (1, 6),  -- Viktor Hovland
    (1, 7),  -- Xander Schauffele
    (1, 8),  -- Patrick Cantlay
    (1, 9),  -- Collin Morikawa
    (1, 10); -- Justin Thomas

-- Verify the seed
SELECT 'Event Players:' as info;
SELECT ep.event_id, p.id as player_id, p.first_name, p.last_name
FROM event_players ep
JOIN players p ON ep.player_id = p.id
WHERE ep.event_id = 1
ORDER BY p.id;

SELECT 'Event Status:' as info;
SELECT id, name, status FROM events WHERE id = 1;

SELECT 'Users:' as info;
SELECT id, username FROM users;
