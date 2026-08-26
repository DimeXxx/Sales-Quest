// ---------------------------------------------------------------------------
// Sales Quest — core domain types
// ---------------------------------------------------------------------------

export type Priority = "critical" | "high" | "normal";
export type UserRole = "manager" | "rop" | "admin";
export type QuestStatus = "active" | "completed";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number; // unit sale price, in company currency
  stock: number;
  initialStock: number; // snapshot at focus-product creation, used for clearance gauges
  stockAgeDays: number;
  marginPercent: number;
  imageUrl?: string; // explicit override; if unset, ProductImage resolves a live photo by name/category
}

export interface FocusProduct {
  id: string;
  productId: string;
  priority: Priority;
  xpReward: number;
  coinReward: number;
  active: boolean;
}

export interface Quest {
  id: string;
  focusProductId: string;
  managerId: string;
  status: QuestStatus;
  createdAt: string;
}

export interface Sale {
  id: string;
  questId: string;
  productId: string;
  managerId: string;
  quantity: number;
  xpEarned: number;
  coinsEarned: number;
  createdAt: string;
}

export interface Manager {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  questsCompleted: number;
  streak: number;
  role: UserRole;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  costCoins: number;
  icon: string;
}

export interface BossFight {
  id: string;
  title: string;
  description: string;
  targetSku: string;
  targetQuantity: number;
  currentQuantity: number;
  deadline: string; // ISO datetime
  reward: string;
  active: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// Combined view model used by the Quests tab — a FocusProduct joined with its Product
export interface QuestCardData {
  focusProductId: string;
  product: Product;
  priority: Priority;
  xpReward: number;
  coinReward: number;
}

// ---------------------------------------------------------------------------
// Reward Engine — MVP keeps manual XP/Coins on FocusProduct, but the shape
// below is what a future automatic engine would consume/produce.
// ---------------------------------------------------------------------------
export interface RewardEngineInput {
  stock: number;
  stockAgeDays: number;
  marginPercent: number;
  priority: Priority;
  salesTarget?: number;
  category?: string;
}

export interface RewardEngineOutput {
  xpReward: number;
  coinReward: number;
}

/**
 * Deterministic placeholder reward calculator.
 * Swap this out later for a tuned model — the important part is the
 * input/output contract stays stable so callers don't change.
 */
export function calculateReward(input: RewardEngineInput): RewardEngineOutput {
  const base: Record<Priority, RewardEngineOutput> = {
    critical: { xpReward: 300, coinReward: 120 },
    high: { xpReward: 250, coinReward: 100 },
    normal: { xpReward: 100, coinReward: 35 },
  };
  const b = base[input.priority];
  const ageBoost = input.stockAgeDays > 120 ? 1.15 : 1;
  const marginBoost = input.marginPercent > 25 ? 1.1 : 1;
  return {
    xpReward: Math.round(b.xpReward * ageBoost * marginBoost),
    coinReward: Math.round(b.coinReward * ageBoost * marginBoost),
  };
}

// XP required to reach the *next* level from the current one (index 0 = to reach level 2)
export const XP_LEVEL_STEP = 1000;

export function xpForLevel(level: number): number {
  return (level - 1) * XP_LEVEL_STEP;
}

export function levelFromXp(totalXp: number): { level: number; xpIntoLevel: number; xpToNext: number } {
  const level = Math.floor(totalXp / XP_LEVEL_STEP) + 1;
  const xpIntoLevel = totalXp - xpForLevel(level);
  return { level, xpIntoLevel, xpToNext: XP_LEVEL_STEP };
}
