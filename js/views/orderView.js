import * as orderController from '../controllers/orderController.js';
import { formatCOP } from '../utils/format.js';

export async function init() {
  try {
    const orders = await orderController.getOrderHistory();
    renderHistory(orders);
  } catch (err) {
    console.error('Error loading orders:', err);
    const wrapper = document.getElementById('historialWrapper');
    if (wrapper) wrapper.innerHTML = '<p>Error al cargar historial. Inténtalo de nuevo.</p>';
  }
}

export function renderHistory(orders) {
  const wrapper = document.getElementById('historialWrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  if (!orders || orders.length === 0) {
    wrapper.innerHTML = '<p>No tienes compras registradas.</p>';
    return;
  }
  orders.forEach((order) => {
    const total = orderController.formatOrderTotal(order.items || []);
    const card = document.createElement('div');
    card.className = 'hist-card big';

    const prodsHTML = (order.items || []).map((i) => `
      <div class="hist-prod">
        <span class="hist-img-wrap">
          <img src="../img/imagenLogo.png" class="hist-thumb" alt="${i.product_name}">
          ${i.quantity > 1 ? `<span class="hist-badge">${i.quantity}</span>` : ''}
        </span>
        <span class="hist-prod-nombre">${i.product_name}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="hist-left">
        <div class="hist-fecha">Fecha: ${order.fecha}</div>
        <div class="hist-cantidad">Productos: ${(order.items || []).length}</div>
        <div class="hist-estado-wrap">
          <span class="hist-estado estado-2">${order.status || 'pending'}</span>
        </div>
      </div>
      <div class="hist-prods">${prodsHTML}</div>
      <div class="hist-right">
        <div class="hist-precio">Total: ${formatCOP(total)}</div>
      </div>
    `;
    wrapper.appendChild(card);
  });
}