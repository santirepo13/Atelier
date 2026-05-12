import { register } from './models/authModel.js';

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

const isSuccess = location.pathname.endsWith('registro-exito.html');
if (isSuccess) {
    setTimeout(() => (location.href = 'login.html'), 4000);
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
            mostrarLoader();
            await register({ username, email, password, claveTipo, claveResp });
            ocultarLoader();
            mostrarLoader();
            setTimeout(() => { location.href = 'registro-exito.html'; }, 3000);
        } catch (err) {
            ocultarLoader();
            alert('Error al registrar: ' + err.message);
        }
    });
}