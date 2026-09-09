import { useCallback, useEffect, useState } from "react";
import type { Achievement, BossFight, Manager, QuestCardData, Reward } from "../types/sales";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import type { ToastMessage } from "../components/ui/Toast";

interface UseGameStateArgs {
  pushToast: (title: string, subtitle?: string, kind?: ToastMessage["kind"]) => void;
}

/**
 * Manager-facing game data — quests, rewards, boss fights, achievements,
 * leaderboard — all fetched from the backend API and kept in sync with it.
 * The current manager's own profile (XP/Coins/level) lives in AuthContext
 * (useAuth().account), since the backend account IS the manager profile.
 */
export function useGameState({ pushToast }: UseGameStateArgs) {
  const { account, refresh: refreshAccount } = useAuth();
  const [quests, setQuests] = useState<QuestCardData[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [bossFights, setBossFights] = useState<BossFight[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<Manager[]>([]);
  const [pulseFocusId, setPulseFocusId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [questsRes, rewardsRes, bossRes, achRes, lbRes] = await Promise.all([
      api.get<{ quests: QuestCardData[] }>("/quests"),
      api.get<{ rewards: Reward[] }>("/rewards"),
      api.get<{ bossFights: BossFight[] }>("/boss-fights"),
      api.get<{ achievements: Achievement[] }>("/achievements"),
      api.get<{ managers: Manager[] }>("/leaderboard"),
    ]);
    setQuests(questsRes.quests);
    setRewards(rewardsRes.rewards);
    setBossFights(bossRes.bossFights);
    setAchievements(achRes.achievements);
    setLeaderboard(lbRes.managers);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const registerSale = useCallback(
    async (focusProductId: string, quantity = 1, details?: { customer?: string; dealValue?: number }) => {
      try {
        const result = await api.post<{ xpEarned: number; coinsEarned: number; leveledUp: boolean; newLevel: number }>(
          "/sales",
          { focusProductId, quantity, ...details }
        );
        setPulseFocusId(focusProductId);
        window.setTimeout(() => setPulseFocusId(null), 500);

        await refreshAccount();
        await loadAll();

        if (result.leveledUp) {
          pushToast(`🚀 Level up! Level ${result.newLevel}`, "", "levelup");
        }
        pushToast("Sale logged", `+${result.xpEarned} XP · +${result.coinsEarned} points`);
        return true;
      } catch (e) {
        const code = e instanceof ApiError ? e.code : "unknown_error";
        pushToast("Could not log the sale", code, "error");
        return false;
      }
    },
    [loadAll, refreshAccount, pushToast]
  );

  const redeemReward = useCallback(
    async (reward: Reward) => {
      try {
        await api.post(`/rewards/${reward.id}/redeem`);
        await refreshAccount();
        pushToast("🎁 Награда получена!", reward.name);
      } catch (e) {
        if (e instanceof ApiError && e.code === "not_enough_coins") {
          pushToast("Не хватает", "Недостаточно Coins", "error");
        } else {
          pushToast("Не удалось обменять", "", "error");
        }
      }
    },
    [refreshAccount, pushToast]
  );

  return {
    currentManager: account as Manager,
    quests,
    questCards: quests,
    rewards,
    bossFights,
    achievements,
    leaderboard,
    pulseFocusId,
    registerSale,
    redeemReward,
    refetch: loadAll,
  };
}
