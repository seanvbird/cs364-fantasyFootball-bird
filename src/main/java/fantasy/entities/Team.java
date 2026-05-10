package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Row in the Team table
// Used in TeamDatabase, RosterDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    private int teamId;
    private String teamName;
    private String ownerName;
    private int leagueId;
}
