const { OpenRouter } = require("@openrouter/sdk");
const env = require("../config/env");

class AIService {
  constructor() {
    if (env.OPENROUTER_API_KEY) {
      this.openrouter = new OpenRouter({        
        apiKey: env.OPENROUTER_API_KEY,
      });
    } else {
      console.warn(
        "OpenRouter API key not configured. AI features will not work."
      );
    }
  }

  async callDeepSeek(systemPrompt, userPrompt) {
    if (!this.openrouter) {
      throw new Error("OpenRouter API key not configured");
    }
  
    const completion = await this.openrouter.chat.send({
      model: "tngtech/deepseek-r1t2-chimera:free",
      messages: [
        {
          role: "system",
          content: 
            "You are a strict JSON API. You MUST follow these rules EXACTLY:\n\n" +
            "CRITICAL RULES:\n" +
            "- Output ONLY raw JSON, nothing else\n" +
            "- No markdown formatting (no code blocks)\n" +
            "- No comments or explanations\n" +
            "- No trailing commas\n" +
            "- No text before or after the JSON\n" +
            "- The JSON must be valid and parseable\n" +
            "- Follow the exact structure specified in the prompt\n" +
            "- Do not add any fields not specified\n" +
            "- Do not skip any required fields",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.1,
    });
  
    const rawText = completion.choices[0].message.content;
  
    // 🔥 SAFE JSON EXTRACTION
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
  
    if (firstBrace === -1 || lastBrace === -1) {
      console.error("No JSON found in AI response:", rawText);
      throw new Error("AI response did not contain JSON");
    }
  
    const jsonString = rawText.slice(firstBrace, lastBrace + 1);
  
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      console.error("Invalid JSON extracted:", jsonString);
      throw new Error("AI response was not valid JSON");
    }
  }
  

  async generateWorkoutPlan(userDetails) {
    const {
      age,
      height,
      weight,
      fitnessLevel,
      goal,
      medicalConditions,
      workoutDaysPerWeek,
      preferredWorkoutTime,
    } = userDetails;

    const prompt = `
Create a detailed workout plan for an Indian gym member:

Age: ${age}
Height: ${height} cm
Weight: ${weight} kg
Fitness Level: ${fitnessLevel}
Goal: ${goal}
Medical Conditions: ${medicalConditions || "None"}
Workout Days Per Week: ${workoutDaysPerWeek}
Preferred Workout Time: ${preferredWorkoutTime}

IMPORTANT REQUIREMENTS FOR INDIAN CONTEXT:
1. Focus on exercises that are practical and accessible in Indian gyms
2. Use common gym equipment available in most Indian fitness centers
3. Consider Indian body types and fitness culture
4. Keep the plan simple, effective, and sustainable
5. Avoid recommending expensive equipment or supplements
6. Include bodyweight exercises where appropriate

Return JSON in this exact format:
{
  "planName": "string",
  "goal": "string",
  "duration": "string",
  "schedule": [
    {
      "day": "Monday",
      "focus": "string",
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string",
          "rest": "string"
        }
      ]
    }
  ]
}
`;

    return this.callDeepSeek(
      "You are an expert fitness trainer and exercise physiologist specializing in Indian people. You create practical, cost-effective workout plans suitable for Indian gym members using common equipment available in Indian fitness centers.",
      prompt
    );
  }

  async generateDietPlan(userDetails) {
    const {
      age,
      height,
      weight,
      fitnessLevel,
      goal,
      dietaryRestrictions,
      dietaryPreference,
      medicalConditions,
    } = userDetails;

    const bmr = this.calculateBMR(weight, height, age);
    const targetCalories = this.calculateTargetCalories(
      bmr,
      fitnessLevel,
      goal
    );

    // Normalize dietary preference to veg or non-veg
    const dietType = dietaryPreference 
      ? (dietaryPreference.toLowerCase().includes("veg") && !dietaryPreference.toLowerCase().includes("non") ? "Vegetarian" : "Non-Vegetarian")
      : (dietaryRestrictions && dietaryRestrictions.toLowerCase().includes("veg") && !dietaryRestrictions.toLowerCase().includes("non") ? "Vegetarian" : "Non-Vegetarian");

    const prompt = `
Create a simple, cost-effective diet plan for an Indian person based on the following requirements:

Age: ${age}
Height: ${height} cm
Weight: ${weight} kg
Fitness Level: ${fitnessLevel}
Goal: ${goal}
Dietary Preference: ${dietType}
Medical Conditions: ${medicalConditions || "None"}
Target Daily Calories: ${targetCalories} kcal

CRITICAL REQUIREMENTS FOR INDIAN DIET PLAN:
1. Use ONLY common, affordable Indian food items available in local markets
2. Focus on traditional Indian foods: dal, rice, roti, vegetables, fruits, curd, soya, etc.
3. For ${dietType === "Vegetarian" ? "vegetarian" : "non-vegetarian"}: Use paneer, dal, eggs, chicken (if non-veg), etc. - avoid expensive items
4. DO NOT recommend any expensive supplements, imported foods
5. Keep meals simple, practical, and easy to prepare at home
6. Use locally available vegetables and fruits
7. Pre-workout meal: MUST specify actual food items like banana, dates, milk, roti with peanut butter, etc. - NO generic names like "Sample Food" or placeholder names
8. Post-workout meal: MUST specify actual food items like banana, milk, dates, roti with paneer, dal, etc. - NO generic names like "Sample Food" or placeholder names
9. NEVER use placeholder names like "Sample Food", "Food Item", "Meal", etc. - ALWAYS use real, specific Indian food names
10. All food items MUST be ${dietType.toLowerCase()} appropriate
11. Total calories across all meals MUST equal approximately ${targetCalories} kcal

IMPORTANT REQUIREMENTS:
1. You MUST create meals ONLY for these meal types: Breakfast, Lunch, Dinner, Pre-workout, Post-workout
2. Each meal MUST include specific food items with exact quantities
3. Each food item MUST have: food name, quantity, calories, and protein content
4. Each meal MUST have a totalCalories field that sums all items in that meal
5. Use simple, everyday Indian food names (e.g., "Dal", "Roti", "Rice", "Sabzi", "Paneer", "Chicken Curry", "Banana", "Dates", "Milk", etc.)
6. For Pre-workout: Use light, energy-boosting foods like banana, dates, milk, roti with ghee, etc.
7. For Post-workout: Use protein-rich foods like milk, banana, roti with paneer, dal, eggs (if non-veg), etc.

Return JSON in this EXACT format (no other fields, no variations):
{
  "planName": "string",
  "goal": "string",
  "dailyCalories": ${targetCalories},
  "macros": {
    "protein": "string percentage",
    "carbs": "string percentage",
    "fats": "string percentage"
  },
  "meals": [
    {
      "meal": "Breakfast",
      "time": "string time format",
      "items": [
        {
          "food": "specific food name",
          "quantity": "exact quantity with unit",
          "calories": number,
          "protein": "string with unit"
        }
      ],
      "totalCalories": number
    },
    {
      "meal": "Lunch",
      "time": "string time format",
      "items": [
        {
          "food": "specific food name",
          "quantity": "exact quantity with unit",
          "calories": number,
          "protein": "string with unit"
        }
      ],
      "totalCalories": number
    },
    {
      "meal": "Dinner",
      "time": "string time format",
      "items": [
        {
          "food": "specific food name",
          "quantity": "exact quantity with unit",
          "calories": number,
          "protein": "string with unit"
        }
      ],
      "totalCalories": number
    },
    {
      "meal": "Pre-workout",
      "time": "string time format",
      "items": [
        {
          "food": "specific food name",
          "quantity": "exact quantity with unit",
          "calories": number,
          "protein": "string with unit"
        }
      ],
      "totalCalories": number
    },
    {
      "meal": "Post-workout",
      "time": "string time format",
      "items": [
        {
          "food": "specific food name",
          "quantity": "exact quantity with unit",
          "calories": number,
          "protein": "string with unit"
        }
      ],
      "totalCalories": number
    }
  ]
}

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no comments. The meal field values MUST be exactly: "Breakfast", "Lunch", "Dinner", "Pre-workout", or "Post-workout".

REMEMBER: 
- Keep it simple, affordable, and practical for Indian households. No expensive supplements or imported foods.
- NEVER use placeholder names like "Sample Food", "Food Item", or generic names - ALWAYS use real Indian food names
- Pre-workout and Post-workout meals MUST have actual food items specified.
`;

    return this.callDeepSeek(
      "You are an expert Indian nutritionist and dietitian. You create simple, cost-effective, kcal-based diet plans using common Indian food items available in local markets. You focus on traditional Indian foods and avoid expensive supplements or imported items.",
      prompt
    );
  }

  // ---------- helpers (unchanged) ----------

  calculateBMR(weight, height, age, gender = "male") {
    if (gender === "male") {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  }

  calculateTargetCalories(bmr, fitnessLevel, goal) {
    const activityMultipliers = {
      beginner: 1.375,
      intermediate: 1.55,
      advanced: 1.725,
    };

    const tdee = bmr * (activityMultipliers[fitnessLevel] || 1.55);

    if (
      goal.toLowerCase().includes("muscle") ||
      goal.toLowerCase().includes("bulk")
    ) {
      return Math.round(tdee + 300);
    } else if (
      goal.toLowerCase().includes("weight loss") ||
      goal.toLowerCase().includes("lose")
    ) {
      return Math.round(tdee - 500);
    }

    return Math.round(tdee);
  }
}

module.exports = new AIService();
