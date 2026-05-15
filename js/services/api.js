import { API_BASE } from '../config/env.js';
import { VERSION } from '../version.js';
import { getAuthToken } from '../utils/auth.js';

export async function fetchAPI(endpoint, options = {}) {
  const token = await getAuthToken();
  const url = `${API_BASE}${endpoint}?v=${VERSION}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
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