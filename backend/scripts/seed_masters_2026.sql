-- Seed: The Masters 2026
-- Creates a new event instance and links the field from the global players table.
-- Usage: ./scripts/db.sh new-event seed_masters_2026.sql <passkey>

BEGIN;

-- Create the event
INSERT INTO events (name, max_picks_per_team, max_teams_per_player, status, passkey, event_date, stipulations)
VALUES ('The Masters 2026', 6, 1, 'not_started', :passkey, '2026-04-10 00:00:00-04'::timestamptz, '{"tournament": "The Masters", "year": 2026}'::jsonb)
RETURNING id AS new_event_id;

-- Link players to the event by name
-- Uses a CTE to capture the new event ID
WITH new_event AS (
    SELECT id FROM events
    WHERE name = 'The Masters 2026'
    ORDER BY id DESC LIMIT 1
)
INSERT INTO event_players (event_id, player_id)
SELECT new_event.id, p.id
FROM new_event, players p
WHERE (p.first_name, p.last_name) IN (
    ('Ludvig', 'Aberg'),
    ('Daniel', 'Berger'),
    ('Akshay', 'Bhatia'),
    ('Keegan', 'Bradley'),
    ('Michael', 'Brennan'),
    ('Jacob', 'Bridgeman'),
    ('Sam', 'Burns'),
    ('Angel', 'Cabrera'),
    ('Brian', 'Campbell'),
    ('Patrick', 'Cantlay'),
    ('Wyndham', 'Clark'),
    ('Corey', 'Conners'),
    ('Fred', 'Couples'),
    ('Jason', 'Day'),
    ('Bryson', 'DeChambeau'),
    ('Nico', 'Echavarria'),
    ('Harris', 'English'),
    ('Ethan', 'Fang'),
    ('Matt', 'Fitzpatrick'),
    ('Tommy', 'Fleetwood'),
    ('Ryan', 'Fox'),
    ('Sergio', 'Garcia'),
    ('Ryan', 'Gerard'),
    ('Chris', 'Gotterup'),
    ('Max', 'Greyserman'),
    ('Ben', 'Griffin'),
    ('Harry', 'Hall'),
    ('Brian', 'Harman'),
    ('Tyrrell', 'Hatton'),
    ('Russell', 'Henley'),
    ('Jackson', 'Herrington'),
    ('Nicolai', 'Hojgaard'),
    ('Rasmus', 'Hojgaard'),
    ('Brandon', 'Holtz'),
    ('Max', 'Homa'),
    ('Viktor', 'Hovland'),
    ('Mason', 'Howell'),
    ('Sungjae', 'Im'),
    ('Casey', 'Jarvis'),
    ('Dustin', 'Johnson'),
    ('Zach', 'Johnson'),
    ('Naoyuki', 'Kataoka'),
    ('Johnny', 'Keefer'),
    ('Michael', 'Kim'),
    ('Si Woo', 'Kim'),
    ('Kurt', 'Kitayama'),
    ('Jake', 'Knapp'),
    ('Brooks', 'Koepka'),
    ('Fifa', 'Laopakdee'),
    ('Min Woo', 'Lee'),
    ('Haotong', 'Li'),
    ('Shane', 'Lowry'),
    ('Robert', 'MacIntyre'),
    ('Hideki', 'Matsuyama'),
    ('Matt', 'McCarty'),
    ('Rory', 'McIlroy'),
    ('Tom', 'McKibbin'),
    ('Maverick', 'McNealy'),
    ('Collin', 'Morikawa'),
    ('Rasmus', 'Neergaard-Petersen'),
    ('Alex', 'Noren'),
    ('Andrew', 'Novak'),
    ('Jose Maria', 'Olazabal'),
    ('Carlos', 'Ortiz'),
    ('Marco', 'Penge'),
    ('Aldrich', 'Potgieter'),
    ('Mateo', 'Pulcini'),
    ('Jon', 'Rahm'),
    ('Aaron', 'Rai'),
    ('Patrick', 'Reed'),
    ('Kristoffer', 'Reitan'),
    ('Davis', 'Riley'),
    ('Justin', 'Rose'),
    ('Xander', 'Schauffele'),
    ('Scottie', 'Scheffler'),
    ('Charl', 'Schwartzel'),
    ('Adam', 'Scott'),
    ('Vijay', 'Singh'),
    ('Cameron', 'Smith'),
    ('J.J.', 'Spaun'),
    ('Jordan', 'Spieth'),
    ('Sam', 'Stevens'),
    ('Sepp', 'Straka'),
    ('Nick', 'Taylor'),
    ('Justin', 'Thomas'),
    ('Sami', 'Valimaki'),
    ('Bubba', 'Watson'),
    ('Mike', 'Weir'),
    ('Danny', 'Willett'),
    ('Gary', 'Woodland'),
    ('Cameron', 'Young')
);

COMMIT;

-- Summary
\echo ''
\echo '=== New Event Created ==='
SELECT id, name, passkey, max_picks_per_team, status
FROM events ORDER BY id DESC LIMIT 1;

SELECT COUNT(*) AS players_linked
FROM event_players
WHERE event_id = (SELECT id FROM events ORDER BY id DESC LIMIT 1);
