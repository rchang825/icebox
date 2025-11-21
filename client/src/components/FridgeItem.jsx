import React, { useState } from 'react';

function FridgeItem({ item, setItems, updateItem, deleteItem, setGroceryPrompt }) {
  const [edit, setEdit] = useState(false);
  const [alias, setAlias] = useState(item.alias);
  const [category, setCategory] = useState(item.category);
  const [unit, setUnit] = useState(item.unit);
  // Quantity is always editable, so keep it in sync with parent
  const [quantity, setQuantity] = useState(item.quantity);
  const [tagsInput, setTagsInput] = useState(Array.isArray(item.tags) ? item.tags.join(', ') : '');

  // Keep quantity in sync with parent updates
  React.useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const handleSave = () => {
    setEdit(false);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    updateItem(item.id, alias, category, quantity, unit, tags);
  };
  const handleCancel = () => {
    setEdit(false);
    setAlias(item.alias);
    setCategory(item.category);
    setUnit(item.unit);
  };

  return (
    <tr key={item.id}>
      <td>
        {edit ? (
          <input value={alias} onChange={e => setAlias(e.target.value)} />
        ) : (
          <span>{item.alias}</span>
        )}
      </td>
      <td>
        {edit ? (
          <input value={category} onChange={e => setCategory(e.target.value)} />
        ) : (
          <span>{item.category}</span>
        )}
      </td>
      <td>
        {edit ? (
          <input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="tag1, tag2"
          />
        ) : (
          <div className="tags-cell">
            {(item.tags || []).map((t, i) => (
              <span key={i} className="tag-badge">{t}</span>
            ))}
            {(!item.tags || item.tags.length === 0) && <span className="tag-empty">No tags</span>}
          </div>
        )}
      </td>
  <td className="nowrap">
        <input
          type="number"
          min="0"
          value={quantity}
          onChange={e => {
            const newQty = Number(e.target.value);
            setQuantity(newQty);
            if (newQty === 0) {
              setGroceryPrompt({ id: item.id, alias: alias, category: category, quantity: 1, unit: unit });
            }
          }}
          className="input-qty"
        />
        {edit ? (
          <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="input-unit" />
        ) : (
          <span className="unit-label">{item.unit}(s)</span>
        )}
      </td>
      <td>{new Date(item.date_created).toLocaleString()}</td>
      <td>{new Date(item.date_updated).toLocaleString()}</td>
      <td>
        <div className='actions'>
          {edit ? (
            <>
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEdit(true)}>Edit</button>
              <button onClick={() => updateItem(item.id, alias, category, quantity, unit)}>Save</button>
              <button onClick={() => deleteItem(item.id)} className='btn-delete'>Finish</button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
export default FridgeItem;
