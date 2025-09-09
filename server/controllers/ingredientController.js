const pool = require('../db');

exports.getIngredients = async (req, res) => {
  const result = await pool.query('SELECT * FROM ingredients ORDER BY name');
  res.json(result.rows);
};

exports.addIngredient = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO ingredients (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
