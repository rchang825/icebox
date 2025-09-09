// Utility for adding a grocery item with ingredient creation if needed
export async function addGroceryItem({ alias, category, quantity, unit, sessionId, onSuccess }) {
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
      // Optionally handle error
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
    body: JSON.stringify({ alias, category: ingredient.name, quantity, unit })
  });
  if (res.ok && onSuccess) {
    onSuccess();
  }
}