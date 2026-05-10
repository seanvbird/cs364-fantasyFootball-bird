import { API, escapeHtml, showToast } from '../api.js';
import { getTeamById, showModal, hideModal } from '../helpers.js';
import { state } from '../state.js';
import { loadLeagueTeams } from './league.js';

// Stashes the teamId pending deletion until the confirmation modal resolves.
let pendingDeleteTeamId = null;

export function wireTeamsTab() {
    // Per-row Edit / Delete use one delegated listener so newly rendered rows stay live.
    document.getElementById('teamsListBody').addEventListener('click', function (e) {
        const editBtn = e.target.closest('.edit-team-row');
        if(editBtn) {
            openEditTeamModal(parseInt(editBtn.dataset.teamId));
            return;
        }
        const deleteBtn = e.target.closest('.delete-team-row');
        if(deleteBtn) {
            const id = parseInt(deleteBtn.dataset.teamId);
            const team = getTeamById(id);
            openDeleteTeamModal(id, team ? team.teamName : 'this team');
        }
    });

    document.getElementById('minWinsBtn').addEventListener('click', applyMinWinsFilter);
    document.getElementById('minLossesBtn').addEventListener('click', applyMinLossesFilter);
    document.getElementById('showAllTeamsBtn').addEventListener('click', handleShowAllTeams);
    document.getElementById('newTeamBtn').addEventListener('click', openCreateTeamModal);
    document.getElementById('avgThresholdBtn').addEventListener('click', handleAvgThresholdFilter);

    // Same form handles create and edit; the handler branches on the hidden editingId.
    document.getElementById('teamForm').addEventListener('submit', handleTeamFormSubmit);
    document.getElementById('confirmDeleteTeamBtn').addEventListener('click', handleConfirmDeleteTeam);
}

// Defaults to all cached leagueTeams with the Wins column. The metric arg ('wins' | 'losses')
// drives both the header label and which field is read, so Q1 and Q3 share this render path.
export function renderTeamsList(data, metric) {
    const rows = data || state.leagueTeams;
    const key = metric || 'wins';
    const tbody = document.getElementById('teamsListBody');
    const headCell = document.getElementById('teamsListMetricCol');
    if(!tbody) return;
    if(headCell) headCell.textContent = key === 'losses' ? 'Losses' : 'Wins';
    if(!rows || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No teams match.</td></tr>`;
        return;
    }
    let html = '';
    for(let i = 0; i < rows.length; i++) {
        const t = rows[i];
        const metricVal = t[key] != null ? t[key] : 0;
        html += `<tr>
            <td>${escapeHtml(t.teamName || '')}</td>
            <td>${escapeHtml(t.ownerName || '')}</td>
            <td>${metricVal}</td>
            <td class="text-end">
                <button class="btn btn-outline-secondary btn-sm edit-team-row" data-team-id="${t.teamId}">Edit</button>
                <button class="btn btn-outline-danger btn-sm ms-1 delete-team-row" data-team-id="${t.teamId}">Delete</button>
            </td>
        </tr>`;
    }
    tbody.innerHTML = html;
}

// Q1: re-renders the team list filtered to teams with at least N wins.
async function applyMinWinsFilter() {
    const minWins = parseInt(document.getElementById('minWinsInput').value);
    if(isNaN(minWins) || minWins < 0) {
        showToast('Enter a non-negative number of wins.', 'info');
        return;
    }
    try {
        const rows = await API.getJSON(`/teams/standings?leagueId=${state.leagueId}&minWins=${minWins}`);
        renderTeamsList(rows, 'wins');
    }catch(err) {
        showToast(`Q1 error: ${err.message}`, 'error');
    }
}

// Q3: symmetric counterpart to Q1 — swaps the metric column to "Losses" via renderTeamsList's metric arg.
async function applyMinLossesFilter() {
    const minLosses = parseInt(document.getElementById('minLossesInput').value);
    if(isNaN(minLosses) || minLosses < 0) {
        showToast('Enter a non-negative number of losses.', 'info');
        return;
    }
    try {
        const rows = await API.getJSON(`/teams/losses?leagueId=${state.leagueId}&minLosses=${minLosses}`);
        renderTeamsList(rows, 'losses');
    }catch(err) {
        showToast(`Q3 error: ${err.message}`, 'error');
    }
}

function handleShowAllTeams() {
    renderTeamsList();
}

// Q2: teams whose AVG home_score exceeds the user-entered threshold.
// Result lives in its own card below the main list; unhide the wrapper before rendering rows.
async function handleAvgThresholdFilter() {
    const threshold = parseFloat(document.getElementById('avgThresholdInput').value);
    if(isNaN(threshold)) {
        showToast('Enter a numeric threshold.', 'info');
        return;
    }
    const wrap = document.getElementById('avgThresholdResultWrap');
    const tbody = document.getElementById('avgThresholdResultBody');
    try {
        const rows = await API.getJSON(`/teams/above-avg?leagueId=${state.leagueId}&threshold=${threshold}`);
        wrap.style.display = '';
        if(!rows || rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" class="text-muted text-center py-2">No teams meet the threshold.</td></tr>`;
            return;
        }
        let html = '';
        for(let i = 0; i < rows.length; i++) {
            const r = rows[i];
            html += `<tr>
                <td>${escapeHtml(r.teamName || '')}</td>
                <td>${parseFloat(r.avgScore || 0).toFixed(2)}</td>
            </tr>`;
        }
        tbody.innerHTML = html;
    }catch(err) {
        showToast(`Q2 error: ${err.message}`, 'error');
    }
}

