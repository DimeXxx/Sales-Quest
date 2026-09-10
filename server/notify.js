const crypto = require("node:crypto");
const { state } = require("./db");

/** Pushes an in-app notification for one account. Does not call save() — the caller's own save() covers it. */
function notify(accountId, message, type = "info") {
  state.notifications.push({
    id: crypto.randomUUID(),
    accountId,
    message,
    type, // 'sale' | 'xp' | 'quest' | 'personal_task' | 'info'
    read: false,
    createdAt: new Date().toISOString(),
  });
}

function notifyAllManagers(message, type = "info") {
  for (const a of state.accounts.filter((a) => a.role === "manager" && a.status === "approved")) {
    notify(a.id, message, type);
  }
}

/** Records an XP/Coins change in the audit ledger so "История начислений" has real data. */
function logXpLedger(accountId, source, xpDelta, coinsDelta, note = "") {
  state.xpLedger.push({
    id: crypto.randomUUID(),
    accountId,
    source, // 'sale' | 'personal_task' | 'rop_bonus'
    xpDelta,
    coinsDelta,
    note,
    createdAt: new Date().toISOString(),
  });
}

module.exports = { notify, notifyAllManagers, logXpLedger };
