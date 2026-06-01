import {API} from './api.js'
import {openPlayerStatsModal} from './playerModal.js'

const params = new URLSearchParams(window.location.search);
const leagueId = params.get('leagueId');
const leagueName = params.get('leagueName');

function loadNavbar() {
    document.querySelector('.aTeams').href = `teams.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aLineup').href = `lineup.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aMatchups').href = `matchups.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aPlayers').href = `players.html?leagueId=${leagueId}&leagueName=${leagueName}`;

    document.querySelector('#nav-league-name').textContent = leagueName;

    document.querySelector('.aTeams').classList.add('show');
}

loadNavbar();

async function loadTeams() {
    try {
        const teams = await API.getJSON(`/rosters/by-league?leagueId=${leagueId}`);
        renderTeams(teams);
    }catch(err) {
        console.error('Failed to load leagues: ', err.message);
    }
}

loadTeams();

function renderTeams(teams) {
    const teamsBody = document.querySelector('#teams-body');
    teamsBody.innerHTML = '';

    for(const t of teams) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('cardDiv');

        const teamNameH = document.createElement('h3');
        teamNameH.classList.add('teamNameH');
        teamNameH.textContent = t.teamName;
        cardDiv.appendChild(teamNameH);
        
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


