package fantasy.api;

import fantasy.database.RosterDatabase;
import fantasy.entities.Roster;
import fantasy.entities.RosterPlayer;
import fantasy.entities.TeamWithRoster;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/rosters")
public class RosterApi {

    private final RosterDatabase dao;

    // Spring injects the RosterDatabase
    public RosterApi(RosterDatabase dao) {
        this.dao = dao;
    }

    // GET /api/rosters : returns the team's active roster for submit lineup tab
    @GetMapping
    public ResponseEntity<List<RosterPlayer>> getByTeamId(@RequestParam int teamId) {
        return ResponseEntity.ok(dao.getByTeamId(teamId));
    }

    // GET /api/rosters/by-league : returns every team in the league with its roster
    @GetMapping("/by-league")
    public ResponseEntity<List<TeamWithRoster>> getTeamsWithActiveRosters(@RequestParam int leagueId) {
        return ResponseEntity.ok(dao.getTeamsWithActiveRosters(leagueId));
    }

    // POST /api/rosters : adds a player to a teams roster. Rejects if the player is already rostered on a team in the same league
    @PostMapping
    public ResponseEntity<Roster> addPlayer(@RequestBody Roster roster) {
        if(dao.isPlayerOnActiveRosterInLeague(roster.getPlayerId(), roster.getTeamId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Player is already on an active roster in this league");
        }
        int id = dao.addPlayer(roster);
        roster.setRosterId(id);
        return ResponseEntity.status(201).body(roster);
    }
}
