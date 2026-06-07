package fantasy.api;

import fantasy.database.TeamsDatabase;
import fantasy.entities.Roster;
import fantasy.entities.Team;
import fantasy.entities.TeamWithRoster;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamsApi {

    private final TeamsDatabase dao;

    // Spring injects the TeamsDatabase
    public TeamsApi(TeamsDatabase dao) {
        this.dao = dao;
    }

    // POST /api/teams : creates a team and returns it with the generated id
    @PostMapping
    public ResponseEntity<Team> create(@RequestBody Team team) {
        int id = dao.create(team);
        team.setTeamId(id);
        return ResponseEntity.status(201).body(team);
    }

    // PUT /api/teams/{id} : updates a team's name and owner
    @PutMapping("/{id}")
    public ResponseEntity<Team> update(@PathVariable int id, @RequestBody Team team) {
        team.setTeamId(id);
        if(!dao.update(team)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found");
        }
        return ResponseEntity.ok(team);
    }

    // DELETE /api/teams/{id} : deletes the team and rosters, lineups, and matchups cascade out
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if(!dao.delete(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found");
        }
        return ResponseEntity.noContent().build();
    }

    // GET /api/teams/rosters : returns every team in the league with its active roster
    @GetMapping("/rosters")
    public ResponseEntity<List<TeamWithRoster>> getTeamsWithActiveRosters(@RequestParam int leagueId) {
        return ResponseEntity.ok(dao.getTeamsWithActiveRosters(leagueId));
    }

    // POST /api/teams/roster : adds a player to a team's roster. Rejects if the player is already rostered on a team in the same league
    @PostMapping("/roster")
    public ResponseEntity<Roster> addPlayer(@RequestBody Roster roster) {
        if(dao.isPlayerOnActiveRosterInLeague(roster.getPlayerId(), roster.getTeamId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Player is already on an active roster in this league");
        }
        int id = dao.addPlayer(roster);
        roster.setRosterId(id);
        return ResponseEntity.status(201).body(roster);
    }
}
