import { fetchAPI } from './api.js';

export async function getCart() {
  return fetchAPI('/cart');
}

export async function addItem(productId, quantity = 1) {
  return fetchAPI('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateItem(itemId, quantity) {
  return fetchAPI(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeItem(itemId) {
  return fetchAPI(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

export async function getTotal() {
  const data = await fetchAPI('/cart/total');
  return data.total;
}

export async function clearCart() {
  const items = await getCart();
  for (const item of items) {
    await removeItem(item.id);
  }
}