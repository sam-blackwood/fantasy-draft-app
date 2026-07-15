-- Seed: The Open Championship
-- Creates a new event instance and links the field from the global players table.
-- Also adds 42 new players to the global table idempotently, so this file is safe to run standalone on prod.
-- Usage: ./scripts/db.sh new-event seed_the_open_championship_2026.sql <passkey>

BEGIN;

-- Ensure all The Open Championship players exist in the global players table.
-- Idempotent via WHERE NOT EXISTS (no unique constraint on first_name/last_name).
INSERT INTO players (first_name, last_name, status, country_code)
SELECT v.first_name, v.last_name, v.status, v.country_code
FROM (VALUES
    ('Alejandro', 'De Castro Piera', 'amateur', 'ESP'),
    ('Alistair', 'Docherty', 'professional', 'USA'),
    ('Antoine', 'Rozner', 'professional', 'FRA'),
    ('Austen', 'Truslow', 'professional', 'USA'),
    ('Baard', 'Bjoernevik Skogen', 'professional', 'NOR'),
    ('Cameron', 'John', 'professional', 'AUS'),
    ('Dan', 'Bradbury', 'professional', 'ENG'),
    ('Darren', 'Clarke', 'professional', 'NIR'),
    ('David', 'Duval', 'professional', 'USA'),
    ('David', 'Howard', 'amateur', 'IRL'),
    ('Eugenio', 'Chacarra', 'professional', 'ESP'),
    ('Francesco', 'Laporta', 'professional', 'ITA'),
    ('Francesco', 'Molinari', 'professional', 'ITA'),
    ('Frederic', 'Lacroix', 'professional', 'FRA'),
    ('Henrik', 'Stenson', 'professional', 'SWE'),
    ('Jack', 'Buchanan', 'amateur', 'RSA'),
    ('Jack', 'McDonald', 'professional', 'SCO'),
    ('Jeongwoo', 'Ham', 'professional', 'KOR'),
    ('Jesper', 'Svensson', 'professional', 'SWE'),
    ('Jiho', 'Yang', 'professional', 'KOR'),
    ('Joakim', 'Lagergren', 'professional', 'SWE'),
    ('Joe', 'Dean', 'professional', 'ENG'),
    ('Jose Luis', 'Ballester Barrio', 'professional', 'ESP'),
    ('Kazuma', 'Kobori', 'professional', 'NZL'),
    ('Keita', 'Nakajima', 'professional', 'JPN'),
    ('Lev', 'Grinberg', 'amateur', 'UKR'),
    ('MJ', 'Daffue', 'professional', 'RSA'),
    ('Marcus', 'Plunkett', 'professional', 'USA'),
    ('Martin', 'Couvra', 'professional', 'FRA'),
    ('Matthew', 'Baldwin', 'professional', 'ENG'),
    ('Matthew', 'Southgate', 'professional', 'ENG'),
    ('Michael', 'Hollick', 'professional', 'RSA'),
    ('Nevill', 'Ruiter', 'amateur', 'NED'),
    ('Ren', 'Yonezawa', 'professional', 'JPN'),
    ('Ryutaro', 'Nagano', 'professional', 'JPN'),
    ('Sam', 'Bairstow', 'professional', 'ENG'),
    ('Scott', 'Vincent', 'professional', 'ZIM'),
    ('Shaun', 'Norris', 'professional', 'RSA'),
    ('Stuart', 'Grehan', 'amateur', 'IRL'),
    ('Tiger', 'Christensen', 'professional', 'GER'),
    ('Tim', 'Wiedemeyer', 'amateur', 'GER'),
    ('Tom', 'Sloman', 'professional', 'ENG')
) AS v(first_name, last_name, status, country_code)
WHERE NOT EXISTS (
    SELECT 1 FROM players p
    WHERE p.first_name = v.first_name AND p.last_name = v.last_name
);

-- Create the event
INSERT INTO events (name, max_picks_per_team, max_teams_per_player, status, passkey, event_date, stipulations)
VALUES ('The Open Championship', 6, 1, 'not_started', :passkey, '2026-07-16 00:00:00-04'::timestamptz, '{"tournament": "The Open Championship", "year": 2026}'::jsonb)
RETURNING id AS new_event_id;

