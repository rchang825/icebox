import React, { useEffect, useState } from 'react';

function MyFridge({ sessionId, showAddForm, setShowAddForm }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
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
      body: JSON.stringify({ name, quantity })
    });
    if (res.ok) {
      setName('');
      setQuantity(1);
      fetchItems();
      setShowAddForm(false);
    } else {
      const data = await res.json();
      setError(data.error || 'Add failed');
    }
  };

  const updateItem = async (id, name, quantity) => {
    const res = await fetch(`/api/fridge_items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ name, quantity })
    });
    if (res.ok) fetchItems();
  };

  const deleteItem = async (id) => {
    const res = await fetch(`/api/fridge_items/${id}`, {
      method: 'DELETE',
      headers: { 'x-session-id': sessionId }
    });
    if (res.ok) fetchItems();
  };

  return (
    <div id='my-fridge'>
      <h2>My Fridge</h2>
      {showAddForm && (
        <form onSubmit={addItem} style={{ marginBottom: '2rem' }}>
          <input type="text" placeholder="Item name" value={name} onChange={e => setName(e.target.value)} required />
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
          <button type="submit">Add Item</button>
          <button type="button" onClick={() => setShowAddForm(false)} style={{marginLeft:'1rem'}}>Cancel</button>
          {error && <span style={{color:'red', marginLeft:'1rem'}}>{error}</span>}
        </form>
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
            <tr key={item.id}>
              <td>
                <input value={item.name} onChange={e => {
                  const newName = e.target.value;
                  setItems(items.map(it => it.id === item.id ? { ...it, name: newName } : it));
                }} />
              </td>
              <td>
                <input type="number" min="1" value={item.quantity} onChange={e => {
                  const newQty = Number(e.target.value);
                  setItems(items.map(it => it.id === item.id ? { ...it, quantity: newQty } : it));
                }} />
              </td>
              <td>{new Date(item.date_created).toLocaleString()}</td>
              <td>{new Date(item.date_updated).toLocaleString()}</td>
              <td >
                <div className='actions'>
                  <button onClick={() => updateItem(item.id, item.name, item.quantity)}>Update</button>
                  <button onClick={() => deleteItem(item.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyFridge;
