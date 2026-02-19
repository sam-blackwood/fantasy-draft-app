-- Full Seed: Clean slate with Players Championship 2026 data
-- Wipes ALL data (including users) and re-seeds players + event
-- Usage: psql $DATABASE_URL -f scripts/seed_all.sql

BEGIN;

-- Nuke everything (order matters for foreign keys, CASCADE handles the rest)
TRUNCATE TABLE draft_results, event_players, users, players, events RESTART IDENTITY CASCADE;

-- Insert all 119 players from The Players Championship 2026 field
INSERT INTO players (first_name, last_name, status, country_code) VALUES
    ('Scottie', 'Scheffler', 'professional', 'USA'),
    ('Tommy', 'Fleetwood', 'professional', 'ENG'),
    ('Rory', 'McIlroy', 'professional', 'NIR'),
    ('Russell', 'Henley', 'professional', 'USA'),
    ('Ben', 'Griffin', 'professional', 'USA'),
    ('Xander', 'Schauffele', 'professional', 'USA'),
    ('Si Woo', 'Kim', 'professional', 'KOR'),
    ('Robert', 'MacIntyre', 'professional', 'SCO'),
    ('Cameron', 'Young', 'professional', 'USA'),
    ('J.J.', 'Spaun', 'professional', 'USA'),
    ('Sam', 'Burns', 'professional', 'USA'),
    ('Hideki', 'Matsuyama', 'professional', 'JPN'),
    ('Matt', 'Fitzpatrick', 'professional', 'ENG'),
    ('Viktor', 'Hovland', 'professional', 'NOR'),
    ('Patrick', 'Cantlay', 'professional', 'USA'),
    ('Harry', 'Hall', 'professional', 'ENG'),
    ('Harris', 'English', 'professional', 'USA'),
    ('Maverick', 'McNealy', 'professional', 'USA'),
    ('Justin', 'Rose', 'professional', 'ENG'),
    ('Justin', 'Thomas', 'professional', 'USA'),
    ('Keegan', 'Bradley', 'professional', 'USA'),
    ('Ryan', 'Gerard', 'professional', 'USA'),
    ('Rickie', 'Fowler', 'professional', 'USA'),
    ('Ludvig', 'Aberg', 'professional', 'SWE'),
    ('Jason', 'Day', 'professional', 'AUS'),
    ('Shane', 'Lowry', 'professional', 'IRL'),
    ('Chris', 'Gotterup', 'professional', 'USA'),
    ('Corey', 'Conners', 'professional', 'CAN'),
    ('Rasmus', 'Hojgaard', 'professional', 'DEN'),
    ('Collin', 'Morikawa', 'professional', 'USA'),
    ('Tyrrell', 'Hatton', 'professional', 'ENG'),
    ('Sepp', 'Straka', 'professional', 'AUT'),
    ('Billy', 'Horschel', 'professional', 'USA'),
    ('Sungjae', 'Im', 'professional', 'KOR'),
    ('Tony', 'Finau', 'professional', 'USA'),
    ('Sahith', 'Theegala', 'professional', 'USA'),
    ('Adam', 'Scott', 'professional', 'AUS'),
    ('Erik', 'van Rooyen', 'professional', 'RSA'),
    ('Brian', 'Harman', 'professional', 'USA'),
    ('Taylor', 'Pendrith', 'professional', 'CAN'),
    ('Lee', 'Hodges', 'professional', 'USA'),
    ('Aaron', 'Rai', 'professional', 'ENG'),
    ('Wyndham', 'Clark', 'professional', 'USA'),
    ('Lucas', 'Glover', 'professional', 'USA'),
    ('Max', 'Homa', 'professional', 'USA'),
    ('Byeong Hun', 'An', 'professional', 'KOR'),
    ('Jordan', 'Spieth', 'professional', 'USA'),
    ('Akshay', 'Bhatia', 'professional', 'USA'),
    ('Kurt', 'Kitayama', 'professional', 'USA'),
    ('Adam', 'Hadwin', 'professional', 'CAN'),
    ('Max', 'Greyserman', 'professional', 'USA'),
    ('Denny', 'McCarthy', 'professional', 'USA'),
    ('Nick', 'Taylor', 'professional', 'CAN'),
    ('Tom', 'Kim', 'professional', 'KOR'),
    ('Andrew', 'Novak', 'professional', 'USA'),
    ('Jake', 'Knapp', 'professional', 'USA'),
    ('Davis', 'Thompson', 'professional', 'USA'),
    ('Austin', 'Eckroat', 'professional', 'USA'),
    ('Mackenzie', 'Hughes', 'professional', 'CAN'),
    ('Thomas', 'Detry', 'professional', 'BEL'),
    ('Taylor', 'Montgomery', 'professional', 'USA'),
    ('Patrick', 'Fishburn', 'professional', 'USA'),
    ('Taylor', 'Moore', 'professional', 'USA'),
    ('Nick', 'Dunlap', 'professional', 'USA'),
    ('Rico', 'Hoey', 'professional', 'PHI'),
    ('Chris', 'Kirk', 'professional', 'USA'),
    ('Will', 'Zalatoris', 'professional', 'USA'),
    ('Alex', 'Noren', 'professional', 'SWE'),
    ('Eric', 'Cole', 'professional', 'USA'),
    ('Tom', 'Hoge', 'professional', 'USA'),
    ('Luke', 'Clanton', 'professional', 'USA'),
    ('Davis', 'Riley', 'professional', 'USA'),
    ('Ben', 'Kohles', 'professional', 'USA'),
    ('Beau', 'Hossler', 'professional', 'USA'),
    ('J.T.', 'Poston', 'professional', 'USA'),
    ('Keith', 'Mitchell', 'professional', 'USA'),
    ('Matt', 'Kuchar', 'professional', 'USA'),
    ('Christiaan', 'Bezuidenhout', 'professional', 'RSA'),
    ('Stephan', 'Jaeger', 'professional', 'GER'),
    ('Mac', 'Meissner', 'professional', 'USA'),
    ('Min Woo', 'Lee', 'professional', 'AUS'),
    ('Webb', 'Simpson', 'professional', 'USA'),
    ('Nico', 'Echavarria', 'professional', 'COL'),
    ('Emiliano', 'Grillo', 'professional', 'ARG'),
    ('Mark', 'Hubbard', 'professional', 'USA'),
    ('Kevin', 'Yu', 'professional', 'TPE'),
    ('Peter', 'Malnati', 'professional', 'USA'),
    ('Michael', 'Thorbjornsen', 'professional', 'USA'),
    ('Doug', 'Ghim', 'professional', 'USA'),
    ('Cameron', 'Davis', 'professional', 'AUS'),
    ('Justin', 'Lower', 'professional', 'USA'),
    ('Harry', 'Higgs', 'professional', 'USA'),
    ('S.H.', 'Kim', 'professional', 'KOR'),
    ('Patton', 'Kizzire', 'professional', 'USA'),
    ('Victor', 'Perez', 'professional', 'FRA'),
    ('K.H.', 'Lee', 'professional', 'KOR'),
    ('Andrew', 'Putnam', 'professional', 'USA'),
    ('Charley', 'Hoffman', 'professional', 'USA'),
    ('Trace', 'Crowe', 'professional', 'USA'),
    ('Adam', 'Svensson', 'professional', 'CAN'),
    ('Hayden', 'Springer', 'professional', 'USA'),
    ('Ben', 'Martin', 'professional', 'USA'),
    ('Lanto', 'Griffin', 'professional', 'USA'),
    ('Henrik', 'Norlander', 'professional', 'SWE'),
    ('Patrick', 'Rodgers', 'professional', 'USA'),
    ('Daniel', 'Berger', 'professional', 'USA'),
    ('Matt', 'Wallace', 'professional', 'ENG'),
    ('Nicolai', 'Hojgaard', 'professional', 'DEN'),
    ('Matthieu', 'Pavon', 'professional', 'FRA'),
    ('Gary', 'Woodland', 'professional', 'USA'),
    ('Joel', 'Dahmen', 'professional', 'USA');

-- Create The Players Championship 2026 event
INSERT INTO events (name, max_picks_per_team, max_teams_per_player, status, passkey, stipulations)
VALUES ('The Players Championship 2026', 6, 1, 'not_started', 'dye', '{"tournament": "The Players", "year": 2026}'::jsonb);

-- Link all players to the event
INSERT INTO event_players (event_id, player_id)
SELECT
    (SELECT id FROM events WHERE name = 'The Players Championship 2026'),
    id
FROM players;

COMMIT;

-- Summary
SELECT 'Seed complete' AS status;
SELECT COUNT(*) AS total_players FROM players;
SELECT name, status, max_picks_per_team, max_teams_per_player FROM events;
SELECT COUNT(*) AS players_in_event FROM event_players;
