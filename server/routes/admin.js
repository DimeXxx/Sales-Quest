const express = require("express");
const crypto = require("node:crypto");
const { state, save } = require("../db");
const { requireAuth, requireRole, hashPassword } = require("../auth");
const { toPublicAccount } = require("./auth");
const { notify, notifyAllManagers, logXpLedger } = require("../notify");

const router = express.Router();
router.use(requireAuth, requireRole("rop", "admin"));

// ---- pending account approvals -------------------------------------------
router.get("/accounts", (_req, res) => {
  const accounts = [...state.accounts]
    .sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name) : a.status === "pending" ? -1 : 1))
    .map(toPublicAccount);
  res.json({ accounts });
});

router.post("/accounts", (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "missing_fields" });

  const normalizedEmail = String(email).trim().toLowerCase();
  if (state.accounts.some((a) => a.email === normalizedEmail)) {
    return res.status(409).json({ error: "email_taken" });
  }

  const account = {
    id: crypto.randomUUID(),
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: role === "rop" ? "rop" : "manager",
    status: "approved", // admin-created accounts skip the pending queue
    avatar: name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join(""),
    avatarUrl: null,
    department: "Продажи",
    createdAt: new Date().toISOString(),
    monthlyTarget: 0,
    notifyPrefs: { inApp: true, email: false, telegram: false },
    level: 1,
    xp: 0,
    coins: 0,
    totalCashBonus: 0,
    questsCompleted: 0,
    streak: 0,
    lastSaleDate: null,
  };
  state.accounts.push(account);
  save();
  res.status(201).json({ account: toPublicAccount(account) });
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

  const otherAdmins = state.accounts.filter((a) => a.id !== account.id && (a.role === "rop" || a.role === "admin"));
  if (role === "manager" && (account.role === "rop" || account.role === "admin") && otherAdmins.length === 0) {
    return res.status(400).json({ error: "last_admin" });
  }

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
  if (Number(xp) || Number(coins)) {
    logXpLedger(account.id, "rop_bonus", Number(xp) || 0, Number(coins) || 0, "Бонус от РОПа");
    notify(account.id, `РОП начислил бонус: +${Number(xp) || 0} XP, +${Number(coins) || 0} points`, "xp");
  }
  save();
  res.json({ account: toPublicAccount(account) });
});

router.put("/accounts/:id", (req, res) => {
  const { name, email, monthlyTarget, department } = req.body || {};
  const account = state.accounts.find((a) => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: "not_found" });

  if (email !== undefined) {
    const normalized = String(email).trim().toLowerCase();
    if (state.accounts.some((a) => a.id !== account.id && a.email === normalized)) {
      return res.status(409).json({ error: "email_taken" });
    }
    account.email = normalized;
  }
  if (name !== undefined) account.name = name;
  if (monthlyTarget !== undefined) account.monthlyTarget = Number(monthlyTarget) || 0;
  if (department !== undefined) account.department = department;
  save();
  res.json({ account: toPublicAccount(account) });
});

router.delete("/accounts/:id", (req, res) => {
  const account = state.accounts.find((a) => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: "not_found" });

  const otherAdmins = state.accounts.filter((a) => a.id !== account.id && (a.role === "rop" || a.role === "admin"));
  if ((account.role === "rop" || account.role === "admin") && otherAdmins.length === 0) {
    return res.status(400).json({ error: "last_admin" });
  }

  state.accounts = state.accounts.filter((a) => a.id !== account.id);
  save();
  res.status(204).end();
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
        description: p.description || "",
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
  notifyAllManagers(`Новый квест: ${product.name}`, "quest");
  save();

  res.status(201).json({ focusProductId: focus.id, productId: product.id });
});

