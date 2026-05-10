-- ─────────────────────────────────────────────────────────────────────────────
-- CS364 Fantasy Football — Demo Seed Data
-- Run AFTER schema.sql and seed-players-stats.sql
--
-- Creates:
--   1 league, 8 teams, 8 DEF players (IDs 201-208),
--   96 roster entries (12 per team),
--   68 matchups (17 weeks × 4 games, all with scores and winners),
--   72 lineup entries (9 starters per team for week 17)
--
-- Schema validation notes:
--   • league_id, team_id, player_id are auto-increment; teams and DEF players
--     use explicit IDs so roster/matchup/lineup inserts below are deterministic.
--   • No FK constraints in schema — insert order is flexible.
--   • player.bye_week = 0 is a valid placeholder (real bye weeks are regular season).
--   • Duplicate (team_id, player_id, week_number) lineup rows are not blocked by
--     the schema — re-running this file without the DELETE block will produce
--     duplicates. Run the DELETE block first or truncate affected tables.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- CLEANUP (safe to re-run; removes only demo-created rows)
-- ─────────────────────────────────────────────────────────────────────────────
DELETE FROM lineup   WHERE team_id BETWEEN 1 AND 8;
DELETE FROM roster   WHERE team_id BETWEEN 1 AND 8;
DELETE FROM matchup  WHERE league_id = 1;
DELETE FROM team     WHERE league_id = 1;
DELETE FROM player   WHERE player_id BETWEEN 201 AND 208;
DELETE FROM league   WHERE league_id = 1;


-- ─────────────────────────────────────────────────────────────────────────────
-- LEAGUE
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO league (league_id, league_name, season_year, draft_date, scoring_type) VALUES
(1, 'CS364 Fantasy League', 2025, '2025-08-24', 'standard');


-- ─────────────────────────────────────────────────────────────────────────────
-- TEAMS  (league_id = 1)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO team (team_id, team_name, owner_name, league_id) VALUES
(1, 'Sean''s Team',   'Sean',   1),
(2, 'Matt''s Team',   'Matt',   1),
(3, 'Kyle''s Team',   'Kyle',   1),
(4, 'Jake''s Team',   'Jake',   1),
(5, 'Chris''s Team',  'Chris',  1),
(6, 'Alex''s Team',   'Alex',   1),
(7, 'Ryan''s Team',   'Ryan',   1),
(8, 'Tyler''s Team',  'Tyler',  1);


-- ─────────────────────────────────────────────────────────────────────────────
-- DEF PLAYERS  (IDs 201-208; appended after the 200 players in seed-players-stats.sql)
-- Each represents a full NFL team defense / special teams unit.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO player (player_id, first_name, last_name, position, nfl_team, status, bye_week) VALUES
(201, 'Kansas City',    'Defense', 'DEF', 'KC',  'Active', 0),
(202, 'Philadelphia',  'Defense', 'DEF', 'PHI', 'Active', 0),
(203, 'Baltimore',     'Defense', 'DEF', 'BAL', 'Active', 0),
(204, 'Buffalo',       'Defense', 'DEF', 'BUF', 'Active', 0),
(205, 'San Francisco', 'Defense', 'DEF', 'SF',  'Active', 0),
(206, 'Denver',        'Defense', 'DEF', 'DEN', 'Active', 0),
(207, 'Detroit',       'Defense', 'DEF', 'DET', 'Active', 0),
(208, 'Minnesota',     'Defense', 'DEF', 'MIN', 'Active', 0);


