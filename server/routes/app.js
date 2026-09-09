const express = require("express");
const crypto = require("node:crypto");
const { state, save } = require("../db");
const { requireAuth } = require("../auth");
const { toPublicAccount } = require("./auth");
const { computeSaleReward } = require("../rewardEngine");

const router = express.Router();
router.use(requireAuth);

// ---- quests (active focus products joined with product info) ------------
router.get("/quests", (req, res) => {
  const quests = state.focusProducts
    .filter((fp) => fp.active)
    .map((fp) => {
      const product = state.products.find((p) => p.id === fp.productId);
      if (!product) return null;
      const mySold = state.sales
        .filter((s) => s.focusProductId === fp.id && s.accountId === req.auth.id)
        .reduce((a, s) => a + s.quantity, 0);
      const daysInStock = fp.createdAt ? Math.floor((Date.now() - new Date(fp.createdAt).getTime()) / 86400000) : 0;
      return {
        focusProductId: fp.id,
        priority: fp.priority,
        xpReward: fp.xpReward,
        coinReward: fp.coinReward,
        cashBonus: fp.cashBonus || 0,
        daysInStock,
        mySold,
        product,
      };
    })
    .filter(Boolean);
  res.json({ quests });
});

// ---- register a sale ------------------------------------------------------
router.post("/sales", (req, res) => {
  const { focusProductId, quantity, customer, dealValue } = req.body || {};
  const qty = Math.max(1, Number(quantity) || 1);

  const fp = state.focusProducts.find((f) => f.id === focusProductId && f.active);
  if (!fp) return res.status(404).json({ error: "quest_not_found" });

  const product = state.products.find((p) => p.id === fp.productId);
  if (!product || product.stock <= 0) return res.status(400).json({ error: "sold_out" });

  const clampedQty = Math.min(qty, product.stock);
  const account = state.accounts.find((a) => a.id === req.auth.id);
  const { xpEarned, coinsEarned, cashEarned, volMult, ageMult, streakMult } = computeSaleReward(fp, clampedQty, account);

  product.stock -= clampedQty;
  product.soldCount = (product.soldCount || 0) + clampedQty;

  const prevLevel = Math.floor(account.xp / 1000) + 1;
  account.xp += xpEarned;
  account.coins += coinsEarned;
  account.totalCashBonus = Math.round(((account.totalCashBonus || 0) + cashEarned) * 100) / 100;
  account.questsCompleted += 1;
  account.level = Math.floor(account.xp / 1000) + 1;

  const bf = state.bossFights.find((b) => b.active && b.targetSku === product.sku);
  if (bf) bf.currentQuantity = Math.min(bf.targetQuantity, bf.currentQuantity + clampedQty);

  state.sales.push({
    id: crypto.randomUUID(),
    accountId: account.id,
    focusProductId,
    productId: product.id,
    quantity: clampedQty,
    xpEarned,
    coinsEarned,
    cashEarned,
    customer: customer ? String(customer).trim() : null,
    dealValue: dealValue !== undefined && dealValue !== "" ? Number(dealValue) || 0 : null,
    createdAt: new Date().toISOString(),
  });

  save();

  res.json({
    xpEarned,
    coinsEarned,
    cashEarned,
    leveledUp: account.level > prevLevel,
    newLevel: account.level,
    multipliers: { volume: volMult, age: ageMult, streak: streakMult },
    account: toPublicAccount(account),
  });
});

// ---- rewards ---------------------------------------------------------------
router.get("/rewards", (_req, res) => {
  res.json({ rewards: state.rewards });
});

router.post("/rewards/:id/redeem", (req, res) => {
  const reward = state.rewards.find((r) => r.id === req.params.id);
  if (!reward) return res.status(404).json({ error: "reward_not_found" });

  const account = state.accounts.find((a) => a.id === req.auth.id);
  if (account.coins < reward.costCoins) return res.status(400).json({ error: "not_enough_coins" });

  account.coins -= reward.costCoins;
  state.redemptions.push({
    id: crypto.randomUUID(),
    accountId: account.id,
    rewardId: reward.id,
    costCoins: reward.costCoins,
    createdAt: new Date().toISOString(),
  });
  save();

  res.json({ account: toPublicAccount(account) });
});

// ---- boss fights -------------------------------------------------------
router.get("/boss-fights", (_req, res) => {
  res.json({ bossFights: state.bossFights });
});

// ---- achievements --------------------------------------------------------
router.get("/achievements", (req, res) => {
  const unlockedIds = new Set(
    state.accountAchievements.filter((aa) => aa.accountId === req.auth.id).map((aa) => aa.achievementId)
  );
  const achievements = state.achievements.map((a) => ({ ...a, unlocked: unlockedIds.has(a.id) }));
  res.json({ achievements });
});

// ---- leaderboard ----------------------------------------------------------
router.get("/leaderboard", (_req, res) => {
  const managers = state.accounts
    .filter((a) => a.status === "approved")
    .map((a) => ({
      id: a.id,
      name: a.name,
      avatar: a.avatar,
      role: a.role,
      level: a.level,
      xp: a.xp,
      coins: a.coins,
      totalCashBonus: a.totalCashBonus || 0,
      questsCompleted: a.questsCompleted,
      streak: a.streak,
    }))
    .sort((a, b) => b.xp - a.xp);
  res.json({ managers });
});

// ---- personal analytics ----------------------------------------------
router.get("/my-analytics", (req, res) => {
  const mySales = state.sales.filter((s) => s.accountId === req.auth.id);

  // Bucket by ISO week (YYYY-Www) so "sales by week" reflects real activity,
  // not fabricated data — weeks with no sales simply don't appear.
  function isoWeekKey(iso) {
    const d = new Date(iso);
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  const byWeek = {};
  for (const s of mySales) {
    const key = isoWeekKey(s.createdAt);
    if (!byWeek[key]) byWeek[key] = { week: key, units: 0, xp: 0, coins: 0, deals: 0 };
    byWeek[key].units += s.quantity;
    byWeek[key].xp += s.xpEarned;
    byWeek[key].coins += s.coinsEarned;
    byWeek[key].deals += 1;
  }
  const salesByWeek = Object.values(byWeek).sort((a, b) => a.week.localeCompare(b.week));

  const byProduct = {};
  for (const s of mySales) {
    const product = state.products.find((p) => p.id === s.productId);
    if (!product) continue;
    if (!byProduct[product.id]) byProduct[product.id] = { name: product.name, sku: product.sku, units: 0 };
    byProduct[product.id].units += s.quantity;
  }
  const topProducts = Object.values(byProduct).sort((a, b) => b.units - a.units).slice(0, 8);

  const totalUnits = mySales.reduce((a, s) => a + s.quantity, 0);
  const totalDealValue = mySales.reduce((a, s) => a + (s.dealValue || 0), 0);
  const totalDeals = mySales.length;

  res.json({ salesByWeek, topProducts, totalUnits, totalDealValue, totalDeals });
});

module.exports = router;
