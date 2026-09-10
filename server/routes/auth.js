const express = require("express");
const crypto = require("node:crypto");
const { state, save } = require("../db");
const { hashPassword, verifyPassword, createSession, setSessionCookie, clearSessionCookie, requireAuth } = require("../auth");

const router = express.Router();

function toPublicAccount(a) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    status: a.status,
    avatar: a.avatar,
    avatarUrl: a.avatarUrl || null,
    department: a.department || "Продажи",
    createdAt: a.createdAt || null,
    monthlyTarget: a.monthlyTarget || 0,
    notifyPrefs: a.notifyPrefs || { inApp: true, email: false, telegram: false },
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

  const token = createSession(account, req.headers["user-agent"]);
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

  const token = createSession(account, req.headers["user-agent"]);
  setSessionCookie(res, token);
  res.json({ account: toPublicAccount(account) });
});

router.post("/logout", requireAuth, (req, res) => {
  state.sessions = state.sessions.filter((s) => s.id !== req.auth.sessionId);
  save();
  clearSessionCookie(res);
  res.status(204).end();
});

router.get("/me", requireAuth, (req, res) => {
  const account = state.accounts.find((a) => a.id === req.auth.id);
  if (!account) return res.status(401).json({ error: "not_found" });
  res.json({ account: toPublicAccount(account) });
});

// ---- password change -------------------------------------------------
router.post("/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const account = state.accounts.find((a) => a.id === req.auth.id);
  if (!account) return res.status(404).json({ error: "not_found" });

  if (!currentPassword || !verifyPassword(currentPassword, account.passwordHash)) {
    return res.status(401).json({ error: "invalid_current_password" });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "weak_password" });
  }

  account.passwordHash = hashPassword(newPassword);
  save();
  res.status(204).end();
});

// ---- sessions (active devices) -----------------------------------------
router.get("/sessions", requireAuth, (req, res) => {
  const sessions = state.sessions
    .filter((s) => s.accountId === req.auth.id)
    .map((s) => ({ ...s, current: s.id === req.auth.sessionId }));
  res.json({ sessions });
});

router.post("/sessions/logout-others", requireAuth, (req, res) => {
  state.sessions = state.sessions.filter((s) => s.accountId !== req.auth.id || s.id === req.auth.sessionId);
  save();
  res.status(204).end();
});

router.post("/sessions/logout-all", requireAuth, (req, res) => {
  state.sessions = state.sessions.filter((s) => s.accountId !== req.auth.id);
  save();
  clearSessionCookie(res);
  res.status(204).end();
});

module.exports = { router, toPublicAccount };
