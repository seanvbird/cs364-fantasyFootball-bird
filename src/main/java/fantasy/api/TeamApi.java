package fantasy.api;

import fantasy.database.TeamDatabase;
import fantasy.entities.Team;
import fantasy.entities.TeamHomeAvg;
import fantasy.entities.TeamLossRecord;
import fantasy.entities.TeamStanding;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamApi {

    private final TeamDatabase dao;

    // Spring injects the TeamDatabase
    public TeamApi(TeamDatabase dao) {
        this.dao = dao;
    }

    // POST /api/teams : creates a team and returns it with the generated id
    @PostMapping
    public ResponseEntity<Team> create(@RequestBody Team team) {
        int id = dao.create(team);
        team.setTeamId(id);
        return ResponseEntity.status(201).body(team);
    }

    // GET /api/teams/standings : Q1 - returns teams in the league with at least "minWins" wins
    @GetMapping("/standings")
    public ResponseEntity<List<TeamStanding>> getStandings(@RequestParam int leagueId, @RequestParam int minWins) {
        return ResponseEntity.ok(dao.getStandings(leagueId, minWins));
    }

    // GET /api/teams/above-avg : Q2 - returns teams who have an average home score above the threshold
    @GetMapping("/above-avg")
    public ResponseEntity<List<TeamHomeAvg>> getTeamsAboveAvg(@RequestParam int leagueId, @RequestParam double threshold) {
        return ResponseEntity.ok(dao.getTeamsAboveAvg(leagueId, threshold));
    }

    // GET /api/teams/losses : Q3 - returns teams in the league with at least "minLosses" losses
    @GetMapping("/losses")
    public ResponseEntity<List<TeamLossRecord>> getTeamsWithMinLosses(@RequestParam int leagueId, @RequestParam int minLosses) {
        return ResponseEntity.ok(dao.getTeamsWithMinLosses(leagueId, minLosses));
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
}
