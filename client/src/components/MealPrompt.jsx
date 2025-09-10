import React, { useState } from 'react';

import IngredientDropdown from '../components/IngredientDropdown';

const MealPrompt = ({ onSubmit, onCancel }) => {
  const [mealName, setMealName] = useState('');
  const [mealHours, setMealHours] = useState('');
  const [mealMinutes, setMealMinutes] = useState('');
  const [servings, setServings] = useState(1);
  const [instructionInput, setInstructionInput] = useState('');
  const [instructions, setInstructions] = useState([]);
  const [ingredientAlias, setIngredientAlias] = useState('');
  const [ingredientCategory, setIngredientCategory] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('unit');
  const [ingredients, setIngredients] = useState([]);

  const handleAddIngredient = () => {
    if (!ingredientAlias || !ingredientCategory || !ingredientQuantity) return;
    setIngredients([
      ...ingredients,
      { alias: ingredientAlias, category: ingredientCategory, quantity: ingredientQuantity, unit: ingredientUnit },
    ]);
    setIngredientCategory('');
    setIngredientQuantity('');
    setIngredientUnit('unit');
    setIngredientAlias('');
  };

  const handleRemoveIngredient = (idx) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleAddInstruction = () => {
    if (!instructionInput.trim()) return;
    setInstructions([...instructions, instructionInput.trim()]);
    setInstructionInput('');
  };

  const handleRemoveInstruction = (idx) => {
    setInstructions(instructions.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Require at least minutes to be filled
    if (!mealName || (!mealHours && !mealMinutes) || instructions.length === 0 || ingredients.length === 0) return;
    // Compose time string, e.g. '1h 30min' or '45min'
    let mealTime = '';
    if (mealHours && parseInt(mealHours) > 0) {
      mealTime += `${parseInt(mealHours)}h`;
    }
    if (mealMinutes && parseInt(mealMinutes) > 0) {
      mealTime += (mealTime ? ' ' : '') + `${parseInt(mealMinutes)}min`;
    }
    onSubmit({ name: mealName, time: mealTime, servings, instructions, ingredients });
    setMealName('');
    setMealHours('');
    setMealMinutes('');
    setServings(1);
    setInstructions([]);
    setInstructionInput('');
    setIngredients([]);
    // reset input boxes/dropdowns
    setIngredientCategory('');
    setIngredientQuantity('');
    setIngredientUnit('unit');
    setIngredientAlias('');
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="meal-prompt">
        <div>
          <label>Meal Name:</label>
          <input value={mealName} onChange={e => setMealName(e.target.value)} required />
        </div>
        <div>
          <label>Time:</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              min="0"
              placeholder="(optional)"
              value={mealHours}
              onChange={e => setMealHours(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ width: '100px' }}
            />
            <span>h</span>
            <input
              type="number"
              min="0"
              max="59"
              value={mealMinutes}
              onChange={e => setMealMinutes(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ width: '100px' }}
              required
            />
            <span>min</span>
          </div>
        </div>
        <div>
          <label>Servings:</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              placeholder="Servings"
              value={servings}
              onChange={e => setServings(parseInt(e.target.value) || 1)}
              style={{ width: '100px' }}
              required
            />
            <span>serving(s)</span>
          </div>
        </div>
        <div>
          <label>Add Ingredient:</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Ingredient Name"
              value={ingredientAlias}
              onChange={e => setIngredientAlias(e.target.value)}
              style={{ width: '150px' }}
            />
            <IngredientDropdown value={ingredientCategory} onChange={setIngredientCategory} />
            <input
              type="number"
              min="0"
              placeholder="Quantity"
              value={ingredientQuantity}
              onChange={e => setIngredientQuantity(e.target.value)}
              style={{ width: '80px' }}
            />
            <input
              type="text"
              placeholder="unit"
              value={ingredientUnit}
              onChange={e => setIngredientUnit(e.target.value === '' ? 'unit' : e.target.value)}
              style={{ width: '100px' }}
            />
            <button type="button" onClick={handleAddIngredient}>Add</button>
          </div>
          <ul>
            {ingredients.map((ing, idx) => (
              <li key={idx}>
                {ing.alias} - {ing.quantity} {ing.unit}(s)
                <button type="button" className='btn-delete'onClick={() => handleRemoveIngredient(idx)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <label>Add Instruction:</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <textarea
              value={instructionInput}
              onChange={e => setInstructionInput(e.target.value)}
              style={{ flex: 1, minHeight: '2.5em', resize: 'vertical' }}
            />
            <button type="button" onClick={handleAddInstruction}>Add</button>
          </div>
          <ol>
            {instructions.map((inst, idx) => (
              <li key={idx}>
                {inst}
                <button type="button" className='btn-delete' onClick={() => handleRemoveInstruction(idx)} style={{ marginLeft: '0.5rem' }}>Remove</button>
              </li>
            ))}
          </ol>
        </div>
        <button type="submit" style={{ maxWidth: 'max-content' }}>Save Meal</button>
        {onCancel && (
          <button type="button" style={{ maxWidth: 'max-content' }} onClick={onCancel}>Cancel</button>
        )}
      </form>
    </div>

  );
};

export default MealPrompt;
