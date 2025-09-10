const pool = require('../db');

exports.getGroceryItems = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grocery_items WHERE user_id = $1 ORDER BY id', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getGroceryItemByAlias = async (req, res) => {
  const { alias } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM grocery_items WHERE user_id = $1 AND LOWER(alias) = LOWER($2) LIMIT 1',
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

exports.addGroceryItem = async (req, res) => {
  const { alias, category, quantity, unit, checked } = req.body;
  if (!alias || !category || !quantity || !unit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO grocery_items (alias, category, quantity, unit, checked, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [alias, category, quantity, unit, checked || false, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateGroceryItem = async (req, res) => {
  const { id } = req.params;
  const { alias, category, quantity, unit, checked } = req.body;
  try {
    const result = await pool.query(
      'UPDATE grocery_items SET alias = $1, category = $2, quantity = $3, unit = $4, checked = $5 WHERE id = $6 RETURNING *',
      [alias, category, quantity, unit, checked, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteGroceryItem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM grocery_items WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
