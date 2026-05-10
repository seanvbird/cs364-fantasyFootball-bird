package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Row in the Roster table
// Used in RosterDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Roster {

    private int rosterId;
    private int teamId;
    private int playerId;
    private int acquiredWeek;
    private Integer droppedWeek;
}
