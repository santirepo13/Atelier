import { auth, db } from './firebase-init.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import {
  doc, setDoc, getDoc, updateDoc, arrayUnion,
  collection, getDocs
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';

// =================== FUNCIONES AUXILIARES ===================

// Para el loader global universal
let loaderMostrado = false;
let loaderTimeout = null;
function mostrarLoader() {
  const loader = document.getElementById('globalLoader');
  if (loader && !loaderMostrado) {
    loader.style.opacity = '1';
    loader.style.display = 'flex';
    loaderMostrado = true;
    loaderTimeout = setTimeout(() => ocultarLoader(), 3000);
  }
}
function ocultarLoader() {
  const loader = document.getElementById('globalLoader');
  if (loaderMostrado && loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
    loaderMostrado = false;
  }
  clearTimeout(loaderTimeout);
}
mostrarLoader();

const formatCOP = n => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0
}).format(n);

// ========== INICIALIZA AL CARGAR DOM ==========
document.addEventListener('DOMContentLoaded', () => {
  // --------- CARRUSEL ---------
  let currentIndex = 0;
  const dots      = document.querySelectorAll('.dot');
  const itemWidth = 220;

  function updateDots(idx) { dots.forEach((d, i) => d.classList.toggle('active', i === idx)); }
  function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    if (track) track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    updateDots(currentIndex);
  }
  window.prev = function () {
    const t = document.querySelectorAll('.carousel-item').length;
    if (t) { currentIndex = (currentIndex - 1 + t) % t; updateCarousel(); }
  };
  window.next = function () {
    const t = document.querySelectorAll('.carousel-item').length;
    if (t) { currentIndex = (currentIndex + 1) % t; updateCarousel(); }
  };

  // --------- SIDEBAR ---------
  const btnHamburguesa = document.getElementById('btnMenuHamburguesa');
  const sidebarMenu = document.getElementById('sidebarMenu');
  const btnCerrar = document.getElementById('btnCerrarSidebar');

  btnHamburguesa?.addEventListener('click', () => sidebarMenu.classList.add('active'));
  btnCerrar?.addEventListener('click', () => sidebarMenu.classList.remove('active'));

  function asignarListenersSidebarSubmenus() {
    if (!sidebarMenu) return;
    sidebarMenu.querySelectorAll('.submenu-toggle').forEach(btn => {
      btn.onclick = () => {
        const submenu = btn.nextElementSibling;
        if (submenu) submenu.classList.toggle('active');
      };
    });
  }
  asignarListenersSidebarSubmenus();

  // --------- SIDEBAR USUARIO ---------
  function setupSidebarUser() {
    const userBtn = document.getElementById('sidebarUserBtn');
    const userMenu = document.getElementById('sidebarUserMenu');
    const histBtn = document.getElementById('sidebarHistorialBtn');
    const logoutBtn = document.getElementById('sidebarLogoutBtn');
    if (!userBtn || !userMenu) return;

    userMenu.style.display = 'none';
    onAuthStateChanged(auth, user => {
      if (user) {
        const alias = (user.displayName || user.email || 'Usuario').split('@')[0];
        userBtn.textContent = alias;
        userBtn.classList.add('usuario-btn');
        userBtn.onclick = (e) => {
          e.stopPropagation();
          userMenu.style.display = (userMenu.style.display === 'block') ? 'none' : 'block';
        };
        if (histBtn) histBtn.onclick = (e) => {
          e.preventDefault();
          location.href = 'history.html';
        };
        if (logoutBtn) logoutBtn.onclick = async (e) => {
          e.preventDefault();
          await signOut(auth);
          location.reload();
        };
      } else {
        userBtn.textContent = "Iniciar Sesión";
        userBtn.classList.remove('usuario-btn');
        userMenu.style.display = 'none';
        userBtn.onclick = () => location.href = 'login.html';
      }
      asignarListenersSidebarSubmenus(); // <-- Garantiza siempre funcionalidad submenús después de cambios de usuario
    });
    // Cierra menú si clic fuera
    document.addEventListener('click', (e) => {
      if (!userBtn.contains(e.target) && !userMenu.contains(e.target)) {
        userMenu.style.display = 'none';
      }
    });
  }
  setupSidebarUser();

  // ============= CARRITO DE COMPRAS =============
  let uidActual = null;
  let carrito = [];

  const carritoToggle   = document.getElementById('carritoToggle');
  const carritoPopup    = document.getElementById('carritoPopup');
  const carritoContador = document.querySelector('.contador');
  const finalizarBtn    = document.getElementById('finalizarCompra');
  let carritoLista = carritoPopup?.querySelector('ul');

  // Actualiza referencia en caso de que cambie el DOM
  function refreshCarritoRefs() {
    carritoLista = carritoPopup?.querySelector('ul');
  }

  function agruparCarrito(lista) {
    const map = {};
    lista.forEach(p => {
      const key = p.nombre + '|' + p.precio + '|' + (p.img || '');
      if (!map[key]) {
        map[key] = { ...p, cantidad: 1 };
      } else {
        map[key].cantidad += (p.cantidad || 1);
      }
    });
    return Object.values(map);
  }

  carritoToggle?.addEventListener('click', () => {
    if (carritoPopup) {
      carritoPopup.style.display =
          carritoPopup.style.display === 'block' ? 'none' : 'block';
    }
  });
  document.addEventListener('click', e => {
    if (carritoToggle && carritoPopup &&
        !carritoToggle.contains(e.target) && !carritoPopup.contains(e.target)) {
      carritoPopup.style.display = 'none';
    }
  });

  async function actualizarCarrito() {
    refreshCarritoRefs();
    if (!carritoLista || !carritoContador) return;
    carritoLista.innerHTML = '';
    const agrupado = agruparCarrito(carrito);
    agrupado.forEach((p, idx) => {
      const li = document.createElement('li');
      li.style.position = 'relative';
      li.innerHTML = `
        <img src="${p.img}" style="width:24px;vertical-align:middle;border-radius:6px;margin-right:5px;">
        ${p.nombre} - ${formatCOP(p.precio)}
        ${p.cantidad > 1 ? `<span style="background:#ffc107;color:#222;font-size:13px;font-weight:bold;position:absolute;top:2px;right:28px;border-radius:50%;padding:2px 7px;z-index:2;">${p.cantidad}</span>` : ''}
        <button class="eliminar-carrito" data-key="${p.nombre}|${p.precio}|${p.img}" style="margin-left:8px;background:red;color:#fff;border:none;border-radius:6px;padding:2px 8px;cursor:pointer;">x</button>
      `;
      carritoLista.appendChild(li);
    });
    carritoContador.textContent = carrito.length;
    if (finalizarBtn) finalizarBtn.disabled = carrito.length === 0;

    carritoLista.querySelectorAll('.eliminar-carrito').forEach(btn => {
      btn.addEventListener('click', e => {
        const key = btn.getAttribute('data-key');
        carrito = carrito.filter(p => (p.nombre + '|' + p.precio + '|' + (p.img || '')) !== key);
        actualizarCarrito();
      });
    });

    // Mostrar total
    const oldTotal = carritoLista.parentNode.querySelector('div[carritototal]');
    if (oldTotal) oldTotal.remove();
    const total = agrupado.reduce((sum, p) => sum + (Number(p.precio) * (p.cantidad || 1)), 0);
    const totalDiv = document.createElement('div');
    totalDiv.setAttribute('carritototal', '1');
    totalDiv.style.cssText = 'text-align:right;font-weight:bold;margin-top:10px;font-size:1.09em;color:#124d09;';
    totalDiv.innerHTML = `Total: ${formatCOP(total)}`;
    carritoLista.parentNode.appendChild(totalDiv);

    if (uidActual) await setDoc(doc(db, 'usuarios', uidActual), { carrito }, { merge: true });
  }

  async function cargarCarritoDesdeFirestore() {
    if (!uidActual) return;
    const snap = await getDoc(doc(db, 'usuarios', uidActual));
    if (snap.exists() && snap.data().carrito) {
      carrito = snap.data().carrito;
      actualizarCarrito();
    }
  }
  function totalCarrito() {
    const agrupado = agruparCarrito(carrito);
    return agrupado.reduce((sum, p) => sum + (Number(p.precio) * (p.cantidad || 1)), 0);
  }

  finalizarBtn?.addEventListener('click', () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    abrirModalPagoWizard();
  });


  // ============= FIREBASE SESIÓN =============
  onAuthStateChanged(auth, async user => {
    if (user) {
      uidActual = user.uid;
      finalizarBtn?.removeAttribute('disabled');
      await cargarCarritoDesdeFirestore();
    } else {
      uidActual = null;
      finalizarBtn?.setAttribute('disabled', 'true');
    }
    await cargarProductos();
  });

  // ============= PRODUCTOS DINÁMICOS =============
  async function cargarProductos() {
    const cont = document.getElementById('carousel-track');
    if (!cont) return;
    const qs = await getDocs(collection(db, 'productos'));
    cont.innerHTML = '';
    qs.forEach(s => {
      const p = s.data();
      cont.insertAdjacentHTML('beforeend', `
        <div class="carousel-item">
          <div class="card">
            <img src="${p.imagen}" alt="${p.nombre}" />
            <h3>${p.nombre}</h3>
            <p>${p.descripcion}<br>COP&nbsp;${formatCOP(Number(p.precio))}</p>
            <button class="btn-comprar">Agregar</button>
            <div class="cantidad-panel" style="display:none; margin-top:6px;">
              <input type="number" min="1" value="1" style="width:48px; border-radius:6px; border:1px solid #ccc; padding:2px 4px; margin-right:6px;">
              <button class="btn-ok" style="background:#cddc39; color:#333; border:none; border-radius:6px; padding:2px 14px; font-weight:bold; cursor:pointer;">OK</button>
              <button class="btn-cancelar" style="background:#eee; color:#333; border:none; border-radius:6px; padding:2px 8px; margin-left:3px; cursor:pointer;">Cancelar</button>
            </div>
          </div>
        </div>
      `);
    });
    const productosDocs = qs.docs;
    document.querySelectorAll('.card').forEach((cardElem, idx) => {
      const btnAgregar = cardElem.querySelector('.btn-comprar');
      const panelCantidad = cardElem.querySelector('.cantidad-panel');
      const inputCantidad = cardElem.querySelector('input[type="number"]');
      const btnOK = cardElem.querySelector('.btn-ok');
      const btnCancelar = cardElem.querySelector('.btn-cancelar');
      const productoData = productosDocs[idx].data();

      btnAgregar.addEventListener('click', () => {
        panelCantidad.style.display = 'inline-block';
        btnAgregar.style.display = 'none';
        inputCantidad.focus();
      });
      btnCancelar.addEventListener('click', () => {
        panelCantidad.style.display = 'none';
        btnAgregar.style.display = '';
        inputCantidad.value = '1';
      });
      btnOK.addEventListener('click', () => {
        let cantidad = parseInt(inputCantidad.value, 10);
        if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
        for (let i = 0; i < cantidad; i++) {
          carrito.push({
            nombre: productoData.nombre,
            precio: productoData.precio,
            img: productoData.imagen
          });
        }
        actualizarCarrito();
        panelCantidad.style.display = 'none';
        btnAgregar.style.display = '';
        inputCantidad.value = '1';
      });
    });

    updateDots(0);
    ocultarLoader();
  }

  // ============= HISTORIAL Y PAGO =============
  document.getElementById('historialToggle')?.addEventListener('click', e => {
    e.preventDefault();
    location.href = 'history.html';
  });

  // WIZARD DE PAGO
  const customPagoOverlay = document.getElementById('customPagoOverlay');
  const customPagoModal = document.getElementById('customPagoModal');

  function abrirModalPagoWizard() {
    if (customPagoOverlay) customPagoOverlay.style.display = 'block';
    mostrarPasoSeleccion();
  }
  function cerrarModalPagoWizard() {
    if (customPagoOverlay) customPagoOverlay.style.display = 'none';
  }
  function loaderHTML(texto) {
    return `
      <div class="pago-loader-center">
        <div class="loader-bag">
          <div class="bag-fill"></div><div class="bag-handle"></div>
        </div>
        <p>${texto}</p>
      </div>`;
  }
  function mostrarPasoSeleccion() {
    if (!customPagoModal) return;
    customPagoModal.className = 'custom-pago-modal pago-step-mini';
    customPagoModal.innerHTML = `
      <span id="closePagoModal">&times;</span>
      <h2 class="pago-titulo-centrado">Método de pago</h2>
      <button class="pago-btn" onclick="mostrarPasoTarjeta()">Tarjeta de crédito/débito</button>
      <button class="pago-btn" onclick="mostrarPasoPSE()">PSE</button>
      <button class="pago-btn" onclick="mostrarPasoEfecty()">Efecty</button>`;
    document.getElementById('closePagoModal').onclick = cerrarModalPagoWizard;
  }
  window.mostrarPasoTarjeta = function () {
    if (!customPagoModal) return;
    customPagoModal.className = 'custom-pago-modal pago-step-medium';
    customPagoModal.innerHTML = `
      <span id="closePagoModal">&times;</span>
      <h2>Pagar con tarjeta</h2>
      <div style="font-weight:bold; color:#124d09; margin-bottom:10px;">
        Total a pagar: ${formatCOP(totalCarrito())}
      </div>
      <form id="formTarjetaWizard" autocomplete="off">
        <div class="pago-campo"><label>Número de tarjeta</label>
          <input id="numeroTarjeta" class="pago-input" maxlength="19" autocomplete="cc-number" required></div>
        <div class="pago-campo"><label>Fecha vencimiento</label>
          <input id="vencimientoTarjeta" class="pago-input" maxlength="5" placeholder="MM/AA" autocomplete="cc-exp" required></div>
        <div class="pago-campo"><label>CVC</label>
          <input id="cvvTarjeta" class="pago-input" maxlength="4" autocomplete="cc-csc" required></div>
        <div class="pago-campo"><label>Nombre en tarjeta</label>
          <input id="nombreTarjeta" class="pago-input" autocomplete="cc-name" required></div>
        <button class="pago-btn" id="btnPagarTarjeta" type="submit" disabled>Pagar ahora</button>
        <button class="pago-btn" type="button" id="btnVolverTarjeta">Volver</button>
      </form>`;
    document.getElementById('closePagoModal').onclick = cerrarModalPagoWizard;
    document.getElementById('btnVolverTarjeta').onclick = mostrarPasoSeleccion;
    document.getElementById('vencimientoTarjeta').addEventListener('input', e => {
      const v = e.target.value.replace(/\D/g, '');
      e.target.value = v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2, 4)}` : v;
      validarTarjeta();
    });
    ['numeroTarjeta', 'cvvTarjeta', 'nombreTarjeta'].forEach(id => {
      document.getElementById(id).addEventListener('input', validarTarjeta);
    });
    function mark(id, bad) { document.getElementById(id).classList.toggle('invalid', bad); }
    function validarTarjeta() {
      const num = document.getElementById('numeroTarjeta').value.replace(/\s+/g, '');
      const cvv = document.getElementById('cvvTarjeta').value;
      const nom = document.getElementById('nombreTarjeta').value.trim();
      const fec = document.getElementById('vencimientoTarjeta').value;
      let ok = true;
      if (num.length < 13) { mark('numeroTarjeta', true); ok = false; } else mark('numeroTarjeta', false);
      if (!/^\d{3,4}$/.test(cvv)) { mark('cvvTarjeta', true); ok = false; } else mark('cvvTarjeta', false);
      if (!nom) { mark('nombreTarjeta', true); ok = false; } else mark('nombreTarjeta', false);
      let fOk = false;
      if (/^\d{2}\/\d{2}$/.test(fec)) {
        const [m, a] = fec.split('/').map(Number);
        const d = new Date(); const cm = d.getMonth() + 1; const ca = d.getFullYear() % 100;
        if (m >= 1 && m <= 12 && (a > ca || (a === ca && m >= cm))) fOk = true;
      }
      mark('vencimientoTarjeta', !fOk); if (!fOk) ok = false;
      document.getElementById('btnPagarTarjeta').disabled = !ok;
    }
    document.getElementById('formTarjetaWizard').onsubmit = e => {
      e.preventDefault();
      validarTarjeta();
      if (!document.getElementById('btnPagarTarjeta').disabled)
        simularPasoProcesando('Procesando pago...');
    };
  };
/* ───────── PSE ───────── */
window.mostrarPasoPSE = function () {
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>Pagar con PSE</h2>
    <div style="font-weight:bold; color:#124d09; margin-bottom:10px;">
      Total a pagar: ${formatCOP(totalCarrito())}
    </div>
    <form id="formPSEWizard" autocomplete="off">
      <div class="pago-campo">
        <label>Banco</label>
        <select id="bancoPSE" class="pago-select" required>
          <option value="">Selecciona tu banco</option>
          <option value="1001">BANCO DE BOGOTA</option>
          <option value="1002">BANCO POPULAR</option>
          <option value="1006">BANCO ITAU</option>
          <option value="1007">BANCOLOMBIA</option>
          <option value="1009">CITIBANK</option>
          <option value="1012">BANCO GNB SUDAMERIS</option>
          <option value="1013">BANCO BBVA COLOMBIA S.A</option>
          <option value="1019">SCOTIABANK COLPATRIA</option>
          <option value="1023">BANCO DE OCCIDENTE</option>
          <option value="1032">BANCO CAJA SOCIAL</option>
          <option value="1040">BANCO AGRARIO</option>
          <option value="1047">BANCO MUNDO MUJER S.A.</option>
          <option value="1051">BANCO DAVIVIENDA</option>
          <option value="1052">BANCO AV VILLAS</option>
          <option value="1058">BANCO PROCREDIT</option>
          <option value="1059">BANCAMIA S.A</option>
          <option value="1060">BANCO PICHINCHA S.A</option>
          <option value="1061">BANCOOMEVA S.A.</option>
          <option value="1062">BANCO FALABELLA</option>
          <option value="1063">BANCO FINANDINA S.A. BIC</option>
          <option value="1065">BANCO SANTANDER COLOMBIA</option>
          <option value="1066">BANCO COOPCENTRAL</option>
          <option value="1069">BANCO SERFINANZA</option>
          <option value="1070">LULO BANK</option>
          <option value="1071">JP MORGAN</option>
          <option value="1097">DALE</option>
          <option value="1151">RAPPIPAY DAVIPLATA</option>
          <option value="1283">CFA COOPERATIVA FINANCIERA</option>
          <option value="1286">JFK COOPERATIVA FINANCIERA</option>
          <option value="1289">COTRAFA</option>
          <option value="1291">COOFINEP COOPERATIVA FINANCIERA</option>
          <option value="1292">CONFIAR COOPERATIVA FINANCIERA</option>
          <option value="1303">BANCO UNIÓN (antes GIROS)</option>
          <option value="1370">COLTEFINANCIERA</option>
          <option value="1507">NEQUI</option>
          <option value="1551">DAVIPLATA</option>
          <option value="1558">BANCO CREDIFINANCIERA</option>
          <option value="1637">IRIS</option>
          <option value="1801">MOVII S.A.</option>
          <option value="1804">UALÁ</option>
          <option value="1809">NU COLOMBIA C.F.</option>
          <option value="1811">RAPPIPAY</option>
          <option value="1815">ALIANZA FIDUCIARIA</option>
          <option value="1816">CREZCAMOS S.A. C.F.</option>
        </select>
      </div>
      <div class="pago-campo">
        <label>Cédula</label>
        <input id="cedulaPSE" class="pago-input" maxlength="15" autocomplete="off" required>
      </div>
      <button class="pago-btn" id="btnPagarPSE" type="submit" disabled>Pagar ahora</button>
      <button class="pago-btn" type="button" id="btnVolverPSE">Volver</button>
    </form>`;

  document.getElementById('closePagoModal').onclick = cerrarModalPagoWizard;
  document.getElementById('btnVolverPSE').onclick = mostrarPasoSeleccion;

  const banco = document.getElementById('bancoPSE');
  const ced = document.getElementById('cedulaPSE');
  const btn = document.getElementById('btnPagarPSE');

  banco.onchange = ced.oninput = validarPSE;
  function validarPSE() {
    const okBanco = !!banco.value;
    const okCed = /^\d{5,15}$/.test(ced.value.trim());
    banco.classList.toggle('invalid', !okBanco);
    ced.classList.toggle('invalid', !okCed);
    btn.disabled = !(okBanco && okCed);
  }

  document.getElementById('formPSEWizard').onsubmit = e => {
    e.preventDefault();
    if (!btn.disabled) simularPasoProcesando('Procesando pago...');
  };
};

