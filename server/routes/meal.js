const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

module.exports = (authenticateSession) => {
  router.get('/meals', authenticateSession, mealController.getMeals);
  router.get('/meals/:id', authenticateSession, mealController.getMealById);
  router.get('/meals/:id/ingredients', authenticateSession, mealController.getMealIngredients);
  router.post('/meals', authenticateSession, mealController.addMeal);
  // router.put('/meals/:id', authenticateSession, mealController.updateMeal);
  router.delete('/meals/:id', authenticateSession, mealController.deleteMeal);
  return router;
};
