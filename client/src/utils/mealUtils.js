// Utility to sort meals by fridge and grocery category match ratios
// meals: array of meal objects
// fridgeItems: array of fridge item objects
// groceryItems: array of grocery item objects
// Each meal should have a meal_ingredients array, each with a category
// Each fridge/grocery item should have a category


export function sortMealsByCategoryMatch(meals, fridgeItems, groceryItems) {
  return meals.slice().sort((a, b) => {
    const [aInFridge, aInGrocery, aStillNeeded, aFridgeRatio, aGroceryRatio] = getMealIngredientMatchCounts(a, fridgeItems, groceryItems);
    const [bInFridge, bInGrocery, bStillNeeded, bFridgeRatio, bGroceryRatio] = getMealIngredientMatchCounts(b, fridgeItems, groceryItems);
    // Sort by fridge ratio descending, then grocery ratio descending
    if (bFridgeRatio !== aFridgeRatio) return bFridgeRatio - aFridgeRatio;
    return bGroceryRatio - aGroceryRatio;
  });
}

// Returns [inFridge, inGrocery, stillNeeded, fridgeRatio, groceryRatio] for a meal using ing_categories
export function getMealIngredientMatchCounts(meal, fridgeItems, groceryItems) {
  const fridgeCategories = new Set(fridgeItems.map(item => (item.category || '').toLowerCase().trim()));
  const groceryCategories = new Set(groceryItems.map(item => (item.category || '').toLowerCase().trim()));
  const ingCategories = Array.isArray(meal.ing_categories) ? meal.ing_categories : [];
  let inFridge = 0;
  let inGrocery = 0;
  let stillNeeded = 0;
  for (const catRaw of ingCategories) {
    const cat = (catRaw || '').toLowerCase().trim();
    if (cat && fridgeCategories.has(cat)) {
      inFridge++;
    } else if (cat && groceryCategories.has(cat)) {
      inGrocery++;
    } else {
      stillNeeded++;
    }
  }
  const total = ingCategories.length;
  const fridgeRatio = total ? inFridge / total : 0;
  const groceryRatio = total ? inGrocery / total : 0;
  return [inFridge, inGrocery, stillNeeded, fridgeRatio, groceryRatio];
}

