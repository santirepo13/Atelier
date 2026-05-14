import { login, googleLogin } from './models/authModel.js';
import { fetchAPI } from './config/api.js';

const loader = document.getElementById('globalLoader');
let loaderMostrado = false;
let loaderTimeout = null;

function mostrarLoader() {
    if (loader && !loaderMostrado) {
        loader.style.opacity = '1';
        loader.style.display = 'flex';
        loaderMostrado = true;
        loaderTimeout = setTimeout(ocultarLoader, 3000);
    }
}
function ocultarLoader() {
    if (loaderMostrado && loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
        loaderMostrado = false;
    }
    clearTimeout(loaderTimeout);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const googleBtn = document.querySelector('.google-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username  = document.getElementById('username').value.trim();
        const pass      = document.getElementById('password').value.trim();
        const claveTipo = parseInt(document.getElementById('clave').value, 10);
        const claveResp = document.getElementById('claveRespuesta').value.trim().toLowerCase();

        if (!username || !pass || !claveTipo || !claveResp || isNaN(claveTipo)) {
            alert('Completa todos los campos.');
            return;
        }

        try {
            mostrarLoader();

            const userData = await fetchAPI(`/users/by-username/${encodeURIComponent(username)}`);
            const email = userData.email;

            await login(email, pass, claveTipo, claveResp);
            ocultarLoader();
            location.href = 'index.html';
        } catch (err) {
            if (!loaderMostrado) mostrarLoader();
            setTimeout(() => {
                ocultarLoader();
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
            mostrarLoader();
            try {
                await googleLogin();
                ocultarLoader();
                location.href = 'index.html';
            } catch (err) {
                ocultarLoader();
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    alert('Error con Google: ' + err.message);
                }
            }
        });
    }
});