package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Row in the Matchup table
// Used in MatchupDatabase, TeamDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Matchup {

    private int matchupId;
    private int leagueId;
    private int weekNumber;
    private int homeTeamId;
    private int awayTeamId;
    private Double homeScore;
    private Double awayScore;
    private Integer winnerTeamId;
}
