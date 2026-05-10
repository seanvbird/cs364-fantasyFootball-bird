package fantasy.api;

import fantasy.database.PlayerDatabase;
import fantasy.entities.Player;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerApi {

    private final PlayerDatabase dao;

    // Spring injects the PlayerDatabase
    public PlayerApi(PlayerDatabase dao) {
        this.dao = dao;
    }

    // GET /api/players : returns every player in the database
    @GetMapping
    public ResponseEntity<List<Player>> getAll() {
        return ResponseEntity.ok(dao.getAll());
    }

    // GET /api/players/free-agents : Q5 - returns free agents for a league
    @GetMapping("/free-agents")
    public ResponseEntity<List<Player>> getFreeAgents(@RequestParam int leagueId) {
        return ResponseEntity.ok(dao.getFreeAgents(leagueId));
    }

    // GET /api/players/search : Q7 - returns players who match on first or last name
    @GetMapping("/search")
    public ResponseEntity<List<Player>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(dao.searchByName(name));
    }

    // GET /api/players/league-rostered : Q8 - players currently on an active roster for a league
    @GetMapping("/league-rostered")
    public ResponseEntity<List<Player>> getLeagueRostered(@RequestParam int leagueId) {
        return ResponseEntity.ok(dao.getLeagueRostered(leagueId));
    }
}
