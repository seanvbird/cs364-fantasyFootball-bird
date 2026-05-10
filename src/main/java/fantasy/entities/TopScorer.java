package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Q4 row: a top fantasy scorer for a given week
// Used in PlayerStatsDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopScorer {

    private String firstName;
    private String lastName;
    private String position;
    private String nflTeam;
    private Double fantasyPoints;
    private int weekNumber;
}
