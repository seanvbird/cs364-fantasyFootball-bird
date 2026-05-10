package fantasy.database;

import fantasy.entities.FullLineupEntry;
import fantasy.entities.LineupEntry;

import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Component
public class LineupDatabase {

    private final DataSource dataSource;

    // JDBC DataSource configured from application.properties.
    public LineupDatabase(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Atomically replaces a team's lineup for one week. The DELETE and the per entry INSERTs run inside one transaction, to avoid a crash mid write
    public void replaceLineup(int teamId, int weekNumber, List<LineupEntry> entries) {
        // Single connection with autoCommit=false so DELETE and all INSERTs are one atomic thing
        try(Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                String deleteSql = "DELETE FROM lineup "
                                 + "WHERE team_id = ? AND week_number = ?";
                try(PreparedStatement del = conn.prepareStatement(deleteSql)) {
                    del.setInt(1, teamId);
                    del.setInt(2, weekNumber);
                    del.executeUpdate();
                }
                String insertSql = "INSERT INTO lineup (team_id, player_id, week_number, slot) "
                                 + "VALUES (?, ?, ?, ?)";
                for(LineupEntry entry : entries) {
                    try(PreparedStatement ins = conn.prepareStatement(insertSql)) {
                        ins.setInt(1, teamId);
                        ins.setInt(2, entry.getPlayerId());
                        ins.setInt(3, weekNumber);
                        ins.setString(4, entry.getSlot());
                        ins.executeUpdate();
                    }
                }
                conn.commit();
            } catch(SQLException e) {
                conn.rollback();
                throw new RuntimeException("Database error", e);
            } finally {
                conn.setAutoCommit(true);
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }

    // Q9: returns the lineup for one team/week. Lists slot, player name, fantasy points in UI
    public List<FullLineupEntry> getFullLineup(int teamId, int weekNumber) {
        String sql = "SELECT l.lineup_id, l.slot, l.week_number, t.team_id, t.team_name, p.player_id, p.first_name, p.last_name, p.position, p.nfl_team, p.status, "
                   + "(SELECT ps.fantasy_points FROM player_stats ps WHERE ps.player_id = p.player_id AND ps.week_number = l.week_number) AS fantasy_points "
                   + "FROM lineup l "
                   + "JOIN team t ON l.team_id = t.team_id "
                   + "JOIN player p ON l.player_id = p.player_id "
                   + "WHERE l.team_id = ? AND l.week_number = ?";
        List<FullLineupEntry> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, teamId);
            ps.setInt(2, weekNumber);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(new FullLineupEntry(
                        rs.getInt("lineup_id"),
                        rs.getString("slot"),
                        rs.getInt("week_number"),
                        rs.getInt("team_id"),
                        rs.getString("team_name"),
                        rs.getInt("player_id"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        rs.getString("position"),
                        rs.getString("nfl_team"),
                        rs.getString("status"),
                        rs.getObject("fantasy_points", Double.class)
                    ));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }
}
