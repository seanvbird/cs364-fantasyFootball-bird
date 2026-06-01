import {API} from './api.js';

// Number of regular-season weeks. Drives the stats grid and every week picker.
export const REGULAR_SEASON_WEEKS = 17;

// Reason: every non-leagues page ships an empty #modal-container / #modal pair,
// so the shared modal helpers below can target them without per-page markup.
const modalContainer = document.querySelector('#modal-container');
const modal = document.querySelector('#modal');

// Hides the shared modal.
export function closeModal() {
    modalContainer.classList.remove('show');
    modal.classList.remove('show');
}

// Fills the modal with the given elements and shows it. Clicking the backdrop closes it.
export function openModal(...nodes) {
    modal.innerHTML = '';
    modal.append(...nodes);
    modalContainer.classList.add('show');
    modal.classList.add('show');
    // Reason: assign onclick (not addEventListener) so repeated opens don't stack handlers.
    modalContainer.onclick = (e) => {
        if(e.target === modalContainer) {
            closeModal();
        }
    };
}

// Opens the modal showing a player's weekly stats for the whole regular season.
export async function openPlayerStatsModal(playerId, playerName) {
    let stats;
    try {
        stats = await API.getJSON(`/stats?playerId=${playerId}`);
    }catch(err) {
        console.error('Failed to load stats: ', err.message);
        return;
    }

    const title = document.createElement('p');
    title.classList.add('modalTitle');
    title.textContent = playerName;

    const wrap = document.createElement('div');
    wrap.classList.add('statsTableWrap');
    wrap.append(statsTable(stats));

    openModal(title, wrap, closeButton());
}

// Builds the stats table for weeks 1..REGULAR_SEASON_WEEKS. Weeks the player has
// no stat row for (bye / inactive) render as em-dashes.
function statsTable(stats) {
    // Reason: index rows by week so missing weeks can render as blanks.
    const byWeek = {};
    for(const s of stats) {
        byWeek[s.weekNumber] = s;
    }

    const table = document.createElement('table');
    table.classList.add('statsTable');
    table.append(headRow('Wk', 'Pass', 'Rush', 'Rec', 'TD', 'FP'));

    for(let week = 1; week <= REGULAR_SEASON_WEEKS; week++) {
        const s = byWeek[week];
        if(s) {
            table.append(statRow(week, s.passingYards, s.rushingYards, s.receivingYards, s.touchdowns, s.fantasyPoints.toFixed(2)));
        }else {
            const row = statRow(week, '—', '—', '—', '—', '—');
            row.classList.add('statEmptyRow');
            table.append(row);
        }
    }
    return table;
}

// Builds a header row of <th> cells from the given values.
function headRow(...values) {
    const tr = document.createElement('tr');
    for(const value of values) {
        const th = document.createElement('th');
        th.textContent = value;
        tr.append(th);
    }
    return tr;
}

// Builds a body row of <td> cells from the given values.
function statRow(...values) {
    const tr = document.createElement('tr');
    for(const value of values) {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
    }
    return tr;
}

// Builds a Close button wired to close the modal.
function closeButton() {
    const button = document.createElement('button');
    button.classList.add('cancelButton');
    button.textContent = 'Close';
    button.addEventListener('click', closeModal);
    return button;
}
