-- ─────────────────────────────────────────────
-- LEAGUE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league (
    league_id    INT          AUTO_INCREMENT PRIMARY KEY,
    league_name  VARCHAR(100) NOT NULL,
    season_year  INT          NOT NULL,
    draft_date   DATE,
    scoring_type VARCHAR(20)  NOT NULL
);

-- ─────────────────────────────────────────────
-- TEAM
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team (
    team_id    INT          AUTO_INCREMENT PRIMARY KEY,
    team_name  VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    league_id  INT          NOT NULL,
    FOREIGN KEY (league_id) REFERENCES league(league_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- PLAYER
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player (
    player_id  INT          AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50)  NOT NULL,
    last_name  VARCHAR(50)  NOT NULL,
    position   VARCHAR(10)  NOT NULL,
    nfl_team   VARCHAR(50)  NOT NULL,
    status     VARCHAR(20)  NOT NULL,
    bye_week   INT          NOT NULL
);

-- ─────────────────────────────────────────────
-- ROSTER  (resolves many-to-many: TEAM ↔ PLAYER over time)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roster (
    roster_id      INT  AUTO_INCREMENT PRIMARY KEY,
    team_id        INT  NOT NULL,
    player_id      INT  NOT NULL,
    acquired_week  INT  NOT NULL,
    dropped_week   INT  DEFAULT NULL,    -- NULL means still on roster
    FOREIGN KEY (team_id)   REFERENCES team(team_id)     ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- LINEUP  (who starts each week for each team)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lineup (
    lineup_id   INT         AUTO_INCREMENT PRIMARY KEY,
    team_id     INT         NOT NULL,
    player_id   INT         NOT NULL,
    week_number INT         NOT NULL,
    slot        VARCHAR(10) NOT NULL,
    FOREIGN KEY (team_id)   REFERENCES team(team_id)     ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
-- MATCHUP
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matchup (
    matchup_id     INT           AUTO_INCREMENT PRIMARY KEY,
    league_id      INT           NOT NULL,
    week_number    INT           NOT NULL,
    home_team_id   INT           NOT NULL,
    away_team_id   INT           NOT NULL,
    home_score     DECIMAL(6, 2) DEFAULT 0.00,
    away_score     DECIMAL(6, 2) DEFAULT 0.00,
    winner_team_id INT           DEFAULT NULL,  -- NULL until matchup is complete
    FOREIGN KEY (league_id)      REFERENCES league(league_id) ON DELETE CASCADE,
    FOREIGN KEY (home_team_id)   REFERENCES team(team_id)     ON DELETE CASCADE,
    FOREIGN KEY (away_team_id)   REFERENCES team(team_id)     ON DELETE CASCADE,
    FOREIGN KEY (winner_team_id) REFERENCES team(team_id)     ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- PLAYER_STATS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_stats (
    stat_id         INT           AUTO_INCREMENT PRIMARY KEY,
    player_id       INT           NOT NULL,
    week_number     INT           NOT NULL,
    passing_yards   INT           DEFAULT 0,
    rushing_yards   INT           DEFAULT 0,
    receiving_yards INT           DEFAULT 0,
    touchdowns      INT           DEFAULT 0,
    fantasy_points  DECIMAL(6, 2) DEFAULT 0.00,
    FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE CASCADE
);
