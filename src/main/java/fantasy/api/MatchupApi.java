package fantasy.api;

import fantasy.database.MatchupDatabase;
import fantasy.entities.Matchup;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matchups")
public class MatchupApi {

    private final MatchupDatabase dao;

    // Spring injects the MatchupDatabase
    public MatchupApi(MatchupDatabase dao) {
        this.dao = dao;
    }

    // GET /api/matchups : returns every matchup scheduled in the league
    @GetMapping
    public ResponseEntity<List<Matchup>> getByLeague(@RequestParam int leagueId) {
        return ResponseEntity.ok(dao.getByLeague(leagueId));
    }
}
