const BASE = '/api';

// Thin fetch wrapper that JSON-encodes bodies and parses JSON responses; throws on non-2xx.
export const API = {
  async request(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, opts);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    if (res.status === 204) return null;

    const ct = res.headers.get('Content-Type') || '';
    if (!ct.includes('application/json')) {
      throw new Error('Unexpected server response (not JSON). Check server logs.');
    }
    return res.json();
  },

  getJSON(path) { return this.request('GET', path); },
  postJSON(path, body) { return this.request('POST', path, body); },
  putJSON(path, body) { return this.request('PUT', path, body); },
  deleteJSON(path, body) { return this.request('DELETE', path, body); },
};

// Escapes a string for safe insertion into innerHTML; prevents XSS from DB or user input.
export function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

// Pops a dismissable toast in the top-right corner; type is 'error' | 'success' | 'info'.
export function showToast(message, type = 'error') {
  const container = document.getElementById('toastContainer');
  if (!container) {
    console.warn('showToast: #toastContainer not found in DOM');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.innerHTML = `
    <div class="toast-body">
      <span>${escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Dismiss">&times;</button>
    </div>`;

  toast.querySelector('.toast-close').addEventListener('click', function () {
    toast.remove();
  });

  container.appendChild(toast);
}
