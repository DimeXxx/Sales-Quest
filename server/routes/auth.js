const express = require("express");
const crypto = require("node:crypto");
const db = require("../db");
const { hashPassword, verifyPassword, signSession, setSessionCookie, clearSessionCookie, requireAuth } = require("../auth");

const router = express.Router();

function toPublicAccount(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    avatar: row.avatar,
    level: row.level,
    xp: row.xp,
    coins: row.coins,
    questsCompleted: row.quests_completed,
    streak: row.streak,
  };
}

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = db.prepare("SELECT id FROM accounts WHERE email = ?").get(normalizedEmail);
  if (existing) return res.status(409).json({ error: "email_taken" });

  const id = crypto.randomUUID();
  // Role is always "manager" — self-registration can never grant ROP/admin
  // access. Promoting someone to ROP is an admin-only action.
  db.prepare(`
    INSERT INTO accounts (id, name, email, password_hash, role, status, avatar, level, xp, coins, quests_completed, streak)
    VALUES (?, ?, ?, ?, 'manager', 'pending', ?, 1, 0, 0, 0, 0)
  `).run(id, name, normalizedEmail, hashPassword(password), initials(name));

  const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(id);
  const token = signSession(account);
  setSessionCookie(res, token);
  res.status(201).json({ account: toPublicAccount(account) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "missing_fields" });

  const normalizedEmail = String(email).trim().toLowerCase();
  const account = db.prepare("SELECT * FROM accounts WHERE email = ?").get(normalizedEmail);
  if (!account || !verifyPassword(password, account.password_hash)) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = signSession(account);
  setSessionCookie(res, token);
  res.json({ account: toPublicAccount(account) });
});

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get("/me", requireAuth, (req, res) => {
  const account = db.prepare("SELECT * FROM accounts WHERE id = ?").get(req.auth.id);
  if (!account) return res.status(401).json({ error: "not_found" });
  res.json({ account: toPublicAccount(account) });
});

module.exports = { router, toPublicAccount };