router.post("/focus-products/bulk", (req, res) => {
  const rows = req.body?.rows || [];
  const REWARD_BASE = { critical: [5, 6], high: [3, 4], normal: [1, 2] };

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

  const { name, sku, category, price, priority, xpReward, coinReward, cashBonus, stock, imageUrl, description } = req.body || {};

  if (name !== undefined) product.name = name;
  if (sku !== undefined) product.sku = sku;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price) || 0;
  if (imageUrl !== undefined) product.imageUrl = imageUrl || null;
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

router.post("/boss-fights", (req, res) => {
  const { title, description, targetSku, targetQuantity, deadline, reward } = req.body || {};
  if (!title || !targetSku || !targetQuantity || !deadline) return res.status(400).json({ error: "missing_fields" });
  const bf = {
    id: crypto.randomUUID(),
    title,
    description: description || "",
    targetSku,
    targetQuantity: Number(targetQuantity),
    currentQuantity: 0,
    deadline: new Date(deadline).toISOString(),
    reward: reward || "",
    active: false,
  };
  state.bossFights.push(bf);
  notifyAllManagers(`Новый Team Challenge: ${bf.title}`, "quest");
  save();
  res.status(201).json({ id: bf.id });
});

router.put("/boss-fights/:id", (req, res) => {
  const bf = state.bossFights.find((b) => b.id === req.params.id);
  if (!bf) return res.status(404).json({ error: "not_found" });
  const { title, description, targetSku, targetQuantity, deadline, reward } = req.body || {};
  if (title !== undefined) bf.title = title;
  if (description !== undefined) bf.description = description;
  if (targetSku !== undefined) bf.targetSku = targetSku;
  if (targetQuantity !== undefined) bf.targetQuantity = Number(targetQuantity) || bf.targetQuantity;
  if (deadline !== undefined) bf.deadline = new Date(deadline).toISOString();
  if (reward !== undefined) bf.reward = reward;
  save();
  res.status(204).end();
});

router.delete("/boss-fights/:id", (req, res) => {
  state.bossFights = state.bossFights.filter((b) => b.id !== req.params.id);
  save();
  res.status(204).end();
});

// ---- rewards shop (admin-managed catalog) ---------------------------------
router.get("/rewards", (_req, res) => {
  res.json({ rewards: state.rewards });
});

router.post("/rewards", (req, res) => {
  const { name, description, costCoins, icon } = req.body || {};
  if (!name || !costCoins) return res.status(400).json({ error: "missing_fields" });
  const reward = {
    id: crypto.randomUUID(),
    name,
    description: description || "",
    costCoins: Number(costCoins),
    icon: icon || "gift",
  };
  state.rewards.push(reward);
  save();
  res.status(201).json({ id: reward.id });
});

router.put("/rewards/:id", (req, res) => {
  const reward = state.rewards.find((r) => r.id === req.params.id);
  if (!reward) return res.status(404).json({ error: "not_found" });
  const { name, description, costCoins, icon } = req.body || {};
  if (name !== undefined) reward.name = name;
  if (description !== undefined) reward.description = description;
  if (costCoins !== undefined) reward.costCoins = Number(costCoins) || reward.costCoins;
  if (icon !== undefined) reward.icon = icon;
  save();
  res.status(204).end();
});

router.delete("/rewards/:id", (req, res) => {
  state.rewards = state.rewards.filter((r) => r.id !== req.params.id);
  save();
  res.status(204).end();
});

// ---- resets ------------------------------------------------------------
function resetManagerFields(a) {
  a.level = 1;
  a.xp = 0;
  a.coins = 0;
  a.totalCashBonus = 0;
  a.questsCompleted = 0;
  a.streak = 0;
  a.lastSaleDate = null;
}

/** Clears every activity record tied to one account — otherwise Analytics/History/Ledger keep showing "reset" data forever, reading straight from these logs regardless of what the account fields say. */
function clearAccountActivity(accountId) {
  state.sales = state.sales.filter((s) => s.accountId !== accountId);
  state.xpLedger = state.xpLedger.filter((e) => e.accountId !== accountId);
  state.notifications = state.notifications.filter((n) => n.accountId !== accountId);
  state.personalTaskEntries = state.personalTaskEntries.filter((e) => {
    const task = state.personalTasks.find((t) => t.id === e.taskId);
    return !task || task.assigneeId !== accountId;
  });
  state.redemptions = state.redemptions.filter((r) => r.accountId !== accountId);
}

router.post("/reset/manager/:id", (req, res) => {
  const account = state.accounts.find((a) => a.id === req.params.id);
  if (account) {
    resetManagerFields(account);
    clearAccountActivity(account.id);
  }
  save();
  res.status(204).end();
});

router.post("/reset/managers", (_req, res) => {
  const managers = state.accounts.filter((a) => a.role !== "rop" && a.role !== "admin");
  managers.forEach((a) => {
    resetManagerFields(a);
    clearAccountActivity(a.id);
  });
  save();
  res.status(204).end();
});

router.post("/reset/stock", (_req, res) => {
  state.products.forEach((p) => {
    p.stock = p.initialStock;
    p.soldCount = 0;
  });
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

router.post("/recompute-categories", (_req, res) => {
  // Backfills existing products (from before category was a controlled
  // dropdown) onto the same fixed buckets the photo search relies on.
  // SKU prefix is checked first when the text-based guess is "General" —
  // for a Hikvision-style catalog it's a much more reliable signal than
  // the free-text category or marketing name.
  const { normalizeCategory, categoryFromSku } = require("../categories");
  let changed = 0;
  for (const p of state.products) {
    let next = normalizeCategory(p.category);
    if (next === "General") {
      next = categoryFromSku(p.sku) || "General";
    }
    if (next !== p.category) {
      p.category = next;
      changed++;
    }
  }
  save();
  res.json({ changed });
});

router.post("/recompute-priorities", (_req, res) => {
  // Fixes the fallout of the old buggy import logic (missing margin data
  // used to force everything to "critical"). Stock-volume only, matching
  // the corrected client-side guessPriority.
  let changed = 0;
  for (const fp of state.focusProducts) {
    const product = state.products.find((p) => p.id === fp.productId);
    if (!product) continue;
    const next = product.stock >= 100 ? "critical" : product.stock >= 40 ? "high" : "normal";
    if (next !== fp.priority) {
      fp.priority = next;
      changed++;
    }
  }
  save();
  res.json({ changed });
});

router.post("/recompute-achievements", (_req, res) => {
  // Backfills achievements against sales that happened before this logic
  // existed — without this, only sales made AFTER the fix would ever
  // trigger an unlock check.
  const { checkAndUnlockAchievements } = require("../achievements");
  let totalUnlocked = 0;
  for (const account of state.accounts.filter((a) => a.role === "manager")) {
    totalUnlocked += checkAndUnlockAchievements(state, account).length;
  }
  save();
  res.json({ totalUnlocked });
});

router.post("/reset/all", (_req, res) => {
  state.accounts.filter((a) => a.role !== "rop" && a.role !== "admin").forEach(resetManagerFields);
  state.products.forEach((p) => {
    p.stock = p.initialStock;
    p.soldCount = 0;
  });
  state.bossFights.forEach((bf) => { bf.currentQuantity = 0; });
  state.accountAchievements = [];
  // These are all activity logs derived from sales — Analytics, History,
  // and the Ledger read straight from them, so a "full reset" that leaves
  // them in place looks like it didn't do anything at all.
  state.sales = [];
  state.xpLedger = [];
  state.notifications = [];
  state.redemptions = [];
  state.personalTaskEntries = [];
  state.personalTasks.forEach((t) => {
    t.status = "active";
    t.rewardGranted = false;
  });
  save();
  res.status(204).end();
});

// ---- company-wide analytics ------------------------------------------
router.get("/analytics", (_req, res) => {
  function isoWeekKey(iso) {
    const d = new Date(iso);
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  const byWeek = {};
  for (const s of state.sales) {
    const key = isoWeekKey(s.createdAt);
    if (!byWeek[key]) byWeek[key] = { week: key, units: 0, xp: 0, revenue: 0 };
    byWeek[key].units += s.quantity;
    byWeek[key].xp += s.xpEarned;
    const product = state.products.find((p) => p.id === s.productId);
    byWeek[key].revenue += s.dealValue || (product ? product.price * s.quantity : 0);
  }
  const salesByWeek = Object.values(byWeek).sort((a, b) => a.week.localeCompare(b.week));

  const topProducts = [...state.products]
    .filter((p) => (p.soldCount || 0) > 0)
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 8)
    .map((p) => ({ name: p.name, sku: p.sku, units: p.soldCount || 0 }));

  const totalUnits = state.products.reduce((a, p) => a + (p.soldCount || 0), 0);
  const totalRevenue = state.sales.reduce((a, s) => {
    const product = state.products.find((p) => p.id === s.productId);
    return a + (s.dealValue || (product ? product.price * s.quantity : 0));
  }, 0);
  const totalXp = state.accounts.filter((a) => a.role === "manager").reduce((a, m) => a + m.xp, 0);
  const totalCoinsAwarded = state.sales.reduce((a, s) => a + s.coinsEarned, 0);
  const totalCashPaid = state.sales.reduce((a, s) => a + (s.cashEarned || 0), 0);
  const totalDeals = state.sales.length;

  const byManager = state.accounts
    .filter((a) => a.role === "manager")
    .map((a) => {
      const mySales = state.sales.filter((s) => s.accountId === a.id);
      const revenue = mySales.reduce((sum, s) => {
        const product = state.products.find((p) => p.id === s.productId);
        return sum + (s.dealValue || (product ? product.price * s.quantity : 0));
      }, 0);
      return {
        accountId: a.id,
        name: a.name,
        units: mySales.reduce((sum, s) => sum + s.quantity, 0),
        revenue,
        deals: mySales.length,
        xpEarned: mySales.reduce((sum, s) => sum + s.xpEarned, 0),
        coinsEarned: mySales.reduce((sum, s) => sum + s.coinsEarned, 0),
      };
    })
    .filter((m) => m.deals > 0)
    .sort((a, b) => b.revenue - a.revenue);

  res.json({ salesByWeek, topProducts, byManager, totalUnits, totalRevenue, totalXp, totalCoinsAwarded, totalCashPaid, totalDeals });
});

module.exports = router;
