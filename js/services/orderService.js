import { fetchAPI } from './api.js';

export async function createOrder(items, paymentMethod, total) {
  return fetchAPI('/orders', {
    method: 'POST',
    body: JSON.stringify({ items, paymentMethod, total }),
  });
}

export async function getOrders() {
  return fetchAPI('/orders');
}

export async function getOrder(id) {
  return fetchAPI(`/orders/${id}`);
}