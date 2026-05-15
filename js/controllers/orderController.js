import * as orderService from '../services/orderService.js';
import * as cartService from '../services/cartService.js';

export async function createOrder(items, paymentMethod, total) {
  return orderService.createOrder(items, paymentMethod, total);
}

export async function getOrders() {
  return orderService.getOrders();
}

export async function getOrder(id) {
  return orderService.getOrder(id);
}

export async function getOrderHistory() {
  return orderService.getOrders();
}

export function formatOrderTotal(items) {
  return items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
}