package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// One entry inside a ReplaceLineupRequest. The player and the slot they should occupy
// Used in LineupDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineupEntry {

    private int playerId;
    private String slot;
}
