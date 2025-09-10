const pool = require('../db');
exports.getMeals = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM meals WHERE user_id = $1 ORDER BY id',
    [req.user.id]
  );
  res.json(result.rows);
};

exports.addMeal = async (req, res) => {
  const { name, time, instructions, ingredients } = req.body;
  if (!name || !time || !instructions || !ingredients) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const meal_id = await pool.query(
      'INSERT INTO meals (name, time, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, time, instructions, req.user.id]
    );
    ingredients.forEach(async ingredient => {
      await pool.query(
        'INSERT INTO meal_ingredients (meal_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4)',
        [meal_id.rows[0].id, ingredient.name, ingredient.quantity, ingredient.unit]
      );
    }
    res.json({ id: meal_id.rows[0].id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateMeal = async (req, res) => {
  const { id } = req.params;
  const { name, time, instructions, ingredients } = req.body;
  try {
    // update ingredients
    const existingIngredients = await pool.query('SELECT * FROM meal_ingredients WHERE meal_id = $1', [id]);
    ingredients.forEach(async ingredient => {
      const existing = existingIngredients.rows.find(existing => existing.ingredient_name === ingredient.ingredient_name);
      if (existing) {
        await pool.query(
          'UPDATE meal_ingredients SET quantity = $1, unit = $2 WHERE id = $3',
          [ingredient.quantity, ingredient.unit, existing.id]
        );
      } else {
        await pool.query(
          'INSERT INTO meal_ingredients (meal_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4)',
          [id, ingredient.ingredient_name, ingredient.quantity, ingredient.unit]
        );
      }
    });
  // delete any ingredients that are no longer in the meal
  existingIngredients.rows.forEach(async existing => {
    const stillExists = meal_ingredients.find(ingredient => ingredient.ingredient_name === existing.ingredient_name);
    if (!stillExists) {
      await pool.query('DELETE FROM meal_ingredients WHERE id = $1', [existing.id]);
    }
  });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  try {
    const result = await pool.query(
      'UPDATE meals SET name = $1, time = $2, instructions = $3 WHERE id = $4 RETURNING *',
      [name, time, instructions, id]
    );
    res.json(result.rows[0]);
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
