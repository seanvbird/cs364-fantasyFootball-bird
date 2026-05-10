import { API, escapeHtml, showToast } from '../api.js';
import { renderFullLineup, formatPlayerName } from '../helpers.js';
import { CURRENT_WEEK } from '../state.js';

// Picking a team auto-loads its roster as a checklist; clearing the dropdown hides the section.
export function wireLineupTab() {
    document.getElementById('lineupTeamSelect').addEventListener('change', function () {
        const tid = this.value ? parseInt(this.value) : null;
        if(tid) {
            loadLineupRoster(tid);
        }else {
            document.getElementById('lineupRosterSection').classList.add('d-none');
        }
    });

    document.getElementById('submitLineupBtn').addEventListener('click', handleSubmitLineup);
    document.getElementById('viewLineupBtn').addEventListener('click', handleViewLineup);
}

// Loads the active roster for the selected team and renders it as a checkbox list.
// Unhides the section after data lands so it doesn't flash empty during the fetch.
async function loadLineupRoster(teamId) {
    try {
        const roster = await API.getJSON(`/rosters?teamId=${teamId}`);
        renderLineupRoster(roster);
        document.getElementById('lineupRosterSection').classList.remove('d-none');
    }catch(err) {
        showToast(`Failed to load roster: ${err.message}`, 'error');
    }
}

// Each checkbox carries playerId + NFL position in data-* attrs so the submit handler builds entries without re-fetching.
function renderLineupRoster(roster) {
    const tbody = document.getElementById('lineupRosterBody');
    if(!roster || roster.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-muted text-center py-3">No players on roster.</td></tr>`;
        return;
    }
    let html = '';
    for(let i = 0; i < roster.length; i++) {
        const r = roster[i];
        const pos = r.position || 'QB';
        html += `<tr>
            <td><input type="checkbox" class="form-check-input lineup-player-check" data-player-id="${r.playerId}" data-position="${escapeHtml(pos)}"></td>
            <td>${formatPlayerName(r)}</td>
            <td>${escapeHtml(pos)}</td>
            <td>${escapeHtml(r.nflTeam || '')}</td>
            <td>${escapeHtml(r.status || '')}</td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

// Builds the lineup payload from checked rows and PUTs it as one atomic replace.
// Button is disabled during the request because the server-side replace is DELETE+INSERT in one transaction —
// two interleaved submits would corrupt the lineup.
async function handleSubmitLineup() {
    const teamId = parseInt(document.getElementById('lineupTeamSelect').value);
    if(!teamId) { showToast('Select a team first.', 'info'); return; }

    const checkedRows = Array.from(document.querySelectorAll('#lineupRosterBody tr')).filter(function (row) {
        return row.querySelector('.lineup-player-check:checked');
    });
    if(checkedRows.length === 0) { showToast('Select at least one player.', 'info'); return; }

    // Each entry's slot is auto-filled from the player's NFL position; the server does no slot validation.
    const entries = checkedRows.map(function (row) {
        const cb = row.querySelector('.lineup-player-check');
        return { playerId: parseInt(cb.dataset.playerId), slot: cb.dataset.position };
    });

    const btn = document.getElementById('submitLineupBtn');
    btn.disabled = true;
    try {
        await API.putJSON('/lineups', {
            teamId: teamId,
            weekNumber: CURRENT_WEEK,
            entries: entries,
        });
    }catch(err) {
        showToast(`Lineup error: ${err.message}`, 'error');
    }finally {
        btn.disabled = false;
    }
}

// Q9: fetches a team's full lineup with weekly stats and hands it to the shared renderFullLineup.
// fantasy_points can be NULL when no stats row exists; renderFullLineup shows '—' for those.
async function handleViewLineup() {
    const teamId = parseInt(document.getElementById('viewLineupTeamSelect').value);
    const week = parseInt(document.getElementById('viewLineupWeekInput').value);
    const tbody = document.getElementById('viewLineupBody');
    if(!teamId) { showToast('Select a team.', 'info'); return; }
    if(!week) { showToast('Enter a week number.', 'info'); return; }
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-2">Loading…</td></tr>`;
    try {
        const lineup = await API.getJSON(`/lineups/full?teamId=${teamId}&week=${week}`);
        renderFullLineup(lineup, tbody);
    }catch(err) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-danger text-center py-2">Failed to load lineup.</td></tr>`;
    }
}
