import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Helper to get GoogleGenAI safely
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "Calcus" });
});

// 2. AI Problem Solver (Text, Canvas Drawing, or Word Problem)
app.post("/api/ai/solve", async (req, res) => {
  try {
    const { problem, imageBase64, mode = "step-by-step" } = req.body;

    if (!problem && !imageBase64) {
      return res.status(400).json({ error: "Please provide a math problem or image." });
    }

    const ai = getAIClient();

    const parts: any[] = [];
    if (imageBase64) {
      // Remove data URL prefix if present
      const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: cleanData,
        },
      });
    }

    const promptText = `
You are Calcus AI - an expert math tutor, mathematician, and step-by-step problem solver for the Calcus app.
Solve the following mathematical problem accurately and thoroughly.

Problem / Question:
${problem || "Analyze the math problem drawn or shown in the provided image."}

Requested Mode: ${mode}

Please format your response strictly as valid JSON matching this schema:
{
  "title": "Short title describing the topic (e.g. Quadratic Equation Solving, Derivative of Polynomial)",
  "category": "Algebra | Calculus | Trigonometry | Geometry | Statistics | Linear Algebra | Arithmetic | Word Problem",
  "summary": "Brief 1-2 sentence overview of the strategy and answer.",
  "finalAnswer": "The precise final result in plain text or LaTeX format.",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Title of step 1",
      "explanation": "Clear explanation of why this step was taken.",
      "latex": "LaTeX code representing this mathematical step (e.g. \\\\int x^2 dx = \\\\frac{x^3}{3} + C)"
    }
  ],
  "formulasUsed": ["Array of formula names or equations used in the solution"],
  "proTips": "1-2 helpful tips or alternative methods to remember for exams/study.",
  "similarPracticeProblem": "A similar problem for the user to try on their own."
}
Return ONLY valid JSON.
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: parts.length === 1 ? parts[0].text : { parts },
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const jsonText = response.text || "{}";
    const result = JSON.parse(jsonText);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error("Error in /api/ai/solve:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to solve math problem using Calcus AI.",
    });
  }
});

// 3. AI Assessment & Practice Quiz Generator
app.post("/api/ai/quiz/generate", async (req, res) => {
  try {
    const { topic = "Algebra", difficulty = "Intermediate", count = 3 } = req.body;
    const ai = getAIClient();

    const prompt = `
Generate a math practice quiz set for the topic "${topic}" at level "${difficulty}".
Generate exactly ${count} math problems with varying concepts.

Return strictly JSON with the schema:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q1",
      "questionText": "Text of problem 1 (use clear formatting and math notation)",
      "latex": "Optional LaTeX representation of equation",
      "hints": ["Hint 1", "Hint 2"],
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Step by step explanation of the correct answer"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error("Error in /api/ai/quiz/generate:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to generate quiz." });
  }
});

// 4. AI Quiz Answer Evaluation & Personal Assessment
app.post("/api/ai/quiz/evaluate", async (req, res) => {
  try {
    const { questionText, userAnswer, correctAnswer } = req.body;
    const ai = getAIClient();

    const prompt = `
You are Calcus AI Tutor. Evaluate the user's math answer.
Question: ${questionText}
User's Answer: ${userAnswer}
Expected Answer: ${correctAnswer}

Provide feedback in strict JSON format:
{
  "isCorrect": boolean,
  "score": number (0 to 100),
  "feedback": "Encouraging, constructive feedback tailored to where they did well or where they made a mistake.",
  "correction": "Detailed breakdown if answer is wrong, highlighting the exact step where sign/algebra error happened."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const jsonText = response.text || "{}";
    const assessment = JSON.parse(jsonText);
    res.json({ success: true, assessment });
  } catch (err: any) {
    console.error("Error in /api/ai/quiz/evaluate:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to evaluate answer." });
  }
});

// 5. Formula Explanation & Insights
app.post("/api/ai/formula-explain", async (req, res) => {
  try {
    const { formulaName, latexFormula } = req.body;
    const ai = getAIClient();

    const prompt = `
Provide an engaging, highly educational explanation for the math formula: "${formulaName}" (${latexFormula}).
Format as strict JSON:
{
  "name": "${formulaName}",
  "latex": "${latexFormula}",
  "overview": "Clear explanation of what the formula calculates.",
  "variables": [
    { "symbol": "x", "meaning": "Description of x" }
  ],
  "realWorldApplications": ["Application 1 in engineering/science/finance", "Application 2"],
  "workedExample": {
    "problem": "Example scenario with numbers",
    "solutionSteps": "Step by step solution showing substitutions and final result."
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const jsonText = response.text || "{}";
    const explanation = JSON.parse(jsonText);
    res.json({ success: true, explanation });
  } catch (err: any) {
    console.error("Error in /api/ai/formula-explain:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to explain formula." });
  }
});

// Vite middleware or production static handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Calcus Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
