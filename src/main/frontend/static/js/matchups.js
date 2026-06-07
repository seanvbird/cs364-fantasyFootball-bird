import {API} from './api.js';

const params = new URLSearchParams(window.location.search);
const leagueId = params.get('leagueId');
const leagueName = params.get('leagueName');

// Page state, loaded once on init.
let matchups = [];                  // every matchup in the league, all weeks
let teamNames = new Map();          // teamId -> teamName

const weekSelect = document.querySelector('#week-select');
const matchupsBody = document.querySelector('#matchups-body');

// Sets the navbar links and active tab from the URL league params.
function loadNavbar() {
    document.querySelector('.aTeams').href = `teams.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aLineup').href = `lineup.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aMatchups').href = `matchups.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aPlayers').href = `players.html?leagueId=${leagueId}&leagueName=${leagueName}`;

    document.querySelector('#nav-league-name').textContent = leagueName;
    document.querySelector('.aMatchups').classList.add('show');
}

// Loads matchups + a teamId->name map, builds the week picker, renders the latest week.
async function init() {
    loadNavbar();

    try {
        matchups = await API.getJSON(`/matchups?leagueId=${leagueId}`);
        const teams = await API.getJSON(`/teams/rosters?leagueId=${leagueId}`);
        for(const t of teams) {
            teamNames.set(t.teamId, t.teamName);
        }
    }catch(err) {
        console.error('Failed to load matchups: ', err.message);
        return;
    }

    // Reason: build the week picker from the weeks that actually have matchups.
    const weeks = [...new Set(matchups.map(m => m.weekNumber))].sort((a, b) => a - b);
    for(const week of weeks) {
        const option = document.createElement('option');
        option.value = week;
        option.textContent = `Week ${week}`;
        weekSelect.appendChild(option);
    }

    weekSelect.addEventListener('change', () => {
        renderWeek(parseInt(weekSelect.value, 10));
    });

    if(weeks.length > 0) {
        const latest = weeks[weeks.length - 1];
        weekSelect.value = latest;
        renderWeek(latest);
    }
}

// Renders one card per matchup for the given week, highlighting the winner.
function renderWeek(week) {
    matchupsBody.innerHTML = '';

    const games = matchups.filter(m => m.weekNumber === week);
    if(games.length === 0) {
        const empty = document.createElement('p');
        empty.classList.add('lineupEmpty');
        empty.textContent = 'No matchups this week.';
        matchupsBody.append(empty);
        return;
    }

    for(const m of games) {
        const card = document.createElement('div');
        card.classList.add('matchupCard');
        card.appendChild(matchupSide(m.homeTeamId, m.homeScore, m.winnerTeamId));

        const vs = document.createElement('span');
        vs.classList.add('matchupVs');
        vs.textContent = 'vs';
        card.appendChild(vs);

        card.appendChild(matchupSide(m.awayTeamId, m.awayScore, m.winnerTeamId));
        matchupsBody.appendChild(card);
    }
}

// Builds one side of a matchup card. Scores are null until a game is finalized.
function matchupSide(teamId, score, winnerTeamId) {
    const side = document.createElement('div');
    side.classList.add('matchupSide');
    if(teamId === winnerTeamId) {
        side.classList.add('matchupWinner');
    }

    const name = document.createElement('span');
    name.classList.add('matchupTeam');
    name.textContent = teamNames.get(teamId) || `Team ${teamId}`;

    const points = document.createElement('span');
    points.classList.add('matchupScore');
    points.textContent = (score === null || score === undefined) ? '—' : Number(score).toFixed(2);

    side.append(name, points);
    return side;
}

init();
