import {API} from './api.js';
import {openPlayerStatsModal, openModal, closeModal} from './playerModal.js';

const params = new URLSearchParams(window.location.search);
const leagueId = params.get('leagueId');
const leagueName = params.get('leagueName');

// Teams in this league, refreshed by loadTeams(). Backs the delete picker and edit pre-fill.
let teams = [];

const addTeamButton = document.querySelector('#add-team-button');
const deleteTeamSelect = document.querySelector('#delete-team-select');
const deleteTeamButton = document.querySelector('#delete-team-button');

// Sets the navbar links and active tab from the URL league params.
function loadNavbar() {
    document.querySelector('.aTeams').href = `teams.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aLineup').href = `lineup.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aMatchups').href = `matchups.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aPlayers').href = `players.html?leagueId=${leagueId}&leagueName=${leagueName}`;

    document.querySelector('#nav-league-name').textContent = leagueName;

    document.querySelector('.aTeams').classList.add('show');
}

loadNavbar();

// Loads every team in the league with its active roster, then renders + refills the delete picker.
async function loadTeams() {
    try {
        teams = await API.getJSON(`/teams/rosters?leagueId=${leagueId}`);
        renderTeams(teams);
        populateDeleteSelect(teams);
    }catch(err) {
        console.error('Failed to load teams: ', err.message);
    }
}

loadTeams();

// Opens the create-team modal.
addTeamButton.addEventListener('click', () => {
    openTeamModal(null);
});

// Deletes the team currently chosen in the control-bar dropdown.
deleteTeamButton.addEventListener('click', () => {
    deleteTeam(parseInt(deleteTeamSelect.value, 10));
});

// Rebuilds the delete-team dropdown options from the loaded teams.
function populateDeleteSelect(teams) {
    deleteTeamSelect.innerHTML = '';
    for(const t of teams) {
        const option = document.createElement('option');
        option.value = t.teamId;
        option.textContent = t.teamName;
        deleteTeamSelect.append(option);
    }
}

// Renders one card per team: a header (name + owner + Edit) and the active roster.
function renderTeams(teams) {
    const teamsBody = document.querySelector('#teams-body');
    teamsBody.innerHTML = '';

    for(const t of teams) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('cardDiv');

        const header = document.createElement('div');
        header.classList.add('teamCardHeader');

        const teamNameH = document.createElement('h3');
        teamNameH.classList.add('teamNameH');
        teamNameH.textContent = t.teamName;

        const owner = document.createElement('span');
        owner.classList.add('teamOwner');
        owner.textContent = `Owner: ${t.ownerName}`;

        // Clicking Edit opens the modal pre-filled with this team's name and owner.
        const editButton = document.createElement('button');
        editButton.classList.add('editButton');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            openTeamModal(t);
        });

        header.append(teamNameH, owner, editButton);
        cardDiv.appendChild(header);

        const rosterDiv = document.createElement('div');
        rosterDiv.classList.add('rosterDiv');

        for(const p of t.roster) {
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('playerDiv');

            const firstLastName = document.createElement('p');
            firstLastName.classList.add('playerNameColumn');
            firstLastName.textContent = `${p.firstName} ${p.lastName}`;
            // Clicking a player name opens the shared weekly-stats modal.
            firstLastName.addEventListener('click', () => {
                openPlayerStatsModal(p.playerId, `${p.firstName} ${p.lastName}`);
            });

            const position = document.createElement('p');
            position.classList.add('playerColumn');
            position.textContent = p.position;

            const nflTeam = document.createElement('p');
            nflTeam.classList.add('playerColumn');
            nflTeam.textContent = p.nflTeam;

            playerDiv.append(firstLastName, position, nflTeam);
            rosterDiv.appendChild(playerDiv);
        }

        cardDiv.appendChild(rosterDiv);
        teamsBody.appendChild(cardDiv);
    }
}

// Opens the add/edit modal. Pass a team to edit (pre-fills its fields) or null to create one.
function openTeamModal(team) {
    const title = document.createElement('p');
    title.classList.add('modalTitle');
    title.textContent = team ? 'Edit Team' : 'Add Team';

    const nameLabel = fieldLabel('Team name');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.classList.add('input');
    if(team) {
        nameInput.value = team.teamName;
    }

    const ownerLabel = fieldLabel('Owner name');
    const ownerInput = document.createElement('input');
    ownerInput.type = 'text';
    ownerInput.classList.add('input');
    if(team) {
        ownerInput.value = team.ownerName;
    }

    const message = document.createElement('p');
    message.classList.add('modalMessage');

    const submitButton = document.createElement('button');
    submitButton.classList.add('submitButton');
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', () => {
        saveTeam(team, nameInput.value, ownerInput.value, message);
    });

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancelButton');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', closeModal);

    const buttons = document.createElement('div');
    buttons.classList.add('actionsButtons');
    buttons.append(submitButton, cancelButton);

    openModal(title, nameLabel, nameInput, ownerLabel, ownerInput, message, buttons);
}

// Builds a modal field label.
function fieldLabel(text) {
    const label = document.createElement('label');
    label.classList.add('label');
    label.textContent = text;
    return label;
}

// Creates (existing == null) or updates a team, then refreshes the page on success.
async function saveTeam(existing, teamName, ownerName, message) {
    const body = {
        teamName,
        ownerName,
        leagueId: parseInt(leagueId, 10),
    };

    try {
        if(existing) {
            await API.putJSON('/teams/' + existing.teamId, { ...body, teamId: existing.teamId });
        }else {
            await API.postJSON('/teams', body);
        }
        closeModal();
        await loadTeams();
    }catch(err) {
        message.textContent = err.message;
    }
}

// Deletes a team after confirmation. Its rosters, lineups, and matchups cascade out.
async function deleteTeam(id) {
    if(!confirm('Are you sure you want to delete this team?')) {
        return;
    }
    try {
        await API.deleteJSON('/teams/' + id);
        await loadTeams();
    }catch(err) {
        console.error('Failed to delete team: ', err.message);
    }
}
