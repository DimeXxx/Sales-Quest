const express = require("express");
const fs = require("node:fs");
const { state, save, DB_PATH } = require("../db");
const { requireAuth, requireRole } = require("../auth");

const router = express.Router();
router.use(requireAuth, requireRole("rop", "admin"));

// Keys a real backup must have — a quick sanity check before we ever
// overwrite live data with an uploaded file.
const REQUIRED_KEYS = [
  "accounts", "products", "focusProducts", "bossFights", "rewards",
  "achievements", "accountAchievements", "sales", "redemptions",
];

router.get("/backup", (_req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Disposition", `attachment; filename="salesquest-backup-${date}.json"`);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(state, null, 2));
});

router.post("/restore", (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== "object") {
    return res.status(400).json({ error: "invalid_file" });
  }
  const missing = REQUIRED_KEYS.filter((k) => !(k in incoming));
  if (missing.length > 0) {
    return res.status(400).json({ error: "not_a_backup", missing });
  }

  // Safety net: snapshot what's live right now, alongside the main data
  // file, before it gets overwritten — recoverable via Railway Console if
  // the restore turns out to be a mistake.
  try {
    const safetyPath = `${DB_PATH}.before-restore-${Date.now()}.json`;
    fs.writeFileSync(safetyPath, JSON.stringify(state));
  } catch {
    // Non-fatal — proceed with the restore even if the safety snapshot
    // couldn't be written (e.g. read-only filesystem edge case).
  }

  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, incoming);
  save();

  res.json({ restored: true, accounts: state.accounts.length, products: state.products.length, sales: state.sales.length });
});

module.exports = router;
