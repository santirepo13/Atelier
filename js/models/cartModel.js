import { auth } from './firebase-init.js';
import { fetchAPI } from './config/api.js';

async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay usuario autenticado');
  return user.getIdToken();
}

function authHeader() {
  return { Authorization: `Bearer ${auth.currentUser ? 'LOADING' : ''}` };
}

export async function getCart() {
  const token = await getToken();
  return fetchAPI('/cart', { headers: { Authorization: `Bearer ${token}` } });
}

export async function addItem(productId, quantity = 1) {
  const token = await getToken();
  return fetchAPI('/cart/items', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateItem(itemId, quantity) {
  const token = await getToken();
  return fetchAPI(`/cart/items/${itemId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeItem(itemId) {
  const token = await getToken();
  return fetchAPI(`/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTotal() {
  const token = await getToken();
  const data = await fetchAPI('/cart/total', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.total;
}