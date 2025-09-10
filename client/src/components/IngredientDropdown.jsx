import React, { useEffect, useState } from 'react';


function IngredientDropdown({ value, onChange, sessionId }) {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);

  React.useEffect(() => {
    setInput(value || '');
  }, [value]);

  useEffect(() => {
    fetch('/api/ingredients')
      .then(res => res.json())
      .then(setIngredients);
  }, []);

  const handleSelect = (name) => {
    setInput(name);
    setShowDropdown(false);
    onChange(name);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    setShowDropdown(true);
    onChange(e.target.value);
  };

  const filtered = ingredients.filter(ing => ing.name.toLowerCase().includes(input.toLowerCase()));

  return (
  <div className="dropdown-wrapper">
      <input
        value={input}
        onChange={handleInput}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder="Category"
      />
      {showDropdown && filtered.length > 0 && (
        <ul className="dropdown-list">
          {filtered.map(ing => (
            <li key={ing.id} className="dropdown-item" onMouseDown={() => handleSelect(ing.name)}>
              {ing.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default IngredientDropdown;
