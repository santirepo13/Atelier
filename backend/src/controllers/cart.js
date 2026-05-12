const { queries, dbQuery } = require('../models/queries');
const { pool } = require('../config/db');

exports.getItems = async (req, res, next) => {
  try {
    const result = await dbQuery(queries.cart.get_items, [req.uid]);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity < 1) return res.status(400).json({ error: 'Datos inválidos' });
    // verify product exists
    const prod = await dbQuery(queries.products.get_by_id, [productId]);
    if (prod.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    const result = await dbQuery(queries.cart.add_item, [req.uid, productId, quantity]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ error: 'La cantidad debe ser mayor o igual a 1' });
    const result = await dbQuery(queries.cart.update_item, [req.params.itemId, quantity, req.uid]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item no encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const result = await dbQuery(queries.cart.delete_item, [req.params.itemId, req.uid]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item no encontrado' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.getTotal = async (req, res, next) => {
  try {
    const result = await dbQuery(queries.cart.get_total, [req.uid]);
    res.json({ total: Number(result.rows[0]?.total) || 0 });
  } catch (err) { next(err); }
};