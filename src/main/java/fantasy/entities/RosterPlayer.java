package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Row for each player in a roster, used by TeamWithRoster entity in a list for the entire roster
// Used in RosterDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RosterPlayer {

    private int rosterId;
    private int teamId;
    private int playerId;
    private int acquiredWeek;
    private Integer droppedWeek;
    private String firstName;
    private String lastName;
    private String position;
    private String nflTeam;
    private String status;
}
