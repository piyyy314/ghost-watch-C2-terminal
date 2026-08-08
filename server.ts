import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints FIRST
  app.post("/api/gemini/process-logs", async (req, res) => {
    try {
      const { logs, analysisType } = req.body;
      if (!logs || !Array.isArray(logs)) {
        return res.status(400).json({ error: "Invalid logs parameter." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      // Lazy-instantiate GoogleGenAI inside the request handler or once here
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const logText = logs
        .map((log: any, idx: number) => `LOG_ID: ${log.id || `LOG-${idx}`} | TYPE: ${log.type.toUpperCase()} | MESSAGE: ${log.msg}`)
        .join("\n");

      let prompt = "";
      if (analysisType === "summary") {
        prompt = `You are the Ghost-Watch AI C2 Terminal intelligence sub-system. We need a professional operations summary of the following security command logs.
Analyze the events, identify the current situation (e.g. status of signal intercepts, active fences, threats), and output a concise, high-density bulleted summary.
Keep your analysis clinical, cold, tactical, and highly readable.
Format the output using markdown headers, lists, and highlighting key terms.
Do not use flowery descriptors or conversational boilerplate.

Log Data Stream:
${logText}`;
      } else if (analysisType === "critical_events") {
        prompt = `You are the Ghost-Watch AI C2 Terminal intelligence defense sub-system.
Examine the following real-time logs and isolate any CRITICAL anomalies, PERIMETER BREACHES, or SEVERE THREAT alerts (e.g., threat intercepts, fence triggers, privilege escalations, Trojan payloads).
For each critical issue found, provide:
- **EVENT SIGNATURE & TARGET**: What happened and which target is involved
- **THREAT STATUS**: Level/Severity
- **OPERATIONAL IMPACT / SECTOR BOUNDARY BREACHED**: Explain what is compromised
- **RECOMMENDATION / COUNTERMEASURES**: Recommended actions for C2 operator.

If no major anomalies or breaches exist in the logs, state that high-priority perimeter checks are currently clear and normal tracking operations are active, but highlight any minor warnings that need observation.
Format with clean tactical panels/sections using markdown. Highly structured, elite tactical layout.

Log Data Stream:
${logText}`;
      } else {
        prompt = `Provide a brief analysis of these logs:
${logText}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.status(500).json({ error: error.message || "Failed to process logs with Gemini AI." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
