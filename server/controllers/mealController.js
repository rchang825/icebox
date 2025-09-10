const pool = require('../db');

// Get all meals for the logged-in user
exports.getMeals = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM meals WHERE user_id = $1 ORDER BY id',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single meal by id for the logged-in user
exports.getMealById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM meals WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (!result.rows.length) return res.sendStatus(404);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMealIngredients = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM meal_ingredients WHERE meal_id = $1',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMeal = async (req, res) => {
  const { name, time, servings, instructions, ingredients } = req.body;
  if (!name || !time || !servings || !Array.isArray(instructions) || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Missing required fields or invalid types' });
  }
  try {
    const meal_id = await pool.query(
      'INSERT INTO meals (name, time, servings, instructions, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, time, servings, instructions, req.user.id]
    );
    ingredients.forEach(async ingredient => {
      await pool.query(
        'INSERT INTO meal_ingredients (meal_id, alias, category, quantity, unit) VALUES ($1, $2, $3, $4, $5)',
        [meal_id.rows[0].id, ingredient.alias, ingredient.category, ingredient.quantity, ingredient.unit]
      );
    });
    res.json({ id: meal_id.rows[0].id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMeal = async (req, res) => {
  const { id } = req.params;
  const check = await pool.query('SELECT * FROM meals WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  if (!check.rows.length) return res.sendStatus(403);
  await pool.query('DELETE FROM meals WHERE id = $1', [id]);
  res.json({ success: true });
};
