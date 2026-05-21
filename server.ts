import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload size limit to support image uploads for homework mode
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Lazy initializer for Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your Secrets tab.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// 1. General chat with Smarty (warm, energetic, quick, fun, speaking like a friend)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    const ai = getAI();

    // Context parameters to help customize Smarty's message
    const subjectProgressDesc = context?.subjects ? 
      `Subject study status: ${JSON.stringify(context.subjects)}` : "No specific subjects configured.";
    
    const activeSessionDesc = context?.session ? 
      `Currently in an active session: ${JSON.stringify(context.session)}. Points allocated: ${context.session.points || 0}` : "Out of session right now.";

    const characterStylesDesc = context?.characterUpgrade ? 
      `Active character style/avatar selected: ${JSON.stringify(context.characterUpgrade)}` : "Default character style.";

    const systemInstruction = `You are Smarty, a vibrant, energetic, warm, and friendly study companion and AI friend!
Your job is to support, appreciate, and encourage the student without putting too much pressure.
Keep your talks quick, fun, energetic, and completely free of boring lectures. Avoid listing internal paths or technical facts. Avoid dry, clinical jargon.
Speak like a close, supportive friend. Use highly encouraging and colloquial language (e.g., "Ah, you've got this!", "Let's crush this session together!").

Key Rules for your personality:
- We want quick, energetic and fun suggestions. Max 2-3 sentences unless asked to explain an issue.
- If the student is feeling tired, low on motivation, or about to give up, throw in a funny, playful motivational slogan! Use humor and warm jokes.
- Discuss hard topics and explain ONLY when the user explicitly asks you to explain. Otherwise, keep your briefing brief, interactive, and ask trivia or quick questions.
- Give a lot of credit and honest appreciation!
- Make sure to use the student's status context appropriately:
  * ${subjectProgressDesc}
  * ${activeSessionDesc}
  * ${characterStylesDesc}
- Keep your output clean and highly scannable, using bullet points only when listing items.
- Since the student can hear you, make your output ideal for Text-to-Speech (clear, friendly cadence, pronounceable, punchy!). Keep it natural.`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.9,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error?.message || "Something went wrong during chat." });
  }
});

// 2. Generate customized study quizzes according to study progress, timetable, & syllabus
app.post("/api/quiz", async (req, res) => {
  try {
    const { subject, syllabusTopic, difficulty } = req.body;
    const ai = getAI();

    const systemInstruction = `You are Smarty's quiz engine. Create 3 vibrant, fun, multiple-choice quiz questions based on the subject (${subject}) and syllabus topic (${syllabusTopic || "general knowledge/syllabus requirements"}).
Make the questions interactive and conversational, suited for a high school or middle school student. Include fun distractors but a clear correct option.
Include quick educational rewards (briefly explain why the answer is right in the 'explanation' field).
You must return your output strictly in JSON format matching the responseSchema structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a fun quiz for: Subject: ${subject}, Topic: ${syllabusTopic || "General overview"}, Difficulty level: ${difficulty || "Medium"}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The quiz question. Make it energetic and quick." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 options."
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)." },
              explanation: { type: Type.STRING, description: "A very brief, fun, friendly explanation (1-2 sentences) of why it's correct." }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    const parsedQuiz = JSON.parse(response.text || "[]");
    res.json(parsedQuiz);
  } catch (error: any) {
    console.error("Error in /api/quiz:", error);
    res.status(500).json({ error: error?.message || "Failed to generate study quiz." });
  }
});

// 3. Homework help mode with image analysis (OCR/Problem solving)
app.post("/api/homework-help", async (req, res) => {
  try {
    const { imageBase64, mimeType, question } = req.body;
    const ai = getAI();

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required for homework analysis." });
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: imageBase64 // Base64 data without data:image/png;base64, prefix
      }
    };

    const promptText = `Help me with my homework based on this image!
Question / Instruction from user: "${question || "Analyze this homework problem, describe it and check the work or solve it step by step."}"

Reply in Smarty's signature warm, encouraging, and friendly voice (like a helpful classmate).
Keep explanation quick and clear. Highlight key tips using bold text. Make sure not to give long lectures, just point out the core concept and guide step-by-step! Ensure we understand it perfectly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [imagePart, { text: promptText }]
      },
      config: {
        systemInstruction: "You are Smarty's helpful homework assistant. You explain things cleanly with zero verbose fluff. Keep it enthusiastic and clear."
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/homework-help:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze your homework image." });
  }
});

// Start dev server in development, serve static files in production
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smarty server started at http://localhost:${PORT}`);
  });
}

startServer();
