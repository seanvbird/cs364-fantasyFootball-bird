package fantasy.api;

import fantasy.database.PlayerStatsDatabase;
import fantasy.entities.PlayerStats;
import fantasy.entities.PositionAvg;
import fantasy.entities.TopScorer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class PlayerStatsApi {

    private final PlayerStatsDatabase dao;

    // Spring injects the PlayerStatsDatabase
    public PlayerStatsApi(PlayerStatsDatabase dao) {
        this.dao = dao;
    }

    // GET /api/stats : returns players weekly stats rows. For the player stats pop up
    @GetMapping
    public ResponseEntity<List<PlayerStats>> getByPlayer(@RequestParam int playerId) {
        return ResponseEntity.ok(dao.getByPlayer(playerId));
    }

    // GET /api/stats/top : Q4 - returns top 10 scoring players for a week
    @GetMapping("/top")
    public ResponseEntity<List<TopScorer>> getTopScorers(@RequestParam int week) {
        return ResponseEntity.ok(dao.getTopScorers(week));
    }

    // GET /api/stats/avg-by-position : Q6 - returns average fantasy points per position across all weeks
    @GetMapping("/avg-by-position")
    public ResponseEntity<List<PositionAvg>> getAvgByPosition() {
        return ResponseEntity.ok(dao.getAvgByPosition());
    }
}
