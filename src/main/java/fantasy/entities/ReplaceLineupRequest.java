package fantasy.entities;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// The request body for PUT /api/lineups. Atomic full-lineup replace for a team and week
// Used in LineupApi
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplaceLineupRequest {

    private int teamId;
    private int weekNumber;
    private List<LineupEntry> entries;
}
