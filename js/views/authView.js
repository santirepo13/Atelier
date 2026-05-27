import * as authController from '../controllers/authController.js';
import { showLoader, hideLoader } from '../components/loader.js';

export function initLogin() {
  const form = document.getElementById('loginForm');
  const googleBtn = document.querySelector('.google-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const claveTipo = parseInt(document.getElementById('clave').value, 10);
    const claveResp = document.getElementById('claveRespuesta').value.trim().toLowerCase();

    if (!username || !pass || !claveTipo || !claveResp || isNaN(claveTipo)) {
      alert('Completa todos los campos.');
      return;
    }

    try {
      showLoader();
      const userData = await authController.getUserByUsername(username);
      await authController.login(userData.email, pass, claveTipo, claveResp);
      hideLoader();
      location.href = 'index.html';
    } catch (err) {
      showLoader();
      setTimeout(() => {
        hideLoader();
        if (err.status === 404) {
          alert('Usuario no encontrado.');
        } else {
          alert('Error al iniciar sesión: ' + err.message);
        }
      }, 700);
    }
  });

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      showLoader();
      try {
        const result = await authController.loginWithGoogle();
        hideLoader();
        if (result.isNewUser) {
          location.href = '/views/google-register.html';
        } else {
          location.href = 'index.html';
        }
      } catch (err) {
        hideLoader();
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
          alert('Error con Google: ' + err.message);
        }
      }
    });
  }
}