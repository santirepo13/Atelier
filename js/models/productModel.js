import { fetchAPI } from './config/api.js';

export async function getAllProducts() {
  return fetchAPI('/products');
}

export async function getProduct(id) {
  return fetchAPI(`/products/${id}`);
}