// Opens the team modal in create mode (blank form, "Create" submit label, empty editingId).
function openCreateTeamModal() {
    document.getElementById('teamFormEditingId').value = '';
    document.getElementById('teamModalTitle').textContent = 'New Team';
    document.getElementById('teamModalSubmitBtn').textContent = 'Create';
    document.getElementById('teamForm').reset();
    showModal('teamModal');
}

// Opens the team modal in edit mode pre-filled from the cached team.
// Stamps teamId into editingId so the submit handler PUTs instead of POSTs.
function openEditTeamModal(id) {
    const team = getTeamById(id);
    if(!team) return;
    document.getElementById('teamFormEditingId').value = id;
    document.getElementById('teamModalTitle').textContent = 'Edit Team';
    document.getElementById('teamModalSubmitBtn').textContent = 'Save';
    document.getElementById('editTeamName').value = team.teamName;
    document.getElementById('editOwnerName').value = team.ownerName;
    showModal('teamModal');
}

// Single submit handler for create AND edit; reloads leagueTeams after success so dropdowns reflect the change.
async function handleTeamFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('teamFormEditingId').value;
    const body = {
        teamName: document.getElementById('editTeamName').value,
        ownerName: document.getElementById('editOwnerName').value,
        leagueId: state.leagueId,
    };
    try {
        if(id) {
            await API.putJSON(`/teams/${id}`, body);
        }else {
            await API.postJSON('/teams', body);
        }
        hideModal('teamModal');
        await loadLeagueTeams();
    }catch(err) {
        showToast(`Error: ${err.message}`, 'error');
    }
}

// Stashes the teamId pending deletion and shows the confirmation modal.
function openDeleteTeamModal(id, name) {
    pendingDeleteTeamId = id;
    document.getElementById('deleteTeamName').textContent = name;
    showModal('deleteTeamModal');
}

// Fires DELETE once confirmed; clears pendingDeleteTeamId first so a double-click can't fire two requests.
async function handleConfirmDeleteTeam() {
    if(!pendingDeleteTeamId) return;
    const id = pendingDeleteTeamId;
    pendingDeleteTeamId = null;
    try {
        await API.deleteJSON(`/teams/${id}`);
        hideModal('deleteTeamModal');
        await loadLeagueTeams();
    }catch(err) {
        showToast(`Error: ${err.message}`, 'error');
    }
}
