const { queries, dbQuery } = require('../models/queries');
const { pool } = require('../config/db');

exports.create = async (req, res, next) => {
  const { paymentMethod } = req.body;
  const validMethods = ['card', 'PSE', 'Efecty'];
  if (!validMethods.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Método de pago no válido' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get cart items and compute total from DB
    const cartResult = await client.query(queries.cart.get_items, [req.uid]);
    const items = cartResult.rows;
    if (items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

    // Insert order header
    const orderResult = await client.query(queries.orders.create, [req.uid, total, paymentMethod]);
    const orderId = orderResult.rows[0].id;

    // Insert order items (denormalized)
    for (const item of items) {
      await client.query(queries.orders.create_item, [
        orderId, item.product_id, item.nombre, item.precio, item.quantity
      ]);
    }

    // Clear cart
    await client.query(queries.cart.clear_cart, [req.uid]);

    await client.query('COMMIT');
    res.status(201).json({ orderId, status: 'pending' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order creation failed:', err);
    next(err);
  } finally {
    client.release();
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const ordersResult = await dbQuery(queries.orders.get_orders, [req.uid]);
    const orders = ordersResult.rows;
    // Fetch details for each order
    for (const order of orders) {
      const detailsResult = await dbQuery(queries.orders.get_details, [order.id]);
      order.items = detailsResult.rows;
    }
    res.json(orders);
  } catch (err) { next(err); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const orderResult = await dbQuery(queries.orders.get_order, [req.params.id, req.uid]);
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    const order = orderResult.rows[0];
    const detailsResult = await dbQuery(queries.orders.get_details, [order.id]);
    order.items = detailsResult.rows;
    res.json(order);
  } catch (err) { next(err); }
};