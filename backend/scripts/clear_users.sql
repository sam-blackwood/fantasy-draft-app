-- Clear Users: Delete all users and their draft results
-- Usage: psql $DATABASE_URL -f scripts/clear_users.sql

BEGIN;

DELETE FROM draft_results;
DELETE FROM users;

UPDATE events
SET status = 'not_started',
    started_at = NULL,
    completed_at = NULL;

COMMIT;

SELECT 'Users cleared' AS status;
SELECT 'Users remaining:' AS info, COUNT(*) AS count FROM users;
