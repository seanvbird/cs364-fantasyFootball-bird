package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Q9 row: a single starter for a team and the week joined with player info and weekly stats
// Used in LineupDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FullLineupEntry {

    private int lineupId;
    private String slot;
    private int weekNumber;
    private int teamId;
    private String teamName;
    private int playerId;
    private String firstName;
    private String lastName;
    private String position;
    private String nflTeam;
    private String status;
    private Double fantasyPoints;
}
