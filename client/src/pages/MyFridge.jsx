import React, { useEffect, useState } from 'react';
import GroceryPrompt from '../components/GroceryPrompt';
import FridgeItem from '../components/FridgeItem';

function MyFridge({ sessionId, showAddForm, setShowAddForm }) {
  const [items, setItems] = useState([]);
  const [groceryPrompt, setGroceryPrompt] = useState(null); // {name, quantity}
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('unit(s)');
  const [error, setError] = useState('');

  const fetchItems = () => {
    fetch('/api/my_fridge_items', {
      headers: { 'x-session-id': sessionId }
    })
      .then(res => res.json())
      .then(setItems);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/fridge_items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ name, quantity, unit })
    });
    if (res.ok) {
      setName('');
      setQuantity(1);
      setUnit('unit(s)');
      fetchItems();
      setShowAddForm(false);
    } else {
      const data = await res.json();
      setError(data.error || 'Add failed');
    }
  };

  const updateItem = async (id, name, quantity, unit) => {
    if (quantity === 0) {
      setGroceryPrompt({ id, name, quantity: 1, unit });
      return;
    }
    const res = await fetch(`/api/fridge_items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ name, quantity, unit })
    });
    if (res.ok) fetchItems();
  };

  const deleteItem = async (id) => {
    const item = items.find(it => it.id === id);
    setGroceryPrompt({ id, name: item.name, quantity: item.quantity, unit: item.unit });
  };

  const handleGrocerySave = async ({ name, quantity, unit }) => {
    // Save to grocery_items
    await fetch('/api/grocery_items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ name, quantity, unit })
    });
    // If this was a delete, delete the fridge item
    if (groceryPrompt && groceryPrompt.id) {
      await fetch(`/api/fridge_items/${groceryPrompt.id}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId }
      });
    } else if (groceryPrompt && groceryPrompt.id === undefined) {
      // If this was a quantity 0 update, set fridge item quantity to 0
      // (already handled by not updating, or you can remove the item)
    }
    setGroceryPrompt(null);
    fetchItems();
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
    fetchItems();
  };

  return (
    <div id='my-fridge'>
      <h2>My Fridge</h2>
      {showAddForm && (
        <form onSubmit={addItem} style={{ marginBottom: '2rem' }}>
          <input type="text" placeholder="Item name" value={name} onChange={e => setName(e.target.value)} required />
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
          <input type="text" placeholder="Unit" value={unit} onChange={e => setUnit(e.target.value)} required style={{width:'7em'}} />
          <button type="submit">Add Item</button>
          <button type="button" onClick={() => setShowAddForm(false)} style={{marginLeft:'1rem'}}>Cancel</button>
          {error && <span style={{color:'red', marginLeft:'1rem'}}>{error}</span>}
        </form>
      )}
      {groceryPrompt && (
        <GroceryPrompt
          item={groceryPrompt}
          onSave={handleGrocerySave}
          onCancel={handleGroceryCancel}
        />
      )}
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Date Created</th>
            <th>Date Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <FridgeItem
              key={item.id}
              item={item}
              setItems={setItems}
              updateItem={updateItem}
              deleteItem={deleteItem}
              setGroceryPrompt={setGroceryPrompt}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyFridge;
