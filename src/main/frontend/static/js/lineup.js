import {API} from './api.js';
import {openPlayerStatsModal, REGULAR_SEASON_WEEKS} from './playerModal.js';

const params = new URLSearchParams(window.location.search);
const leagueId = params.get('leagueId');
const leagueName = params.get('leagueName');

// The nine starting slots in render order, and how many of each a lineup holds.
const SLOTS = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'DEF'];
const CAPACITY = { QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1, K: 1, DEF: 1 };

// Page state, refreshed whenever the team or week changes. Each roster player
// carries a `slot` (a starting slot, or null when benched).
let teamsData = [];
let roster = [];

const teamSelect = document.querySelector('#team-select');
const weekSelect = document.querySelector('#week-select');
const lineupBody = document.querySelector('#lineup-body');
const saveButton = document.querySelector('#save-lineup');
const message = document.querySelector('#lineup-message');

// Sets the navbar links and active tab from the URL league params.
function loadNavbar() {
    document.querySelector('.aTeams').href = `teams.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aLineup').href = `lineup.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aMatchups').href = `matchups.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aPlayers').href = `players.html?leagueId=${leagueId}&leagueName=${leagueName}`;

    document.querySelector('#nav-league-name').textContent = leagueName;
    document.querySelector('.aLineup').classList.add('show');
}

// Populates the team + week dropdowns, then loads the first team's lineup.
async function init() {
    loadNavbar();

    for(let week = 1; week <= REGULAR_SEASON_WEEKS; week++) {
        const option = document.createElement('option');
        option.value = week;
        option.textContent = `Week ${week}`;
        weekSelect.append(option);
    }
    weekSelect.value = REGULAR_SEASON_WEEKS;

    try {
        teamsData = await API.getJSON(`/rosters/by-league?leagueId=${leagueId}`);
    }catch(err) {
        console.error('Failed to load teams: ', err.message);
        return;
    }

    for(const t of teamsData) {
        const option = document.createElement('option');
        option.value = t.teamId;
        option.textContent = t.teamName;
        teamSelect.append(option);
    }

    teamSelect.addEventListener('change', loadLineup);
    weekSelect.addEventListener('change', loadLineup);
    saveButton.addEventListener('click', saveLineup);

    if(teamsData.length > 0) {
        loadLineup();
    }
}

// Loads the selected team's roster and the saved lineup for the selected week,
// marking each rostered player with its starting slot (or null for the bench).
async function loadLineup() {
    message.textContent = '';
    const teamId = parseInt(teamSelect.value, 10);
    const week = parseInt(weekSelect.value, 10);

    const team = teamsData.find(t => t.teamId === teamId);
    roster = team.roster.map(p => ({ ...p, slot: null }));

    let lineup = [];
    try {
        lineup = await API.getJSON(`/lineups/full?teamId=${teamId}&week=${week}`);
    }catch(err) {
        console.error('Failed to load lineup: ', err.message);
    }

    for(const entry of lineup) {
        const player = roster.find(p => p.playerId === entry.playerId);
        if(player) {
            player.slot = entry.slot;
        }
    }

    render();
}

// Renders the Starters section (one row per slot) and the Bench section below.
function render() {
    lineupBody.innerHTML = '';

    const startersDiv = section('Starters');
    const starters = roster.filter(p => p.slot);
    for(const slot of SLOTS) {
        // Reason: pull the first starter still holding this slot, then drop them
        // from the pool so the two RB / two WR slots each take a distinct player.
        const index = starters.findIndex(p => p.slot === slot);
        if(index >= 0) {
            startersDiv.append(starterRow(slot, starters.splice(index, 1)[0]));
        }else {
            startersDiv.append(emptyRow(slot));
        }
    }
    lineupBody.append(startersDiv);

    const benchDiv = section('Bench');
    const bench = roster.filter(p => !p.slot);
    if(bench.length === 0) {
        const empty = document.createElement('p');
        empty.classList.add('lineupEmpty');
        empty.textContent = 'No bench players.';
        benchDiv.append(empty);
    }
    for(const player of bench) {
        benchDiv.append(benchRow(player));
    }
    lineupBody.append(benchDiv);

    // Save is valid only once every slot is filled (a complete nine-player lineup).
    saveButton.disabled = roster.filter(p => p.slot).length !== SLOTS.length;
}

