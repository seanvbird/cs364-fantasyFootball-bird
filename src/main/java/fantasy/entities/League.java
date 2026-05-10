package fantasy.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Row in the League table
// Used in LeagueDatabase
@Data
@NoArgsConstructor
@AllArgsConstructor
public class League {

    private int leagueId;
    private String leagueName;
    private int seasonYear;
    private String draftDate;
    private String scoringType;
}
