import React, { useEffect, useState } from 'react';
import IngredientDropdown from '../components/IngredientDropdown';
import GroceryPrompt from '../components/GroceryPrompt';
import FridgePrompt from '../components/FridgePrompt';
import FridgeItem from '../components/FridgeItem';
import { addGroceryItem } from '../utils/groceryUtils';
import { addFridgeItem } from '../utils/fridgeUtils';

function MyFridge({ sessionId, registerAddHandler }) {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [groceryPrompt, setGroceryPrompt] = useState(null); // {name, quantity}
  const [alias, setAlias] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unit');
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const getFridgeItems = () => {
    fetch('/api/my_fridge_items', {
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
    // eslint-disable-next-line
  }, [registerAddHandler]);

  const handleFridgeSave = async ({ alias, category, quantity, unit }) => {
    setError('');
    await addFridgeItem({
      alias,
      category,
      quantity,
      unit,
      sessionId,
      onSuccess: () => {
        setAlias('');
        setCategory('');
        setQuantity(1);
        setUnit('unit');
        getFridgeItems();
        setShowAddForm(false);
      }
    });
  };

  const updateFridgeItem = async (id, alias, category, quantity, unit) => {
    const res = await fetch(`/api/fridge_items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ alias, category, quantity, unit })
    });
    if (res.ok) getFridgeItems();
  };

  const deleteFridgeItem = async (id) => {
    const item = fridgeItems.find(it => it.id === id);
    setGroceryPrompt({ id, alias: item.alias, category: item.category, quantity: item.quantity, unit: item.unit });
  };

  const handleGrocerySave = async ({ alias, category, quantity, unit }) => {
    if (!alias || !category || !quantity || !unit) {
      setGroceryPrompt(null);
      return;
    }
  await addGroceryItem({
      alias,
      category,
      quantity,
      unit,
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
          item={{ alias, category, quantity, unit }}
          sessionId={sessionId}
          onSave={handleFridgeSave}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      {groceryPrompt && (
        <GroceryPrompt
          item={groceryPrompt}
          onSave={handleGrocerySave}
          onCancel={handleGroceryCancel}
        />
      )}
      {fridgeItems.length === 0 && <div>No fridge items yet!</div>}
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Date Created</th>
            <th>Date Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fridgeItems.map(item => (
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

export default MyFridge;
