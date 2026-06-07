package fantasy.api;

import fantasy.database.LeaguesDatabase;
import fantasy.entities.League;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/leagues")
public class LeaguesApi {

    private final LeaguesDatabase dao;

    // Spring injects the LeaguesDatabase
    public LeaguesApi(LeaguesDatabase dao) {
        this.dao = dao;
    }

    // GET /api/leagues : returns every league in the database
    @GetMapping
    public ResponseEntity<List<League>> getAll() {
        return ResponseEntity.ok(dao.getAll());
    }

    // POST /api/leagues : creates a league and returns it with the generated id
    @PostMapping
    public ResponseEntity<League> create(@RequestBody League league) {
        int id = dao.create(league);
        league.setLeagueId(id);
        return ResponseEntity.status(201).body(league);
    }

    // PUT /api/leagues/{id} : updates a league
    @PutMapping("/{id}")
    public ResponseEntity<League> update(@PathVariable int id, @RequestBody League league) {
        league.setLeagueId(id);
        if(!dao.update(league)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "League not found");
        }
        return ResponseEntity.ok(league);
    }

    // DELETE /api/leagues/{id} : deletes a league and the teams and matchups cascade out
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if(!dao.delete(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "League not found");
        }
        return ResponseEntity.noContent().build();
    }
}
