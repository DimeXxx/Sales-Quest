const express = require("express");
const crypto = require("node:crypto");
const db = require("../db");
const { requireAuth } = require("../auth");
const { toPublicAccount } = require("./auth");

const router = express.Router();
router.use(requireAuth);

// ---- quests (active focus products joined with product info) ------------
router.get("/quests", (_req, res) => {
  const rows = db.prepare(`
    SELECT fp.id AS focusProductId, fp.priority, fp.xp_reward AS xpReward, fp.coin_reward AS coinReward,
           p.id AS productId, p.name, p.sku, p.category, p.description, p.price, p.stock, p.initial_stock AS initialStock, p.image_url AS imageUrl
    FROM focus_products fp
    JOIN products p ON p.id = fp.product_id
    WHERE fp.active = 1
  `).all();

  res.json({
    quests: rows.map((r) => ({
      focusProductId: r.focusProductId,
      priority: r.priority,
      xpReward: r.xpReward,
      coinReward: r.coinReward,
      product: {
        id: r.productId,
        name: r.name,
        sku: r.sku,
        category: r.category,
        description: r.description,
        price: r.price,
        stock: r.stock,
        initialStock: r.initialStock,
        imageUrl: r.imageUrl,
      },
    })),
  });
});

// ---- register a sale ------------------------------------------------------
router.post("/sales", (req, res) => {
  const { focusProductId, quantity } = req.body || {};
  const qty = Math.max(1, Number(quantity) || 1);

  const fp = db.prepare("SELECT * FROM focus_products WHERE id = ? AND active = 1").get(focusProductId);
  if (!fp) return res.status(404).json({ error: "quest_not_found" });

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(fp.product_id);
  if (!product || product.stock <= 0) return res.status(400).json({ error: "sold_out" });

  const clampedQty = Math.min(qty, product.stock);
  const xpEarned = fp.xp_reward * clampedQty;
  const coinsEarned = fp.coin_reward * clampedQty;

  const tx = db.transaction(() => {
    db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(clampedQty, product.id);

    const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(req.auth.id);
    const newXp = account.xp + xpEarned;
    const newLevel = Math.floor(newXp / 1000) + 1;
    db.prepare(`
      UPDATE accounts SET xp = ?, coins = coins + ?, quests_completed = quests_completed + 1, level = ? WHERE id = ?
    `).run(newXp, coinsEarned, newLevel, account.id);

    db.prepare(`
      UPDATE boss_fights SET current_quantity = MIN(target_quantity, current_quantity + ?)
      WHERE active = 1 AND target_sku = ?
    `).run(clampedQty, product.sku);

    db.prepare(`
      INSERT INTO sales (id, account_id, focus_product_id, quantity, xp_earned, coins_earned)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), account.id, focusProductId, clampedQty, xpEarned, coinsEarned);

    return { newXp, newLevel, prevLevel: Math.floor(account.xp / 1000) + 1 };
  });

  const result = tx();
  const updatedAccount = db.prepare("SELECT * FROM accounts WHERE id = ?").get(req.auth.id);

  res.json({
    xpEarned,
    coinsEarned,
    leveledUp: result.newLevel > result.prevLevel,
    newLevel: result.newLevel,
    account: toPublicAccount(updatedAccount),
  });
});

// ---- rewards ---------------------------------------------------------------
router.get("/rewards", (_req, res) => {
  const rewards = db.prepare("SELECT id, name, description, cost_coins AS costCoins, icon FROM rewards").all();
  res.json({ rewards });
});

router.post("/rewards/:id/redeem", (req, res) => {
  const reward = db.prepare("SELECT * FROM rewards WHERE id = ?").get(req.params.id);
  if (!reward) return res.status(404).json({ error: "reward_not_found" });

  const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(req.auth.id);
  if (account.coins < reward.cost_coins) return res.status(400).json({ error: "not_enough_coins" });

  db.prepare("UPDATE accounts SET coins = coins - ? WHERE id = ?").run(reward.cost_coins, account.id);
  db.prepare(`INSERT INTO redemptions (id, account_id, reward_id, cost_coins) VALUES (?, ?, ?, ?)`).run(
    crypto.randomUUID(), account.id, reward.id, reward.cost_coins
  );

  const updated = db.prepare("SELECT * FROM accounts WHERE id = ?").get(account.id);
  res.json({ account: toPublicAccount(updated) });
});

// ---- boss fights -------------------------------------------------------
router.get("/boss-fights", (_req, res) => {
  const rows = db.prepare(`
    SELECT id, title, description, target_sku AS targetSku, target_quantity AS targetQuantity,
           current_quantity AS currentQuantity, deadline, reward, active
    FROM boss_fights
  `).all();
  res.json({ bossFights: rows.map((r) => ({ ...r, active: Boolean(r.active) })) });
});

// ---- achievements --------------------------------------------------------
router.get("/achievements", (req, res) => {
  const rows = db.prepare(`
    SELECT a.id, a.name, a.description, a.icon,
           EXISTS(SELECT 1 FROM account_achievements aa WHERE aa.account_id = ? AND aa.achievement_id = a.id) AS unlocked
    FROM achievements a
  `).all(req.auth.id);
  res.json({ achievements: rows.map((r) => ({ ...r, unlocked: Boolean(r.unlocked) })) });
});

// ---- leaderboard ----------------------------------------------------------
router.get("/leaderboard", (_req, res) => {
  const rows = db.prepare(`
    SELECT id, name, avatar, role, level, xp, coins, quests_completed AS questsCompleted, streak
    FROM accounts WHERE status = 'approved' ORDER BY xp DESC
  `).all();
  res.json({ managers: rows });
});

module.exports = router;
