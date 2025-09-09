import React, { useState } from 'react';
import IngredientDropdown from './IngredientDropdown';

function FridgePrompt({ item, onSave, onCancel, sessionId }) {
  const [alias, setAlias] = useState(item.alias || '');
  const [category, setCategory] = useState(item.category || '');
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [unit, setUnit] = useState(item.unit || 'unit');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ alias, category, quantity, unit });
  };

  return (
    <div className="prompt-modal">
      <div className="prompt-content">
        <h3>Add to Fridge?</h3>
  <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input value={alias} onChange={e => setAlias(e.target.value)} required />
          </label>
          <label>
            Category:
            <IngredientDropdown value={category} onChange={setCategory} sessionId={sessionId} />
          </label>
          <label>
            Quantity:
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
          </label>
          <label>
            Unit:
            <input value={unit} onChange={e => setUnit(e.target.value)} required className="input-unit-wide" />
          </label>
          <button type="submit">Add to Fridge</button>
          <button type="button" onClick={onCancel} className="btn-cancel">Don't Add to Fridge</button>
        </form>
      </div>
    </div>
  );
}

export default FridgePrompt;
