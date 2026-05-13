import { auth } from './firebase-init.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';

const headerMenu   = document.querySelector('.botones-header');
const loginBtnBox  = headerMenu?.querySelector('.menu:last-child');
const loginButton  = loginBtnBox?.querySelector('button');
const sidebarUserBtn  = document.getElementById('sidebarUserBtn');
const sidebarUserMenu = document.getElementById('sidebarUserMenu');

const userMenu = document.createElement('div');
userMenu.id = 'userMenu';
userMenu.className = 'user-menu-popup';
userMenu.style.display = 'none';
userMenu.innerHTML = `
  <button id="historialUserBtn">Historial</button>
  <button id="logoutBtn">Cerrar sesión</button>
`;
loginBtnBox?.appendChild(userMenu);

function sidebarUserToggleHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    if (window.userMenu) window.userMenu.style.display = 'none';
    if (sidebarUserMenu) {
        sidebarUserMenu.style.display = sidebarUserMenu.style.display === 'block' ? 'none' : 'block';
    }
    assignSidebarMenuListeners();
}

function assignSidebarMenuListeners() {
    if (!sidebarUserMenu) return;
    const histSideBtn = document.getElementById('sidebarHistorialBtn');
    const logoutSideBtn = document.getElementById('sidebarLogoutBtn');
    if (histSideBtn) {
        histSideBtn.onclick = (e) => {
            e.preventDefault();
            if (!window.location.pathname.endsWith('history.html')) {
                location.href = 'views/history.html';
            } else {
                sidebarUserMenu.style.display = 'none';
            }
        };
    }
    if (logoutSideBtn) {
        logoutSideBtn.onclick = async (e) => {
            e.preventDefault();
            await signOut(auth);
            location.reload();
        };
    }
}

document.addEventListener('click', (e) => {
    if (loginBtnBox && !loginBtnBox.contains(e.target)) {
        userMenu.style.display = 'none';
    }
    if (sidebarUserMenu && !sidebarUserMenu.contains(e.target) && e.target !== sidebarUserBtn) {
        sidebarUserMenu.style.display = 'none';
    }
});

onAuthStateChanged(auth, (user) => {
    const histBtn   = document.getElementById('historialUserBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (user) {
        loginButton.removeAttribute('onclick');
        const alias = (user.displayName || user.email || 'Usuario').split('@')[0];
        loginButton.textContent = alias;
        loginButton.classList.add('usuario-btn');
        loginButton.onclick = (e) => {
            e.stopPropagation();
            userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
        };
        if (histBtn) histBtn.onclick = () => {
            if (!window.location.pathname.endsWith('history.html')) {
                location.href = 'views/history.html';
            } else {
                userMenu.style.display = 'none';
            }
        };
        if (logoutBtn) logoutBtn.onclick = async () => {
            await signOut(auth);
            location.reload();
        };
        if (sidebarUserBtn) {
            sidebarUserBtn.textContent = alias;
            sidebarUserBtn.classList.add('usuario-btn');
            sidebarUserBtn.replaceWith(sidebarUserBtn.cloneNode(true));
            const newSidebarUserBtn = document.getElementById('sidebarUserBtn');
            if (newSidebarUserBtn) {
                newSidebarUserBtn.textContent = alias;
                newSidebarUserBtn.classList.add('usuario-btn');
                newSidebarUserBtn.addEventListener('click', sidebarUserToggleHandler);
            }
        }
        assignSidebarMenuListeners();
    } else {
        loginButton.textContent = 'Iniciar Sesión';
        loginButton.classList.add('usuario-btn');
        userMenu.style.display = 'none';
        loginButton.onclick = () => (location.href = 'views/login.html');

        if (sidebarUserBtn) {
            sidebarUserBtn.textContent = 'Iniciar Sesión';
            sidebarUserBtn.classList.add('usuario-btn');
            sidebarUserBtn.replaceWith(sidebarUserBtn.cloneNode(true));
            const newSidebarUserBtn = document.getElementById('sidebarUserBtn');
            if (newSidebarUserBtn) {
                newSidebarUserBtn.textContent = 'Iniciar Sesión';
                newSidebarUserBtn.classList.add('usuario-btn');
                newSidebarUserBtn.onclick = (e) => {
                    e.preventDefault();
                    location.href = 'views/login.html';
                };
            }
        }
        if (sidebarUserMenu) sidebarUserMenu.style.display = 'none';
    }
});

assignSidebarMenuListeners();