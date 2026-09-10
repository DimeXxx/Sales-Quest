const express = require("express");
const { state, save } = require("../db");
const { requireAuth } = require("../auth");
const { toPublicAccount } = require("./auth");

const router = express.Router();
router.use(requireAuth);

// ---- personal info + avatar --------------------------------------------
router.put("/me/profile", (req, res) => {
  const { name, avatarUrl, department } = req.body || {};
  const account = state.accounts.find((a) => a.id === req.auth.id);
  if (!account) return res.status(404).json({ error: "not_found" });
  if (name !== undefined) account.name = name;
  if (avatarUrl !== undefined) account.avatarUrl = avatarUrl || null;
  if (department !== undefined) account.department = department;
  save();
  res.json({ account: toPublicAccount(account) });
});

router.put("/me/notify-prefs", (req, res) => {
  const { inApp, email, telegram } = req.body || {};
  const account = state.accounts.find((a) => a.id === req.auth.id);
  if (!account) return res.status(404).json({ error: "not_found" });
  account.notifyPrefs = {
    inApp: inApp !== undefined ? Boolean(inApp) : account.notifyPrefs?.inApp ?? true,
    email: email !== undefined ? Boolean(email) : account.notifyPrefs?.email ?? false,
    telegram: telegram !== undefined ? Boolean(telegram) : account.notifyPrefs?.telegram ?? false,
  };
  save();
  res.json({ account: toPublicAccount(account) });
});

// ---- in-app notifications ------------------------------------------------
router.get("/notifications", (req, res) => {
  const list = state.notifications
    .filter((n) => n.accountId === req.auth.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50);
  res.json({ notifications: list, unreadCount: list.filter((n) => !n.read).length });
});

router.post("/notifications/:id/read", (req, res) => {
  const n = state.notifications.find((x) => x.id === req.params.id && x.accountId === req.auth.id);
  if (n) n.read = true;
  save();
  res.status(204).end();
});

router.post("/notifications/read-all", (req, res) => {
  for (const n of state.notifications.filter((x) => x.accountId === req.auth.id)) n.read = true;
  save();
  res.status(204).end();
});

// ---- achievement progress (not just unlocked/locked, real numeric progress) --
router.get("/achievements-progress", (req, res) => {
  const account = state.accounts.find((a) => a.id === req.auth.id);
  const mySales = state.sales.filter((s) => s.accountId === req.auth.id);
  const totalUnits = mySales.reduce((a, s) => a + s.quantity, 0);
  const weekendSales = mySales.filter((s) => {
    const d = new Date(s.createdAt).getDay();
    return d === 0 || d === 6;
  }).length;
  const approvedManagers = state.accounts.filter((a) => a.role === "manager" && a.status === "approved");
  const rank = [...approvedManagers].sort((a, b) => b.xp - a.xp).findIndex((a) => a.id === account.id) + 1;

  const PROGRESS = {
    a1: { current: Math.min(account.questsCompleted, 1), target: 1 },
    a2: { current: Math.min(account.questsCompleted, 10), target: 10 },
    a3: { current: Math.min(totalUnits, 50), target: 50 },
    a4: { current: Math.min(weekendSales, 10), target: 10 },
    a5: { current: 0, target: 1 }, // boolean-style, shown as done/not
    a6: { current: 0, target: 1 },
    a7: { current: Math.min(account.streak, 7), target: 7 },
    a8: { current: rank > 0 && rank <= 3 ? 1 : 0, target: 1 },
    a9: { current: Math.min(account.coins, 250), target: 250 },
    a10: { current: Math.min(account.level, 5), target: 5 },
  };

  const unlockedIds = new Set(
    state.accountAchievements.filter((aa) => aa.accountId === req.auth.id).map((aa) => aa.achievementId)
  );
  const achievements = state.achievements.map((a) => ({
    ...a,
    unlocked: unlockedIds.has(a.id),
    progress: PROGRESS[a.id]?.current ?? 0,
    target: PROGRESS[a.id]?.target ?? 1,
  }));
  res.json({ achievements });
});

// ---- XP/Coins ledger history (paginated, filterable by source) -----------
router.get("/xp-history", (req, res) => {
  const { source, page = "1", pageSize = "20" } = req.query;
  let entries = state.xpLedger.filter((e) => e.accountId === req.auth.id);
  if (source) entries = entries.filter((e) => e.source === source);
  entries = entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const p = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Number(pageSize) || 20);
  const total = entries.length;
  const paged = entries.slice((p - 1) * size, p * size);
  res.json({ entries: paged, total, page: p, pageSize: size });
});

// ---- sales history (paginated) --------------------------------------------
router.get("/sales-history", (req, res) => {
  const { page = "1", pageSize = "20" } = req.query;
  let sales = state.sales
    .filter((s) => s.accountId === req.auth.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const p = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Number(pageSize) || 20);
  const total = sales.length;
  const paged = sales.slice((p - 1) * size, p * size).map((s) => {
    const product = state.products.find((prod) => prod.id === s.productId);
    return {
      ...s,
      productName: product?.name ?? "—",
      sku: product?.sku ?? "—",
      // Regular product sales apply instantly today (no ROP approval gate) —
      // status is always "confirmed", reflecting real current behavior
      // rather than a workflow that doesn't exist yet.
      status: "confirmed",
    };
  });
  res.json({ sales: paged, total, page: p, pageSize: size });
});

// ---- personal KPI dashboard (real numbers from the sales log) -------------
router.get("/my-kpi", (req, res) => {
  const account = state.accounts.find((a) => a.id === req.auth.id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const mySales = state.sales.filter((s) => s.accountId === req.auth.id);
  const thisMonthSales = mySales.filter((s) => new Date(s.createdAt) >= monthStart);

  const revenue = (s) => {
    if (s.dealValue) return s.dealValue;
    const product = state.products.find((p) => p.id === s.productId);
    return product ? product.price * s.quantity : 0;
  };

  const monthRevenue = thisMonthSales.reduce((a, s) => a + revenue(s), 0);
  const totalDealValue = mySales.reduce((a, s) => a + revenue(s), 0);
  const avgDealSize = mySales.length > 0 ? totalDealValue / mySales.length : 0;
  const focusUnitsSold = mySales.reduce((a, s) => a + s.quantity, 0);
  const activeDays = [...new Set(thisMonthSales.map((s) => s.createdAt.slice(0, 10)))];

  res.json({
    monthlyTarget: account.monthlyTarget || 0,
    monthRevenue,
    monthPct: account.monthlyTarget ? Math.min(100, Math.round((monthRevenue / account.monthlyTarget) * 100)) : 0,
    avgDealSize,
    focusUnitsSold,
    totalDeals: mySales.length,
    activeDays,
  });
});

module.exports = router;