/* ───────── EFECTY ───────── */
window.mostrarPasoEfecty = function () {
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>Pagar con Efecty</h2>
    <div style="font-weight:bold; color:#124d09; margin-bottom:10px;">
      Total a pagar: ${formatCOP(totalCarrito())}
    </div>
    <form id="formEfectyWizard" autocomplete="off">
      <div class="pago-campo">
        <label>Número de cédula</label>
        <input id="cedulaEfecty" class="pago-input" maxlength="15" autocomplete="off" required>
      </div>
      <button class="pago-btn" id="btnGenerarEfecty" type="submit" disabled>Generar pago</button>
      <button class="pago-btn" type="button" id="btnVolverEfecty">Volver</button>
    </form>`;

  document.getElementById('closePagoModal').onclick = cerrarModalPagoWizard;
  document.getElementById('btnVolverEfecty').onclick = mostrarPasoSeleccion;

  const ced = document.getElementById('cedulaEfecty');
  const btn = document.getElementById('btnGenerarEfecty');
  ced.oninput = () => {
    const ok = /^\d{6,}$/.test(ced.value.trim());
    ced.classList.toggle('invalid', !ok);
    btn.disabled = !ok;
  };

  document.getElementById('formEfectyWizard').onsubmit = e => {
    e.preventDefault();
    if (!btn.disabled) mostrarInfoEfecty();
  };
};

function mostrarInfoEfecty() {
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>Pago Efecty generado</h2>
    <div style="font-weight:bold; color:#124d09; margin-bottom:8px;">
      Total pagado: ${formatCOP(totalCarrito())}
    </div>
    <div style="margin:18px 0;">
      Dirígete a tu Efecty más cercano con el <b>N° de Convenio: 012345</b>
    </div>
    <button class="pago-btn" id="btnPagoRealizadoEfecty">He realizado mi pago</button>
    <button class="pago-btn" type="button" id="btnVolverEfecty2">Volver</button>`;

  document.getElementById('closePagoModal').onclick = cerrarModalPagoWizard;
  document.getElementById('btnVolverEfecty2').onclick = mostrarPasoEfecty;
  document.getElementById('btnPagoRealizadoEfecty').onclick =
      () => simularPasoProcesando('Comunicándonos con sistema aliado...');
}

