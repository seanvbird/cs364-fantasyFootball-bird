import { API, escapeHtml, showToast } from './api.js';
import { state } from './state.js';

// Returns the team object from the cached leagueTeams matching the given id.
export function getTeamById(id) {
    return state.leagueTeams.find(function (t) { return t.teamId === id; });
}

// Bootstrap modal show/hide wrappers so callers pass an element id, not a DOM node.
export function showModal(id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
}

export function hideModal(id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).hide();
}

// Joins first + last name into one escaped string; tolerates missing parts.
export function formatPlayerName(p) {
    return [p.firstName, p.lastName].filter(Boolean).map(escapeHtml).join(' ');
}

// Renders one roster row. Shared by Rosters and Submit Lineup tabs so columns stay in sync.
export function renderRosterRow(p) {
    return `<tr>
        <td>${formatPlayerName(p)}</td>
        <td>${escapeHtml(p.position || '')}</td>
        <td>${escapeHtml(p.nflTeam || '')}</td>
        <td>${escapeHtml(p.status || '')}</td>
    </tr>`;
}

// Q9: renders a full-lineup result (slot, name, position, fantasy pts) into tbody.
// fantasyPoints can be NULL when no stats row exists; show '—' instead of 0 to keep that distinct.
export function renderFullLineup(lineup, tbody) {
    if(!lineup || lineup.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-2">No lineup set for this week.</td></tr>`;
        return;
    }
    let html = '';
    for(let i = 0; i < lineup.length; i++) {
        const e = lineup[i];
        const pts = e.fantasyPoints != null ? parseFloat(e.fantasyPoints).toFixed(2) : '—';
        html += `<tr>
            <td><strong>${escapeHtml(e.slot || '')}</strong></td>
            <td>${formatPlayerName(e)}</td>
            <td>${escapeHtml(e.position || '')}</td>
            <td>${pts}</td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

// Generic fetch+render: replaces tbody with one row per result; toasts on error.
export async function loadIntoTable(url, tbodyId, renderRow) {
    try {
        const rows = await API.getJSON(url);
        const tbody = document.getElementById(tbodyId);
        tbody.innerHTML = '';
        rows.forEach(r => tbody.insertAdjacentHTML('beforeend', renderRow(r)));
    }catch(err) {
        showToast(err.message, 'error');
    }
}
