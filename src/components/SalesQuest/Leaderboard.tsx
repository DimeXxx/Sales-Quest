import { Target, Trophy } from "lucide-react";
import type { Manager } from "../../types/sales";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAuth } from "../../auth/AuthContext";

interface LeaderboardProps {
  managers: Manager[]; // already sorted desc by XP
}

/** Professional sales ranking — small rank numbers, no crowns/medals/gold gradients. */
export function Leaderboard({ managers }: LeaderboardProps) {
  const { t } = useLanguage();
  const { account } = useAuth();
  const currentId = account?.id ?? managers[0]?.id;

  const top = managers.filter((m) => m.role === "manager").slice(0, 5);
  const you = managers.find((m) => m.id === currentId) ?? managers[0];
  const youRank = top.findIndex((m) => m.id === currentId) + 1;
  const leader = top[0];
  const xpToFirst = Math.max(0, (leader?.xp ?? 0) - you.xp);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-1.5 lg:col-span-3">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <Trophy className="h-4 w-4 text-[#8B98A9]" /> {t("liveLeaderboard")}
        </h2>
        {top.map((m, i) => {
          const isYou = m.id === currentId;
          return (
            <Card key={m.id} interactive className={`flex items-center gap-3 px-4 py-2.5 ${isYou ? "border-cyan-400/30" : ""}`}>
              <span className="w-5 text-center font-mono text-xs font-bold text-[#8B98A9]">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-bold text-[#F5F7FA]">
                {m.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#F5F7FA]">
                  {m.name} {isYou && <span className="ml-1 rounded-md bg-cyan-400/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">{t("you")}</span>}
                </p>
                <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${leader ? (m.xp / leader.xp) * 100 : 0}%` }} />
                </div>
              </div>
              <p className="font-mono text-sm font-semibold text-[#F5F7FA]">{m.xp.toLocaleString()} XP</p>
            </Card>
          );
        })}
      </div>

      <div className="lg:col-span-2">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
          <Target className="h-4 w-4 text-[#8B98A9]" /> {t("yourPerformance")}
        </h2>
        <Card className="p-4">
          <p className="text-xs text-[#8B98A9]">{t("yourRank")}</p>
          <p className="text-2xl font-bold text-[#F5F7FA]">#{youRank || "—"}</p>

          {xpToFirst > 0 ? (
            <>
              <p className="mt-3 text-xs text-[#8B98A9]">{t("toFirstPlace")}</p>
              <p className="mb-1.5 font-mono text-sm font-semibold text-[#F5F7FA]">{xpToFirst.toLocaleString()} XP</p>
              <Progress value={(you.xp / (leader?.xp || 1)) * 100} colorClassName="bg-cyan-400" />
            </>
          ) : (
            <p className="mt-3 text-sm font-semibold text-emerald-300">{t("youAreFirst")}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#223044] pt-3 text-xs text-[#8B98A9]">
            <p><span className="font-semibold text-[#F5F7FA]">{you.streak}</span> {t("daysStreak")}</p>
            <p><span className="font-semibold text-[#F5F7FA]">{you.questsCompleted}</span> {t("questsCompleted")}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
