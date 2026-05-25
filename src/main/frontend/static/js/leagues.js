import {API} from './api.js';


const newLeagueButton = document.querySelector('#new-league-button');
const modalContainer = document.querySelector('#modal-container');
const submitButton = document.querySelector('#submit-button');
const cancelButton = document.querySelector('#cancel-button');
const modal = document.querySelector('#modal');

newLeagueButton.addEventListener('click', () => {
    modalContainer.classList.add('show');
    modal.classList.add('show');
});

submitButton.addEventListener('click', () => {
    createLeague();
});

cancelButton.addEventListener('click', () => {
    closeModal();
    clearForm();
});

async function createLeague(){
    const body = {
        leagueName: document.querySelector('#league-name-input').value,
        seasonYear: parseInt(document.querySelector('#year-input').value, 10),
        draftDate: document.querySelector('#date-input').value,
        scoringType: document.querySelector('#scoring-type-input').value,
    };

    try {
        await API.postJSON('/leagues', body);
        closeModal();
        clearForm();
        loadLeagues();
    }catch(err) {
        console.error('Failed to create league: ', err.message);
    }
}

function closeModal() {
    modalContainer.classList.remove('show');
    modal.classList.remove('show');
}

function clearForm() {
    document.querySelector('#league-name-input').value = '';
    document.querySelector('#year-input').value = '';
    document.querySelector('#date-input').value = '';
    document.querySelector('#scoring-type-input').value = '';
}

async function loadLeagues() {
    try {
        const leagues = await API.getJSON('/leagues');
        renderLeagues(leagues);
    }catch(err) {
        console.error('Failed to load leagues: ', err.message);
    }

}

function renderLeagues(leagues) {
    const tbody = document.querySelector('#leaguesTableBody');
    tbody.innerHTML = '';

    for(const l of leagues) {
        const tr = document.createElement('tr');
        tr.classList.add('leagueRow');

        const nameCell = document.createElement('th');
        nameCell.classList.add('leagueTh');

        const nameLink = document.createElement('a');
        nameLink.textContent = l.leagueName;
        nameLink.href = `/teams.html?leagueId=${l.leagueId}&leagueName=${l.leagueName}`;
        nameLink.classList.add('leagueLink');
        nameCell.append(nameLink);

        const yearCell = document.createElement('td');
        yearCell.textContent = l.seasonYear;

        const draftCell = document.createElement('td');
        draftCell.textContent = l.draftDate;

        const scoringCell = document.createElement('td');
        scoringCell.textContent = l.scoringType;

        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('deleteButton');
        deleteButton.dataset.id = l.leagueId;
        deleteButton.addEventListener('click', () => {
            deleteLeague(l.leagueId);
        });
        actionCell.appendChild(deleteButton);

        tr.append(nameCell, yearCell, draftCell, scoringCell, actionCell);
        tbody.append(tr);
    }
}

loadLeagues();

async function deleteLeague(id) {
    if(!confirm('Are you sure you want to delete this league?')) {
        return;
    }
    try {
        await API.deleteJSON('/leagues/' + id);
        loadLeagues();
    }catch(err) {
        console.error('Failed to delete league: ', err.message);
    }
}