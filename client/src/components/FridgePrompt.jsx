import React, { useState } from 'react';
import IngredientDropdown from './IngredientDropdown';

function FridgePrompt({ item, onSave, onCancel, isModal = true, sessionId, error, isSaving = false }) {
  const [alias, setAlias] = useState(item.alias || '');
  const [category, setCategory] = useState(item.category || '');
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [unit, setUnit] = useState(item.unit || 'unit');
  const [localError, setLocalError] = useState(error || item.error || '');

  React.useEffect(() => {
    setLocalError(error || item.error || '');
  }, [error, item.error]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!alias.trim()) {
      setLocalError('Name is required');
      return;
    }
    if (!category.trim()) {
      setLocalError('Category is required');
      return;
    }
    if (!quantity || quantity <= 0) {
      setLocalError('Quantity must be greater than 0');
      return;
    }
    if (!unit.trim()) {
      setLocalError('Unit is required');
      return;
    }

    // Clear any previous errors
    setLocalError('');

    onSave({ alias: alias.trim(), category: category.trim(), quantity, unit: unit.trim() });
  };

  return (
    <div className={isModal ? "prompt-modal" : ""}>
      <div className={isModal ? "prompt-content" : ""}>
        <h3>Add to Fridge?</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input value={alias} onChange={e => setAlias(e.target.value)} required disabled={isSaving} />
          </label>
          <label style={{ display: 'flex' }}>
            Category:
            <IngredientDropdown required value={category} onChange={setCategory} sessionId={sessionId} disabled={isSaving} />
          </label>
          <label>
            Quantity:
            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required disabled={isSaving} />
          </label>
          <label>
            Unit:
            <input value={unit} onChange={e => setUnit(e.target.value)} required className="input-unit-wide" disabled={isSaving} />
          </label>
          {localError && <div style={{ color: 'red', marginBottom: 8 }}>{localError}</div>}
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Add to Fridge'}
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel" disabled={isSaving}>
            Don't Add to Fridge
          </button>
        </form>
      </div>
    </div>
  );
}

export default FridgePrompt;
