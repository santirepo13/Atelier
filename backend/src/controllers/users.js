const { queries, dbQuery } = require('../models/queries');

exports.create = async (req, res, next) => {
  const { uid, username, email, claveTipo, claveRespuesta } = req.body;
  if (!uid || !username || !email || !claveTipo || !claveRespuesta) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  try {
    await dbQuery(queries.users.create, [uid, username, email, claveTipo, claveRespuesta.toLowerCase()]);
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Perfil ya existe' });
    console.error(err);
    res.status(500).json({ error: 'Error al crear perfil' });
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const result = await dbQuery(queries.users.get_profile, [req.uid]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Perfil no encontrado' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

exports.validateClave = async (req, res, next) => {
  const { tipo, respuesta } = req.body;
  if (!tipo || !respuesta) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const result = await dbQuery(queries.users.validate_clave, [req.uid, tipo, respuesta.toLowerCase()]);
    res.json({ valid: result.rowCount > 0 });
  } catch (err) { next(err); }
};