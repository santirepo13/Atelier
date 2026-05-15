import * as cartService from '../services/cartService.js';

export async function getCartItems() {
  return cartService.getCart();
}

export async function addToCart(productId, quantity) {
  return cartService.addItem(productId, quantity);
}

export async function updateQuantity(itemId, quantity) {
  return cartService.updateItem(itemId, quantity);
}

export async function removeFromCart(itemId) {
  return cartService.removeItem(itemId);
}

export async function getCartTotal() {
  return cartService.getTotal();
}

export function calculateCartTotal(items) {
  return items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
}

export function isCartEmpty(items) {
  return !items || items.length === 0;
}