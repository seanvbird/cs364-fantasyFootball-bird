package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Q1 row: a team in the league with its win count
// Used in TeamDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamStanding {

    private int teamId;
    private String teamName;
    private String ownerName;
    private long wins;
}
