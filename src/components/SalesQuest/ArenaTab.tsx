import type { Achievement, Manager, Reward } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";
import { Leaderboard } from "./Leaderboard";
import { RewardStore } from "./RewardStore";
import { Achievements } from "./Achievements";

interface ArenaTabProps {
  managers: Manager[];
  rewards: Reward[];
  achievements: Achievement[];
  coins: number;
  onRedeem: (reward: Reward) => void;
}

export function ArenaTab({ managers, rewards, achievements, coins, onRedeem }: ArenaTabProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">{t("arenaTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("arenaSubtitle")}</p>
      </div>

      <Leaderboard managers={managers} />
      <Achievements achievements={achievements} />
      <RewardStore rewards={rewards} coins={coins} onRedeem={onRedeem} />
    </div>
  );
}
