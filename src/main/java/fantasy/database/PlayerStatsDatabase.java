package fantasy.database;

import fantasy.entities.PlayerStats;
import fantasy.entities.PositionAvg;
import fantasy.entities.TopScorer;

import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class PlayerStatsDatabase {

    private final DataSource dataSource;

    // JDBC DataSource configured from application.properties
    public PlayerStatsDatabase(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Gets every weekly stats row for one player with the oldest week first
    // Query for displaying stats when clicking on a player in Players tab
    public List<PlayerStats> getByPlayer(int playerId) {
        String sql = "SELECT stat_id, player_id, week_number, passing_yards, rushing_yards, receiving_yards, touchdowns, fantasy_points "
                   + "FROM player_stats "
                   + "WHERE player_id = ? "
                   + "ORDER BY week_number";
        List<PlayerStats> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, playerId);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(new PlayerStats(
                        rs.getInt("stat_id"),
                        rs.getInt("player_id"),
                        rs.getInt("week_number"),
                        rs.getInt("passing_yards"),
                        rs.getInt("rushing_yards"),
                        rs.getInt("receiving_yards"),
                        rs.getInt("touchdowns"),
                        rs.getDouble("fantasy_points")
                    ));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Q4: Gets the top 10 scoring players for a week in descending order
    public List<TopScorer> getTopScorers(int week) {
        String sql = "SELECT ps.fantasy_points, ps.week_number, p.first_name, p.last_name, p.position, p.nfl_team "
                   + "FROM player_stats ps JOIN player p ON p.player_id = ps.player_id "
                   + "WHERE ps.week_number = ? "
                   + "ORDER BY ps.fantasy_points DESC "
                   + "LIMIT 10";
        List<TopScorer> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, week);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(new TopScorer(
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getString("position"),
                        rs.getString("nfl_team"),
                        rs.getObject("fantasy_points", Double.class),
                        rs.getInt("week_number")
                    ));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Q6: Gets the average fantasy points per position across all weeks, and the amount of games played for each position
    public List<PositionAvg> getAvgByPosition() {
        String sql = "SELECT p.position, AVG(ps.fantasy_points) AS avgPoints, COUNT(*) AS gamesPlayed "
                   + "FROM player p JOIN player_stats ps ON p.player_id = ps.player_id "
                   + "GROUP BY p.position "
                   + "ORDER BY avgPoints DESC";
        List<PositionAvg> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while(rs.next()) {
                results.add(new PositionAvg(
                    rs.getString("position"),
                    rs.getDouble("avgPoints"),
                    rs.getLong("gamesPlayed")
                ));
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }
}
