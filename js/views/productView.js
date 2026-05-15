import * as productController from '../controllers/productController.js';
import * as cartController from '../controllers/cartController.js';
import { formatCOP } from '../utils/format.js';
import { showLoader, hideLoader } from '../components/loader.js';

let currentIndex = 0;
const itemWidth = 220;

export async function init() {
  showLoader();
  try {
    const products = await productController.loadProducts();
    renderProducts(products);
    setupCarouselLogic();
    window.dispatchEvent(new Event('products-loaded'));
  } catch (err) {
    console.error('Error loading products:', err);
  } finally {
    hideLoader();
  }
}

export function renderProducts(products) {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  track.innerHTML = '';
  products.forEach((p, idx) => {
    const imgSrc = `../${p.imagen}`;
    track.insertAdjacentHTML('beforeend', `
      <div class="carousel-item">
        <div class="card">
          <img src="${imgSrc}" alt="${p.nombre}" />
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

    const card = track.children[idx];
    setupProductCardEvents(card, p);
  });
}

function setupProductCardEvents(card, product) {
  const btnAgregar = card.querySelector('.btn-comprar');
  const panel = card.querySelector('.cantidad-panel');
  const input = card.querySelector('input');
  const btnOK = card.querySelector('.btn-ok');
  const btnCancel = card.querySelector('.btn-cancelar');

  btnAgregar.onclick = () => {
    panel.style.display = 'inline-block';
    btnAgregar.style.display = 'none';
    input.focus();
  };

  btnCancel.onclick = () => {
    panel.style.display = 'none';
    btnAgregar.style.display = '';
    input.value = '1';
  };

  btnOK.onclick = async () => {
    const qty = Math.max(1, parseInt(input.value, 10) || 1);
    try {
      await cartController.addToCart(product.id, qty);
      panel.style.display = 'none';
      btnAgregar.style.display = '';
      input.value = '1';
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      alert('Error al agregar al carrito: ' + err.message);
    }
  };
}

function setupCarouselLogic() {
  const dots = document.querySelectorAll('.dot');

  function updateDots(idx) {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
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

  updateDots(0);
}