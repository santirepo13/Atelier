import * as cartController from '../controllers/cartController.js';
import * as orderController from '../controllers/orderController.js';
import { formatCOP } from '../utils/format.js';
import { validateCardNumber, validateCVV, validateExpiry, validateRequired } from '../utils/validators.js';

let customPagoOverlay;
let customPagoModal;

export function init() {
  customPagoOverlay = document.getElementById('customPagoOverlay');
  customPagoModal = document.getElementById('customPagoModal');
}

export function openPaymentWizard() {
  if (customPagoOverlay) customPagoOverlay.style.display = 'block';
  showPaymentSelection();
}

export function closePaymentWizard() {
  if (customPagoOverlay) customPagoOverlay.style.display = 'none';
}

async function getCartTotal() {
  try {
    return await cartController.getCartTotal();
  } catch {
    return 0;
  }
}

function loaderHTML(texto) {
  return `<div class="pago-loader-center">
    <div class="loader-bag"><div class="bag-fill"></div><div class="bag-handle"></div></div>
    <p>${texto}</p>
  </div>`;
}

export function showPaymentSelection() {
  if (!customPagoModal) return;
  customPagoModal.className = 'custom-pago-modal pago-step-mini';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2 class="pago-titulo-centrado">Método de pago</h2>
    <button class="pago-btn" onclick="paymentView.showCardStep()">Tarjeta de crédito/débito</button>
    <button class="pago-btn" onclick="paymentView.showPSEStep()">PSE</button>
    <button class="pago-btn" onclick="paymentView.showEfectyStep()">Efecty</button>`;
  document.getElementById('closePagoModal').onclick = closePaymentWizard;
}

export async function showCardStep() {
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
  document.getElementById('closePagoModal').onclick = closePaymentWizard;
  document.getElementById('btnVolverTarjeta').onclick = showPaymentSelection;
  document.getElementById('vencimientoTarjeta').addEventListener('input', e => {
    const v = e.target.value.replace(/\D/g, '');
    e.target.value = v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2, 4)}` : v;
    validateCardForm();
  });
  ['numeroTarjeta', 'cvvTarjeta', 'nombreTarjeta'].forEach(id => {
    document.getElementById(id).addEventListener('input', validateCardForm);
  });

  function mark(id, bad) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('invalid', bad);
  }

  function validateCardForm() {
    const num = document.getElementById('numeroTarjeta').value.replace(/\s+/g, '');
    const cvv = document.getElementById('cvvTarjeta').value;
    const nom = document.getElementById('nombreTarjeta').value.trim();
    const fec = document.getElementById('vencimientoTarjeta').value;
    let ok = true;
    if (!validateCardNumber(num)) { mark('numeroTarjeta', true); ok = false; } else mark('numeroTarjeta', false);
    if (!validateCVV(cvv)) { mark('cvvTarjeta', true); ok = false; } else mark('cvvTarjeta', false);
    if (!nom) { mark('nombreTarjeta', true); ok = false; } else mark('nombreTarjeta', false);
    if (!validateExpiry(fec)) { mark('vencimientoTarjeta', true); ok = false; } else mark('vencimientoTarjeta', false);
    document.getElementById('btnPagarTarjeta').disabled = !ok;
  }

  document.getElementById('formTarjetaWizard').onsubmit = e => {
    e.preventDefault();
    if (!document.getElementById('btnPagarTarjeta').disabled) {
      processPayment('Procesando pago...');
    }
  };
}

export async function showPSEStep() {
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
  document.getElementById('closePagoModal').onclick = closePaymentWizard;
  document.getElementById('btnVolverPSE').onclick = showPaymentSelection;
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
    if (!btn.disabled) processPayment('Procesando pago...');
  };
}

export async function showEfectyStep() {
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
  document.getElementById('closePagoModal').onclick = closePaymentWizard;
  document.getElementById('btnVolverEfecty').onclick = showPaymentSelection;
  const ced = document.getElementById('cedulaEfecty');
  const btn = document.getElementById('btnGenerarEfecty');
  ced.oninput = () => {
    const ok = /^\d{6,}$/.test(ced.value.trim());
    ced.classList.toggle('invalid', !ok);
    btn.disabled = !ok;
  };
  document.getElementById('formEfectyWizard').onsubmit = e => {
    e.preventDefault();
    if (!btn.disabled) showEfectyInfo();
  };
}

async function showEfectyInfo() {
  const total = await getCartTotal();
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>Pago Efecty generado</h2>
    <div style="font-weight:bold; color:#124d09; margin-bottom:8px;">Total: ${formatCOP(total)}</div>
    <div style="margin:18px 0;">Dirígete a tu Efecty más cercano con el <b>N° de Convenio: 012345</b></div>
    <button class="pago-btn" id="btnPagoRealizadoEfecty">He realizado mi pago</button>
    <button class="pago-btn" type="button" id="btnVolverEfecty2">Volver</button>`;
  document.getElementById('closePagoModal').onclick = closePaymentWizard;
  document.getElementById('btnVolverEfecty2').onclick = showEfectyStep;
  document.getElementById('btnPagoRealizadoEfecty').onclick = () => processPayment('Comunicándonos con sistema aliado...');
}

function processPayment(texto) {
  customPagoModal.className = 'custom-pago-modal pago-step-medium';
  customPagoModal.innerHTML = `<span id="closePagoModal" style="visibility:hidden;">&times;</span>${loaderHTML(texto)}`;
  const ms = texto.includes('aliado') ? 3400 : 3800;
  setTimeout(showPaymentSuccess, ms);
}

function showPaymentSuccess() {
  customPagoModal.className = 'custom-pago-modal pago-step-large';
  customPagoModal.innerHTML = `
    <span id="closePagoModal">&times;</span>
    <h2>¡Compra realizada con éxito!</h2>
    <p style="margin-bottom:16px;">Tu pago fue procesado y tu compra quedó registrada.<br><b>Gracias por confiar en ATELIER.</b></p>
    <button class="pago-btn" id="btnFinalizarCompra">Finalizar</button>`;
  document.getElementById('closePagoModal').onclick = closePaymentWizard;
  document.getElementById('btnFinalizarCompra').addEventListener('click', finalizeOrder);
}

async function finalizeOrder() {
  try {
    const items = await cartController.getCartItems();
    if (cartController.isCartEmpty(items)) {
      alert('Tu carrito está vacío.');
      return;
    }
    const total = cartController.calculateCartTotal(items);
    const paymentMethod = 'card';
    await orderController.createOrder(items, paymentMethod, total);
    closePaymentWizard();
    window.dispatchEvent(new Event('cart-updated'));
  } catch (err) {
    alert('Error al procesar pedido: ' + err.message);
  }
}

window.paymentView = {
  showCardStep,
  showPSEStep,
  showEfectyStep
};