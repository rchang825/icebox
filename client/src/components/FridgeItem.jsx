import react from 'react';
import { useState } from 'react';

function FridgeItem({ item, setItems, updateItem, deleteItem, setGroceryPrompt }) {

  return (
    <tr key={item.id}>
      <td>
        <input value={item.name} onChange={e => {
          const newName = e.target.value;
          setItems(items.map(it => it.id === item.id ? { ...it, name: newName } : it));
        }} />
      </td>
      <td style={{whiteSpace:'nowrap'}}>
        <input type="number" min="0" value={item.quantity} onChange={e => {
          const newQty = Number(e.target.value);
          if (newQty === 0) {
            setGroceryPrompt({ id: item.id, name: item.name, quantity: 1, unit: item.unit });
          } else {
            setItems(items.map(it => it.id === item.id ? { ...it, quantity: newQty } : it));
          }
        }} style={{width:'4em'}} />
        <input type="text" value={item.unit} onChange={e => {
          const newUnit = e.target.value;
          setItems(items.map(it => it.id === item.id ? { ...it, unit: newUnit } : it));
        }} style={{width:'6em', marginLeft:'0.5em'}} />
      </td>
      <td>{new Date(item.date_created).toLocaleString()}</td>
      <td>{new Date(item.date_updated).toLocaleString()}</td>
      <td >
        <div className='actions'>
          <button onClick={() => updateItem(item.id, item.name, item.quantity, item.unit)}>Update</button>
          <button onClick={() => deleteItem(item.id)}>Delete</button>
        </div>
      </td>
    </tr>
  );
}
export default FridgeItem;
