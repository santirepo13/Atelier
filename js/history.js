// history.js
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
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
mostrarLoader(); // <-- MUY IMPORTANTE

// ========= FORMATEADOR DE MONEDA =========
const formatCOP = n => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
}).format(n);

// ========= UTILS =========
const estadosMap = {
    1: { txt: 'Entregado', clase: 'estado-1' },
    2: { txt: 'En proceso de envío', clase: 'estado-2' },
    3: { txt: 'Comuníquese con soporte', clase: 'estado-3' }
};

const historialWrapper = document.getElementById('historialWrapper');

// ========= AGRUPAR PRODUCTOS REPETIDOS =========
function agruparProductos(productos) {
    const mapa = {};
    productos.forEach(p => {
        const key = p.nombre + '|' + p.precio + '|' + (p.img||'');
        if (!mapa[key]) {
            mapa[key] = { ...p, cantidad: 1 };
        } else {
            mapa[key].cantidad++;
        }
    });
    return Object.values(mapa);
}

// ========= AUTH + CARGA =========
onAuthStateChanged(auth, async user => {
    if (!user) {
        alert('Debes iniciar sesión para ver tu historial.');
        location.href = 'login.html';
        ocultarLoader();
        return;
    }

    const snap = await getDoc(doc(db, 'usuarios', user.uid));
    const hist = snap.exists() && snap.data().historial ? snap.data().historial : [];

    if (!hist.length) {
        historialWrapper.innerHTML = '<p>No tienes compras registradas aún.</p>';
        ocultarLoader();
        return;
    }

    hist.forEach(compra => {
        if (!compra.productos || !compra.productos.length) return;

        const estado = estadosMap[2]; // puedes personalizar según la lógica de tu sistema
        const agrupados = agruparProductos(compra.productos);
        const totalCompra = agrupados.reduce((sum, p) => sum + (Number(p.precio) * (p.cantidad || 1)), 0);

        // Estructura solo con clases CSS
        const card = document.createElement('div');
        card.className = 'hist-card big';

        // Columna izquierda
        const left = document.createElement('div');
        left.className = 'hist-left';
        left.innerHTML = `
            <div class="hist-row hist-fecha">Fecha: ${compra.fecha}</div>
            <div class="hist-row hist-cantidad">Productos: ${compra.productos.length}</div>
            <div class="hist-row hist-estado-wrap">
              <span class="hist-estado ${estado.clase}">${estado.txt}</span>
            </div>
        `;

        // Columna central: productos agrupados
        const prods = document.createElement('div');
        prods.className = "hist-prods";
        agrupados.forEach(p => {
            const pDiv = document.createElement('div');
            pDiv.className = "hist-prod";
            pDiv.innerHTML = `
        <span class="hist-img-wrap">
          <img src="${p.img || 'img/imagenLogo.png'}" class="hist-thumb" alt="${p.nombre}">
          ${p.cantidad > 1
                ? `<span class="hist-badge" title="Cantidad">${p.cantidad}</span>`
                : ''}
        </span>
        <span class="hist-prod-nombre">${p.nombre}</span>
    `;
            prods.appendChild(pDiv);
        });

        // Columna derecha: valor total alineado
        const right = document.createElement('div');
        right.className = 'hist-right';
        right.innerHTML = `<div class="hist-precio">Valor total: ${formatCOP(totalCompra)}</div>`;

        card.appendChild(left);
        card.appendChild(prods);
        card.appendChild(right);

        historialWrapper.appendChild(card);
    });

    ocultarLoader();
});

// ========= GALERÍA =========
window.abrirGaleria = src => {
    document.getElementById('galeriaImg').src = src;
    document.getElementById('galeriaOverlay').style.display = 'flex';
};
window.cerrarGaleria = () =>
    (document.getElementById('galeriaOverlay').style.display = 'none');

// ========== SIDEBAR HAMBURGUESA ==========
// (Funciona igual que en index)
const sidebar = document.getElementById('sidebarMenu');
const btnMenu = document.getElementById('btnMenuHamburguesa');
const btnCerrarSidebar = document.getElementById('btnCerrarSidebar');
const submenuToggles = sidebar ? sidebar.querySelectorAll('.submenu-toggle') : [];
const sidebarUserBtn = document.getElementById('sidebarUserBtn');
const sidebarUserMenu = document.getElementById('sidebarUserMenu');

// Mostrar/Ocultar sidebar
if(btnMenu) btnMenu.addEventListener('click', () => sidebar.classList.add('active'));
if(btnCerrarSidebar) btnCerrarSidebar.addEventListener('click', () => sidebar.classList.remove('active'));

// Submenús anidados
submenuToggles.forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        this.nextElementSibling && this.nextElementSibling.classList.toggle('active');
    });
});

// Menú usuario desplegable
if(sidebarUserBtn && sidebarUserMenu) {
    sidebarUserBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarUserMenu.style.display = sidebarUserMenu.style.display === 'block' ? 'none' : 'block';
    });
    // Oculta el submenú al hacer click fuera
    document.addEventListener('click', () => sidebarUserMenu.style.display = 'none');
}

// (Opcional: cierra sidebar al navegar)
sidebar && sidebar.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => sidebar.classList.remove('active'))
);

// Cambia el texto del botón de usuario si hay sesión
onAuthStateChanged(auth, user => {
    if (user && sidebarUserBtn) {
        sidebarUserBtn.textContent = user.displayName || user.email || 'Usuario';
    } else if(sidebarUserBtn) {
        sidebarUserBtn.textContent = 'Iniciar Sesión';
    }
});
