import * as authController from './controllers/authController.js';
import { showLoader, hideLoader } from './components/loader.js';

const form = document.getElementById('googleRegisterForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username  = document.getElementById('displayName').value.trim();
    const claveTipo = parseInt(document.getElementById('clave').value, 10);
    const claveResp = document.getElementById('claveRespuesta').value.trim();

    if (!username || isNaN(claveTipo) || !claveResp) {
      alert('Completa todos los campos.');
      return;
    }

    try {
      showLoader();
      await authController.completeGoogleRegistration(username, claveTipo, claveResp);
      hideLoader();
      location.href = '/index.html';
    } catch (err) {
      hideLoader();
      if (err.status === 409) {
        alert('Ese nombre de usuario ya está en uso. Elige otro.');
      } else {
        alert('Error al completar el registro: ' + err.message);
      }
    }
  });
}
