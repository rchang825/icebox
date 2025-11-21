import React, { useEffect, useState } from 'react';
import IngredientDropdown from '../components/IngredientDropdown';
import GroceryPrompt from '../components/GroceryPrompt';
import FridgePrompt from '../components/FridgePrompt';
import FridgeItem from '../components/FridgeItem';
import { addGroceryItem } from '../utils/groceryUtils';
import { addFridgeItem } from '../utils/fridgeUtils';

function Fridge({ sessionId, registerAddHandler }) {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [groceryPrompt, setGroceryPrompt] = useState(null);
  const [alias, setAlias] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unit');
  const [tagsInput, setTagsInput] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortByTag, setSortByTag] = useState(false);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const getFridgeItems = () => {
    fetch('/api/fridge_items', {
      headers: { 'x-session-id': sessionId }
    })
      .then(res => res.json())
      .then(setFridgeItems);
  };

  useEffect(() => {
    getFridgeItems();
    fetch('/api/me', { headers: { 'x-session-id': sessionId } })
      .then(res => res.json())
      .then(data => setUserName(data.name || ''));
    if (registerAddHandler) {
      registerAddHandler(() => setShowAddForm(true));
    }
  }, [registerAddHandler, sessionId]);

  const handleFridgeSave = async ({ alias, category, quantity, unit, tags }) => {
    setError('');
    // Use new API to check for duplicate fridge item by alias
    const res = await fetch(`/api/fridge_items/alias/${encodeURIComponent(alias)}`, {
      headers: { 'x-session-id': sessionId }
    });
    if (res.ok) {
      setError('An item with this name is already in your fridge! Please specify a different name to add a new item');
      return;
    }
    await addFridgeItem({
      alias,
      category,
      quantity,
      unit,
      tags,
      sessionId,
      onSuccess: () => {
        setAlias('');
        setCategory('');
        setQuantity(1);
        setUnit('unit');
        setTagsInput('');
        getFridgeItems();
        setShowAddForm(false);
      }
    });
  };

  const updateFridgeItem = async (id, alias, category, quantity, unit, tags) => {
    const res = await fetch(`/api/fridge_items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ alias, category, quantity, unit, tags })
    });
    if (res.ok) getFridgeItems();
  };



  const deleteFridgeItem = async (id) => {
    const item = fridgeItems.find(it => it.id === id);
    // Use new API to check for duplicate alias
    const res = await fetch(`/api/grocery_items/alias/${encodeURIComponent(item.alias)}`, {
      headers: { 'x-session-id': sessionId }
    });
    if (res.ok) {
      setGroceryPrompt({
        id,
        alias: item.alias,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        tags: item.tags || [],
        error: 'An item with this name is already in your grocery list! Please specify a different name to add a new item'
      });
    } else {
      setGroceryPrompt({ id, alias: item.alias, category: item.category, quantity: item.quantity, unit: item.unit, tags: item.tags || [], error: '' });
    }
  };

  const handleGrocerySave = async ({ alias, category, quantity, unit, tags }) => {
    if (!alias || !category || !quantity || !unit) {
      setGroceryPrompt(null);
      return;
    }
    const res = await fetch(`/api/grocery_items/alias/${encodeURIComponent(alias)}`, {
      headers: { 'x-session-id': sessionId }
    });
    if (res.ok) {
      setGroceryPrompt(prev => ({ ...prev, alias, category, quantity, unit, error: 'An item with this name is already in your grocery list! Please specify a different name to add a new item' }));
      return;
    }
    await addGroceryItem({
      alias,
      category,
      quantity,
      unit,
      tags,
      sessionId,
      onSuccess: async () => {
        // If this was a delete, delete the fridge item
        if (groceryPrompt && groceryPrompt.id) {
          await fetch(`/api/fridge_items/${groceryPrompt.id}`, {
            method: 'DELETE',
            headers: { 'x-session-id': sessionId }
          });
        }
        setGroceryPrompt(null);
        getFridgeItems();
      }
    });
  };

  const handleGroceryCancel = async () => {
    // If this was a delete, actually delete the fridge item
    if (groceryPrompt && groceryPrompt.id) {
      await fetch(`/api/fridge_items/${groceryPrompt.id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId }
      });
    }
    setGroceryPrompt(null);
    getFridgeItems();
  };

  return (
    <div id='my-fridge'>
      <h2>{userName ? `${userName}'s Fridge` : 'My Fridge'}</h2>
      {showAddForm && (
        <FridgePrompt
          item={{ alias, category, quantity, unit, tags: [] }}
          sessionId={sessionId}
          onSave={handleFridgeSave}
          onCancel={() => setShowAddForm(false)}
          error={error}
        />
      )}
      {groceryPrompt && (
        <GroceryPrompt
          item={groceryPrompt}
          onSave={handleGrocerySave}
          onCancel={handleGroceryCancel}
          sessionId={sessionId}
        />
      )}
      {fridgeItems.length === 0 && <div>No fridge items yet!</div>}
      <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Filter by tag (single)"
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
        />
      </div>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Tags</th>
            <th>Quantity</th>
            <th>Date Created</th>
            <th>Date Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fridgeItems
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
            <FridgeItem
              key={item.id}
              item={item}
              setItems={setFridgeItems}
              updateItem={updateFridgeItem}
              deleteItem={deleteFridgeItem}
              setGroceryPrompt={setGroceryPrompt}
              items={fridgeItems}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Fridge;
