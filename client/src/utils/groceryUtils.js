// Utility for adding a grocery item with ingredient creation if needed
export async function addGroceryItem({ alias, category, quantity, unit, sessionId, onSuccess, onDuplicate }) {
  // 1. Check if ingredient exists
  const ingRes = await fetch('/api/ingredients', { headers: { 'x-session-id': sessionId } });
  const ingredients = await ingRes.json();
  let ingredient = ingredients.find(ing => ing.name.toLowerCase() === category.trim().toLowerCase());
  if (!ingredient) {
    // 2. Create ingredient
    const createRes = await fetch('/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify({ name: category.trim() })
    });
    if (!createRes.ok) {
      console.error('Failed to create ingredient');
      return;
    }
    ingredient = await createRes.json();
  }
  // 3. Add grocery item
  const res = await fetch('/api/grocery_items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId
    },
    body: JSON.stringify({ alias, category: ingredient.name, quantity, unit, checked: false })
  });
  if (res.ok && onSuccess) {
    onSuccess();
    return;
  }
  // If duplicate error, try to fetch the existing item and call onDuplicate
  if (res.status === 400 || res.status === 409) {
    // Try to fetch the existing grocery item by alias
    const getRes = await fetch(`/api/grocery_items?alias=${encodeURIComponent(alias)}`, {
      headers: { 'x-session-id': sessionId }
    });
    if (getRes.ok) {
      const item = await getRes.json()[0];
      if (item && onDuplicate) {
        onDuplicate(item);
      }
    }
  }
}