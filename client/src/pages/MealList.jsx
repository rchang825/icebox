import React, { useState, useEffect } from 'react';
import MealPrompt from '../components/MealPrompt';
import MealCard from '../components/MealCard';
import { sortMealsByCategoryMatch, getMealIngredientMatchCounts } from '../utils/mealUtils';

function MealList({ sessionId, registerAddHandler }) {
  const [mealPrompt, setMealPrompt] = useState(false);
  const [meals, setMeals] = useState([]);
  const [fridgeItems, setFridgeItems] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);

  useEffect(() => {
    if (registerAddHandler) {
      registerAddHandler(() => setMealPrompt(true));
    }
  }, [registerAddHandler]);

  useEffect(() => {
    fetch('/api/meals', { headers: { 'x-session-id': sessionId } })
      .then(res => res.json())
      .then(data => {
        setMeals(data);
      });
    fetch('/api/fridge_items', { headers: { 'x-session-id': sessionId } })
      .then(res => res.json())
      .then(data => setFridgeItems(Array.isArray(data) ? data : []));
    fetch('/api/grocery_items', { headers: { 'x-session-id': sessionId } })
      .then(res => res.json())
      .then(data => setGroceryItems(Array.isArray(data) ? data : []));
  }, [sessionId, meals.length]);

  const handleMealSubmit = (mealData) => {
    fetch('/api/meals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify(mealData)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to save meal');
        }
        return res.json();
      })
      .then(newMeal => {
        setMeals(prevMeals => [...prevMeals, newMeal]);
      })
      .catch(err => {
        console.error(err);
        alert('Error saving meal. Please try again.');
      });
    // if successfully saved, close the prompt
    setMealPrompt(false);
  };

  const handleCancel = () => {
    setMealPrompt(false);
  };

  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Sort meals by fridge/grocery match ratios
  const sortedMeals = sortMealsByCategoryMatch(meals, fridgeItems, groceryItems);

  return (
    <div id="meal-planner">
      <h2>Meal Planner</h2>
      {mealPrompt && (
        <MealPrompt onSubmit={handleMealSubmit} onCancel={handleCancel} />
      )}
      {meals.length === 0 && <div>No meals yet!</div>}
      <ul style={{ listStyleType: 'none', padding: '1em' }}>
        {sortedMeals.map((meal, index) => {
          const [inFridge, inGrocery, stillNeeded] = getMealIngredientMatchCounts(meal, fridgeItems, groceryItems);
          return (
            <li key={index}>
              <h3
                style={{ cursor: 'pointer', fontWeight: 'bold', margin: '8px 0' }}
                onClick={() => handleToggle(index)}
              >
                {meal.name}
              </h3>
              <div style={{ fontSize: '0.95em', color: '#555', marginBottom: 4 }}>
                {inFridge} ingredient{inFridge !== 1 ? 's' : ''} already in fridge, {inGrocery} ingredient{inGrocery !== 1 ? 's' : ''} on grocery list, {stillNeeded} ingredient{stillNeeded !== 1 ? 's' : ''} still needed
              </div>
              {expandedIndex === index && (
                <MealCard meal={meal} sessionId={sessionId} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MealList;