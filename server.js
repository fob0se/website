const http = require("http");
const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();
app.use(express.json({ limit: "20kb" }));

const indexPath = path.join(__dirname, "index.html");

function encodeUrl(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeUrl(token) {
  return Buffer.from(token, "base64url").toString("utf8");
}

function isValidTarget(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

app.get("/", (_req, res) => {
  res.sendFile(indexPath);
});

app.post("/api/convert", (req, res) => {
  const raw = typeof req.body?.url === "string" ? req.body.url.trim() : "";

  if (!raw) {
    return res.status(400).json({ error: "URL gerekli." });
  }

  if (!isValidTarget(raw)) {
    return res.status(400).json({
      error: "Sadece http:// veya https:// ile başlayan geçerli URL'ler kullanılabilir."
    });
  }

  const token = encodeUrl(raw);

  const host = req.get("host");
  const protocol = req.get("x-forwarded-proto") || req.protocol || "https";
  const convertedUrl = `${protocol}://${host}/go/${token}`;

  return res.json({ url: convertedUrl });
});

app.get("/go/:token", (req, res) => {
  try {
    const target = decodeUrl(req.params.token);

    if (!isValidTarget(target)) {
      return res.status(400).send("Geçersiz hedef URL.");
    }

    res.set("Cache-Control", "no-store");
    return res.redirect(302, target);
  } catch {
    return res.status(400).send("Geçersiz bağlantı.");
  }
});

// Vercel, server.js'i Node function olarak çalıştırır.
// Yerelde çalıştırmak için: npm start
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Rina URL Converter: http://localhost:${port}`);
  });
}

module.exports = app;

