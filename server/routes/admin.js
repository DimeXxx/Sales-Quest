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
        cashBonus: fp.cashBonus || 0,
        productId: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        stock: p.stock,
        initialStock: p.initialStock,
        soldCount: p.soldCount || 0,
        imageUrl: p.imageUrl,
      };
    })
    .filter(Boolean);
  res.json({ rows });
});

router.post("/focus-products", (req, res) => {
  const { name, sku, category, description, price, stock, priority, xpReward, coinReward, cashBonus, imageUrl } = req.body || {};
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
    soldCount: 0,
  };
  const focus = {
    id: crypto.randomUUID(),
    productId: product.id,
    priority,
    xpReward: Number(xpReward) || 0,
    coinReward: Number(coinReward) || 0,
    cashBonus: Number(cashBonus) || 0,
    active: true,
    createdAt: new Date().toISOString(),
  };
  state.products.push(product);
  state.focusProducts.push(focus);
  save();

  res.status(201).json({ focusProductId: focus.id, productId: product.id });
});

router.post("/focus-products/bulk", (req, res) => {
  const rows = req.body?.rows || [];
  const REWARD_BASE = { critical: [100, 120], high: [85, 100], normal: [35, 35] };

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
      soldCount: 0,
    };
    const [xpReward, coinReward] = REWARD_BASE[row.priority] || REWARD_BASE.normal;
    state.products.push(product);
    state.focusProducts.push({
      id: crypto.randomUUID(),
      productId: product.id,
      priority: row.priority,
      xpReward,
      coinReward,
      cashBonus: Number(row.cashBonus) || 0,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }
  save();
  res.status(201).json({ imported: rows.length });
});

router.delete("/focus-products/:id", (req, res) => {
  const fp = state.focusProducts.find((f) => f.id === req.params.id);
  if (!fp) return res.status(404).json({ error: "not_found" });

  if (req.query.permanent === "true") {
    state.focusProducts = state.focusProducts.filter((f) => f.id !== req.params.id);
    // Only remove the underlying product too if no other focus entry references it.
    const stillReferenced = state.focusProducts.some((f) => f.productId === fp.productId);
    if (!stillReferenced) {
      state.products = state.products.filter((p) => p.id !== fp.productId);
    }
  } else {
    fp.active = false;
  }
  save();
  res.status(204).end();
});

router.put("/focus-products/:id", (req, res) => {
  const fp = state.focusProducts.find((f) => f.id === req.params.id);
  if (!fp) return res.status(404).json({ error: "not_found" });
  const product = state.products.find((p) => p.id === fp.productId);
  if (!product) return res.status(404).json({ error: "not_found" });

  const { name, sku, category, price, priority, xpReward, coinReward, cashBonus, stock } = req.body || {};

  if (name !== undefined) product.name = name;
  if (sku !== undefined) product.sku = sku;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = Number(price) || 0;
  if (stock !== undefined && stock !== "") {
    // Manual restock — treat the new number as a fresh cycle, so the
    // clearance gauge (sold vs initial) doesn't go negative or look wrong.
    product.stock = Number(stock) || 0;
    product.initialStock = Number(stock) || 0;
  }

  if (priority !== undefined) fp.priority = priority;
  if (xpReward !== undefined) fp.xpReward = Number(xpReward) || 0;
  if (coinReward !== undefined) fp.coinReward = Number(coinReward) || 0;
  if (cashBonus !== undefined) fp.cashBonus = Number(cashBonus) || 0;

  save();
  res.status(204).end();
});

router.post("/focus-products/:id/cash-bonus", (req, res) => {
  const { cashBonus } = req.body || {};
  const fp = state.focusProducts.find((f) => f.id === req.params.id);
  if (!fp) return res.status(404).json({ error: "not_found" });
  fp.cashBonus = Math.max(0, Number(cashBonus) || 0);
  save();
  res.status(204).end();
});

// ---- sales report — for reconciling sold quantities against 1C ------------
router.get("/sales-report", (_req, res) => {
  const rows = state.products.map((p) => {
    const fp = state.focusProducts.find((f) => f.productId === p.id);
    const cashBonus = fp?.cashBonus || 0;
    return {
      productId: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      soldCount: p.soldCount || 0,
      stock: p.stock,
      initialStock: p.initialStock,
      cashBonusPerUnit: cashBonus,
      totalCashPaid: Math.round(p.soldCount * cashBonus * 100) / 100,
    };
  });

  const managerTotals = state.accounts
    .filter((a) => a.role === "manager")
    .map((a) => ({
      accountId: a.id,
      name: a.name,
      questsCompleted: a.questsCompleted,
      totalCashBonus: a.totalCashBonus || 0,
    }));

  res.json({ products: rows, managers: managerTotals });
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
