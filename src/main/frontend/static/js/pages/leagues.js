import { API, escapeHtml, showToast } from '../api.js';

// Cached league list so click handlers can resolve name/id without re-fetching.
let allLeagues = [];

// Stashes the leagueId pending deletion until the user confirms in the modal.
let pendingDeleteId = null;

// Row buttons use event delegation on the tbody so newly rendered rows stay live.
document.addEventListener('DOMContentLoaded', function () {
  loadLeagues();

  document.getElementById('newLeagueBtn').addEventListener('click', openCreateModal);
  document.getElementById('leagueForm').addEventListener('submit', handleLeagueFormSubmit);
  document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);

  document.getElementById('leaguesTableBody').addEventListener('click', function (e) {
    // closest() walks up from the click target so a click on an icon inside the button still hits.
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    if (editBtn) {
      openEditModal(parseInt(editBtn.dataset.id));
    } else if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id);
      const league = allLeagues.find(function (l) { return l.leagueId === id; });
      openDeleteModal(id, league ? league.leagueName : 'this league');
    }
  });
});

// Fetches every league and re-renders the table; errors toast and leave the prior list on screen.
async function loadLeagues() {
  try {
    allLeagues = await API.getJSON('/leagues');
    renderLeagues(allLeagues);
  } catch (err) {
    showToast(`Failed to load leagues: ${err.message}`, 'error');
  }
}

// Renders the leagues array as table rows. The leagueName is URL-encoded on the link
// so special characters survive the navigation to league.html.
function renderLeagues(leagues) {
  const tbody = document.getElementById('leaguesTableBody');
  if (!leagues || leagues.length === 0) {
    tbody.innerHTML =
      `<tr><td colspan="5" class="text-center text-muted py-3">No leagues found.</td></tr>`;
    return;
  }
  let html = '';
  for(let i = 0; i < leagues.length; i++) {
    const l = leagues[i];
    html += `<tr>
      <td><a href="/league.html?leagueId=${l.leagueId}&leagueName=${encodeURIComponent(l.leagueName)}" class="fw-semibold text-decoration-none">${escapeHtml(l.leagueName)}</a></td>
      <td>${escapeHtml(l.seasonYear)}</td>
      <td>${escapeHtml(l.draftDate || '')}</td>
      <td>${escapeHtml(l.scoringType)}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary edit-btn me-1" data-id="${l.leagueId}">Edit</button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${l.leagueId}">Delete</button>
      </td>
    </tr>`;
  }
  tbody.innerHTML = html;
}

// Opens the league modal in create mode (blank form, "Create" submit label, no editingId).
function openCreateModal() {
  document.getElementById('editingId').value = '';
  document.getElementById('leagueModalTitle').textContent = 'New League';
  document.getElementById('leagueModalSubmitBtn').textContent = 'Create';
  document.getElementById('leagueForm').reset();
  bootstrap.Modal.getOrCreateInstance(document.getElementById('leagueModal')).show();
}

// Opens the league modal in edit mode pre-filled from the cached league.
// Stamps leagueId into the hidden editingId so the submit handler PUTs instead of POSTs.
function openEditModal(id) {
  const league = allLeagues.find(function (l) { return l.leagueId === id; });
  document.getElementById('editingId').value = id;
  document.getElementById('leagueModalTitle').textContent = 'Edit League';
  document.getElementById('leagueModalSubmitBtn').textContent = 'Save';
  document.getElementById('leagueName').value = league.leagueName;
  document.getElementById('seasonYear').value = league.seasonYear;
  document.getElementById('draftDate').value = league.draftDate || '';
  document.getElementById('scoringType').value = league.scoringType;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('leagueModal')).show();
}

// Single submit handler for create AND edit — branches on whether editingId was set.
async function handleLeagueFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('editingId').value;
  const body = {
    leagueName: document.getElementById('leagueName').value,
    seasonYear: parseInt(document.getElementById('seasonYear').value),
    draftDate: document.getElementById('draftDate').value,
    scoringType: document.getElementById('scoringType').value,
  };
  try {
    if (id) {
      await API.putJSON(`/leagues/${id}`, body);
    } else {
      await API.postJSON('/leagues', body);
    }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('leagueModal')).hide();
    await loadLeagues();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Stashes the leagueId pending deletion and shows the confirmation modal.
function openDeleteModal(id, name) {
  pendingDeleteId = id;
  document.getElementById('deleteTargetName').textContent = name;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show();
}

// Fires DELETE for the league in pendingDeleteId; clears it first so a double-click can't fire two requests.
async function handleConfirmDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  pendingDeleteId = null;
  try {
    await API.deleteJSON(`/leagues/${id}`);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).hide();
    await loadLeagues();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}
