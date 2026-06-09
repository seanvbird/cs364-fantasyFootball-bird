package fantasy.database;

import fantasy.entities.Roster;
import fantasy.entities.RosterPlayer;
import fantasy.entities.Team;
import fantasy.entities.TeamWithRoster;

import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Component
public class TeamsDatabase {

    private final DataSource dataSource;

    // JDBC DataSource configured from application.properties
    public TeamsDatabase(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Creates/inserts a new team row for a league and returns the team_id assigned to it
    public int create(Team team) {
        String sql = "INSERT INTO team (team_name, owner_name, league_id) "
                   + "VALUES (?, ?, ?)";
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, team.getTeamName());
            ps.setString(2, team.getOwnerName());
            ps.setInt(3, team.getLeagueId());
            ps.executeUpdate();
            try(ResultSet keys = ps.getGeneratedKeys()) {
                keys.next();
                return keys.getInt(1);
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }

    // Updates a teams name and the owner, will return false if now rows matched
    public boolean update(Team team) {
        String sql = "UPDATE team "
                   + "SET team_name = ?, owner_name = ? "
                   + "WHERE team_id = ?";
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, team.getTeamName());
            ps.setString(2, team.getOwnerName());
            ps.setInt(3, team.getTeamId());
            return ps.executeUpdate() > 0;
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }

    // Deletes a team row for a league. Everything cascades out automatically: Rosters/Lineups/Matchups
    public boolean delete(int id) {
        String sql = "DELETE FROM team "
                   + "WHERE team_id = ?";
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }

    // Returns every team in the league with its active roster
    // Gets the teams first and then calls getByTeamId for each team to attach the roster
    public List<TeamWithRoster> getTeamsWithActiveRosters(int leagueId) {
        String teamSql = "SELECT team_id, team_name, owner_name "
                       + "FROM team "
                       + "WHERE league_id = ? "
                       + "ORDER BY team_name";
        List<TeamWithRoster> teams = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(teamSql)) {
            ps.setInt(1, leagueId);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    int teamId = rs.getInt("team_id");
                    String teamName = rs.getString("team_name");
                    String ownerName = rs.getString("owner_name");
                    teams.add(new TeamWithRoster(
                        teamId,
                        teamName,
                        ownerName,
                        getByTeamId(teamId)
                    ));
                }
            }
        }catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return teams;
    }

    // Gets a team's active roster. Helper for getTeamsWithActiveRosters
    private List<RosterPlayer> getByTeamId(int teamId) {
        String sql = "SELECT r.roster_id, r.team_id, r.player_id, r.acquired_week, r.dropped_week, p.first_name, p.last_name, p.position, p.nfl_team, p.status "
                   + "FROM roster r "
                   + "JOIN player p ON r.player_id = p.player_id "
                   + "WHERE r.team_id = ? AND r.dropped_week IS NULL "
                   + "ORDER BY p.position";
        List<RosterPlayer> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, teamId);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(new RosterPlayer(
                        rs.getInt("roster_id"),
                        rs.getInt("team_id"),
                        rs.getInt("player_id"),
                        rs.getInt("acquired_week"),
                        rs.getObject("dropped_week", Integer.class),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getString("position"),
                        rs.getString("nfl_team"),
                        rs.getString("status")
                    ));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Inserts a roster row that binds a player to a team. Returns the roster_id assigned to the new row
    public int addPlayer(Roster roster) {
        String sql = "INSERT INTO roster (team_id, player_id, acquired_week, dropped_week) "
                   + "VALUES (?, ?, ?, NULL)";
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, roster.getTeamId());
            ps.setInt(2, roster.getPlayerId());
            ps.setInt(3, roster.getAcquiredWeek());
            ps.executeUpdate();
            try(ResultSet keys = ps.getGeneratedKeys()) {
                keys.next();
                return keys.getInt(1);
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }

    // Used to check if a player is already on an active roster in a league. POST /api/teams/roster uses this so a player cant be rostered twice in a league
    public boolean isPlayerOnActiveRosterInLeague(int playerId, int teamId) {
        // Selects 1 because this is an existence check not a data fetch. 1 is the cheapest thing for the DB to get.
        String sql = "SELECT 1 "
                   + "FROM roster r JOIN team t ON r.team_id = t.team_id "
                   + "WHERE r.player_id = ? "
                   + "  AND r.dropped_week IS NULL "
                   + "  AND t.league_id = (SELECT league_id FROM team WHERE team_id = ?) "
                   + "LIMIT 1";
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, playerId);
            ps.setInt(2, teamId);
            try(ResultSet rs = ps.executeQuery()) {
                // just returns true is player is on an active roster, false otherwise
                return rs.next();
            }
        }catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }
}
