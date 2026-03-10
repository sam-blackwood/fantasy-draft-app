-- Seed: The Players Championship 2026
-- Creates a new event instance and links the field from the global players table.
-- Usage: ./scripts/db.sh new-event seed_players_championship_2026.sql <passkey>

BEGIN;

-- Create the event
INSERT INTO events (name, max_picks_per_team, max_teams_per_player, status, passkey, event_date, stipulations)
VALUES ('The Players Championship 2026', 6, 1, 'not_started', :passkey, '2026-03-12 00:00:00-05'::timestamptz, '{"tournament": "The Players", "year": 2026}'::jsonb)
RETURNING id AS new_event_id;

-- Link players to the event by name
-- Uses a CTE to capture the new event ID
WITH new_event AS (
    SELECT id FROM events
    WHERE name = 'The Players Championship 2026'
    ORDER BY id DESC LIMIT 1
)
INSERT INTO event_players (event_id, player_id)
SELECT new_event.id, p.id
FROM new_event, players p
WHERE (p.first_name, p.last_name) IN (
    ('Scottie', 'Scheffler'),
    ('Rory', 'McIlroy'),
    ('Tommy', 'Fleetwood'),
    ('Xander', 'Schauffele'),
    ('Russell', 'Henley'),
    ('Hideki', 'Matsuyama'),
    ('Matt', 'Fitzpatrick'),
    ('Si Woo', 'Kim'),
    ('Robert', 'MacIntyre'),
    ('Ben', 'Griffin'),
    ('Cameron', 'Young'),
    ('Jake', 'Knapp'),
    ('Harris', 'English'),
    ('Patrick', 'Cantlay'),
    ('Collin', 'Morikawa'),
    ('Sam', 'Burns'),
    ('Maverick', 'McNealy'),
    ('Shane', 'Lowry'),
    ('Rickie', 'Fowler'),
    ('J.J.', 'Spaun'),
    ('Viktor', 'Hovland'),
    ('Ludvig', 'Aberg'),
    ('Kurt', 'Kitayama'),
    ('Jacob', 'Bridgeman'),
    ('Justin', 'Thomas'),
    ('Chris', 'Gotterup'),
    ('Ryan', 'Gerard'),
    ('Min Woo', 'Lee'),
    ('Harry', 'Hall'),
    ('Akshay', 'Bhatia'),
    ('Keegan', 'Bradley'),
    ('Justin', 'Rose'),
    ('Rasmus', 'Hojgaard'),
    ('Nick', 'Taylor'),
    ('Jason', 'Day'),
    ('Sepp', 'Straka'),
    ('Nicolai', 'Hojgaard'),
    ('Jordan', 'Spieth'),
    ('Taylor', 'Pendrith'),
    ('Christiaan', 'Bezuidenhout'),
    ('Matt', 'McCarty'),
    ('Sam', 'Stevens'),
    ('J.T.', 'Poston'),
    ('Ryan', 'Fox'),
    ('Corey', 'Conners'),
    ('Thorbjorn', 'Olesen'),
    ('Max', 'Greyserman'),
    ('Max', 'McGreevy'),
    ('Sami', 'Valimaki'),
    ('Aaron', 'Rai'),
    ('Denny', 'McCarthy'),
    ('Mac', 'Meissner'),
    ('Patrick', 'Rodgers'),
    ('Keith', 'Mitchell'),
    ('Michael', 'Thorbjornsen'),
    ('Johnny', 'Keefer'),
    ('Alex', 'Smalley'),
    ('Chris', 'Kirk'),
    ('Davis', 'Thompson'),
    ('Daniel', 'Berger'),
    ('Wyndham', 'Clark'),
    ('Nico', 'Echavarria'),
    ('Marco', 'Penge'),
    ('Ryo', 'Hisatsune'),
    ('Michael', 'Kim'),
    ('Lucas', 'Glover'),
    ('Brian', 'Harman'),
    ('Rico', 'Hoey'),
    ('Vince', 'Whaley'),
    ('Michael', 'Brennan'),
    ('Tony', 'Finau'),
    ('Andrew', 'Novak'),
    ('Kevin', 'Roy'),
    ('Mackenzie', 'Hughes'),
    ('Stephan', 'Jaeger'),
    ('Garrick', 'Higgo'),
    ('Takumi', 'Kanaya'),
    ('Emiliano', 'Grillo'),
    ('Kevin', 'Yu'),
    ('Eric', 'Cole'),
    ('Bud', 'Cauley'),
    ('Sungjae', 'Im'),
    ('Chad', 'Ramey'),
    ('Lee', 'Hodges'),
    ('Gary', 'Woodland'),
    ('Tom', 'Hoge'),
    ('Chandler', 'Phillips'),
    ('Steven', 'Fisk'),
    ('Brooks', 'Koepka'),
    ('Aldrich', 'Potgieter'),
    ('Mark', 'Hubbard'),
    ('Matti', 'Schmid'),
    ('William', 'Mouw'),
    ('Karl', 'Vilips'),
    ('Jhonattan', 'Vegas'),
    ('Erik', 'van Rooyen'),
    ('Davis', 'Riley'),
    ('Danny', 'Walker'),
    ('Brian', 'Campbell'),
    ('Adam', 'Schenk'),
    ('Cameron', 'Davis'),
    ('Joe', 'Highsmith'),
    ('Max', 'Homa'),
    ('Kristoffer', 'Reitan'),
    ('Alex', 'Noren'),
    ('Ricky', 'Castillo'),
    ('Jordan', 'Smith'),
    ('Haotong', 'Li'),
    ('Zecheng', 'Dou'),
    ('Seamus', 'Power'),
    ('Patton', 'Kizzire'),
    ('Andrew', 'Putnam'),
    ('Joel', 'Dahmen'),
    ('Taylor', 'Moore'),
    ('Pierceson', 'Coody'),
    ('Adam', 'Scott'),
    ('Sahith', 'Theegala'),
    ('Austin', 'Smotherman'),
    ('S.H.', 'Kim'),
    ('Matthieu', 'Pavon'),
    ('Zach', 'Bauchou'),
    ('Sudarshan', 'Yellamaraju'),
    ('A.J.', 'Ewart')
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
