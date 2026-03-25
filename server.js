import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const REQUESTS_FILE = path.join(__dirname, "delete-requests.json");

app.post("/api/delete-request", (req, res) => {
  const { phone, message } = req.body;
  if (!phone || phone.trim().length < 6) {
    return res.status(400).json({ error: "Numéro de téléphone invalide" });
  }

  const entry = {
    phone: phone.trim(),
    message: (message || "").trim(),
    date: new Date().toISOString(),
    status: "pending"
  };

  let requests = [];
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf-8"));
    }
  } catch { /* ignore */ }

  requests.push(entry);
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));

  console.log(`[DELETE REQUEST] ${entry.date} — ${entry.phone}`);
  res.json({ success: true });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Site Tape'a running on port ${PORT}`);
});