-- ─────────────────────────────────────────────────────────────────────────────
-- ROSTERS  (12 players per team: 9 starters + 3 bench; acquired_week = 1)
--
-- Player ID reference (from seed-players-stats.sql auto-increment order):
--   2=Josh Allen QB, 3=Drake Maye QB, 6=Jared Goff QB, 7=C.Williams QB,
--   9=Jalen Hurts QB, 10=Justin Herbert QB, 12=Patrick Mahomes QB,
--   14=Jonathan Taylor RB, 15=Christian McCaffrey RB, 16=Bijan Robinson RB,
--   20=Jahmyr Gibbs RB, 23=James Cook RB, 24=Lamar Jackson QB,
--   25=Derrick Henry RB, 27=DeVon Achane RB, 28=Puka Nacua WR,
--   31=Jaxon Smith-Njigba WR, 32=Brock Purdy QB, 33=Kyren Williams RB,
--   35=Travis Etienne RB, 36=Javonte Williams RB, 37=Chase Brown RB,
--   38=Amon-Ra St. Brown WR, 39=Josh Jacobs RB, 42=D'Andre Swift RB,
--   44=Saquon Barkley RB, 46=Ashton Jeanty RB, 48=Ja'Marr Chase WR,
--   49=Trey McBride TE, 50=Brandon Aubrey K, 51=Rico Dowdle RB,
--   52=Joe Burrow QB, 53=Breece Hall RB, 54=Jaylen Warren RB,
--   58=Cameron Dicker K, 59=Chris Olave WR, 62=Zay Flowers WR,
--   65=Kenneth Walker RB, 66=Zach Charbonnet RB, 68=Tony Pollard RB... wait
--   Actually Pollard is player_id=68. But checking again...
--   Let me note: 64=RJ Harvey RB, 65=Kenneth Walker RB, 66=Zach Charbonnet RB,
--   68=Tony Pollard RB, 70=Nico Collins WR, 71=Jameson Williams WR,
--   73=Jake Bates K, 75=Tee Higgins WR, 77=Harrison Butker K,
--   78=Andy Borregales K, 79=Rhamondre Stevenson RB, 81=David Montgomery RB,
--   82=Tyler Loop K, 83=Courtland Sutton WR, 86=A.J. Brown WR,
--   87=Quinshon Judkins RB, 89=Jayden Daniels QB, 91=Evan McPherson K,
--   102=DK Metcalf WR, 105=Tyrone Tracy RB, 106=CeeDee Lamb WR,
--   108=Dallas Goedert TE, 109=DeVonta Smith WR, 111=DJ Moore WR,
--   113=Quentin Johnston WR, 118=Justin Jefferson WR, 119=Jordan Mason RB,
--   121=Jake Elliott K, 122=Travis Kelce TE, 123=Ladd McConkey WR,
--   130=Bucky Irving RB, 131=Brock Bowers TE, 140=George Kittle TE,
--   149=Chuba Hubbard RB, 150=Khalil Shakir WR, 152=Dalton Schultz TE,
--   154=Rashee Rice WR, 155=Jordan Addison WR, 156=Aaron Jones RB,
--   159=Brian Thomas WR, 164=Marquise Brown WR, 168=Dalton Kincaid TE,
--   173=Mark Andrews TE, 191=Alvin Kamara RB, 192=Cooper Kupp WR,
--   199=Sam LaPorta TE
-- ─────────────────────────────────────────────────────────────────────────────

-- Team 1: Aaron's Army — KC stack (Mahomes, Kelce, Butker, KC Defense)
INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) VALUES
(1, 12,  1, NULL),   -- Patrick Mahomes QB
(1, 15,  1, NULL),   -- Christian McCaffrey RB
(1, 44,  1, NULL),   -- Saquon Barkley RB
(1, 106, 1, NULL),   -- CeeDee Lamb WR
(1, 118, 1, NULL),   -- Justin Jefferson WR
(1, 122, 1, NULL),   -- Travis Kelce TE
(1, 25,  1, NULL),   -- Derrick Henry RB (FLEX)
(1, 77,  1, NULL),   -- Harrison Butker K
(1, 201, 1, NULL),   -- Kansas City Defense DEF
(1, 14,  1, NULL),   -- Jonathan Taylor RB (bench)
(1, 154, 1, NULL),   -- Rashee Rice WR (bench)
(1, 59,  1, NULL);   -- Chris Olave WR (bench)

-- Team 2: Beast Mode — BUF stack (Allen, Cook, Shakir, BUF Defense)
INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) VALUES
(2, 2,   1, NULL),   -- Josh Allen QB
(2, 23,  1, NULL),   -- James Cook RB
(2, 16,  1, NULL),   -- Bijan Robinson RB
(2, 111, 1, NULL),   -- DJ Moore WR
(2, 150, 1, NULL),   -- Khalil Shakir WR
(2, 168, 1, NULL),   -- Dalton Kincaid TE
(2, 191, 1, NULL),   -- Alvin Kamara RB (FLEX)
(2, 78,  1, NULL),   -- Andy Borregales K
(2, 204, 1, NULL),   -- Buffalo Defense DEF
(2, 3,   1, NULL),   -- Drake Maye QB (bench)
(2, 53,  1, NULL),   -- Breece Hall RB (bench)
(2, 159, 1, NULL);   -- Brian Thomas WR (bench)

