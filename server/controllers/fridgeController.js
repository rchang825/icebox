const pool = require('../db');

exports.getFridgeItems = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM fridge_items WHERE user_id = $1 ORDER BY id',
    [req.user.id]
  );
  res.json(result.rows);
};

exports.getFridgeItemByAlias = async (req, res) => {
  const { alias } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM fridge_items WHERE user_id = $1 AND LOWER(alias) = LOWER($2) LIMIT 1',
      [req.user.id, alias]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addFridgeItem = async (req, res) => {
  const { alias, category, quantity, unit } = req.body;
  if (!alias || !category || !quantity || !unit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO fridge_items (alias, category, quantity, unit, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [alias, category, quantity, unit, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateFridgeItem = async (req, res) => {
  const { id } = req.params;
  const { alias, category, quantity, unit } = req.body;
  const check = await pool.query('SELECT * FROM fridge_items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!check.rows.length) return res.sendStatus(403);
  try {
    const result = await pool.query(
      'UPDATE fridge_items SET alias = $1, category = $2, quantity = $3, unit = $4, date_updated = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [alias, category, quantity, unit, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFridgeItem = async (req, res) => {
  const { id } = req.params;
  const check = await pool.query('SELECT * FROM fridge_items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!check.rows.length) return res.sendStatus(403);
  await pool.query('DELETE FROM fridge_items WHERE id = $1', [id]);
  res.json({ success: true });
};
