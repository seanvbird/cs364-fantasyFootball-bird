package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Row in the PlayerStats table. A player's weekly fantasy stats
// Used in PlayerStatsDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerStats {

    private int statId;
    private int playerId;
    private int weekNumber;
    private int passingYards;
    private int rushingYards;
    private int receivingYards;
    private int touchdowns;
    private double fantasyPoints;
}
