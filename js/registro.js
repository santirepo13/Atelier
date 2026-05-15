import * as authController from './controllers/authController.js';
import { showLoader, hideLoader } from './components/loader.js';

const isSuccess = location.pathname.endsWith('registro-exito.html');
if (isSuccess) {
    setTimeout(() => (location.href = '/views/login.html'), 4000);
} else {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username     = document.getElementById('displayName').value.trim();
        const email        = document.getElementById('email').value.trim();
        const password     = document.getElementById('password').value.trim();
        const confirm      = document.getElementById('confirm').value.trim();
        const claveTipo    = parseInt(document.getElementById('clave').value, 10);
        const claveResp    = document.getElementById('claveRespuesta').value.trim();

        if (!username || !email || !password || !confirm || isNaN(claveTipo) || !claveResp) {
            alert('Completa todos los campos.');
            return;
        }
        if (password !== confirm) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            showLoader();
            await authController.register({ username, email, password, claveTipo, claveResp });
            hideLoader();
            showLoader();
            setTimeout(() => { location.href = '/views/registro-exito.html'; }, 3000);
        } catch (err) {
            hideLoader();
            alert('Error al registrar: ' + err.message);
        }
    });
}