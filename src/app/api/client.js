const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';
const TOKEN_KEY = 'sf_token';

const headers = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem(TOKEN_KEY)
    ? { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
    : {}),
});

async function request(method, path, body) {
  const url = `${BASE}${path}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: headers(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (networkErr) {
    // Network failure — server unreachable, CORS preflight blocked, etc.
    console.error('[API] Network error:', url, networkErr);
    throw new Error(
      'Cannot reach the server. Make sure VITE_API_URL is set correctly in your Netlify environment variables.'
    );
  }

  // --- Debug info (visible in browser DevTools → Console) ---
  console.debug(`[API] ${method} ${url} → ${res.status} (${res.headers.get('content-type') ?? 'no content-type'})`);

  if (res.status === 204) return null;

  // Read the raw text first — never assume the body is JSON
  const text = await res.text();

  if (!text) {
    if (!res.ok) throw new Error(`Server returned ${res.status} with an empty body`);
    return null;
  }

  // Check whether the server actually sent JSON
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    // The server sent HTML (Netlify 404 page, nginx error page, etc.)
    console.error('[API] Expected JSON but got:', contentType);
    console.error('[API] Response body (first 300 chars):', text.slice(0, 300));
    throw new Error(
      res.status === 404
        ? `API route not found: ${url} — check that VITE_API_URL points to your deployed backend.`
        : `Server returned non-JSON response (${res.status}). Check your backend deployment.`
    );
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('[API] Failed to parse JSON from:', url);
    console.error('[API] Raw text:', text.slice(0, 300));
    throw new Error('Server returned invalid JSON. Check your backend logs.');
  }

  if (!res.ok) throw new Error(data.message || `Request failed with status ${res.status}`);
  return data;
}

export const get   = (path)       => request('GET',    path);
export const post  = (path, body) => request('POST',   path, body);
export const put   = (path, body) => request('PUT',    path, body);
export const patch = (path, body) => request('PATCH',  path, body);
export const del   = (path)       => request('DELETE', path);
