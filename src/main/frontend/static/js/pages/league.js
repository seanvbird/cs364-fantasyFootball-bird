import { API, showToast } from '../api.js';
import { state } from '../state.js';
import { wireTeamsTab, renderTeamsList } from './teams.js';
import { loadRosters } from './rosters.js';
import { wireLineupTab } from './submitLineup.js';
import { wirePlayersTab, loadPlayers } from './players.js';
import { wirePlayerStatsTab } from './playerStats.js';
import { loadMatchups } from './matchups.js';

// Bootstraps the league workspace: parses URL, loads teams, then wires every tab.
// Redirects back to /leagues.html if no valid leagueId was passed in.
document.addEventListener('DOMContentLoaded', async function () {
    const params = new URLSearchParams(window.location.search);
    state.leagueId = parseInt(params.get('leagueId'));
    state.leagueName = params.get('leagueName') || 'League';
    if(!state.leagueId || isNaN(state.leagueId)) {
        window.location.href = '/leagues.html';
        return;
    }

    document.getElementById('leagueNameHeader').textContent = state.leagueName;
    document.title = `Fantasy Football — ${state.leagueName}`;

    // Teams must load first so dropdowns are populated before the other tabs render.
    await loadLeagueTeams();

    loadPlayers();
    loadRosters();
    loadMatchups();

    wireTeamsTab();
    wireLineupTab();
    wirePlayersTab();
    wirePlayerStatsTab();
});

// Fetches every team via the Q1 standings endpoint at minWins=0 — one trip yields teamId,
// teamName, ownerName, and wins. Exported so teams.js can refresh after a CRUD action.
export async function loadLeagueTeams() {
    try {
        state.leagueTeams = await API.getJSON(`/teams/standings?leagueId=${state.leagueId}&minWins=0`);
        populateAllTeamDropdowns();
        renderTeamsList();
    }catch(err) {
        showToast(`Failed to load teams: ${err.message}`, 'error');
    }
}

// Refills every team-selector dropdown in the workspace from the cached leagueTeams.
function populateAllTeamDropdowns() {
    const dropdownIds = ['lineupTeamSelect', 'addToTeamSelect', 'viewLineupTeamSelect'];
    dropdownIds.forEach(function (id) {
        const select = document.getElementById(id);
        if(!select) return;
        // Keep the placeholder option (index 0) and clear the rest so reloads don't duplicate entries.
        while(select.options.length > 1) select.remove(1);
        state.leagueTeams.forEach(function (t) {
            const opt = document.createElement('option');
            opt.value = t.teamId;
            opt.textContent = t.teamName;
            select.appendChild(opt);
        });
    });
}
