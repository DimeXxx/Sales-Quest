const express = require("express");
const crypto = require("node:crypto");
const { state, save } = require("../db");
const { hashPassword, verifyPassword, signSession, setSessionCookie, clearSessionCookie, requireAuth } = require("../auth");

const router = express.Router();

function toPublicAccount(a) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    status: a.status,
    avatar: a.avatar,
    level: a.level,
    xp: a.xp,
    coins: a.coins,
    totalCashBonus: a.totalCashBonus || 0,
    questsCompleted: a.questsCompleted,
    streak: a.streak,
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

  if (state.accounts.some((a) => a.email === normalizedEmail)) {
    return res.status(409).json({ error: "email_taken" });
  }

  // Role is always "manager" — self-registration can never grant ROP/admin
  // access. Promoting someone to ROP is an admin-only action.
  const account = {
    id: crypto.randomUUID(),
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: "manager",
    status: "pending",
    avatar: initials(name),
    level: 1,
    xp: 0,
    coins: 0,
    questsCompleted: 0,
    streak: 0,
  };
  state.accounts.push(account);
  save();

  const token = signSession(account);
  setSessionCookie(res, token);
  res.status(201).json({ account: toPublicAccount(account) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "missing_fields" });

  const normalizedEmail = String(email).trim().toLowerCase();
  const account = state.accounts.find((a) => a.email === normalizedEmail);
  if (!account || !verifyPassword(password, account.passwordHash)) {
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
  const account = state.accounts.find((a) => a.id === req.auth.id);
  if (!account) return res.status(401).json({ error: "not_found" });
  res.json({ account: toPublicAccount(account) });
});

module.exports = { router, toPublicAccount };
