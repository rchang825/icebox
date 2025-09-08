const express = require('express');
const router = express.Router();
const groceryController = require('../controllers/groceryController');

module.exports = (authenticateSession) => {
  router.get('/grocery_items', authenticateSession, groceryController.getGroceryItems);
  router.post('/grocery_items', authenticateSession, groceryController.addGroceryItem);
  router.put('/grocery_items/:id', authenticateSession, groceryController.updateGroceryItem);
  router.delete('/grocery_items/:id', authenticateSession, groceryController.deleteGroceryItem);
  return router;
};
