package fantasy.api;

import fantasy.database.MatchupsDatabase;
import fantasy.entities.Matchup;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matchups")
public class MatchupsApi {

    private final MatchupsDatabase dao;

    // Spring injects the MatchupsDatabase
    public MatchupsApi(MatchupsDatabase dao) {
        this.dao = dao;
    }

    // GET /api/matchups : returns every matchup scheduled in the league
    @GetMapping
    public ResponseEntity<List<Matchup>> getByLeague(@RequestParam int leagueId) {
        return ResponseEntity.ok(dao.getByLeague(leagueId));
    }
}