-- Team 3: TD Kings — BAL stack (L. Jackson, Andrews, Loop, BAL Defense)
INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) VALUES
(3, 24,  1, NULL),   -- Lamar Jackson QB
(3, 42,  1, NULL),   -- D'Andre Swift RB
(3, 39,  1, NULL),   -- Josh Jacobs RB
(3, 62,  1, NULL),   -- Zay Flowers WR
(3, 71,  1, NULL),   -- Jameson Williams WR
(3, 173, 1, NULL),   -- Mark Andrews TE
(3, 20,  1, NULL),   -- Jahmyr Gibbs RB (FLEX)
(3, 82,  1, NULL),   -- Tyler Loop K
(3, 203, 1, NULL),   -- Baltimore Defense DEF
(3, 6,   1, NULL),   -- Jared Goff QB (bench)
(3, 66,  1, NULL),   -- Zach Charbonnet RB (bench)
(3, 155, 1, NULL);   -- Jordan Addison WR (bench)

-- Team 4: Gridiron Gurus — PHI stack (Hurts, AJ Brown, DeVonta, Goedert, Elliott, PHI Defense)
INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) VALUES
(4, 9,   1, NULL),   -- Jalen Hurts QB
(4, 46,  1, NULL),   -- Ashton Jeanty RB
(4, 35,  1, NULL),   -- Travis Etienne RB
(4, 86,  1, NULL),   -- A.J. Brown WR
(4, 109, 1, NULL),   -- DeVonta Smith WR
(4, 108, 1, NULL),   -- Dallas Goedert TE
(4, 28,  1, NULL),   -- Puka Nacua WR (FLEX)
(4, 121, 1, NULL),   -- Jake Elliott K
(4, 202, 1, NULL),   -- Philadelphia Defense DEF
(4, 11,  1, NULL),   -- Baker Mayfield QB (bench)
(4, 68,  1, NULL),   -- Tony Pollard RB (bench)
(4, 164, 1, NULL);   -- Marquise Brown WR (bench)

-- Team 5: Fantasy Fanatics — CIN stack (Burrow, Chase, Higgins, McPherson)
INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) VALUES
(5, 52,  1, NULL),   -- Joe Burrow QB
(5, 51,  1, NULL),   -- Rico Dowdle RB
(5, 54,  1, NULL),   -- Jaylen Warren RB
(5, 48,  1, NULL),   -- Ja'Marr Chase WR
(5, 75,  1, NULL),   -- Tee Higgins WR
(5, 140, 1, NULL),   -- George Kittle TE
(5, 65,  1, NULL),   -- Kenneth Walker RB (FLEX)
(5, 91,  1, NULL),   -- Evan McPherson K
(5, 205, 1, NULL),   -- San Francisco Defense DEF
(5, 37,  1, NULL),   -- Chase Brown RB (bench)
(5, 70,  1, NULL),   -- Nico Collins WR (bench)
(5, 33,  1, NULL);   -- Kyren Williams RB (bench)

-- Team 6: Blitz Brigade — WAS QB + spread roster
INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) VALUES
(6, 89,  1, NULL),   -- Jayden Daniels QB
(6, 27,  1, NULL),   -- De'Von Achane RB
(6, 81,  1, NULL),   -- David Montgomery RB
(6, 83,  1, NULL),   -- Courtland Sutton WR
(6, 102, 1, NULL),   -- DK Metcalf WR
(6, 131, 1, NULL),   -- Brock Bowers TE
(6, 36,  1, NULL),   -- Javonte Williams RB (FLEX)
(6, 50,  1, NULL),   -- Brandon Aubrey K
(6, 206, 1, NULL),   -- Denver Defense DEF
(6, 8,   1, NULL),   -- Bo Nix QB (bench)
(6, 64,  1, NULL),   -- RJ Harvey RB (bench)
(6, 152, 1, NULL);   -- Dalton Schultz TE (bench)

-- Team 7: End Zone Elite — LAC stack (Herbert, McConkey, Johnston, Dicker)
INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) VALUES
(7, 10,  1, NULL),   -- Justin Herbert QB
(7, 14,  1, NULL),   -- Jonathan Taylor RB
(7, 119, 1, NULL),   -- Jordan Mason RB
(7, 123, 1, NULL),   -- Ladd McConkey WR
(7, 113, 1, NULL),   -- Quentin Johnston WR
(7, 49,  1, NULL),   -- Trey McBride TE
(7, 87,  1, NULL),   -- Quinshon Judkins RB (FLEX)
(7, 58,  1, NULL),   -- Cameron Dicker K
(7, 208, 1, NULL),   -- Minnesota Defense DEF
(7, 55,  1, NULL),   -- J.J. McCarthy QB (bench)
(7, 142, 1, NULL),   -- Omarion Hampton RB (bench)
(7, 192, 1, NULL);   -- Cooper Kupp WR (bench)

