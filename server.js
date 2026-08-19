import express from "express";
import cors from "cors";
import OpenAI from "openai";
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

// Groq API (OpenAI SDK Uyumlu)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

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

    const completion = await client.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
Sen Sithra AI'sın.
Türkçe konuş.
Kendini Sithra AI olarak tanıt.
Cevapların doğal, akıcı, modern ve yardımcı olsun.
Gereksiz yere çok uzun cevap verme.
Kullanıcı kodlama hakkında soru sorarsa anlaşılır ve uygulanabilir cevap ver.
`
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
    console.error("Groq API Error:", error);

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
