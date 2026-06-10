const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';
const TOKEN_KEY = 'sf_token';

const headers = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem(TOKEN_KEY)
    ? { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` }
    : {}),
});

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const get  = (path)        => request('GET',    path);
export const post = (path, body)  => request('POST',   path, body);
export const put  = (path, body)  => request('PUT',    path, body);
export const patch= (path, body)  => request('PATCH',  path, body);
export const del  = (path)        => request('DELETE', path);
