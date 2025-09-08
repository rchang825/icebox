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
  const { name, quantity, unit } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO grocery_items (name, quantity, unit) VALUES ($1, $2, $3) RETURNING *',
      [name, quantity, unit]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateGroceryItem = async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit } = req.body;
  try {
    const result = await pool.query(
      'UPDATE grocery_items SET name = $1, quantity = $2, unit = $3 WHERE id = $4 RETURNING *',
      [name, quantity, unit, id]
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
