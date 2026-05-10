package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Q6 row: aggregate fantasy points per position
// Used in PlayerStatsDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PositionAvg {

    private String position;
    private double avgPoints;
    private long gamesPlayed;
}
