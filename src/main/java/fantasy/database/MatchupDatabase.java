package fantasy.database;

import fantasy.entities.Matchup;

import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Component
public class MatchupDatabase {

    private final DataSource dataSource;

    // JDBC DataSource configured from application.properties
    public MatchupDatabase(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Returns every matchup for every week scheduled in the league
    public List<Matchup> getByLeague(int leagueId) {
        String sql = "SELECT matchup_id, league_id, week_number, home_team_id, away_team_id, home_score, away_score, winner_team_id "
                   + "FROM matchup "
                   + "WHERE league_id = ?";
        List<Matchup> results = new ArrayList<>();
        try(Connection conn = dataSource.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, leagueId);
            try(ResultSet rs = ps.executeQuery()) {
                while(rs.next()) {
                    results.add(new Matchup(
                            rs.getInt("matchup_id"),
                            rs.getInt("league_id"),
                            rs.getInt("week_number"),
                            rs.getInt("home_team_id"),
                            rs.getInt("away_team_id"),
                            rs.getObject("home_score", Double.class),
                            rs.getObject("away_score", Double.class),
                            rs.getObject("winner_team_id", Integer.class)
                    ));
                }
            }
        } catch(SQLException e) {
            throw new RuntimeException("Database error", e);
        }
        return results;
    }
}
