import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Statik dosyaları sun
app.use(express.static(__dirname));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ana sayfa
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
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Sen Sithra AI'sın.

Türkçe konuş.

Kendini Sithra AI olarak tanıt.

Cevapların doğal, akıcı, modern ve yardımcı olsun.

Kullanıcı sana normal şekilde soru sorabilir.

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
    console.error("OpenAI Error:", error);

    res.status(500).json({
      error: "Sithra AI bağlantısında hata oluştu: " + (error.message || "Bilinmeyen hata")
    });
  }
});

// Lokal çalıştırma desteği
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Sithra AI backend ${PORT} portunda çalışıyor.`);
  });
}

// Vercel Serverless Deployment için zorunlu export
export default app;
