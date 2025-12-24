// Valid meal enum values from schema
const VALID_MEALS = [
  "Breakfast",
  "Mid-Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Dinner",
  "Post-Workout",
];

exports.normalizeMeal = (meal = "") => {
  const value = meal.toLowerCase().trim();
  
  // Check if already a valid enum value (case-insensitive)
  const exactMatch = VALID_MEALS.find(m => m.toLowerCase() === value);
  if (exactMatch) return exactMatch;
  
  // Exact matches first
  if (value === "breakfast") return "Breakfast";
  if (value === "lunch") return "Lunch";
  if (value === "dinner" || value === "supper") return "Dinner";
  if (value === "mid-morning snack" || value === "mid morning snack") return "Mid-Morning Snack";
  if (value === "afternoon snack") return "Afternoon Snack";
  if (value === "post-workout" || value === "post workout") return "Post-Workout";
  
  // Partial matches
  if (value.includes("breakfast")) return "Breakfast";
  if (value.includes("lunch")) return "Lunch";
  if (value.includes("dinner") || value.includes("supper")) return "Dinner";
  if (value.includes("mid-morning") || value.includes("mid morning")) return "Mid-Morning Snack";
  if (value.includes("afternoon") && value.includes("snack")) return "Afternoon Snack";
  if (value.includes("post-workout") || value.includes("post workout")) return "Post-Workout";
  
  // Default to Mid-Morning Snack for any snack-related terms
  if (value.includes("snack") || value.includes("morning")) return "Mid-Morning Snack";
  
  // Default fallback - always return a valid enum value
  return "Breakfast";
};

// Validate and normalize food item
exports.normalizeFoodItem = (item) => {
  return {
    food: String(item.food || item.name || "Unknown").trim(),
    quantity: String(item.quantity || item.amount || "1 serving").trim(),
    calories: Number(item.calories || item.cal || 0) || 0,
    protein: String(item.protein || item.proteinAmount || "0g").trim(),
  };
};

// Validate and normalize meal
exports.normalizeMealData = (meal) => {
  // Ensure meal name is always a valid enum value
  const mealName = exports.normalizeMeal(meal.meal || meal.mealName || meal.name);
  
  const normalizedMeal = {
    meal: mealName, // Guaranteed to be a valid enum value
    time: String(meal.time || meal.mealTime || "12:00 PM").trim(),
    items: [],
    totalCalories: 0,
  };

  // Normalize items
  if (Array.isArray(meal.items)) {
    normalizedMeal.items = meal.items.map(exports.normalizeFoodItem);
    // Calculate total calories if not provided
    normalizedMeal.totalCalories = meal.totalCalories || 
      normalizedMeal.items.reduce((sum, item) => sum + (item.calories || 0), 0);
  } else if (Array.isArray(meal.foods)) {
    normalizedMeal.items = meal.foods.map(exports.normalizeFoodItem);
    normalizedMeal.totalCalories = meal.totalCalories || 
      normalizedMeal.items.reduce((sum, item) => sum + (item.calories || 0), 0);
  }

  // Ensure at least one item exists
  if (normalizedMeal.items.length === 0) {
    normalizedMeal.items = [{
      food: "Meal item",
      quantity: "1 serving",
      calories: 0,
      protein: "0g",
    }];
  }

  return normalizedMeal;
};
  