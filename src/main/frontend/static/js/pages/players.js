import { API, escapeHtml, showToast } from '../api.js';
import { formatPlayerName, showModal } from '../helpers.js';
import { state, CURRENT_WEEK } from '../state.js';

// One 3-state filter driving which endpoint loadPlayers() hits.
// Single variable makes Q5/Q8 mutual exclusion structural — there's no way to set both at once.
let playerFilter = 'all'; // 'all' | 'freeAgents' | 'rostered'

export function wirePlayersTab() {
    // Free Agents toggle: clicking when already on flips back to 'all'.
    document.getElementById('freeAgentsToggle').addEventListener('click', function () {
        playerFilter = (playerFilter === 'freeAgents') ? 'all' : 'freeAgents';
        updateToggleVisuals();
        loadPlayers();
    });

    // Rostered toggle: same on/off semantics, mutually exclusive with Free Agents via the shared filter.
    document.getElementById('rosteredToggle').addEventListener('click', function () {
        playerFilter = (playerFilter === 'rostered') ? 'all' : 'rostered';
        updateToggleVisuals();
        loadPlayers();
    });

    // Search is intentionally NOT cleared here — search wins in the loadPlayers() dispatch order.
    document.getElementById('showAllPlayersBtn').addEventListener('click', function () {
        playerFilter = 'all';
        updateToggleVisuals();
        loadPlayers();
    });

    // Q7: debounced name search. 200 ms timer collapses bursts of input events.
    let searchTimer = null;
    document.getElementById('playerSearchInput').addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(loadPlayers, 200);
    });

    document.getElementById('playersTableBody').addEventListener('change', function (e) {
        if(e.target.classList.contains('player-select-radio')) {
            updateAddButtonState();
        }
    });
    document.getElementById('addToTeamSelect').addEventListener('change', updateAddButtonState);

    document.getElementById('playersTableBody').addEventListener('click', function (e) {
        const nameLink = e.target.closest('.player-name-link');
        if(nameLink) {
            openPlayerStatsModal(parseInt(nameLink.dataset.playerId), nameLink.textContent);
        }
    });

    document.getElementById('addPlayerBtn').addEventListener('click', handleAddPlayer);
}

// Re-syncs both toggle buttons from playerFilter. Cheaper than tracking which one changed.
function updateToggleVisuals() {
    const fa = document.getElementById('freeAgentsToggle');
    const ros = document.getElementById('rosteredToggle');
    fa.classList.toggle('btn-outline-secondary', playerFilter !== 'freeAgents');
    fa.classList.toggle('btn-secondary', playerFilter === 'freeAgents');
    ros.classList.toggle('btn-outline-secondary', playerFilter !== 'rostered');
    ros.classList.toggle('btn-secondary', playerFilter === 'rostered');
}

// Enables Add Player only when both a player radio and a team are selected; avoids a 400 round-trip.
function updateAddButtonState() {
    const anySelected = document.querySelector('.player-select-radio:checked');
    const teamSelected = document.getElementById('addToTeamSelect').value;
    document.getElementById('addPlayerBtn').disabled = !(anySelected && teamSelected);
}

// Fetches the player list using the active filter.
// Dispatch priority: search > free-agents > rostered > all — search wins so the toggle can stay highlighted while narrowing by name.
export async function loadPlayers() {
    try {
        let path;
        const trimmed = document.getElementById('playerSearchInput').value.trim();
        if(trimmed) {
            path = `/players/search?name=${encodeURIComponent(trimmed)}`;
        }else if(playerFilter === 'freeAgents') {
            path = `/players/free-agents?leagueId=${state.leagueId}`;
        }else if(playerFilter === 'rostered') {
            path = `/players/league-rostered?leagueId=${state.leagueId}`;
        }else {
            path = '/players';
        }
        const players = await API.getJSON(path);
        renderPlayers(players);
    }catch(err) {
        showToast(`Failed to load players: ${err.message}`, 'error');
    }
}

// Each row carries data-player-id on both the radio (add-to-roster) and the name link (stats modal).
function renderPlayers(players) {
    const tbody = document.getElementById('playersTableBody');
    if(!players || players.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No players found.</td></tr>`;
        return;
    }
    let html = '';
    for(let i = 0; i < players.length; i++) {
        const p = players[i];
        html += `<tr>
            <td><input type="radio" name="playerSelect" class="form-check-input player-select-radio" data-player-id="${p.playerId}"></td>
            <td><a href="#" class="player-name-link" data-player-id="${p.playerId}">${formatPlayerName(p)}</a></td>
            <td>${escapeHtml(p.position || '')}</td>
            <td>${escapeHtml(p.nflTeam || '')}</td>
            <td>${escapeHtml(p.status || '')}</td>
            <td>${escapeHtml(p.byeWeek != null ? p.byeWeek : '')}</td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

// Opens the per-player stats modal and lazily fetches that player's weekly stats.
// Nullable stat fields render as '—' instead of 0 so missing data isn't confused with a real zero.
async function openPlayerStatsModal(playerId, name) {
    document.getElementById('playerStatsModalTitle').textContent = `${name} — Stats`;
    const tbody = document.getElementById('playerStatsBody');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-2">Loading…</td></tr>`;
    showModal('playerStatsModal');
    try {
        const stats = await API.getJSON(`/stats?playerId=${playerId}`);
        if(!stats || stats.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-2">No stats available.</td></tr>`;
            return;
        }
        let html = '';
        for(let i = 0; i < stats.length; i++) {
            const s = stats[i];
            html += `<tr>
                <td>${escapeHtml(s.weekNumber)}</td>
                <td>${escapeHtml(s.passingYards != null ? s.passingYards : '—')}</td>
                <td>${escapeHtml(s.rushingYards != null ? s.rushingYards : '—')}</td>
                <td>${escapeHtml(s.receivingYards != null ? s.receivingYards : '—')}</td>
                <td>${escapeHtml(s.touchdowns != null ? s.touchdowns : '—')}</td>
                <td>${s.fantasyPoints != null ? parseFloat(s.fantasyPoints).toFixed(2) : '—'}</td>
            </tr>`;
        }
        tbody.innerHTML = html;
    }catch(err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-2">Failed to load stats.</td></tr>`;
    }
}

// POSTs a new roster entry for the selected player + team; acquiredWeek is hardcoded to CURRENT_WEEK.
async function handleAddPlayer() {
    const radioEl = document.querySelector('.player-select-radio:checked');
    const teamEl = document.getElementById('addToTeamSelect');
    if(!radioEl || !teamEl.value) { showToast('Select a player and a team.', 'info'); return; }
    const body = {
        teamId: parseInt(teamEl.value),
        playerId: parseInt(radioEl.dataset.playerId),
        acquiredWeek: CURRENT_WEEK,
    };
    try {
        await API.postJSON('/rosters', body);
        await loadPlayers();
        document.getElementById('addPlayerBtn').disabled = true;
    }catch(err) {
        showToast(`Error: ${err.message}`, 'error');
    }
}
