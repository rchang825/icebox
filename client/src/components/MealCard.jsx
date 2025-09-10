import React, { useState, useEffect } from 'react';

function MealCard({ meal, sessionId }) {
  // get the associated meal_ingredients for this meal and save to variable
  const [mealIngredients, setMealIngredients] = useState([]);
  useEffect(() => {
    fetch(`/api/meals/${meal.id}/ingredients`, { headers: { 'x-session-id': sessionId } })
      .then(res => res.json())
      .then(data => {
        setMealIngredients(data);
      });
  }, [meal.id, sessionId]);

  return (
    <div className="meal-card">
      <h3>{meal.name}</h3>
      <p>Time: {meal.time}</p>
      <div>
        <strong>Ingredients:</strong>
        <ul>
          {mealIngredients.map((ing, idx) => (
            <li key={idx}>{ing.quantity} {ing.unit}(s) of {ing.alias} ({ing.category})</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Instructions:</strong>
        <ol>
          {meal.instructions.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default MealCard;