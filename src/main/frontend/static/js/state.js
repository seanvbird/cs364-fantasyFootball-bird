// Shared league-workspace state. Lives in its own module so tab files can import
// bindings without pulling in pages/league.js (which would create a circular import).
export const state = {
    leagueId: null,
    leagueName: '',
    leagueTeams: [],
};

// Hardcoded "current" week — the demo only operates on week 17.
export const CURRENT_WEEK = 17;
