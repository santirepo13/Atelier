const { queries, dbQuery } = require('../models/queries');

exports.getAll = async (req, res, next) => {
  try {
    const result = await dbQuery(queries.products.get_all);
    res.json(result.rows);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await dbQuery(queries.products.get_by_id, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};