import * as productService from '../services/productService.js';
import * as cartService from '../services/cartService.js';

export async function loadProducts() {
  return productService.getAllProducts();
}

export async function getProduct(id) {
  return productService.getProduct(id);
}

export async function addToCart(productId, quantity) {
  return cartService.addItem(productId, quantity);
}