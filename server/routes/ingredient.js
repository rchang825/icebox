const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');

module.exports = (authenticateSession) => {
  router.get('/ingredients', ingredientController.getIngredients);
  router.post('/ingredients', authenticateSession, ingredientController.addIngredient);
  return router;
};
