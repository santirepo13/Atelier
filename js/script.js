import * as productCtrl from './controllers/productController.js';
import * as cartCtrl from './controllers/cartController.js';
import * as orderCtrl from './controllers/orderController.js';
import * as productModel from './models/productModel.js';
import * as cartModel from './models/cartModel.js';

const formatCOP = n => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0
}).format(n);

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
mostrarLoader();

let currentIndex = 0;
const itemWidth = 220;

function updateDots(idx) {
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

window.prev = function () {
  const t = document.querySelectorAll('.carousel-item').length;
  if (t) { currentIndex = (currentIndex - 1 + t) % t; updateCarousel(); }
};
window.next = function () {
  const t = document.querySelectorAll('.carousel-item').length;
  if (t) { currentIndex = (currentIndex + 1) % t; updateCarousel(); }
};

function updateCarousel() {
  const track = document.querySelector('.carousel-track');
  if (track) track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  updateDots(currentIndex);
}

const btnHamb = document.getElementById('btnMenuHamburguesa');
const sidebar = document.getElementById('sidebarMenu');
const btnCerrar = document.getElementById('btnCerrarSidebar');
btnHamb?.addEventListener('click', () => sidebar.classList.add('active'));
btnCerrar?.addEventListener('click', () => sidebar.classList.remove('active'));

sidebar?.querySelectorAll('.submenu-toggle').forEach(btn => {
  btn.onclick = () => {
    const submenu = btn.nextElementSibling;
    if (submenu) submenu.classList.toggle('active');
  };
});

const carritoToggle = document.getElementById('carritoToggle');
const carritoPopup = document.getElementById('carritoPopup');
const finalizarBtn = document.getElementById('finalizarCompra');

carritoToggle?.addEventListener('click', () => {
  if (carritoPopup) {
    carritoPopup.style.display = carritoPopup.style.display === 'block' ? 'none' : 'block';
  }
});
document.addEventListener('click', e => {
  if (carritoToggle && carritoPopup && !carritoToggle.contains(e.target) && !carritoPopup.contains(e.target)) {
    carritoPopup.style.display = 'none';
  }
});

finalizarBtn?.addEventListener('click', () => {
  abrirModalPagoWizard();
});

async function cargarProductos() {
  const cont = document.getElementById('carousel-track');
  if (!cont) return;
  try {
    const products = await productModel.getAllProducts();
    cont.innerHTML = '';
    products.forEach(p => {
      cont.insertAdjacentHTML('beforeend', `
        <div class="carousel-item">
          <div class="card">
            <img src="${p.imagen}" alt="${p.nombre}" />
            <h3>${p.nombre}</h3>
            <p>${p.descripcion || ''}<br>${formatCOP(p.precio)}</p>
            <button class="btn-comprar" data-id="${p.id}">Agregar</button>
            <div class="cantidad-panel" style="display:none; margin-top:6px;">
              <input type="number" min="1" value="1" style="width:48px; border-radius:6px; border:1px solid #ccc; padding:2px 4px; margin-right:6px;">
              <button class="btn-ok" style="background:#cddc39; color:#333; border:none; border-radius:6px; padding:2px 14px; font-weight:bold; cursor:pointer;">OK</button>
              <button class="btn-cancelar" style="background:#eee; color:#333; border:none; border-radius:6px; padding:2px 8px; margin-left:3px; cursor:pointer;">Cancelar</button>
            </div>
          </div>
        </div>
      `);
    });
    document.querySelectorAll('.card').forEach((card, idx) => {
      const btn = card.querySelector('.btn-comprar');
      const panel = card.querySelector('.cantidad-panel');
      const input = card.querySelector('input');
      const btnOK = card.querySelector('.btn-ok');
      const btnCancel = card.querySelector('.btn-cancelar');
      const prod = products[idx];
      btn.onclick = () => { panel.style.display = 'inline-block'; btn.style.display = 'none'; input.focus(); };
      btnCancel.onclick = () => { panel.style.display = 'none'; btn.style.display = ''; input.value = '1'; };
      btnOK.onclick = async () => {
        const qty = Math.max(1, parseInt(input.value, 10) || 1);
        try {
          await cartModel.addItem(prod.id, qty);
          window.dispatchEvent(new Event('cart-updated'));
          panel.style.display = 'none'; btn.style.display = ''; input.value = '1';
          await cartCtrl.updateCartUI();
        } catch (err) { alert('Error al agregar: ' + err.message); }
      };
    });
    updateDots(0);
  } catch (err) { console.error('Error cargando productos:', err); }
  ocultarLoader();
}

window.addEventListener('cart-updated', () => cartCtrl.updateCartUI());

const customPagoOverlay = document.getElementById('customPagoOverlay');
const customPagoModal = document.getElementById('customPagoModal');

function cerrarModalPagoWizard() {
  if (customPagoOverlay) customPagoOverlay.style.display = 'none';
}

async function getCartTotal() {
  try { return await cartModel.getTotal(); } catch { return 0; }
}

function loaderHTML(texto) {
  return `<div class="pago-loader-center">
    <div class="loader-bag"><div class="bag-fill"></div><div class="bag-handle"></div></div>
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

window.mostrarPasoTarjeta = async function () {
  if (!customPagoModal) return;
  const total = await getCartTotal();
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>Pagar con tarjeta</h2>
    <div style="font-weight:bold; color:#124d09; margin-bottom:10px;">Total: ${formatCOP(total)}</div>
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
    if (!document.getElementById('btnPagarTarjeta').disabled)
      simularPasoProcesando('Procesando pago...');
  };
};

window.mostrarPasoPSE = async function () {
  if (!customPagoModal) return;
  const total = await getCartTotal();
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>Pagar con PSE</h2>
    <div style="font-weight:bold; color:#124d09; margin-bottom:10px;">Total: ${formatCOP(total)}</div>
    <form id="formPSEWizard" autocomplete="off">
      <div class="pago-campo"><label>Banco</label>
        <select id="bancoPSE" class="pago-select" required>
          <option value="">Selecciona tu banco</option>
          <option value="1001">BANCO DE BOGOTÁ</option><option value="1007">BANCOLOMBIA</option>
          <option value="1051">BANCO DAVIVIENDA</option><option value="1006">BANCO ITAÚ</option>
          <option value="1023">BANCO DE OCCIDENTE</option><option value="1060">BANCO PICHINCHA</option>
        </select>
      </div>
      <div class="pago-campo"><label>Cédula</label>
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
  banco.onchange = ced.oninput = () => {
    const okBanco = !!banco.value;
    const okCed = /^\d{5,15}$/.test(ced.value.trim());
    banco.classList.toggle('invalid', !okBanco);
    ced.classList.toggle('invalid', !okCed);
    btn.disabled = !(okBanco && okCed);
  };
  document.getElementById('formPSEWizard').onsubmit = e => {
    e.preventDefault();
    if (!btn.disabled) simularPasoProcesando('Procesando pago...');
  };
};

window.mostrarPasoEfecty = async function () {
  if (!customPagoModal) return;
  const total = await getCartTotal();
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>Pagar con Efecty</h2>
    <div style="font-weight:bold; color:#124d09; margin-bottom:10px;">Total: ${formatCOP(total)}</div>
    <form id="formEfectyWizard" autocomplete="off">
      <div class="pago-campo"><label>Número de cédula</label>
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

async function mostrarInfoEfecty() {
  const total = await getCartTotal();
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>Pago Efecty generado</h2>
    <div style="font-weight:bold; color:#124d09; margin-bottom:8px;">Total: ${formatCOP(total)}</div>
    <div style="margin:18px 0;">Dirígete a tu Efecty más cercano con el <b>N° de Convenio: 012345</b></div>
    <button class="pago-btn" id="btnPagoRealizadoEfecty">He realizado mi pago</button>
    <button class="pago-btn" type="button" id="btnVolverEfecty2">Volver</button>`;
  document.getElementById('closePagoModal').onclick = cerrarModalPagoWizard;
  document.getElementById('btnVolverEfecty2').onclick = mostrarPasoEfecty;
  document.getElementById('btnPagoRealizadoEfecty').onclick = () => simularPasoProcesando('Comunicándonos con sistema aliado...');
}

function simularPasoProcesando(texto) {
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `<span id="closePagoModal" style="visibility:hidden;">&times;</span>${loaderHTML(texto)}`;
  const ms = texto.includes('aliado') ? 3400 : 3800;
  setTimeout(mostrarPasoExito, ms);
}

function mostrarPasoExito() {
  customPagoModal.className = 'custom-pago-modal pago-step-large';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>¡Compra realizada con éxito!</h2>
    <p style="margin-bottom:16px;">Tu pago fue procesado y tu compra quedó registrada.<br><b>Gracias por confiar en ATELIER.</b></p>
    <button class="pago-btn" id="btnFinalizarCompra">Finalizar</button>`;
  document.getElementById('closePagoModal').onclick = cerrarModalPagoWizard;
  document.getElementById('btnFinalizarCompra').addEventListener('click', finalizarPedido);
}

async function finalizarPedido() {
  try {
    const items = await cartModel.getCart();
    if (items.length === 0) { alert('Tu carrito está vacío.'); return; }
    const total = items.reduce((s, i) => s + (i.precio * i.quantity), 0);
    const paymentMethod = 'card';
    await orderCtrl.createOrder({ items, paymentMethod, total });
    await cartCtrl.updateCartUI();
    cerrarModalPagoWizard();
  } catch (err) { alert('Error al procesar pedido: ' + err.message); }
}

function abrirModalPagoWizard() {
  if (customPagoOverlay) customPagoOverlay.style.display = 'block';
  mostrarPasoSeleccion();
}

productCtrl.init().catch(err => console.error('Error init product:', err));
cartCtrl.updateCartUI().catch(err => console.error('Error init cart:', err));