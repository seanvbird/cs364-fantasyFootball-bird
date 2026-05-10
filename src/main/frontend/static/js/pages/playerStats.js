import { escapeHtml, showToast } from '../api.js';
import { formatPlayerName, loadIntoTable } from '../helpers.js';

// Wires the two query buttons; each panel only loads on demand.
export function wirePlayerStatsTab() {
    document.getElementById('topScorersBtn').addEventListener('click', handleTopScorers);
    document.getElementById('avgPositionBtn').addEventListener('click', handleAvgByPosition);
}

// Q4: top fantasy-point scorers for the user-entered week. Bails on empty input so the API never sees week=NaN.
function handleTopScorers() {
    const week = document.getElementById('topWeekInput').value;
    if(!week) { showToast('Enter a week number.', 'info'); return; }
    return loadIntoTable(`/stats/top?week=${week}`, 'topScorersBody', function (r) {
        return `<tr><td>${formatPlayerName(r)}</td><td>${escapeHtml(r.position || '')}</td><td>${escapeHtml(r.nflTeam || '')}</td><td>${parseFloat(r.fantasyPoints || 0).toFixed(2)}</td></tr>`;
    });
}

// Q6: AVG fantasy points grouped by position across all weeks; no input required.
function handleAvgByPosition() {
    return loadIntoTable('/stats/avg-by-position', 'avgPositionBody', function (r) {
        return `<tr><td>${escapeHtml(r.position)}</td><td>${parseFloat(r.avgPoints || 0).toFixed(2)}</td><td>${escapeHtml(r.gamesPlayed)}</td></tr>`;
    });
}