-- Team 8: Punt Rockers — DET stack (Purdy, St. Brown, LaPorta, Bates)
INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) VALUES
(8, 32,  1, NULL),   -- Brock Purdy QB
(8, 130, 1, NULL),   -- Bucky Irving RB
(8, 105, 1, NULL),   -- Tyrone Tracy RB
(8, 31,  1, NULL),   -- Jaxon Smith-Njigba WR
(8, 38,  1, NULL),   -- Amon-Ra St. Brown WR
(8, 199, 1, NULL),   -- Sam LaPorta TE
(8, 156, 1, NULL),   -- Aaron Jones RB (FLEX)
(8, 73,  1, NULL),   -- Jake Bates K
(8, 207, 1, NULL),   -- Detroit Defense DEF
(8, 7,   1, NULL),   -- Caleb Williams QB (bench)
(8, 149, 1, NULL),   -- Chuba Hubbard RB (bench)
(8, 79,  1, NULL);   -- Rhamondre Stevenson RB (bench)


-- ─────────────────────────────────────────────────────────────────────────────
-- MATCHUPS  (17 weeks × 4 games = 68 matchups, all scored)
--
-- Schedule (home, away) same each 7-week block, repeated:
--   Wk 1/8/15: (1,2),(3,4),(5,6),(7,8)
--   Wk 2/9/16: (1,3),(2,4),(5,7),(6,8)
--   Wk 3/10/17:(1,4),(2,3),(5,8),(6,7)
--   Wk 4/11:   (1,5),(2,6),(3,7),(4,8)
--   Wk 5/12:   (1,6),(2,5),(3,8),(4,7)
--   Wk 6/13:   (1,7),(2,8),(3,5),(4,6)
--   Wk 7/14:   (1,8),(2,7),(3,6),(4,5)
--
-- Final standings (wins–losses):
--   T1 Aaron's Army    16-1   (only loss: wk 8 vs T2)
--   T3 TD Kings        13-4
--   T2 Beast Mode      11-6
--   T5 Fantasy Fanatics 10-7
--   T6 Blitz Brigade    8-9
--   T4 Gridiron Gurus   6-11
--   T7 End Zone Elite   2-15
--   T8 Punt Rockers     2-15  (wins: wk 8 and wk 15 vs T7)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO matchup (league_id, week_number, home_team_id, away_team_id, home_score, away_score, winner_team_id) VALUES
-- Week 1
(1, 1, 1, 2, 142.30, 118.40, 1),
(1, 1, 3, 4, 121.60,  98.20, 3),
(1, 1, 5, 6,  89.70, 112.30, 6),
(1, 1, 7, 8,  95.40,  78.20, 7),
-- Week 2
(1, 2, 1, 3, 138.70, 108.40, 1),
(1, 2, 2, 4, 125.20, 103.80, 2),
(1, 2, 5, 7, 101.40,  82.60, 5),
(1, 2, 6, 8,  98.30,  72.40, 6),
-- Week 3
(1, 3, 1, 4, 119.80, 115.20, 1),
(1, 3, 2, 3,  98.70, 122.40, 3),
(1, 3, 5, 8, 104.70,  69.30, 5),
(1, 3, 6, 7,  88.40,  92.10, 7),
-- Week 4
(1, 4, 1, 5, 145.20,  96.40, 1),
(1, 4, 2, 6, 112.40, 128.30, 6),
(1, 4, 3, 7, 118.60,  84.20, 3),
(1, 4, 4, 8, 121.30,  77.80, 4),
-- Week 5
(1, 5, 1, 6, 128.40, 101.70, 1),
(1, 5, 2, 5, 134.60,  89.30, 2),
(1, 5, 3, 8,  97.40,  82.60, 3),
(1, 5, 4, 7, 118.20,  88.40, 4),
-- Week 6
(1, 6, 1, 7, 135.70,  79.40, 1),
(1, 6, 2, 8, 108.30,  86.70, 2),
(1, 6, 3, 5, 122.40, 104.60, 3),
(1, 6, 4, 6,  99.80, 115.30, 6),
-- Week 7
(1, 7, 1, 8, 141.30,  68.40, 1),
(1, 7, 2, 7, 119.70,  91.30, 2),
(1, 7, 3, 6, 107.20, 103.40, 3),
(1, 7, 4, 5, 126.80,  88.70, 4),
-- Week 8
(1, 8, 1, 2, 112.40, 138.60, 2),  -- T1's only loss
(1, 8, 3, 4, 129.40, 118.20, 3),
(1, 8, 5, 6,  96.70,  88.30, 5),
(1, 8, 7, 8,  74.60,  89.40, 8),  -- T8's first win
-- Week 9
(1, 9, 1, 3, 143.80, 116.40, 1),
(1, 9, 2, 4, 127.30, 101.60, 2),
(1, 9, 5, 7, 108.40,  82.10, 5),
(1, 9, 6, 8,  94.70,  71.30, 6),
-- Week 10
(1, 10, 1, 4, 136.20, 122.80, 1),
(1, 10, 2, 3, 118.40, 114.60, 2),
(1, 10, 5, 8,  97.80,  78.40, 5),
(1, 10, 6, 7, 103.20,  88.60, 6),
-- Week 11
(1, 11, 1, 5, 149.30,  92.40, 1),
(1, 11, 2, 6, 131.70,  98.30, 2),
(1, 11, 3, 7, 124.60,  76.40, 3),
(1, 11, 4, 8, 116.80,  69.70, 4),
-- Week 12
(1, 12, 1, 6, 132.60, 104.80, 1),
(1, 12, 2, 5, 108.20, 118.40, 5),  -- T5 upsets T2
(1, 12, 3, 8,  97.40,  84.20, 3),
(1, 12, 4, 7, 121.30,  91.60, 4),
-- Week 13
(1, 13, 1, 7, 138.40,  83.60, 1),
(1, 13, 2, 8, 124.70,  72.40, 2),
(1, 13, 3, 5, 112.40, 101.80, 3),
(1, 13, 4, 6, 108.60,  99.40, 4),
-- Week 14
(1, 14, 1, 8, 126.80,  77.30, 1),
(1, 14, 2, 7, 134.20,  88.40, 2),
(1, 14, 3, 6, 118.60,  96.70, 3),
(1, 14, 4, 5, 103.40, 121.80, 5),  -- T5 upsets T4
-- Week 15
(1, 15, 1, 2, 141.70, 119.40, 1),
(1, 15, 3, 4, 126.40, 115.30, 3),
(1, 15, 5, 6, 112.80,  89.40, 5),
(1, 15, 7, 8,  78.60,  94.30, 8),  -- T8's second win
-- Week 16
(1, 16, 1, 3, 132.40, 128.70, 1),  -- close game
(1, 16, 2, 4, 121.60,  98.40, 2),
(1, 16, 5, 7, 104.20,  88.70, 5),
(1, 16, 6, 8,  96.40,  74.80, 6),
-- Week 17
(1, 17, 1, 4, 139.80, 116.40, 1),
(1, 17, 2, 3, 122.40, 126.80, 3),  -- T3 upsets T2 in finale
(1, 17, 5, 8,  98.40,  82.60, 5),
(1, 17, 6, 7, 108.30,  91.40, 6);


