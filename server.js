import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "Sithra AI"
  });
});

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
Cevapların doğal, akıcı ve yardımcı olsun.
Kullanıcı sana normal şekilde soru sorabilir.
Kendini Sithra AI olarak tanıt.

Gereksiz yere çok uzun cevap verme.
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
