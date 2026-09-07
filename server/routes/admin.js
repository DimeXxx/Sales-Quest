const express = require("express");
const crypto = require("node:crypto");
const { state, save } = require("../db");
const { requireAuth, requireRole } = require("../auth");
const { toPublicAccount } = require("./auth");

const router = express.Router();
router.use(requireAuth, requireRole("rop", "admin"));

// ---- pending account approvals -------------------------------------------
router.get("/accounts", (_req, res) => {
  const accounts = [...state.accounts]
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "pending" ? -1 : 1))
    .map(toPublicAccount);
  res.json({ accounts });
});

router.post("/accounts/:id/approve", (req, res) => {
  const account = state.accounts.find((a) => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: "not_found" });
  account.status = "approved";
  save();
  res.status(204).end();
});

router.post("/accounts/:id/reject", (req, res) => {
  const idx = state.accounts.findIndex((a) => a.id === req.params.id && a.status === "pending");
  if (idx === -1) return res.status(404).json({ error: "not_found" });
  state.accounts.splice(idx, 1);
  save();
  res.status(204).end();
});

router.post("/accounts/:id/role", (req, res) => {
  const { role } = req.body || {};
  if (!["manager", "rop"].includes(role)) return res.status(400).json({ error: "invalid_role" });
  const account = state.accounts.find((a) => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: "not_found" });
  account.role = role;
  save();
  res.status(204).end();
});

router.post("/accounts/:id/adjust", (req, res) => {
  const { coins = 0, xp = 0 } = req.body || {};
  const account = state.accounts.find((a) => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: "not_found" });
  account.xp = Math.max(0, account.xp + Number(xp));
  account.coins = Math.max(0, account.coins + Number(coins));
  account.level = Math.floor(account.xp / 1000) + 1;
  save();
  res.json({ account: toPublicAccount(account) });
});

// ---- inventory / focus products -------------------------------------------
router.get("/inventory", (_req, res) => {
  const rows = state.focusProducts
    .map((fp) => {
      const p = state.products.find((prod) => prod.id === fp.productId);
      if (!p) return null;
      return {
        focusProductId: fp.id,
        priority: fp.priority,
        xpReward: fp.xpReward,
        coinReward: fp.coinReward,
        productId: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stock: p.stock,
        initialStock: p.initialStock,
        imageUrl: p.imageUrl,
      };
    })
    .filter(Boolean);
  res.json({ rows });
});

router.post("/focus-products", (req, res) => {
  const { name, sku, category, description, price, stock, priority, xpReward, coinReward, imageUrl } = req.body || {};
  if (!name || !sku || !stock) return res.status(400).json({ error: "missing_fields" });

  const product = {
    id: crypto.randomUUID(),
    name,
    sku,
    category: category || "General",
    description: description || "",
    price: Number(price) || 0,
    stock: Number(stock),
    initialStock: Number(stock),
    imageUrl: imageUrl || null,
  };
  const focus = {
    id: crypto.randomUUID(),
    productId: product.id,
    priority,
    xpReward: Number(xpReward) || 0,
    coinReward: Number(coinReward) || 0,
    active: true,
  };
  state.products.push(product);
  state.focusProducts.push(focus);
  save();

  res.status(201).json({ focusProductId: focus.id, productId: product.id });
});

router.post("/focus-products/bulk", (req, res) => {
  const rows = req.body?.rows || [];
  const REWARD_BASE = { critical: [300, 120], high: [250, 100], normal: [100, 35] };

  for (const row of rows) {
    const product = {
      id: crypto.randomUUID(),
      name: row.name,
      sku: row.sku,
      category: row.category || "General",
      description: row.description || "",
      price: Number(row.price) || 0,
      stock: Number(row.stock),
      initialStock: Number(row.stock),
      imageUrl: null,
    };
    const [xpReward, coinReward] = REWARD_BASE[row.priority] || REWARD_BASE.normal;
    state.products.push(product);
    state.focusProducts.push({
      id: crypto.randomUUID(),
      productId: product.id,
      priority: row.priority,
      xpReward,
      coinReward,
      active: true,
    });
  }
  save();
  res.status(201).json({ imported: rows.length });
});

router.delete("/focus-products/:id", (req, res) => {
  const fp = state.focusProducts.find((f) => f.id === req.params.id);
  if (fp) fp.active = false;
  save();
  res.status(204).end();
});

// ---- boss fights -----------------------------------------------------------
router.post("/boss-fights/:id/toggle", (req, res) => {
  const bf = state.bossFights.find((b) => b.id === req.params.id);
  if (!bf) return res.status(404).json({ error: "not_found" });
  bf.active = !bf.active;
  save();
  res.status(204).end();
});

// ---- resets ------------------------------------------------------------
function resetManagerFields(a) {
  a.level = 1;
  a.xp = 0;
  a.coins = 0;
  a.questsCompleted = 0;
  a.streak = 0;
}

router.post("/reset/manager/:id", (req, res) => {
  const account = state.accounts.find((a) => a.id === req.params.id);
  if (account) resetManagerFields(account);
  save();
  res.status(204).end();
});

router.post("/reset/managers", (_req, res) => {
  state.accounts.filter((a) => a.role !== "rop" && a.role !== "admin").forEach(resetManagerFields);
  save();
  res.status(204).end();
});

router.post("/reset/stock", (_req, res) => {
  state.products.forEach((p) => { p.stock = p.initialStock; });
  save();
  res.status(204).end();
});

router.post("/reset/boss-fights", (_req, res) => {
  state.bossFights.forEach((bf) => { bf.currentQuantity = 0; });
  save();
  res.status(204).end();
});

router.post("/reset/achievements", (_req, res) => {
  state.accountAchievements = [];
  save();
  res.status(204).end();
});

router.post("/reset/all", (_req, res) => {
  state.accounts.filter((a) => a.role !== "rop" && a.role !== "admin").forEach(resetManagerFields);
  state.products.forEach((p) => { p.stock = p.initialStock; });
  state.bossFights.forEach((bf) => { bf.currentQuantity = 0; });
  state.accountAchievements = [];
  save();
  res.status(204).end();
});

module.exports = router;