// Builds a titled section container.
function section(title) {
    const div = document.createElement('div');
    div.classList.add('lineupSection');
    const heading = document.createElement('h3');
    heading.classList.add('lineupSectionTitle');
    heading.textContent = title;
    div.append(heading);
    return div;
}

// Builds a starter row: Bench button, slot label, then the player.
function starterRow(slot, player) {
    const benchButton = document.createElement('button');
    benchButton.classList.add('benchButton');
    benchButton.textContent = 'Bench';
    benchButton.addEventListener('click', () => {
        player.slot = null;
        render();
    });

    const row = document.createElement('div');
    row.classList.add('lineupRow');
    row.append(benchButton, slotLabel(slot), playerCell(player));
    return row;
}

// Builds an empty starter row for a slot no player currently fills.
function emptyRow(slot) {
    const empty = document.createElement('span');
    empty.classList.add('lineupEmptySlot');
    empty.textContent = 'Empty';

    const row = document.createElement('div');
    row.classList.add('lineupRow');
    row.append(slotLabel(slot), empty);
    return row;
}

// Builds a bench row: Start button (disabled when no open slot fits), then the player.
function benchRow(player) {
    const startButton = document.createElement('button');
    startButton.classList.add('startButton');
    startButton.textContent = 'Start';

    const slot = openSlotFor(player.position);
    if(slot === null) {
        startButton.disabled = true;
        startButton.title = `Bench a ${player.position} first`;
    }else {
        startButton.addEventListener('click', () => {
            player.slot = slot;
            render();
        });
    }

    const row = document.createElement('div');
    row.classList.add('lineupRow');
    row.append(startButton, playerCell(player));
    return row;
}

// Builds a slot label cell.
function slotLabel(slot) {
    const label = document.createElement('span');
    label.classList.add('slotLabel');
    label.textContent = slot;
    return label;
}

// Builds the clickable name + position/team cell shared by both sections.
function playerCell(player) {
    const name = document.createElement('span');
    name.classList.add('lineupPlayerName');
    name.textContent = `${player.firstName} ${player.lastName}`;
    name.addEventListener('click', () => {
        openPlayerStatsModal(player.playerId, `${player.firstName} ${player.lastName}`);
    });

    const meta = document.createElement('span');
    meta.classList.add('lineupPlayerMeta');
    meta.textContent = `${player.position} · ${player.nflTeam}`;

    const cell = document.createElement('div');
    cell.classList.add('lineupPlayer');
    cell.append(name, meta);
    return cell;
}

// Returns the first open slot a position can fill (natural slot before FLEX),
// or null when none are open.
function openSlotFor(position) {
    const eligible = (position === 'RB' || position === 'WR' || position === 'TE')
        ? [position, 'FLEX']
        : [position];

    for(const slot of eligible) {
        const used = roster.filter(p => p.slot === slot).length;
        if(used < CAPACITY[slot]) {
            return slot;
        }
    }
    return null;
}

// Submits the staged lineup, replacing the whole week's lineup in one PUT.
async function saveLineup() {
    const teamId = parseInt(teamSelect.value, 10);
    const weekNumber = parseInt(weekSelect.value, 10);
    const entries = roster
        .filter(p => p.slot)
        .map(p => ({ playerId: p.playerId, slot: p.slot }));

    try {
        await API.putJSON('/lineups', { teamId, weekNumber, entries });
        message.textContent = 'Lineup saved.';
        loadLineup();
    }catch(err) {
        message.textContent = `Failed to save lineup: ${err.message}`;
    }
}

init();
