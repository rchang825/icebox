import React, { useState } from 'react';
import IngredientDropdown from './IngredientDropdown';

function GroceryItem({ item, checked, handleCheck, sessionId, onItemUpdated }) {
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
    // 3. Update grocery item with category only
    const res = await fetch(`/api/grocery_items/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ alias, category: ingredient.name, quantity, unit })
    });
    const updated = await res.json();
    setSaving(false);
    setEdit(false);
    if (onItemUpdated) onItemUpdated(updated);
  };

  return (
    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => handleCheck(item.id)}
        style={{ marginRight: '1rem' }}
      />
      {edit ? (
        <>
          <input value={alias} onChange={e => setAlias(e.target.value)} style={{width:'7em', marginRight:'0.5em'}} />
          <IngredientDropdown value={category} onChange={setCategory} sessionId={sessionId} />
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} style={{width:'4em', marginRight:'0.5em'}} />
          <input value={unit} onChange={e => setUnit(e.target.value)} style={{width:'6em', marginRight:'0.5em'}} />
          <button onClick={handleSave} disabled={saving} style={{marginRight:'0.5em'}}>Save</button>
          <button onClick={() => setEdit(false)} disabled={saving}>Cancel</button>
        </>
      ) : (
        <span style={{ textDecoration: checked ? 'line-through' : 'none', flex: 1 }}>
          {item.alias} ({item.category}) x{item.quantity} {item.unit}
          <button onClick={() => setEdit(true)} style={{marginLeft:'1em'}}>Edit</button>
        </span>
      )}
    </li>
  );
}

export default GroceryItem;