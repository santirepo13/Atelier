// login.js
import { auth, db } from './firebase-init.js';
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

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

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let loaderShown = false;

        let userInput = document.getElementById('username').value.trim();
        const pass    = document.getElementById('password').value.trim();
        const confirm = document.getElementById('confirm').value.trim();
        const tipo    = document.getElementById('clave').value;
        const resp    = document.getElementById('claveRespuesta').value.trim().toLowerCase();

        if (!userInput || !pass || !confirm || !tipo || !resp || tipo === 'Palabra Clave') {
            alert('Completa todos los campos.');
            return;
        }
        if (pass !== confirm) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            mostrarLoader();
            loaderShown = true;

            // ── Alias → correo ──
            if (!userInput.includes('@')) {
                const aliasSnap = await getDoc(doc(db, 'usernames', userInput));
                if (!aliasSnap.exists()) throw new Error('Nombre de usuario no encontrado.');
                userInput = aliasSnap.data().correo;
            }

            // ── Autenticación ──
            const cred = await signInWithEmailAndPassword(auth, userInput, pass);
            const user = cred.user;

            // ── Validar palabra-clave ──
            const perfil = await getDoc(doc(db, 'usuarios', user.uid));
            if (!perfil.exists()) throw new Error('Datos de seguridad faltantes.');

            const data = perfil.data();
            if (data.claveTipo !== tipo || (data.claveRespuesta || '').toLowerCase() !== resp) {
                await signOut(auth);
                throw new Error('Palabra clave o respuesta incorrecta.');
            }

            ocultarLoader();
            window.location.href = 'index.html';
        } catch (err) {
            if (!loaderShown) mostrarLoader(); // Si falla antes de mostrar loader, igual mostrarlo un segundo para UX.
            setTimeout(() => {
                ocultarLoader();
                alert('Error al iniciar sesión: ' + err.message);
            }, 700); // Pequeño delay UX
        }
    });

    /* Google */
    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            mostrarLoader();
            const provider = new GoogleAuthProvider();
            try {
                await signInWithPopup(auth, provider);
                ocultarLoader();
                location.href = 'index.html';
            } catch (err) {
                ocultarLoader();
                if (err.code !== 'auth/popup-closed-by-user')
                    alert('Error con Google: ' + err.message);
            }
        });
    }
});
