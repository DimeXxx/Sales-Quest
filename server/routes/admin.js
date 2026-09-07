const express = require("express");
const crypto = require("node:crypto");
const db = require("../db");
const { requireAuth, requireRole } = require("../auth");
const { toPublicAccount } = require("./auth");

const router = express.Router();
router.use(requireAuth, requireRole("rop", "admin"));

// ---- pending account approvals -------------------------------------------
router.get("/accounts", (_req, res) => {
  const rows = db.prepare(`
    SELECT id, name, email, role, status, avatar, level, xp, coins, quests_completed AS questsCompleted, streak
    FROM accounts ORDER BY status ASC, name ASC
  `).all();
  res.json({ accounts: rows });
});

router.post("/accounts/:id/approve", (req, res) => {
  const info = db.prepare("UPDATE accounts SET status = 'approved' WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "not_found" });
  res.status(204).end();
});

router.post("/accounts/:id/reject", (req, res) => {
  // A rejected pending signup is simply removed — approved accounts can't be rejected this way.
  const info = db.prepare("DELETE FROM accounts WHERE id = ? AND status = 'pending'").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "not_found" });
  res.status(204).end();
});

router.post("/accounts/:id/role", (req, res) => {
  const { role } = req.body || {};
  if (!["manager", "rop"].includes(role)) return res.status(400).json({ error: "invalid_role" });
  db.prepare("UPDATE accounts SET role = ? WHERE id = ?").run(role, req.params.id);
  res.status(204).end();
});

router.post("/accounts/:id/adjust", (req, res) => {
  const { coins = 0, xp = 0 } = req.body || {};
  const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(req.params.id);
  if (!account) return res.status(404).json({ error: "not_found" });
  const newXp = Math.max(0, account.xp + Number(xp));
  const newCoins = Math.max(0, account.coins + Number(coins));
  const newLevel = Math.floor(newXp / 1000) + 1;
  db.prepare("UPDATE accounts SET xp = ?, coins = ?, level = ? WHERE id = ?").run(newXp, newCoins, newLevel, account.id);
  res.json({ account: toPublicAccount(db.prepare("SELECT * FROM accounts WHERE id = ?").get(account.id)) });
});

// ---- inventory / focus products -------------------------------------------
router.get("/inventory", (_req, res) => {
  const rows = db.prepare(`
    SELECT fp.id AS focusProductId, fp.priority, fp.xp_reward AS xpReward, fp.coin_reward AS coinReward,
           p.id AS productId, p.name, p.sku, p.category, p.price, p.stock, p.initial_stock AS initialStock, p.image_url AS imageUrl
    FROM focus_products fp JOIN products p ON p.id = fp.product_id
  `).all();
  res.json({ rows });
});

router.post("/focus-products", (req, res) => {
  const { name, sku, category, description, price, stock, priority, xpReward, coinReward, imageUrl } = req.body || {};
  if (!name || !sku || !stock) return res.status(400).json({ error: "missing_fields" });

  const productId = crypto.randomUUID();
  const focusId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO products (id, name, sku, category, description, price, stock, initial_stock, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(productId, name, sku, category || "General", description || "", Number(price) || 0, Number(stock), Number(stock), imageUrl || null);

  db.prepare(`
    INSERT INTO focus_products (id, product_id, priority, xp_reward, coin_reward, active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(focusId, productId, priority, Number(xpReward) || 0, Number(coinReward) || 0);

  res.status(201).json({ focusProductId: focusId, productId });
});

router.post("/focus-products/bulk", (req, res) => {
  const rows = req.body?.rows || [];
  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, sku, category, description, price, stock, initial_stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `);
  const insertFocus = db.prepare(`
    INSERT INTO focus_products (id, product_id, priority, xp_reward, coin_reward, active) VALUES (?, ?, ?, ?, ?, 1)
  `);
  const tx = db.transaction((items) => {
    for (const row of items) {
      const productId = crypto.randomUUID();
      const focusId = crypto.randomUUID();
      insertProduct.run(productId, row.name, row.sku, row.category || "General", row.description || "", Number(row.price) || 0, Number(row.stock), Number(row.stock));
      // Simple priority-based reward, matching the client-side Reward Engine defaults.
      const base = { critical: [300, 120], high: [250, 100], normal: [100, 35] }[row.priority] || [100, 35];
      insertFocus.run(focusId, productId, row.priority, base[0], base[1]);
    }
  });
  tx(rows);
  res.status(201).json({ imported: rows.length });
});

router.delete("/focus-products/:id", (req, res) => {
  db.prepare("UPDATE focus_products SET active = 0 WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

// ---- boss fights -----------------------------------------------------------
router.post("/boss-fights/:id/toggle", (req, res) => {
  const bf = db.prepare("SELECT active FROM boss_fights WHERE id = ?").get(req.params.id);
  if (!bf) return res.status(404).json({ error: "not_found" });
  db.prepare("UPDATE boss_fights SET active = ? WHERE id = ?").run(bf.active ? 0 : 1, req.params.id);
  res.status(204).end();
});

// ---- resets ------------------------------------------------------------
router.post("/reset/manager/:id", (req, res) => {
  db.prepare("UPDATE accounts SET level = 1, xp = 0, coins = 0, quests_completed = 0, streak = 0 WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

router.post("/reset/managers", (_req, res) => {
  db.prepare("UPDATE accounts SET level = 1, xp = 0, coins = 0, quests_completed = 0, streak = 0 WHERE role != 'rop' AND role != 'admin'").run();
  res.status(204).end();
});

router.post("/reset/stock", (_req, res) => {
  db.prepare("UPDATE products SET stock = initial_stock").run();
  res.status(204).end();
});

router.post("/reset/boss-fights", (_req, res) => {
  db.prepare("UPDATE boss_fights SET current_quantity = 0").run();
  res.status(204).end();
});

router.post("/reset/achievements", (_req, res) => {
  db.prepare("DELETE FROM account_achievements").run();
  res.status(204).end();
});

router.post("/reset/all", (_req, res) => {
  const tx = db.transaction(() => {
    db.prepare("UPDATE accounts SET level = 1, xp = 0, coins = 0, quests_completed = 0, streak = 0 WHERE role != 'rop' AND role != 'admin'").run();
    db.prepare("UPDATE products SET stock = initial_stock").run();
    db.prepare("UPDATE boss_fights SET current_quantity = 0").run();
    db.prepare("DELETE FROM account_achievements").run();
  });
  tx();
  res.status(204).end();
});

module.exports = router;
