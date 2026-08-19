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

// index.html'i yayınla
app.use(express.static(__dirname));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// AI
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Mesaj gönderilmedi."
      });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

      instructions: `
Sen Sithra AI'sın.

Türkçe konuş.

Kendini Sithra AI olarak tanıt.

Cevapların doğal, akıcı, modern ve yardımcı olsun.

Kullanıcı sana normal şekilde soru sorabilir.

Gereksiz yere çok uzun cevap verme.

Kullanıcı kodlama hakkında soru sorarsa anlaşılır ve uygulanabilir cevap ver.
`,

      input: message
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error("OpenAI Error:", error);

    res.status(500).json({
      error: "Sithra AI bağlantısında hata oluştu."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Sithra AI backend ${PORT} portunda çalışıyor.`);
});
