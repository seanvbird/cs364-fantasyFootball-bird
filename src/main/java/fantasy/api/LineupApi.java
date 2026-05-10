package fantasy.api;

import fantasy.database.LineupDatabase;
import fantasy.entities.FullLineupEntry;
import fantasy.entities.ReplaceLineupRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/lineups")
public class LineupApi {

    private final LineupDatabase dao;

    // Spring injects the LineupDatabase
    public LineupApi(LineupDatabase dao) {
        this.dao = dao;
    }

    // PUT /api/lineups : atomically replaces a team's lineup for the week
    @PutMapping
    public ResponseEntity<Void> replaceLineup(@RequestBody ReplaceLineupRequest body) {
        if(body.getEntries() == null || body.getEntries().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "teamId, weekNumber, and entries are required");
        }
        dao.replaceLineup(body.getTeamId(), body.getWeekNumber(), body.getEntries());
        // just saving the lineup, nothing is returned so 204 status is used
        return ResponseEntity.noContent().build();
    }

    // GET /api/lineups/full : Q9 - returns full lineup
    @GetMapping("/full")
    public ResponseEntity<List<FullLineupEntry>> getFullLineup(@RequestParam int teamId, @RequestParam int week) {
        return ResponseEntity.ok(dao.getFullLineup(teamId, week));
    }
}
