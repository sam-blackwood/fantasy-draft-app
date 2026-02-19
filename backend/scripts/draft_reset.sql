-- Draft Reset: Clear draft results and reset event status
-- Keeps users, players, and event_players intact
-- Usage: psql $DATABASE_URL -f scripts/draft_reset.sql

BEGIN;

-- Clear all draft picks
DELETE FROM draft_results;

-- Reset all events back to not_started
UPDATE events
SET status = 'not_started',
    started_at = NULL,
    completed_at = NULL;

COMMIT;

-- Summary
SELECT 'Draft reset complete' AS status;
SELECT 'Events:' AS info, id, name, status FROM events;
SELECT 'Users still registered:' AS info, id, username, event_id FROM users ORDER BY id;
SELECT 'Draft results remaining:' AS info, COUNT(*) AS count FROM draft_results;
