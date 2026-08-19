import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
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

// Google Gemini API Yapılandırması (AQ... formatlı anahtar desteklenir)
const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mesaj gönderilmedi." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: "Sen Sithra AI'sın. Türkçe konuş. Kendini Sithra AI olarak tanıt. Cevapların doğal, akıcı, modern ve yardımcı olsun."
      }
    });

    res.json({
      reply: response.text || "Cevap üretilemedi."
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
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
