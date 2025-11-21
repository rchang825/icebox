// Utility for adding a fridge item with ingredient creation if needed
export async function addFridgeItem({ alias, category, quantity, unit, tags = [], sessionId, onSuccess, onError }) {
  try {
    console.log('addFridgeItem called with:', { alias, category, quantity, unit, sessionId });

    // 1. Check if ingredient exists
    const ingRes = await fetch('/api/ingredients', { headers: { 'x-session-id': sessionId } });
    if (!ingRes.ok) {
      console.error('Failed to fetch ingredients:', ingRes.status);
      if (onError) onError('Failed to fetch ingredients');
      return;
    }

    const ingredients = await ingRes.json();
    console.log('Existing ingredients:', ingredients.map(i => i.name));
    let ingredient = ingredients.find(ing => ing.name.toLowerCase() === category.trim().toLowerCase());

    if (!ingredient) {
      console.log('Creating new ingredient:', category.trim());
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
        const errorData = await createRes.json();
        console.error('Failed to create ingredient:', errorData);
        if (onError) onError(errorData.error || 'Failed to create ingredient');
        return;
      }

      ingredient = await createRes.json();
      console.log('Created ingredient:', ingredient);
    } else {
      console.log('Found existing ingredient:', ingredient.name);
    }

    // 3. Add fridge item
  const itemData = { alias, category: ingredient.name, quantity, unit, tags };
    console.log('Saving fridge item:', itemData);
    console.log('Field validation:');
    console.log('- alias:', JSON.stringify(alias), 'truthy:', !!alias);
    console.log('- category:', JSON.stringify(ingredient.name), 'truthy:', !!ingredient.name);
    console.log('- quantity:', JSON.stringify(quantity), 'truthy:', !!quantity);
    console.log('- unit:', JSON.stringify(unit), 'truthy:', !!unit);

    const res = await fetch('/api/fridge_items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId
      },
      body: JSON.stringify(itemData)
    });

    if (res.ok) {
      const savedItem = await res.json();
      console.log('Successfully saved fridge item:', savedItem);
      if (onSuccess) onSuccess();
    } else {
      const errorData = await res.json();
      console.error('Failed to save fridge item:', errorData);
      if (onError) onError(errorData.error || 'Failed to save item');
    }
  } catch (err) {
    console.error('Network error in addFridgeItem:', err);
    if (onError) onError('Network error: ' + err.message);
  }
}