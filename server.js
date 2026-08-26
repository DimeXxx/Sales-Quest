// Minimal production server for deploying the built app (dist/) — used by
// Railway (or any Node host). Not needed for local development; `npm run dev`
// uses Vite's own dev server instead.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "dist");
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(distPath));

// SPA fallback — any unmatched route serves index.html so client-side
// routing (if added later) keeps working. Express 5 needs a named wildcard.
app.get("/*splat", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Sales Quest listening on port ${port}`);
});
