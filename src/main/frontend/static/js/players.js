import {API} from './api.js';
import {openPlayerStatsModal, openModal, closeModal, REGULAR_SEASON_WEEKS} from './playerModal.js';

const params = new URLSearchParams(window.location.search);
const leagueId = params.get('leagueId');
const leagueName = params.get('leagueName');

// Page state, refreshed by loadData().
let allPlayers = [];                // every player in the database
let rosteredPlayers = [];           // players on an active roster in this league
let freeAgentIds = new Set();       // playerIds with no active roster in this league
let teamsData = [];                 // [{ teamId, teamName, ... }] for the Add picker

const filterSelect = document.querySelector('#filter-select');
const playersBody = document.querySelector('#players-body');
const message = document.querySelector('#players-message');

// Sets the navbar links and active tab from the URL league params.
function loadNavbar() {
    document.querySelector('.aTeams').href = `teams.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aLineup').href = `lineup.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aMatchups').href = `matchups.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aPlayers').href = `players.html?leagueId=${leagueId}&leagueName=${leagueName}`;

    document.querySelector('#nav-league-name').textContent = leagueName;
    document.querySelector('.aPlayers').classList.add('show');
}

// Loads players, free agents, rostered players, and the team list.
async function loadData() {
    allPlayers = await API.getJSON('/players');
    rosteredPlayers = await API.getJSON(`/players/league-rostered?leagueId=${leagueId}`);
    teamsData = await API.getJSON(`/rosters/by-league?leagueId=${leagueId}`);

    const freeAgents = await API.getJSON(`/players/free-agents?leagueId=${leagueId}`);
    freeAgentIds = new Set(freeAgents.map(p => p.playerId));
}

// Loads data then renders the default view.
async function init() {
    loadNavbar();
    try {
        await loadData();
    }catch(err) {
        console.error('Failed to load players: ', err.message);
        return;
    }
    filterSelect.addEventListener('change', renderPlayers);
    renderPlayers();
}

// Renders the players table honoring the active filter. Free agents get an Add button.
function renderPlayers() {
    let list = allPlayers;
    if(filterSelect.value === 'free') {
        list = allPlayers.filter(p => freeAgentIds.has(p.playerId));
    }else if(filterSelect.value === 'rostered') {
        list = rosteredPlayers;
    }

    playersBody.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('playersTable');
    table.append(headRow('Name', 'Pos', 'NFL', 'Status', 'Bye', ''));
    for(const p of list) {
        table.append(playerRow(p));
    }
    playersBody.append(table);
}

// Builds a header row of <th> cells from the given values.
function headRow(...values) {
    const tr = document.createElement('tr');
    for(const value of values) {
        const th = document.createElement('th');
        th.classList.add('thPlayers');
        th.textContent = value;
        tr.append(th);
    }
    return tr;
}

// Builds one player row: clickable name (stats modal) + an Add button for free agents.
function playerRow(p) {
    const name = document.createElement('span');
    name.classList.add('playerLink');
    name.textContent = `${p.firstName} ${p.lastName}`;
    name.addEventListener('click', () => {
        openPlayerStatsModal(p.playerId, `${p.firstName} ${p.lastName}`);
    });

    const nameCell = document.createElement('td');
    nameCell.append(name);

    const actionCell = document.createElement('td');
    if(freeAgentIds.has(p.playerId)) {
        const addButton = document.createElement('button');
        addButton.classList.add('addButton');
        addButton.textContent = 'Add';
        addButton.addEventListener('click', () => {
            openAddModal(p);
        });
        actionCell.append(addButton);
    }

    const tr = document.createElement('tr');
    tr.classList.add('playerRow');
    tr.append(nameCell, textCell(p.position), textCell(p.nflTeam), textCell(p.status), textCell(p.byeWeek), actionCell);
    return tr;
}

// Builds a plain text table cell.
function textCell(value) {
    const td = document.createElement('td');
    td.textContent = value;
    return td;
}

// Opens the modal picker to add a free agent to a chosen team and acquired week.
function openAddModal(player) {
    const title = document.createElement('p');
    title.classList.add('modalTitle');
    title.textContent = `Add ${player.firstName} ${player.lastName} to…`;

    const teamPicker = pickerLabel('Team');
    const teamSelect = document.createElement('select');
    teamSelect.classList.add('input');
    for(const t of teamsData) {
        const option = document.createElement('option');
        option.value = t.teamId;
        option.textContent = t.teamName;
        teamSelect.append(option);
    }

    const weekPicker = pickerLabel('Acquired week');
    const weekSelect = document.createElement('select');
    weekSelect.classList.add('input');
    for(let week = 1; week <= REGULAR_SEASON_WEEKS; week++) {
        const option = document.createElement('option');
        option.value = week;
        option.textContent = `Week ${week}`;
        weekSelect.append(option);
    }
    weekSelect.value = REGULAR_SEASON_WEEKS;

    const addMessage = document.createElement('p');
    addMessage.classList.add('modalMessage');

    const confirmButton = document.createElement('button');
    confirmButton.classList.add('submitButton');
    confirmButton.textContent = 'Confirm';
    confirmButton.addEventListener('click', () => {
        confirmAdd(player, parseInt(teamSelect.value, 10), parseInt(weekSelect.value, 10), addMessage);
    });

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancelButton');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', closeModal);

    const buttons = document.createElement('div');
    buttons.classList.add('actionsButtons');
    buttons.append(confirmButton, cancelButton);

    openModal(title, teamPicker, teamSelect, weekPicker, weekSelect, addMessage, buttons);
}

// Builds a modal field label.
function pickerLabel(text) {
    const label = document.createElement('label');
    label.classList.add('label');
    label.textContent = text;
    return label;
}

// Posts the roster addition, then refreshes so the player leaves the free-agent list.
async function confirmAdd(player, teamId, acquiredWeek, addMessage) {
    try {
        await API.postJSON('/rosters', { teamId, playerId: player.playerId, acquiredWeek });
        closeModal();
        message.textContent = `Added ${player.firstName} ${player.lastName}.`;
        await loadData();
        renderPlayers();
    }catch(err) {
        addMessage.textContent = err.message;
    }
}

init();
