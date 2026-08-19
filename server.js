import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Yapılandırması
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.static(__dirname));

// Google Gemini İstemcisi
const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ana Sayfa Yönlendirmesi
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// AI Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Mesaj gönderilmedi."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: `
Sen Sithra AI'sın.
Türkçe konuş.
Kendini Sithra AI olarak tanıt.
Cevapların doğal, akıcı, modern ve yardımcı olsun.
Gereksiz yere çok uzun cevap verme.
Kullanıcı kodlama hakkında soru sorarsa anlaşılır ve uygulanabilir cevap ver.
`
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

// Lokal Çalıştırma Desteği
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Sithra AI backend ${PORT} portunda çalışıyor.`);
  });
}

// Vercel Serverless Export
export default app;
