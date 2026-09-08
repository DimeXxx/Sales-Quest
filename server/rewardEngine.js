// ---------------------------------------------------------------------------
// Reward Engine v2 — wholesale-aware. Base XP/Coins per unit come from the
// focus product (priority-driven, admin-set). On top of that:
//
// 1. Volume bonus — a single sale of many units is worth more per unit than
//    the same units sold in dribs and drabs. Rewards consolidating into
//    bigger wholesale-style deals.
// 2. Stock-age bonus (XP only) — computed automatically from how long the
//    item has been an active focus product (no manual entry needed). The
//    longer it's sat unsold, the more urgent it is to clear, the bigger the
//    XP payout.
// 3. Daily streak multiplier (XP only) — registering at least one sale
//    today keeps the streak alive and grants a flat XP bonus. Miss a day
//    and it resets to 1x until the streak is rebuilt.
// ---------------------------------------------------------------------------

function volumeMultiplier(quantity) {
  if (quantity >= 100) return 1.5;
  if (quantity >= 50) return 1.3;
  if (quantity >= 10) return 1.15;
  return 1.0;
}

function ageMultiplier(createdAtIso) {
  if (!createdAtIso) return 1.0;
  const days = (Date.now() - new Date(createdAtIso).getTime()) / (1000 * 60 * 60 * 24);
  if (days >= 180) return 1.5;
  if (days >= 90) return 1.3;
  if (days >= 30) return 1.15;
  return 1.0;
}

const STREAK_XP_MULTIPLIER = 1.5;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Updates account.streak/lastSaleDate for "made a sale today" and returns
 * the XP multiplier to apply (1.5x once the streak is active, 1x the very
 * first day after a break). Mutates the account object in place.
 */
function applyStreak(account) {
  const today = todayStr();
  if (account.lastSaleDate === today) {
    // Already sold today — streak already active, bonus applies.
    return account.streak > 0 ? STREAK_XP_MULTIPLIER : 1.0;
  }
  const gap = account.lastSaleDate ? daysBetween(account.lastSaleDate, today) : null;
  if (gap === 1) {
    account.streak += 1; // consecutive day
  } else {
    account.streak = 1; // first sale ever, or streak was broken
  }
  account.lastSaleDate = today;
  return STREAK_XP_MULTIPLIER;
}

/**
 * Computes the full reward for a sale. `focusProduct` needs xpReward,
 * coinReward, cashBonus, createdAt. Mutates `account` (streak fields).
 */
function computeSaleReward(focusProduct, quantity, account) {
  const volMult = volumeMultiplier(quantity);
  const ageMult = ageMultiplier(focusProduct.createdAt);
  const streakMult = applyStreak(account);

  const xpEarned = Math.round(focusProduct.xpReward * quantity * volMult * ageMult * streakMult);
  const coinsEarned = Math.round(focusProduct.coinReward * quantity * volMult);
  const cashEarned = Math.round((focusProduct.cashBonus || 0) * quantity * 100) / 100;

  return { xpEarned, coinsEarned, cashEarned, volMult, ageMult, streakMult };
}

module.exports = { volumeMultiplier, ageMultiplier, applyStreak, computeSaleReward };
