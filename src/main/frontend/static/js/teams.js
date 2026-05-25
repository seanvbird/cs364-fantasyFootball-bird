import {API} from './api.js'

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
        const teams = await API.getJSON('/by-league');
        renderTeams(teams);
    }catch(err) {
        console.error('Failed to load leagues: ', err.message);
    }
}

function renderTeams() {
    const teamsBody = document.querySelector('.teams-body');
    teamsBody.innerHTML = '';

    for(const t of teams) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('cardDiv');

        const teamNameDiv = document.createElement('div');
        teamNameDiv.classList.add('teamNameDiv');
        teamNameDiv.textContent = t.teamName;
        
        const rosterDiv = document.createElement('div');
        rosterDiv.classList.add('rosterDiv');
        rosterDiv.textContent = t.roster;



    }
}


