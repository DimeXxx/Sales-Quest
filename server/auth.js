const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const { state, save } = require("./db");

// In production, set JWT_SECRET as a Railway environment variable. Falling
// back to a fixed dev secret is fine for local testing but must never be
// relied on in a real deployment — the README calls this out.
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
const COOKIE_NAME = "sq_session";

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

/** Creates a real, revocable session record and returns its id + signed token. */
function createSession(account, userAgent) {
  const session = {
    id: crypto.randomUUID(),
    accountId: account.id,
    userAgent: userAgent || "Unknown device",
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
  state.sessions.push(session);
  save();
  const token = jwt.sign({ sub: account.id, role: account.role, sid: session.id }, JWT_SECRET, { expiresIn: "30d" });
  return token;
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

/**
 * Reads the session cookie, verifies the JWT, and confirms the session
 * hasn't been revoked (deleted from state.sessions — e.g. by "logout
 * everywhere"). Attaches { id, role, sessionId } to req.auth.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "not_authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const session = state.sessions.find((s) => s.id === payload.sid);
    if (!session) return res.status(401).json({ error: "session_revoked" });
    session.lastSeenAt = new Date().toISOString();
    req.auth = { id: payload.sub, role: payload.role, sessionId: session.id };
    next();
  } catch {
    return res.status(401).json({ error: "invalid_session" });
  }
}

/** Use after requireAuth. Only allows the listed roles through. */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "forbidden" });
    }
    next();
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  requireRole,
  COOKIE_NAME,
};
