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
          content: `
  You are a JSON API.
  
  Rules:
  - Output ONLY raw JSON
  - No markdown
  - No comments
  - No explanations
  - No trailing commas
          `.trim(),
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.3,
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
      medicalConditions,
    } = userDetails;

    const bmr = this.calculateBMR(weight, height, age);
    const targetCalories = this.calculateTargetCalories(
      bmr,
      fitnessLevel,
      goal
    );

    const prompt = `
Create a detailed diet plan:

Age: ${age}
Height: ${height} cm
Weight: ${weight} kg
Fitness Level: ${fitnessLevel}
Goal: ${goal}
Dietary Restrictions: ${dietaryRestrictions || "None"}
Medical Conditions: ${medicalConditions || "None"}
Target Calories: ${targetCalories} kcal

Return JSON in this exact format:
{
  "planName": "string",
  "goal": "string",
  "dailyCalories": number,
  "macros": {
    "protein": "string",
    "carbs": "string",
    "fats": "string"
  },
  "meals": [
    {
      "meal": "Breakfast",
      "time": "string",
      "items": [
        {
          "food": "string",
          "quantity": "string",
          "calories": number,
          "protein": "string"
        }
      ],
      "totalCalories": number
    }
  ]
}
`;

    return this.callDeepSeek(
      "You are an expert nutritionist and dietitian.",
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