/* ───────── Loader + Éxito ───────── */
function simularPasoProcesando(texto){
  customPagoModal.className='custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML=`
    <span id="closePagoModal" style="visibility:hidden;">&times;</span>
    ${loaderHTML(texto)}`;
  const ms = texto.includes('aliado') ? 3400 : 3800;
  setTimeout(mostrarPasoExito, ms);
}

  function mostrarPasoExito(){
    customPagoModal.className='custom-pago-modal pago-step-large';
    customPagoModal.innerHTML=`
    <span id="closePagoModal">&times;</span>
    <h2>¡Compra realizada con éxito!</h2>
    <p style="margin-bottom:16px;">
      Tu pago fue procesado y tu compra quedó registrada.<br>
      <b>Gracias por confiar en ATELIER.</b>
    </p>
    <button class="pago-btn" id="btnFinalizarCompra">Finalizar</button>`;
    document.getElementById('closePagoModal').onclick = cerrarModalPagoWizard;
    // Este addEventListener es la clave:
    document.getElementById('btnFinalizarCompra')
        .addEventListener('click', finalizarCompraSimuladaWizard);

  }


/* ═════════════ FINALIZAR COMPRA ═════════════ */// FINALIZAR COMPRA


  async function finalizarCompraSimuladaWizard() {
    if (!uidActual || carrito.length === 0) return;
    const ref = doc(db, 'usuarios', uidActual);
    const fecha = new Date().toISOString().split('T')[0];
    const compra = {
      id: Date.now() + '_' + Math.floor(Math.random() * 10000),
      fecha,
      productos: carrito
    };
    await updateDoc(ref, { historial: arrayUnion(compra), carrito: [] });
    carrito = [];
    actualizarCarrito();
    cerrarModalPagoWizard();
  }


}); // ← Fin de DOMContentLoaded