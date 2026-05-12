// registro.js
import { auth, db } from './firebase-init.js';
import {
    createUserWithEmailAndPassword,
    updateProfile,
    signOut
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

// ===== Loader Universal =====
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

// ── ¿Estamos en registro-exito.html? ──
const isSuccess = location.pathname.endsWith('registro-exito.html');

if (isSuccess) {
    setTimeout(() => (location.href = 'login.html'), 4000);
} else {
    /* ── Página de registro ── */
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const displayName    = document.getElementById('displayName').value.trim();
        const email          = document.getElementById('email').value.trim();
        const password       = document.getElementById('password').value.trim();
        const confirm        = document.getElementById('confirm').value.trim();
        const claveTipo      = document.getElementById('clave').value;
        const claveRespuesta = document.getElementById('claveRespuesta').value.trim();

        // Validaciones
        if (!displayName || !email || !password || !confirm ||
            !claveTipo || !claveRespuesta || claveTipo === 'Palabra Clave') {
            alert('Completa todos los campos.');
            return;
        }
        if (password !== confirm) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            /* Crear cuenta en Firebase Auth */
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const user = cred.user;

            /* Asignar displayName público */
            await updateProfile(user, { displayName });

            /* Guardar perfil privado */
            await setDoc(doc(db, 'usuarios', user.uid), {
                correo: email,
                nombre: displayName,
                claveTipo,
                claveRespuesta
            });

            /* Guardar alias público (username → correo) */
            await setDoc(doc(db, 'usernames', displayName), { correo: email });

            /* Cerrar sesión y pasar a pantalla de éxito */
            await signOut(auth);

            // Mostrar loader y esperar 3 segundos antes de redirigir
            mostrarLoader();
            setTimeout(() => {
                location.href = 'registro-exito.html';
            }, 3000);

        } catch (err) {
            ocultarLoader();
            alert('Error al registrar: ' + err.message);
        }
    });
}
