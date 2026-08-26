import { useCallback, useMemo, useState } from "react";
import type {
  BossFight,
  FocusProduct,
  Manager,
  Priority,
  Product,
  QuestCardData,
  Reward,
} from "../types/sales";
import { levelFromXp, calculateReward } from "../types/sales";
import {
  ACHIEVEMENTS,
  BOSS_FIGHTS,
  FOCUS_PRODUCTS,
  MANAGERS,
  PRODUCTS,
  REWARDS,
} from "../data/mockData";
import { salesRepository } from "../services/salesRepository";
import type { ToastMessage } from "../components/ui/Toast";

interface UseGameStateArgs {
  pushToast: (title: string, subtitle?: string, kind?: ToastMessage["kind"]) => void;
  currentUserId: string;
}

export function useGameState({ pushToast, currentUserId }: UseGameStateArgs) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [focusProducts, setFocusProducts] = useState<FocusProduct[]>(FOCUS_PRODUCTS);
  const [managers, setManagers] = useState<Manager[]>(MANAGERS);
  const [rewards] = useState<Reward[]>(REWARDS);
  const [bossFights, setBossFights] = useState<BossFight[]>(BOSS_FIGHTS);
  const [achievements] = useState(ACHIEVEMENTS);
  const [pulseFocusId, setPulseFocusId] = useState<string | null>(null);

  const currentManager = managers.find((m) => m.id === currentUserId) ?? managers[0];

  // ---- derived: quest cards for the Quests tab ---------------------------
  const questCards: QuestCardData[] = useMemo(() => {
    return focusProducts
      .filter((fp) => fp.active)
      .map((fp) => {
        const product = products.find((p) => p.id === fp.productId)!;
        return {
          focusProductId: fp.id,
          product,
          priority: fp.priority,
          xpReward: fp.xpReward,
          coinReward: fp.coinReward,
        };
      })
      .filter((q) => q.product);
  }, [focusProducts, products]);

  // ---- register a sale ----------------------------------------------------
  const registerSale = useCallback(
    (focusProductId: string, quantity = 1) => {
      const fp = focusProducts.find((f) => f.id === focusProductId);
      if (!fp) return;
      const product = products.find((p) => p.id === fp.productId);
      if (!product || product.stock <= 0) return;

      const qty = Math.min(quantity, product.stock);
      const xpEarned = fp.xpReward * qty;
      const coinsEarned = fp.coinReward * qty;

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: Math.max(0, p.stock - qty) } : p))
      );

      setManagers((prev) =>
        prev.map((m) => {
          if (m.id !== currentUserId) return m;
          const prevLevel = levelFromXp(m.xp).level;
          const newXp = m.xp + xpEarned;
          const newLevel = levelFromXp(newXp).level;
          if (newLevel > prevLevel) {
            pushToast(`🚀 LEVEL UP! Level ${newLevel}`, "Ты становишься мастером охоты", "levelup");
          }
          return {
            ...m,
            xp: newXp,
            coins: m.coins + coinsEarned,
            questsCompleted: m.questsCompleted + 1,
            level: newLevel,
          };
        })
      );

      // Boss fight progress — if this SKU matches an active boss fight target
      setBossFights((prev) =>
        prev.map((bf) =>
          bf.active && bf.targetSku === product.sku
            ? { ...bf, currentQuantity: Math.min(bf.targetQuantity, bf.currentQuantity + qty) }
            : bf
        )
      );

      setPulseFocusId(focusProductId);
      window.setTimeout(() => setPulseFocusId(null), 500);

      pushToast("🎯 Продажа зафиксирована!", `+${xpEarned} XP · +${coinsEarned} Coins`);

      salesRepository.registerSale({
        id: `s${Date.now()}`,
        questId: focusProductId,
        productId: product.id,
        managerId: currentUserId,
        quantity: qty,
        xpEarned,
        coinsEarned,
        createdAt: new Date().toISOString(),
      });
    },
    [focusProducts, products, pushToast, currentUserId]
  );

  // ---- reward store ---------------------------------------------------
  const redeemReward = useCallback(
    (reward: Reward) => {
      if (currentManager.coins < reward.costCoins) {
        pushToast("Не хватает", `Нужно ещё ${reward.costCoins - currentManager.coins} Coins`, "error");
        return;
      }
      setManagers((prev) =>
        prev.map((m) => (m.id === currentUserId ? { ...m, coins: m.coins - reward.costCoins } : m))
      );
      pushToast("🎁 Награда получена!", reward.name);
    },
    [currentManager.coins, pushToast, currentUserId]
  );

  // ---- admin: add a focus product -----------------------------------
  const addFocusProduct = useCallback(
    (input: {
      name: string;
      sku: string;
      category: string;
      description: string;
      price: number;
      stock: number;
      stockAgeDays: number;
      marginPercent: number;
      priority: Priority;
      xpReward: number;
      coinReward: number;
      imageUrl?: string;
    }) => {
      const productId = `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const focusId = `fp${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newProduct: Product = {
        id: productId,
        name: input.name,
        sku: input.sku,
        category: input.category,
        description: input.description,
        price: input.price,
        stock: input.stock,
        initialStock: input.stock,
        stockAgeDays: input.stockAgeDays,
        marginPercent: input.marginPercent,
        imageUrl: input.imageUrl,
      };
      const newFocus: FocusProduct = {
        id: focusId,
        productId,
        priority: input.priority,
        xpReward: input.xpReward,
        coinReward: input.coinReward,
        active: true,
      };
      setProducts((prev) => [...prev, newProduct]);
      setFocusProducts((prev) => [...prev, newFocus]);
      pushToast("Квест создан", `${input.name} теперь виден менеджерам`);
    },
    [pushToast]
  );

  // ---- admin: bulk import from Excel ----------------------------------
  const bulkImportProducts = useCallback(
    (
      rows: {
        name: string;
        sku: string;
        description: string;
        category: string;
        price: number;
        stock: number;
        stockAgeDays: number;
        marginPercent: number;
        priority: Priority;
      }[]
    ) => {
      const newProducts: Product[] = [];
      const newFocus: FocusProduct[] = [];
      rows.forEach((row, i) => {
        const productId = `p${Date.now()}-${i}`;
        const focusId = `fp${Date.now()}-${i}`;
        const reward = calculateReward({
          stock: row.stock,
          stockAgeDays: row.stockAgeDays,
          marginPercent: row.marginPercent,
          priority: row.priority,
        });
        newProducts.push({
          id: productId,
          name: row.name,
          sku: row.sku,
          category: row.category,
          description: row.description,
          price: row.price,
          stock: row.stock,
          initialStock: row.stock,
          stockAgeDays: row.stockAgeDays,
          marginPercent: row.marginPercent,
        });
        newFocus.push({
          id: focusId,
          productId,
          priority: row.priority,
          xpReward: reward.xpReward,
          coinReward: reward.coinReward,
          active: true,
        });
      });
      setProducts((prev) => [...prev, ...newProducts]);
      setFocusProducts((prev) => [...prev, ...newFocus]);
      pushToast(`Импортировано ${rows.length} товаров`, "Все позиции доступны менеджерам как квесты");
    },
    [pushToast]
  );

  // ---- auth: register a brand-new manager account ----------------------
  const addManager = useCallback((input: { id: string; name: string; avatar: string; role: Manager["role"] }) => {
    setManagers((prev) => [
      ...prev,
      {
        id: input.id,
        name: input.name,
        avatar: input.avatar,
        level: 1,
        xp: 0,
        coins: 0,
        questsCompleted: 0,
        streak: 0,
        role: input.role,
      },
    ]);
  }, []);

  const removeFocusProduct = useCallback((focusProductId: string) => {
    setFocusProducts((prev) => prev.filter((f) => f.id !== focusProductId));
  }, []);

  const toggleBossFight = useCallback((id: string) => {
    setBossFights((prev) => prev.map((bf) => (bf.id === id ? { ...bf, active: !bf.active } : bf)));
  }, []);

  // ---- admin: directly grant/adjust a manager's coins or XP -------------
  const adjustManager = useCallback((managerId: string, delta: { coins?: number; xp?: number }) => {
    setManagers((prev) =>
      prev.map((m) => {
        if (m.id !== managerId) return m;
        const newXp = Math.max(0, m.xp + (delta.xp ?? 0));
        return {
          ...m,
          coins: Math.max(0, m.coins + (delta.coins ?? 0)),
          xp: newXp,
          level: levelFromXp(newXp).level,
        };
      })
    );
  }, []);

  const leaderboard = useMemo(() => [...managers].sort((a, b) => b.xp - a.xp), [managers]);

  return {
    products,
    focusProducts,
    questCards,
    rewards,
    bossFights,
    achievements,
    managers,
    leaderboard,
    currentManager,
    pulseFocusId,
    registerSale,
    redeemReward,
    addFocusProduct,
    bulkImportProducts,
    addManager,
    adjustManager,
    removeFocusProduct,
    toggleBossFight,
  };
}
