const params = new URLSearchParams(window.location.search);
const leagueId = params.get('leagueId');
const leagueName = params.get('leagueName');

function loadNavbar() {
    document.querySelector('.aTeams').href = `teams.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aLineup').href = `lineup.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aMatchups').href = `matchups.html?leagueId=${leagueId}&leagueName=${leagueName}`;
    document.querySelector('.aPlayers').href = `players.html?leagueId=${leagueId}&leagueName=${leagueName}`;

    document.querySelector('#nav-league-name').textContent = leagueName;

    document.querySelector('.aPlayers').classList.add('show');
}

loadNavbar();