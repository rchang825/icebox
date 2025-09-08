import React, { useState } from 'react';

function GroceryItem({ item, checked, handleCheck, sessionId, onItemUpdated }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit || 'unit(s)');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/grocery_items/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ name, quantity, unit })
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
          <input value={name} onChange={e => setName(e.target.value)} style={{width:'7em', marginRight:'0.5em'}} />
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} style={{width:'4em', marginRight:'0.5em'}} />
          <input value={unit} onChange={e => setUnit(e.target.value)} style={{width:'6em', marginRight:'0.5em'}} />
          <button onClick={handleSave} disabled={saving} style={{marginRight:'0.5em'}}>Save</button>
          <button onClick={() => setEdit(false)} disabled={saving}>Cancel</button>
        </>
      ) : (
        <span style={{ textDecoration: checked ? 'line-through' : 'none', flex: 1 }}>
          {item.name} x{item.quantity} {item.unit}
          <button onClick={() => setEdit(true)} style={{marginLeft:'1em'}}>Edit</button>
        </span>
      )}
    </li>
  );
}

export default GroceryItem;