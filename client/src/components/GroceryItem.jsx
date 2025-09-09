import React, { useState } from 'react';
import IngredientDropdown from './IngredientDropdown';

function GroceryItem({ item, checked, handleCheck, sessionId, onItemUpdated }) {
  // Add delete button handler
  const [edit, setEdit] = useState(false);
  const [alias, setAlias] = useState(item.alias);
  const [category, setCategory] = useState(item.category);
  const [quantity, setQuantity] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit || 'unit(s)');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // 1. Check if ingredient exists
    const ingRes = await fetch('/api/ingredients', { headers: { 'x-session-id': sessionId } });
    const ingredients = await ingRes.json();
    let ingredient = ingredients.find(ing => ing.name.toLowerCase() === category.trim().toLowerCase());
    if (!ingredient) {
      // 2. Create ingredient
      const createRes = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({ name: category.trim() })
      });
      if (!createRes.ok) {
        setSaving(false);
        return;
      }
      ingredient = await createRes.json();
    }
    // 3. Update grocery item with category only, include checked
    const res = await fetch(`/api/grocery_items/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ alias, category: ingredient.name, quantity, unit, checked: item.checked })
    });
    const updated = await res.json();
    setSaving(false);
    setEdit(false);
    if (onItemUpdated) onItemUpdated(updated);
  };

  return (
  <li className="grocery-item">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => handleCheck(item.id)}
        className="checkbox"
      />
      {edit ? (
        <>
          <input value={alias} onChange={e => setAlias(e.target.value)} className="input-alias" />
          <IngredientDropdown value={category} onChange={setCategory} sessionId={sessionId} />
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="input-qty input-margin" />
          <input value={unit} onChange={e => setUnit(e.target.value)} className="input-unit input-margin" />
          <button onClick={handleSave} disabled={saving} className="btn-margin">Save</button>
          <button onClick={() => setEdit(false)} disabled={saving}>Cancel</button>
        </>
      ) : (
        <span className='grocery-item-label flex-space-between'>
          <div className={item.checked ? 'checked' : ''}>
            {item.alias} ({item.category}) x{item.quantity} {item.unit}(s)
          </div>
          <div className="actions">
            <button onClick={() => setEdit(true)} className="btn-margin">Edit</button>
            <button onClick={() => onDelete(item.id)} className="btn-margin btn-delete">Delete</button>
          </div>
        </span>
      )}
    </li>
  );
}

export default GroceryItem;