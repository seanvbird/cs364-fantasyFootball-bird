package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Q2 row: a team whose average home score exceeds the threshold
// Used in TeamDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamHomeAvg {

    private int teamId;
    private String teamName;
    private double avgScore;
}
