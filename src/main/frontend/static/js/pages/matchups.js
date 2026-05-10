import { API, escapeHtml, showToast } from '../api.js';
import { getTeamById } from '../helpers.js';
import { state } from '../state.js';

// Loads matchups for this league only; leagueId scopes the result so other leagues' games don't bleed in.
export async function loadMatchups() {
    const tbody = document.getElementById('matchupsTableBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">Loading…</td></tr>`;
    try {
        const matchups = await API.getJSON(`/matchups?leagueId=${state.leagueId}`);
        renderMatchups(matchups);
    }catch(err) {
        showToast(`Failed to load matchups: ${err.message}`, 'error');
    }
}

// Resolves team names from the cached leagueTeams so the server doesn't have to join.
// Unrecorded scores fall back to '—' instead of 0.
function renderMatchups(matchups) {
    const tbody = document.getElementById('matchupsTableBody');
    if(!matchups || matchups.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No matchups found.</td></tr>`;
        return;
    }
    let html = '';
    for(let i = 0; i < matchups.length; i++) {
        const m = matchups[i];
        const homeTeam = getTeamById(m.homeTeamId);
        const awayTeam = getTeamById(m.awayTeamId);
        const homeName = homeTeam ? homeTeam.teamName : m.homeTeamId;
        const awayName = awayTeam ? awayTeam.teamName : m.awayTeamId;

        let winnerName = '—';
        if(m.winnerTeamId) {
            const wt = getTeamById(m.winnerTeamId);
            winnerName = wt ? wt.teamName : m.winnerTeamId;
        }
        const homeScore = m.homeScore != null ? parseFloat(m.homeScore).toFixed(2) : '—';
        const awayScore = m.awayScore != null ? parseFloat(m.awayScore).toFixed(2) : '—';

        html += `<tr>
            <td>${escapeHtml(m.weekNumber)}</td>
            <td>${escapeHtml(homeName)}</td>
            <td>${escapeHtml(awayName)}</td>
            <td>${homeScore}</td>
            <td>${awayScore}</td>
            <td>${escapeHtml(winnerName)}</td>
        </tr>`;
    }
    tbody.innerHTML = html;
}
