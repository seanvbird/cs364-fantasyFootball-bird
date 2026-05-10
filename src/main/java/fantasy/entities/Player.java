package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Row in the Player table
// Used in PlayerDatabase, LineupDatabase, RosterDatabase, PlayerStatsDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Player {

    private int playerId;
    private String firstName;
    private String lastName;
    private String position;
    private String nflTeam;
    private String status;
    private int byeWeek;
}
