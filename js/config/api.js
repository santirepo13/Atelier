export const API_BASE = 'http://localhost:3000/api';

export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    let errMsg = text;
    try { errMsg = JSON.parse(text).error || text; } catch (_) {}
    const err = new Error(errMsg);
    err.status = res.status;
    throw err;
  }
  try { return JSON.parse(text); } catch (_) { return text; }
}