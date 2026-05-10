package fantasy.entities;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Contains the team plus its active roster
// Used in RosterDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamWithRoster {

    private int teamId;
    private String teamName;
    private List<RosterPlayer> roster;
}
