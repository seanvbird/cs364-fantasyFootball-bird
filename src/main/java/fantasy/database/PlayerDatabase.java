package fantasy.database;

import fantasy.entities.Player;

import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Component
public class PlayerDatabase {

    private final DataSource dataSource;

    // JDBC DataSource configured from application.properties
    public PlayerDatabase(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Returns every player row in the database. This is the global player find
    public List<Player> getAll() {
        String sql = "SELECT player_id, first_name, last_name, position, nfl_team, status, bye_week "
                   + "FROM player";
        List<Player> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while(rs.next()) {
                results.add(mapRow(rs));
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Q7: matches first/last name input using LIKE
    // Wrap name in wildcards so users just pass the name
    public List<Player> searchByName(String name) {
        String sql = "SELECT player_id, first_name, last_name, position, nfl_team, status, bye_week "
                   + "FROM player "
                   + "WHERE first_name LIKE ? OR last_name LIKE ?";
        String wildCards = "%" + name + "%";
        List<Player> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, wildCards);
            ps.setString(2, wildCards);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(mapRow(rs));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Q8: players currently rostered on any team in this league. Opposite of getting all free agents
    public List<Player> getLeagueRostered(int leagueId) {
        String sql = "SELECT player_id, first_name, last_name, position, nfl_team, status, bye_week "
                   + "FROM player "
                   + "WHERE player_id IN ( "
                   + "    SELECT r.player_id "
                   + "    FROM roster r "
                   + "    JOIN team t ON r.team_id = t.team_id "
                   + "    WHERE t.league_id = ? AND r.dropped_week IS NULL "
                   + ")";
        List<Player> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, leagueId);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(mapRow(rs));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Q5: gets players who are free agents, not on any active roster. Opposite of getting rostered players
    public List<Player> getFreeAgents(int leagueId) {
        String sql = "SELECT player_id, first_name, last_name, position, nfl_team, status, bye_week "
                   + "FROM player "
                   + "WHERE player_id NOT IN ( "
                   + "    SELECT r.player_id "
                   + "    FROM roster r "
                   + "    JOIN team t ON r.team_id = t.team_id "
                   + "    WHERE t.league_id = ? AND r.dropped_week IS NULL "
                   + ")";
        List<Player> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, leagueId);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(mapRow(rs));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Builds a Player object from the current row of a ResultSet.
    private Player mapRow(ResultSet rs) throws SQLException {
        return new Player(
            rs.getInt("player_id"),
            rs.getString("first_name"),
            rs.getString("last_name"),
            rs.getString("position"),
            rs.getString("nfl_team"),
            rs.getString("status"),
            rs.getInt("bye_week")
        );
    }
}
