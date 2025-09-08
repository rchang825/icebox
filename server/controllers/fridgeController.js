const pool = require('../db');

exports.getMyFridgeItems = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM fridge_items WHERE user_id = $1 ORDER BY id',
    [req.user.id]
  );
  res.json(result.rows);
};

exports.addFridgeItem = async (req, res) => {
  const { name, quantity, unit } = req.body;
  const result = await pool.query(
    'INSERT INTO fridge_items (name, quantity, unit, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, quantity, unit || 'unit(s)', req.user.id]
  );
  res.json(result.rows[0]);
};

exports.updateFridgeItem = async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit } = req.body;
  const check = await pool.query('SELECT * FROM fridge_items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!check.rows.length) return res.sendStatus(403);
  const result = await pool.query(
    'UPDATE fridge_items SET name = $1, quantity = $2, unit = $3, date_updated = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
    [name, quantity, unit, id]
  );
  res.json(result.rows[0]);
};

exports.deleteFridgeItem = async (req, res) => {
  const { id } = req.params;
  const check = await pool.query('SELECT * FROM fridge_items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!check.rows.length) return res.sendStatus(403);
  await pool.query('DELETE FROM fridge_items WHERE id = $1', [id]);
  res.json({ success: true });
};