-- ─────────────────────────────────────────────────────────────────────────────
-- WEEK 17 LINEUPS  (9 starters per team = 72 rows total)
-- Slot values: QB, RB, WR, TE, FLEX, K, DEF
-- FLEX must be position RB, WR, or TE — validated by backend.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO lineup (team_id, player_id, week_number, slot) VALUES
-- Team 1:
(1, 12,  17, 'QB'),    -- Patrick Mahomes
(1, 15,  17, 'RB'),    -- Christian McCaffrey
(1, 44,  17, 'RB'),    -- Saquon Barkley
(1, 106, 17, 'WR'),    -- CeeDee Lamb
(1, 118, 17, 'WR'),    -- Justin Jefferson
(1, 122, 17, 'TE'),    -- Travis Kelce
(1, 25,  17, 'FLEX'),  -- Derrick Henry (RB → FLEX)
(1, 77,  17, 'K'),     -- Harrison Butker
(1, 201, 17, 'DEF'),   -- Kansas City Defense

-- Team 2:
(2, 2,   17, 'QB'),    -- Josh Allen
(2, 23,  17, 'RB'),    -- James Cook
(2, 16,  17, 'RB'),    -- Bijan Robinson
(2, 111, 17, 'WR'),    -- DJ Moore
(2, 150, 17, 'WR'),    -- Khalil Shakir
(2, 168, 17, 'TE'),    -- Dalton Kincaid
(2, 191, 17, 'FLEX'),  -- Alvin Kamara (RB → FLEX)
(2, 78,  17, 'K'),     -- Andy Borregales
(2, 204, 17, 'DEF'),   -- Buffalo Defense

