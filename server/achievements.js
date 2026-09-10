// ---------------------------------------------------------------------------
// Achievement unlock logic. Each achievement's condition is checked against
// real state (sales log, account stats, product stock) — nothing here is
// decorative. Call checkAndUnlockAchievements(account) after anything that
// could satisfy a condition (a sale, mainly); it unlocks whatever newly
// qualifies and returns the list of achievement ids just unlocked.
// ---------------------------------------------------------------------------

function isWeekend(iso) {
  const day = new Date(iso).getDay();
  return day === 0 || day === 6;
}

function checkAndUnlockAchievements(state, account) {
  const mySales = state.sales.filter((s) => s.accountId === account.id);
  const alreadyUnlocked = new Set(
    state.accountAchievements.filter((aa) => aa.accountId === account.id).map((aa) => aa.achievementId)
  );

  const totalUnits = mySales.reduce((a, s) => a + s.quantity, 0);
  const weekendSales = mySales.filter((s) => isWeekend(s.createdAt)).length;

  const bossFightSkus = new Set(state.bossFights.map((b) => b.targetSku));
  const soldTowardBossFight = mySales.some((s) => {
    const product = state.products.find((p) => p.id === s.productId);
    return product && bossFightSkus.has(product.sku);
  });

  const soldCriticalHalfCleared = mySales.some((s) => {
    const product = state.products.find((p) => p.id === s.productId);
    if (!product) return false;
    const fp = state.focusProducts.find((f) => f.productId === product.id);
    if (!fp || fp.priority !== "critical") return false;
    return product.initialStock > 0 && product.stock <= product.initialStock * 0.5;
  });

  const approvedManagers = state.accounts.filter((a) => a.role === "manager" && a.status === "approved");
  const rank = [...approvedManagers].sort((a, b) => b.xp - a.xp).findIndex((a) => a.id === account.id) + 1;

  const CONDITIONS = {
    a1: account.questsCompleted >= 1,
    a2: account.questsCompleted >= 10,
    a3: totalUnits >= 50,
    a4: weekendSales >= 10,
    a5: soldTowardBossFight,
    a6: soldCriticalHalfCleared,
    a7: account.streak >= 7,
    a8: rank >= 1 && rank <= 3,
    a9: account.coins >= 250,
    a10: account.level >= 5,
  };

  const newlyUnlocked = [];
  for (const [id, met] of Object.entries(CONDITIONS)) {
    if (met && !alreadyUnlocked.has(id)) {
      state.accountAchievements.push({ accountId: account.id, achievementId: id, unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(id);
    }
  }
  return newlyUnlocked;
}

module.exports = { checkAndUnlockAchievements };
