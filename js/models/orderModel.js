import { auth } from '../firebase-init.js';
import { fetchAPI } from '../config/api.js';

async function getToken() {
  return auth.currentUser.getIdToken();
}

export async function createOrder(items, paymentMethod, total) {
  const token = await getToken();
  return fetchAPI('/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, paymentMethod, total }),
  });
}

export async function getOrders() {
  const token = await getToken();
  return fetchAPI('/orders', { headers: { Authorization: `Bearer ${token}` } });
}

export async function getOrder(id) {
  const token = await getToken();
  return fetchAPI(`/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}