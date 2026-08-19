import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static(__dirname));

// OpenRouter API (Tüm Llama / Mistral modellerini destekler)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mesaj gönderilmedi." });
    }

    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: "Sen Sithra AI'sın. Türkçe konuş. Kendini Sithra AI olarak tanıt. Cevapların doğal, akıcı ve yardımcı olsun."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = completion.choices[0]?.message?.content;

    res.json({
      reply: reply || "Cevap üretilemedi."
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Sithra AI bağlantısında hata oluştu: " + (error.message || "Bilinmeyen hata")
    });
  }
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Sithra AI backend ${PORT} portunda çalışıyor.`));
}

export default app;
