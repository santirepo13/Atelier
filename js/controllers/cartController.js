import * as cartModel from '../models/cartModel.js';

const formatCOP = (n) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0,
}).format(n);

export async function updateCartUI() {
  try {
    const items = await cartModel.getCart();
    const popup = document.getElementById('carritoPopup');
    const contador = document.querySelector('.contador');
    if (!popup) return;

    const ul = popup.querySelector('ul');
    ul.innerHTML = '';

    let total = 0;
    items.forEach((item) => {
      total += item.precio * item.quantity;
      const li = document.createElement('li');
      li.style.marginBottom = '8px';
      li.style.fontSize = '14px';
      li.innerHTML = `
        <img src="../${item.imagen}" width="24" style="vertical-align:middle;border-radius:6px;margin-right:5px;">
        ${item.nombre} — ${formatCOP(item.precio)} × ${item.quantity}
        <button class="eliminar-carrito" data-id="${item.id}"
          style="margin-left:8px;background:red;color:#fff;border:none;border-radius:6px;padding:2px 8px;cursor:pointer;">×</button>
      `;
      ul.appendChild(li);
    });

    // Contador
    if (contador) contador.textContent = items.length;

    // Total
    let totalDiv = ul.parentNode.querySelector('[carritototal]');
    if (!totalDiv) {
      totalDiv = document.createElement('div');
      totalDiv.setAttribute('carritototal', '1');
      totalDiv.style.cssText = 'text-align:right;font-weight:bold;margin-top:10px;font-size:1.09em;color:#124d09;';
      ul.parentNode.appendChild(totalDiv);
    }
    totalDiv.innerHTML = `Total: ${formatCOP(total)}`;

    // Handlers eliminar
    ul.querySelectorAll('.eliminar-carrito').forEach((btn) => {
      btn.onclick = async () => {
        try {
          await cartModel.removeItem(btn.dataset.id);
          updateCartUI();
        } catch (err) {
          alert('Error al eliminar: ' + err.message);
        }
      };
    });
  } catch (err) {
    console.error('Cart update failed:', err);
  }
}

export async function getAndShowTotal() {
  try {
    const total = await cartModel.getTotal();
    return total;
  } catch (err) {
    console.error('Error getting cart total:', err);
    return 0;
  }
}