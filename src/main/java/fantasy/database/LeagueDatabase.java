package fantasy.database;

import fantasy.entities.League;

import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;

@Component
public class LeagueDatabase {

    private final DataSource dataSource;

    // JDBC DataSource configured from application.properties
    public LeagueDatabase(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Returns every league row in the database and an empty list if none
    public List<League> getAll() {
        String sql = "SELECT league_id, league_name, season_year, draft_date, scoring_type "
                   + "FROM league";
        List<League> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while(rs.next()) {
                results.add(mapRow(rs));
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }

    // Inserts a new league row and returns the league_id
    public int create(League league) {
        String sql = "INSERT INTO league (league_name, season_year, draft_date, scoring_type) "
                   + "VALUES (?, ?, ?, ?)";
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, league.getLeagueName());
            ps.setInt(2, league.getSeasonYear());
            ps.setString(3, league.getDraftDate());
            ps.setString(4, league.getScoringType());
            ps.executeUpdate();
            try(ResultSet keys = ps.getGeneratedKeys()) {
                keys.next();
                return keys.getInt(1);
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }

    // Updates every changeable field on an existing league. Returns false if no row matched the given leagueId
    public boolean update(League league) {
        String sql = "UPDATE league "
                   + "SET league_name = ?, season_year = ?, draft_date = ?, scoring_type = ? "
                   + "WHERE league_id = ?";
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, league.getLeagueName());
            ps.setInt(2, league.getSeasonYear());
            ps.setString(3, league.getDraftDate());
            ps.setString(4, league.getScoringType());
            ps.setInt(5, league.getLeagueId());
            return ps.executeUpdate() > 0;
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }

    // Deletes a league. Teams and matchups cascade out automatically because of ON DELETE CASCADE.
    // Returns false if no row matched.
    public boolean delete(int id) {
        String sql = "DELETE FROM league "
                   + "WHERE league_id = ?";
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
    }

    // Builds a League object from the current row of a ResultSet.
    private League mapRow(ResultSet rs) throws SQLException {
        return new League(
            rs.getInt("league_id"),
            rs.getString("league_name"),
            rs.getInt("season_year"),
            rs.getString("draft_date"),
            rs.getString("scoring_type")
        );
    }
}
