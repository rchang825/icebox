const express = require('express');
const router = express.Router();
const fridgeController = require('../controllers/fridgeController');

module.exports = (authenticateSession) => {
  router.get('/fridge_items', authenticateSession, fridgeController.getFridgeItems);
  router.post('/fridge_items', authenticateSession, fridgeController.addFridgeItem);
  router.put('/fridge_items/:id', authenticateSession, fridgeController.updateFridgeItem);
  router.delete('/fridge_items/:id', authenticateSession, fridgeController.deleteFridgeItem);
  return router;
};
