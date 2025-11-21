import React, { useEffect, useState } from 'react';
import IngredientDropdown from '../components/IngredientDropdown';
import FridgePrompt from '../components/FridgePrompt';
import GroceryPrompt from '../components/GroceryPrompt';
import GroceryItem from '../components/GroceryItem';
import { addGroceryItem } from '../utils/groceryUtils';
import { addFridgeItem } from '../utils/fridgeUtils';

function GroceryList({ sessionId, registerAddHandler }) {
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState({});
  const [fridgePrompt, setFridgePrompt] = useState(null);
  const [groceryPrompt, setGroceryPrompt] = useState(null);
  const [userName, setUserName] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortByTag, setSortByTag] = useState(false);

  // Fetch user name on mount
  useEffect(() => {
    fetch('/api/me', { headers: { 'x-session-id': sessionId } })
      .then(res => res.json())
      .then(data => setUserName(data.name || ''));
    if (registerAddHandler) {
  registerAddHandler(() => setGroceryPrompt({ alias: '', category: '', quantity: 1, unit: 'unit', tags: [] }));
    }
  }, [registerAddHandler, sessionId]);

  // Delete grocery item and refresh list
  const handleDelete = async (id) => {
    await fetch(`/api/grocery_items/${id}`, {
      method: 'DELETE',
      headers: { 'x-session-id': sessionId }
    });
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

  const handleCheck = async (id) => {
    const item = items.find(it => it.id === id);
    // Toggle checked in backend
    const newChecked = !item.checked;
    // Update backend
    const res = await fetch(`/api/grocery_items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({
        alias: item.alias,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        checked: newChecked,
        tags: item.tags || []
      })
    });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => prev.map(it => it.id === updated.id ? updated : it));
      setChecked(prev => ({ ...prev, [id]: newChecked }));
      if (newChecked && !item.checked) {
        // Only prompt when checking (not unchecking)
        // Check for duplicate fridge item by alias
        const fridgeRes = await fetch(`/api/fridge_items/alias/${encodeURIComponent(item.alias)}`, {
          headers: { 'x-session-id': sessionId }
        });
        if (fridgeRes.ok) {
          setFridgePrompt({
            id,
            alias: item.alias,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            tags: item.tags || [],
            error: 'An item with this name is already in your fridge! Please specify a different name to add a new item'
          });
        } else {
          setFridgePrompt({ id, alias: item.alias, category: item.category, quantity: item.quantity, unit: item.unit, tags: item.tags || [], error: '' });
        }
      }
    }
  };

  const handleFridgeSave = async ({ alias, category, quantity, unit, tags }) => {
    await addFridgeItem({
      alias,
      category,
      quantity,
      unit,
      tags,
      sessionId,
      onSuccess: () => setFridgePrompt(null)
    });
  };

  const handleFridgeCancel = () => {
    setFridgePrompt(null);
  };


  return (
    <div id='grocery-list'>
      <h2>{userName ? `${userName}'s Grocery List` : 'Grocery List'}</h2>
      {items.length === 0 && <div>No grocery items yet!</div>}
      {groceryPrompt && (
        <GroceryPrompt
          item={groceryPrompt}
          sessionId={sessionId}
          onSave={async ({ alias, category, quantity, unit, tags }) => {
            await addGroceryItem({
              alias,
              category,
              quantity,
              unit,
              tags,
              sessionId,
              onSuccess: () => {
                setGroceryPrompt(null);
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
              }
            });
          }}
          onCancel={() => setGroceryPrompt(null)}
        />
      )}
      {fridgePrompt && (
        <FridgePrompt
          item={fridgePrompt}
          onSave={handleFridgeSave}
          onCancel={handleFridgeCancel}
          sessionId={sessionId}
          error={fridgePrompt.error}
        />
      )}
      <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Filter by tag (single)"
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
        />
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items
          .filter(item => {
            if (!tagFilter.trim()) return true;
            return (item.tags || []).some(t => t.toLowerCase() === tagFilter.trim().toLowerCase());
          })
          .sort((a, b) => {
            if (!sortByTag) return 0;
            const at = (a.tags && a.tags[0]) ? a.tags[0].toLowerCase() : '';
            const bt = (b.tags && b.tags[0]) ? b.tags[0].toLowerCase() : '';
            if (at < bt) return -1;
            if (at > bt) return 1;
            return 0;
          })
          .map(item => (
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
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}

export default GroceryList;
