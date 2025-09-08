import React, { useState } from 'react';

function FridgePrompt({ item, onSave, onCancel }) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [unit, setUnit] = useState(item.unit || 'unit');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, quantity, unit });
  };

  return (
    <div className="grocery-prompt-modal">
      <div className="grocery-prompt-content">
        <h3>Add to Fridge?</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label>
            Quantity:
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
          </label>
          <label>
            Unit:
            <input value={unit} onChange={e => setUnit(e.target.value)} required style={{width:'7em'}} />
          </label>
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel} style={{marginLeft:'1rem'}}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default FridgePrompt;
