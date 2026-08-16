import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // screenshots as base64 can be large

const API_KEY = process.env.ANTHROPIC_API_KEY;

app.post("/api/extract", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY on the server." });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Request body must include 'content'." });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content }],
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return res.status(anthropicRes.status).json({ error: data.error?.message || "Anthropic API error" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy request failed." });
  }
});

app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
