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
Create a detailed workout plan for a gym member:

Age: ${age}
Height: ${height} cm
Weight: ${weight} kg
Fitness Level: ${fitnessLevel}
Goal: ${goal}
Medical Conditions: ${medicalConditions || "None"}
Workout Days Per Week: ${workoutDaysPerWeek}
Preferred Workout Time: ${preferredWorkoutTime}

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
      "You are an expert fitness trainer and exercise physiologist.",
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
Create a detailed diet plan based on the following requirements:

Age: ${age}
Height: ${height} cm
Weight: ${weight} kg
Fitness Level: ${fitnessLevel}
Goal: ${goal}
Dietary Preference: ${dietType}
Medical Conditions: ${medicalConditions || "None"}
Target Daily Calories: ${targetCalories} kcal

IMPORTANT REQUIREMENTS:
1. You MUST create meals ONLY for these meal types: Breakfast, Lunch, Dinner, Pre-workout, Post-workout
2. Each meal MUST include specific food items with exact quantities
3. All food items MUST be ${dietType.toLowerCase()} appropriate
4. Total calories across all meals MUST equal approximately ${targetCalories} kcal
5. Each food item MUST have: food name, quantity, calories, and protein content
6. Each meal MUST have a totalCalories field that sums all items in that meal

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
`;

    return this.callDeepSeek(
      "You are an expert nutritionist and dietitian. You create precise, kcal-based diet plans with specific food items based on dietary preferences (vegetarian or non-vegetarian only).",
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
