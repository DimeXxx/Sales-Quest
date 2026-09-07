import { Target, Trophy } from "lucide-react";
import type { Manager } from "../../types/sales";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAuth } from "../../auth/AuthContext";

const MEDALS = ["🥇", "🥈", "🥉"];

interface LeaderboardProps {
  managers: Manager[]; // already sorted desc by XP
}

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
      <div className="space-y-2.5 lg:col-span-3">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
          <Trophy className="h-4 w-4 text-amber-400" /> {t("liveLeaderboard")}
        </h2>
        {top.map((m, i) => {
          const isYou = m.id === currentId;
          const isFirst = i === 0;
          return (
            <Card
              key={m.id}
              interactive
              className={`relative flex items-center gap-3 px-4 py-3 ${
                isFirst
                  ? "border-amber-400/70 bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-slate-900/60 shadow-lg shadow-amber-950/30"
                  : isYou
                  ? "border-violet-500/40 bg-violet-500/[0.06]"
                  : ""
              }`}
            >
              {isFirst && (
                <span className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full border border-amber-400/60 bg-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300 shadow-md shadow-amber-950/40">
                  👑 Top Hunter
                </span>
              )}
              <div className="flex h-9 w-9 items-center justify-center text-lg">
                {MEDALS[i] ?? <span className="text-sm font-bold text-slate-500">{i + 1}</span>}
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-bold ${
                  isFirst ? "ring-2 ring-amber-400/70" : ""
                }`}
              >
                {m.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-100">
                  {m.name} {isYou && <span className="ml-1 rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold text-violet-300">{t("you")}</span>}
                </p>
                <p className="text-[11px] text-slate-500">Level {m.level} · {m.questsCompleted} {t("questsCompleted")}</p>
              </div>
              <p className={`font-mono text-sm font-bold ${isFirst ? "text-amber-300" : "text-violet-300"}`}>{m.xp.toLocaleString()} XP</p>
            </Card>
          );
        })}
      </div>

      <div className="lg:col-span-2">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
          <Target className="h-4 w-4 text-emerald-400" /> {t("yourPerformance")}
        </h2>
        <Card className="p-4">
          <p className="text-xs text-slate-500">{t("yourRank")}</p>
          <p className="text-3xl font-black text-slate-50">#{youRank || "—"}</p>

          {xpToFirst > 0 ? (
            <>
              <p className="mt-3 text-xs text-slate-500">{t("toFirstPlace")}</p>
              <p className="mb-1.5 font-mono text-sm font-bold text-amber-300">{xpToFirst.toLocaleString()} XP</p>
              <Progress value={(you.xp / (leader?.xp || 1)) * 100} colorClassName="bg-gradient-to-r from-amber-400 to-amber-300" glowColor="#FBBF24" />
            </>
          ) : (
            <p className="mt-3 text-sm font-semibold text-emerald-300">{t("youAreFirst")}</p>
          )}

          <div className="mt-4 space-y-2 border-t border-white/5 pt-3 text-xs text-slate-400">
            <p>🔥 {you.streak} {t("daysStreak")}</p>
            <p>🎯 {you.questsCompleted} {t("questsCompleted")}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
