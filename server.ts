import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "5mb" }));

const PORT = 3000;

// Lazy initialiser for Gemini API
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Ensure simple server health check is available
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Endpoint: Proactive task recommendations & prioritization guidance
app.post("/api/ai/recommend", async (req: Request, res: Response): Promise<void> => {
  try {
    const { tasks, completedCount } = req.body;
    const ai = getAiClient();

    const prompt = `Analyze this list of study and work tasks. Proactively identify potential bottlenecks, high-priority tasks (taking into account upcoming deadlines and estimated effort), and generate a list of smart, tailored suggestions to boost student productivity.

Current Tasks data:
${JSON.stringify(tasks, null, 2)}

Completed Pomodoros/tasks in this session: ${completedCount || 0}

Please provide:
1. Recommended prioritized tasks (up to 3) with clear reasonings for why they should be done next.
2. 3 highly contextual, actionable study tips or cognitive techniques suited for their current workload.
3. 3 suggested flashcard deck topics that would help them prepare or master their active study topics.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["recommendations", "studyTips", "suggestedDecks"],
          properties: {
            recommendations: {
              type: Type.ARRAY,
              description: "Top actionable task recommendations prioritized.",
              items: {
                type: Type.OBJECT,
                required: ["taskTitle", "priorityScore", "justification", "actionStep"],
                properties: {
                  taskTitle: { type: Type.STRING, description: "Title of the task recommended or created" },
                  priorityScore: { type: Type.STRING, description: "Urgency rating: High, Medium, or Low" },
                  justification: { type: Type.STRING, description: "Why this should be prioritized now based on deadlines and goals" },
                  actionStep: { type: Type.STRING, description: "Concrete immediate step to get started (e.g. 'Read first 2 pages', 'Write down intro draft')" }
                }
              }
            },
            studyTips: {
              type: Type.ARRAY,
              description: "Contextual study tips, cognitive advice, or focus techniques.",
              items: { type: Type.STRING }
            },
            suggestedDecks: {
              type: Type.ARRAY,
              description: "Topics or subject decks suggested for creation to reinforce their study subjects.",
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/ai/recommend:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI recommendations." });
  }
});

// Endpoint: Dynamic Flashcard Generator
app.post("/api/ai/generate-flashcards", async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic } = req.body;
    if (!topic) {
       res.status(400).json({ error: "Topic is required" });
       return;
    }

    const ai = getAiClient();
    const prompt = `Generate exactly 5 highly-effective, educational flashcards to help a student study the following topic: "${topic}".
Each flashcard should have a clear, concise question, concept, or term on the "front" side, and a detailed but easily digestible explanation, answer, or memory trick on the "back" side.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["flashcards"],
          properties: {
            flashcards: {
              type: Type.ARRAY,
              description: "List of generated flashcards.",
              items: {
                type: Type.OBJECT,
                required: ["front", "back"],
                properties: {
                  front: { type: Type.STRING, description: "Front side of the card: term, concept, or quiz question" },
                  back: { type: Type.STRING, description: "Back side of the card: explanation, definition, or answer" }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/ai/generate-flashcards:", error);
    res.status(500).json({ error: error.message || "Failed to generate flashcards." });
  }
});

// Endpoint: AI-assisted notepad analyzer (Summarize + Extract tasks)
app.post("/api/ai/analyze-notes", async (req: Request, res: Response): Promise<void> => {
  try {
    const { noteText } = req.body;
    if (!noteText) {
       res.status(400).json({ error: "Note text is required" });
       return;
    }

    const ai = getAiClient();
    const prompt = `Analyze the student's study or research notes provided below.
Extract:
1. A structured summary formatted nicely in Markdown (using bullet points, bold text, etc.).
2. A list of key actionable tasks or study actions extracted directly from the notes. For each task, estimate its complexity in terms of Pomodoros (1 to 4 focus blocks of 25 mins) and state why it was extracted.

Notes content:
"""
${noteText}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "extractedTasks"],
          properties: {
            summary: {
              type: Type.STRING,
              description: "Structured markdown summary of the notes."
            },
            extractedTasks: {
              type: Type.ARRAY,
              description: "Actionable tasks identified in the notes.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "estimatedPomodoros"],
                properties: {
                  title: { type: Type.STRING, description: "Brief title of the task" },
                  description: { type: Type.STRING, description: "Brief details about what needs to be done" },
                  estimatedPomodoros: { type: Type.INTEGER, description: "Complexity estimated in Pomodoro study blocks (1-4)" }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/ai/analyze-notes:", error);
    res.status(500).json({ error: error.message || "Failed to analyze study notes." });
  }
});

async function bootstrap() {
  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to bootstrap fullstack app:", err);
});
