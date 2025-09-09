const pool = require('../db');

exports.getGroceryItems = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grocery_items ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addGroceryItem = async (req, res) => {
  const { alias, category, quantity, unit } = req.body;
  if (!alias || !category || !quantity || !unit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO grocery_items (alias, category, quantity, unit, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [alias, category, quantity, unit, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateGroceryItem = async (req, res) => {
  const { id } = req.params;
  const { alias, category, quantity, unit } = req.body;
  try {
    const result = await pool.query(
      'UPDATE grocery_items SET alias = $1, category = $2, quantity = $3, unit = $4 WHERE id = $5 RETURNING *',
      [alias, category, quantity, unit, id]
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
