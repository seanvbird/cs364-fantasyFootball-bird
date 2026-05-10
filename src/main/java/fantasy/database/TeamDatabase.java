package fantasy.database;

import fantasy.entities.Team;
import fantasy.entities.TeamHomeAvg;
import fantasy.entities.TeamLossRecord;
import fantasy.entities.TeamStanding;

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
public class TeamDatabase {

    private final DataSource dataSource;

    // JDBC DataSource configured from application.properties
    public TeamDatabase(DataSource dataSource) {
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

    // Q1: Gets each team's wins, and only keeps teams with at least "minWins" wins
    public List<TeamStanding> getStandings(int leagueId, int minWins) {
        // The LEFT JOIN keeps teams with zero wins so they're still included for HAVING
        String sql = "SELECT t.team_id, t.team_name, t.owner_name, COUNT(m.matchup_id) AS wins "
                   + "FROM team t "
                   + "LEFT JOIN matchup m ON m.winner_team_id = t.team_id "
                   + "WHERE t.league_id = ? "
                   + "GROUP BY t.team_id, t.team_name, t.owner_name "
                   + "HAVING COUNT(m.matchup_id) >= ? "
                   + "ORDER BY wins DESC";
        List<TeamStanding> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, leagueId);
            ps.setInt(2, minWins);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(new TeamStanding(
                        rs.getInt("team_id"),
                        rs.getString("team_name"),
                        rs.getString("owner_name"),
                        rs.getLong("wins")
                    ));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Q2: Gets teams who have an average home score above the threshold
    public List<TeamHomeAvg> getTeamsAboveAvg(int leagueId, double threshold) {
        String sql = "SELECT t.team_id, t.team_name, AVG(m.home_score) AS avgScore "
                   + "FROM team t "
                   + "JOIN matchup m ON m.home_team_id = t.team_id "
                   + "WHERE t.league_id = ? "
                   + "GROUP BY t.team_id, t.team_name "
                   + "HAVING AVG(m.home_score) > ?";
        List<TeamHomeAvg> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, leagueId);
            ps.setDouble(2, threshold);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(new TeamHomeAvg(
                        rs.getInt("team_id"),
                        rs.getString("team_name"),
                        rs.getDouble("avgScore")
                    ));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Q3: Gets each teams losses and only keeps teams with at least "minLosses" losses
    public List<TeamLossRecord> getTeamsWithMinLosses(int leagueId, int minLosses) {
        // LEFT JOIN keeps teams with zero losses for the HAVING filter when minLosses = 0.
        String sql = "SELECT t.team_id, t.team_name, t.owner_name, COUNT(m.matchup_id) AS losses "
                   + "FROM team t "
                   + "LEFT JOIN matchup m "
                   + "  ON ((m.home_team_id = t.team_id AND m.winner_team_id = m.away_team_id) "
                   + "  OR (m.away_team_id = t.team_id AND m.winner_team_id = m.home_team_id)) "
                   + "WHERE t.league_id = ? "
                   + "GROUP BY t.team_id, t.team_name, t.owner_name "
                   + "HAVING COUNT(m.matchup_id) >= ? "
                   + "ORDER BY losses DESC";
        List<TeamLossRecord> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, leagueId);
            ps.setInt(2, minLosses);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(new TeamLossRecord(
                        rs.getInt("team_id"),
                        rs.getString("team_name"),
                        rs.getString("owner_name"),
                        rs.getLong("losses")
                    ));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }
}