-- Link players to the event by name
-- Uses a CTE to capture the new event ID
WITH new_event AS (
    SELECT id FROM events
    WHERE name = 'The Open Championship'
    ORDER BY id DESC LIMIT 1
)
INSERT INTO event_players (event_id, player_id)
SELECT new_event.id, p.id
FROM new_event, players p
WHERE (p.first_name, p.last_name) IN (
    ('Aaron', 'Rai'),
    ('Adam', 'Scott'),
    ('Adrien', 'Saddier'),
    ('Akshay', 'Bhatia'),
    ('Aldrich', 'Potgieter'),
    ('Alejandro', 'De Castro Piera'),
    ('Alex', 'Fitzpatrick'),
    ('Alex', 'Noren'),
    ('Alex', 'Smalley'),
    ('Alistair', 'Docherty'),
    ('Andrew', 'Novak'),
    ('Andy', 'Sullivan'),
    ('Angel', 'Ayora'),
    ('Antoine', 'Rozner'),
    ('Austen', 'Truslow'),
    ('Baard', 'Bjoernevik Skogen'),
    ('Ben', 'Griffin'),
    ('Bernd', 'Wiesberger'),
    ('Billy', 'Horschel'),
    ('Brian', 'Harman'),
    ('Brooks', 'Koepka'),
    ('Bryson', 'DeChambeau'),
    ('Bud', 'Cauley'),
    ('Caleb', 'Surratt'),
    ('Cameron', 'John'),
    ('Cameron', 'Smith'),
    ('Cameron', 'Young'),
    ('Casey', 'Jarvis'),
    ('Chris', 'Gotterup'),
    ('Collin', 'Morikawa'),
    ('Corey', 'Conners'),
    ('Daniel', 'Berger'),
    ('Daniel', 'Brown'),
    ('Dan', 'Bradbury'),
    ('Darren', 'Clarke'),
    ('David', 'Duval'),
    ('David', 'Howard'),
    ('David', 'Puig'),
    ('Eric', 'Cole'),
    ('Eugenio', 'Chacarra'),
    ('Fifa', 'Laopakdee'),
    ('Francesco', 'Laporta'),
    ('Francesco', 'Molinari'),
    ('Frederic', 'Lacroix'),
    ('Gary', 'Woodland'),
    ('Haotong', 'Li'),
    ('Harris', 'English'),
    ('Harry', 'Hall'),
    ('Hennie', 'Du Plessis'),
    ('Henrik', 'Stenson'),
    ('Hideki', 'Matsuyama'),
    ('J.J.', 'Spaun'),
    ('J.T.', 'Poston'),
    ('Jackson', 'Suber'),
    ('Jack', 'Buchanan'),
    ('Jack', 'McDonald'),
    ('Jacob', 'Bridgeman'),
    ('Jake', 'Knapp'),
    ('James', 'Nicholas'),
    ('Jason', 'Day'),
    ('Jayden', 'Schaper'),
    ('Jeongwoo', 'Ham'),
    ('Jesper', 'Svensson'),
    ('Jiho', 'Yang'),
    ('Joakim', 'Lagergren'),
    ('Joaquin', 'Niemann'),
    ('Joe', 'Dean'),
    ('Johnny', 'Keefer'),
    ('John', 'Parry'),
    ('Jon', 'Rahm'),
    ('Jordan', 'Smith'),
    ('Jordan', 'Spieth'),
    ('Jose Luis', 'Ballester Barrio'),
    ('Justin', 'Rose'),
    ('Justin', 'Thomas'),
    ('Kazuki', 'Higa'),
    ('Kazuma', 'Kobori'),
    ('Keegan', 'Bradley'),
    ('Keita', 'Nakajima'),
    ('Keith', 'Mitchell'),
    ('Kota', 'Kaneko'),
    ('Kristoffer', 'Reitan'),
    ('Kurt', 'Kitayama'),
    ('Laurie', 'Canter'),
    ('Lev', 'Grinberg'),
    ('Lucas', 'Herbert'),
    ('Ludvig', 'Aberg'),
    ('MJ', 'Daffue'),
    ('Marco', 'Penge'),
    ('Marcus', 'Plunkett'),
    ('Martin', 'Couvra'),
    ('Mason', 'Howell'),
    ('Mateo', 'Pulcini'),
    ('Matthew', 'Baldwin'),
    ('Matthew', 'Jordan'),
    ('Matthew', 'Southgate'),
    ('Matt', 'Fitzpatrick'),
    ('Matt', 'McCarty'),
    ('Matt', 'Wallace'),
    ('Maverick', 'McNealy'),
    ('Max', 'Greyserman'),
    ('Max', 'Homa'),
    ('Michael', 'Brennan'),
    ('Michael', 'Hollick'),
    ('Michael', 'Kim'),
    ('Michael', 'Thorbjornsen'),
    ('Min Woo', 'Lee'),
    ('Naoyuki', 'Kataoka'),
    ('Nevill', 'Ruiter'),
    ('Nick', 'Taylor'),
    ('Nicolai', 'Hojgaard'),
    ('Nico', 'Echavarria'),
    ('Padraig', 'Harrington'),
    ('Patrick', 'Cantlay'),
    ('Patrick', 'Reed'),
    ('Peter', 'Uihlein'),
    ('Pierceson', 'Coody'),
    ('Rasmus', 'Hojgaard'),
    ('Rasmus', 'Neergaard-Petersen'),
    ('Ren', 'Yonezawa'),
    ('Rickie', 'Fowler'),
    ('Robert', 'MacIntyre'),
    ('Rory', 'McIlroy'),
    ('Russell', 'Henley'),
    ('Ryan', 'Fox'),
    ('Ryan', 'Gerard'),
    ('Ryo', 'Hisatsune'),
    ('Ryutaro', 'Nagano'),
    ('Sahith', 'Theegala'),
    ('Sami', 'Valimaki'),
    ('Sam', 'Bairstow'),
    ('Sam', 'Burns'),
    ('Sam', 'Stevens'),
    ('Scottie', 'Scheffler'),
    ('Scott', 'Vincent'),
    ('Sepp', 'Straka'),
    ('Shane', 'Lowry'),
    ('Shaun', 'Norris'),
    ('Si Woo', 'Kim'),
    ('Stewart', 'Cink'),
    ('Stuart', 'Grehan'),
    ('Sungjae', 'Im'),
    ('Thomas', 'Detry'),
    ('Tiger', 'Christensen'),
    ('Tim', 'Wiedemeyer'),
    ('Tommy', 'Fleetwood'),
    ('Tom', 'Kim'),
    ('Tom', 'McKibbin'),
    ('Tom', 'Sloman'),
    ('Travis', 'Smyth'),
    ('Tyrrell', 'Hatton'),
    ('Victor', 'Perez'),
    ('Viktor', 'Hovland'),
    ('Wyndham', 'Clark'),
    ('Xander', 'Schauffele')
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
