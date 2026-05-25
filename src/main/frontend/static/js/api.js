// Base path for the Spring Boot REST API. Every helper prefixes this
// so call sites pass bare paths like '/leagues' instead of '/api/leagues'.
const BASE = '/api';

// Generic fetch wrapper used by the four verb-specific helpers below.
// JSON-encodes the body when present, JSON-parses the response, throws on non-2xx.
// Returns null for 204 No Content (which is what LeagueApi.delete sends back).
async function request(method, path, body) {
    const opts = { method };

    if(body !== undefined) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(body);
    }

    const res = await fetch(BASE + path, opts);

    if(!res.ok) {
        // Reason: Spring's ResponseStatusException serializes as
        // { timestamp, status, error, message, path } — pull message if present.
        let message = res.statusText;
        try {
            const err = await res.json();
            if(err.message) {
                message = err.message;
            }
        }catch{
            // Body wasn't JSON; keep statusText as the fallback message.
        }
        throw new Error(res.status + ': ' + message);
    }

    if(res.status === 204) {
        return null;
    }

    return res.json();
}

// Single object exported to every page.
// Usage: API.getJSON('/leagues'), API.postJSON('/leagues', body), etc.
export const API = {
    request,

    // GET /api{path}. Returns the parsed JSON response.
    getJSON(path) {
        return request('GET', path);
    },

    // POST /api{path} with a JSON body. Returns the parsed JSON of the created resource.
    postJSON(path, body) {
        return request('POST', path, body);
    },

    // PUT /api{path} with a JSON body. Returns the parsed JSON of the updated resource.
    putJSON(path, body) {
        return request('PUT', path, body);
    },

    // DELETE /api{path}. Returns null because the server responds with 204 No Content.
    deleteJSON(path) {
        return request('DELETE', path);
    },
};