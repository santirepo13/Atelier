import * as authService from '../services/authService.js';

export async function login(email, password, claveTipo, claveRespuesta) {
  return authService.login(email, password, claveTipo, claveRespuesta);
}

export async function loginWithGoogle() {
  return authService.googleLogin();
}

export async function register(formData) {
  return authService.register(formData);
}

export async function logout() {
  return authService.logout();
}

export async function getUserByUsername(username) {
  return authService.getUserByUsername(username);
}