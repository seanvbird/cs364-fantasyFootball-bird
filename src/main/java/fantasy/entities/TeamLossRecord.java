package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Q3 row: a team in the league with its loss count
// Used in TeamDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamLossRecord {

    private int teamId;
    private String teamName;
    private String ownerName;
    private long losses;
}
