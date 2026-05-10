import { API, escapeHtml } from '../api.js';
import { renderRosterRow } from '../helpers.js';
import { state } from '../state.js';

// Loads every team's active roster in one trip via the composite endpoint to avoid an N+1.
export async function loadRosters() {
    const container = document.getElementById('rostersContainer');
    container.innerHTML = `<p class="text-muted">Loading rosters…</p>`;
    try {
        const data = await API.getJSON(`/rosters/by-league?leagueId=${state.leagueId}`);
        renderRosters(data);
    }catch(err) {
        container.innerHTML = `<p class="text-danger">Failed to load rosters: ${escapeHtml(err.message)}</p>`;
    }
}

// Renders one card per team. Rows reuse renderRosterRow so the column shape matches Submit Lineup.
function renderRosters(teams) {
    const container = document.getElementById('rostersContainer');
    if(!teams || teams.length === 0) {
        container.innerHTML = `<p class="text-muted">No teams in this league.</p>`;
        return;
    }
    let html = '';
    for(let i = 0; i < teams.length; i++) {
        const team = teams[i];
        let rosterRows;
        if(team.roster && team.roster.length > 0) {
            rosterRows = '';
            for(let j = 0; j < team.roster.length; j++) {
                rosterRows += renderRosterRow(team.roster[j]);
            }
        }else {
            rosterRows = `<tr><td colspan="4" class="text-muted text-center py-2">No players on roster.</td></tr>`;
        }

        html += `<div class="card mb-3">
            <div class="card-header">
                <strong>${escapeHtml(team.teamName)}</strong>
            </div>
            <div class="table-responsive">
                <table class="table table-sm mb-0">
                    <thead class="table-light"><tr><th>Player</th><th>Position</th><th>NFL Team</th><th>Status</th></tr></thead>
                    <tbody>${rosterRows}</tbody>
                </table>
            </div>
        </div>`;
    }
    container.innerHTML = html;
}