-- Team 3:
(3, 24,  17, 'QB'),    -- Lamar Jackson
(3, 42,  17, 'RB'),    -- D'Andre Swift
(3, 39,  17, 'RB'),    -- Josh Jacobs
(3, 62,  17, 'WR'),    -- Zay Flowers
(3, 71,  17, 'WR'),    -- Jameson Williams
(3, 173, 17, 'TE'),    -- Mark Andrews
(3, 20,  17, 'FLEX'),  -- Jahmyr Gibbs (RB → FLEX)
(3, 82,  17, 'K'),     -- Tyler Loop
(3, 203, 17, 'DEF'),   -- Baltimore Defense

-- Team 4:
(4, 9,   17, 'QB'),    -- Jalen Hurts
(4, 46,  17, 'RB'),    -- Ashton Jeanty
(4, 35,  17, 'RB'),    -- Travis Etienne
(4, 86,  17, 'WR'),    -- A.J. Brown
(4, 109, 17, 'WR'),    -- DeVonta Smith
(4, 108, 17, 'TE'),    -- Dallas Goedert
(4, 28,  17, 'FLEX'),  -- Puka Nacua (WR → FLEX)
(4, 121, 17, 'K'),     -- Jake Elliott
(4, 202, 17, 'DEF'),   -- Philadelphia Defense

-- Team 5:
(5, 52,  17, 'QB'),    -- Joe Burrow
(5, 51,  17, 'RB'),    -- Rico Dowdle
(5, 54,  17, 'RB'),    -- Jaylen Warren
(5, 48,  17, 'WR'),    -- Ja'Marr Chase
(5, 75,  17, 'WR'),    -- Tee Higgins
(5, 140, 17, 'TE'),    -- George Kittle
(5, 65,  17, 'FLEX'),  -- Kenneth Walker (RB → FLEX)
(5, 91,  17, 'K'),     -- Evan McPherson
(5, 205, 17, 'DEF'),   -- San Francisco Defense

-- Team 6:
(6, 89,  17, 'QB'),    -- Jayden Daniels
(6, 27,  17, 'RB'),    -- De'Von Achane
(6, 81,  17, 'RB'),    -- David Montgomery
(6, 83,  17, 'WR'),    -- Courtland Sutton
(6, 102, 17, 'WR'),    -- DK Metcalf
(6, 131, 17, 'TE'),    -- Brock Bowers
(6, 36,  17, 'FLEX'),  -- Javonte Williams (RB → FLEX)
(6, 50,  17, 'K'),     -- Brandon Aubrey
(6, 206, 17, 'DEF'),   -- Denver Defense

-- Team 7:
(7, 10,  17, 'QB'),    -- Justin Herbert
(7, 14,  17, 'RB'),    -- Jonathan Taylor
(7, 119, 17, 'RB'),    -- Jordan Mason
(7, 123, 17, 'WR'),    -- Ladd McConkey
(7, 113, 17, 'WR'),    -- Quentin Johnston
(7, 49,  17, 'TE'),    -- Trey McBride
(7, 87,  17, 'FLEX'),  -- Quinshon Judkins (RB → FLEX)
(7, 58,  17, 'K'),     -- Cameron Dicker
(7, 208, 17, 'DEF'),   -- Minnesota Defense

-- Team 8:
(8, 32,  17, 'QB'),    -- Brock Purdy
(8, 130, 17, 'RB'),    -- Bucky Irving
(8, 105, 17, 'RB'),    -- Tyrone Tracy
(8, 31,  17, 'WR'),    -- Jaxon Smith-Njigba
(8, 38,  17, 'WR'),    -- Amon-Ra St. Brown
(8, 199, 17, 'TE'),    -- Sam LaPorta
(8, 156, 17, 'FLEX'),  -- Aaron Jones (RB → FLEX)
(8, 73,  17, 'K'),     -- Jake Bates
(8, 207, 17, 'DEF');   -- Detroit Defense
