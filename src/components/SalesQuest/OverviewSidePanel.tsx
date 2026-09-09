import { Coins, Flame, Gift, Star } from "lucide-react";
import type { Achievement, Manager } from "../../types/sales";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { Card } from "../ui/Card";
import { ProfileCard } from "./ProfileCard";

interface OverviewSidePanelProps {
  manager: Manager;
  rank: number;
  leaderboard: Manager[];
  achievements: Achievement[];
}

export function OverviewSidePanel({ manager, rank, leaderboard, achievements }: OverviewSidePanelProps) {
  const { t } = useLanguage();
  const { account } = useAuth();
  const top = leaderboard.filter((m) => m.role === "manager").slice(0, 6);
  const unlocked = achievements.filter((a) => a.unlocked).slice(0, 4);
  const preview = unlocked.length > 0 ? unlocked : achievements.slice(0, 4);

  return (
    <div className="w-full space-y-4 lg:w-[300px] lg:shrink-0">
      <ProfileCard manager={manager} rank={rank} />

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-bold text-[#F5F7FA]">{t("liveLeaderboard")}</h2>
        <div className="space-y-2.5">
          {top.map((m, i) => {
            const isYou = m.id === account?.id;
            return (
              <div key={m.id} className={`flex items-center gap-2.5 rounded-lg px-1 py-1 ${isYou ? "bg-cyan-400/[0.06]" : ""}`}>
                <span className="w-5 text-center font-mono text-[11px] font-bold text-[#8B98A9]">{i + 1}</span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-[#F5F7FA]">
                  {m.avatar}
                </div>
                <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#F5F7FA]">{m.name}</p>
                <p className="whitespace-nowrap font-mono text-xs font-semibold text-[#8B98A9]">{m.xp.toLocaleString()} XP</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-bold text-[#F5F7FA]">{t("yourProgressWidget")}</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <Flame className={`mx-auto mb-1 h-4 w-4 ${manager.streak > 0 ? "text-orange-400" : "text-[#8B98A9]"}`} />
            <p className="text-sm font-bold text-[#F5F7FA]">{manager.streak}</p>
            <p className="text-[9px] text-[#8B98A9]">{t("daysStreak")}</p>
          </div>
          <div>
            <Star className="mx-auto mb-1 h-4 w-4 text-violet-300" />
            <p className="text-sm font-bold text-[#F5F7FA]">{manager.xp.toLocaleString()}</p>
            <p className="text-[9px] text-[#8B98A9]">{t("totalXpLabel")}</p>
          </div>
          <div>
            <Gift className="mx-auto mb-1 h-4 w-4 text-amber-300" />
            <p className="text-sm font-bold text-[#F5F7FA]">{manager.coins.toLocaleString()}</p>
            <p className="text-[9px] text-[#8B98A9]">{t("rewardPoints")}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-bold text-[#F5F7FA]">{t("achievements")}</h2>
        <div className="grid grid-cols-4 gap-2">
          {preview.map((a) => (
            <div key={a.id} className={`flex flex-col items-center gap-1 rounded-lg p-2 text-center ${a.unlocked ? "" : "opacity-40"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.unlocked ? "bg-violet-500/15" : "bg-white/[0.04]"}`}>
                <Coins className={`h-3.5 w-3.5 ${a.unlocked ? "text-violet-300" : "text-[#8B98A9]"}`} strokeWidth={1.75} />
              </div>
              <p className="text-[9px] font-semibold leading-tight text-[#F5F7FA]">{a.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
