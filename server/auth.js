const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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

function signSession(account) {
  return jwt.sign({ sub: account.id, role: account.role }, JWT_SECRET, { expiresIn: "30d" });
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

/** Reads the session cookie, verifies it, and attaches { id, role } to req.auth. 401s if missing/invalid. */
function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "not_authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = { id: payload.sub, role: payload.role };
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

module.exports = { hashPassword, verifyPassword, signSession, setSessionCookie, clearSessionCookie, requireAuth, requireRole, COOKIE_NAME };
