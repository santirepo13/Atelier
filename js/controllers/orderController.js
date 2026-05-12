import * as orderModel from '../models/orderModel.js';

const formatCOP = (n) => new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0,
}).format(n);

export async function init() {
  try {
    const orders = await orderModel.getOrders();
    renderHistory(orders);
  } catch (err) {
    console.error('Error loading orders:', err);
    const wrapper = document.getElementById('historialWrapper');
    if (wrapper) wrapper.innerHTML = '<p>Error al cargar historial. Inténtalo de nuevo.</p>';
  }
}

export async function createOrder({ items, paymentMethod, total }) {
  return orderModel.createOrder(items, paymentMethod, total);
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
    const total = (order.items || []).reduce(
      (sum, i) => sum + (i.product_price * i.quantity), 0,
    );
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