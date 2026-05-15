import { showLoader, hideLoader } from './components/loader.js';
import * as productView from './views/productView.js';
import * as cartView from './views/cartView.js';
import * as paymentView from './views/paymentView.js';
import { init as initHistory } from './views/orderView.js';

showLoader();

function initMenu() {
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
}

function initCart() {
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
    paymentView.openPaymentWizard();
  });
}

function initEvents() {
  window.addEventListener('cart-updated', () => {
    cartView.updateCartUI();
  });
}

export function init() {
  initMenu();
  initCart();
  initEvents();
  paymentView.init();

  if (document.getElementById('carousel-track')) {
    productView.init();
  }

  if (document.getElementById('historialWrapper')) {
    initHistory().finally(() => hideLoader());
  } else {
    cartView.updateCartUI().finally(() => hideLoader());
  }
}

init();