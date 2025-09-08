import React, { useEffect, useState } from 'react';
import FridgePrompt from '../components/FridgePrompt';
import GroceryItem from '../components/GroceryItem';

function GroceryList({ sessionId }) {
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState({});
  const [fridgePrompt, setFridgePrompt] = useState(null); // {name, quantity, unit}

  useEffect(() => {
    fetch('/api/grocery_items', {
      headers: { 'x-session-id': sessionId }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
        setChecked({});
      });
  }, [sessionId]);

  const handleCheck = (id) => {
    const item = items.find(it => it.id === id);
    if (!checked[id]) {
      // Only prompt when checking (not unchecking)
      setFridgePrompt({ id, name: item.name, quantity: item.quantity, unit: item.unit });
    }
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFridgeSave = async ({ name, quantity, unit }) => {
    // Add to fridge_items
    await fetch('/api/fridge_items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ name, quantity, unit })
    });
    // Optionally, remove from grocery_items
    if (fridgePrompt && fridgePrompt.id) {
      await fetch(`/api/grocery_items/${fridgePrompt.id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId }
      });
    }
    setFridgePrompt(null);
    // Refresh list
    fetch('/api/grocery_items', {
      headers: { 'x-session-id': sessionId }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
        setChecked({});
      });
  };

  const handleFridgeCancel = () => {
    setFridgePrompt(null);
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', background: '#fff', padding: '2rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h2>Grocery List</h2>
      {items.length === 0 && <div>No grocery items yet!</div>}
      {fridgePrompt && (
        <FridgePrompt
          item={fridgePrompt}
          onSave={handleFridgeSave}
          onCancel={handleFridgeCancel}
        />
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <GroceryItem
            key={item.id}
            item={item}
            checked={!!checked[item.id]}
            handleCheck={handleCheck}
            sessionId={sessionId}
            onItemUpdated={updated => {
              if (!updated || !updated.id) return;
              setItems(prev => prev.map(it => it.id === updated.id ? updated : it));
            }}
          />
        ))}
      </ul>
    </div>
  );
}

export default GroceryList;
