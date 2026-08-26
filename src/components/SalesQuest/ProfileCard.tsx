import { Coins, Flame, Target, Trophy, Zap } from "lucide-react";
import type { Manager } from "../../types/sales";
import { levelFromXp } from "../../types/sales";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { useLanguage } from "../../i18n/LanguageContext";

interface ProfileCardProps {
  manager: Manager;
  rank: number;
}

export function ProfileCard({ manager, rank }: ProfileCardProps) {
  const { t } = useLanguage();
  const { xpIntoLevel, xpToNext } = levelFromXp(manager.xp);
  const pct = (xpIntoLevel / xpToNext) * 100;

  return (
    <Card glow="violet" className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-6 -bottom-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-violet-500/40 ring-2 ring-violet-300/30">
            {manager.avatar}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-cyan-400 text-[9px] font-black text-slate-950">
              {manager.level}
            </span>
          </div>
          <div>
            <p className="text-base font-bold text-slate-100">{manager.name}</p>
            <p className="text-xs font-medium text-violet-300">
              Level {manager.level} — Охотник за неликвидом
            </p>
          </div>
        </div>

        <div className="min-w-[220px] flex-1">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-semibold text-violet-300">
              <Zap className="h-3.5 w-3.5" /> XP
            </span>
            <span className="font-mono tabular-nums text-slate-400">
              {xpIntoLevel.toLocaleString()} <span className="text-slate-600">/</span> {xpToNext.toLocaleString()}
            </span>
          </div>
          <Progress value={pct} height="h-2" colorClassName="bg-gradient-to-r from-violet-500 to-fuchsia-400" glowColor="#A78BFA" />
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5">
          <Coins className="h-5 w-5 text-amber-400" />
          <div className="leading-none">
            <p className="font-mono text-lg font-bold tabular-nums text-amber-300">
              {manager.coins.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-500/70">coins</p>
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-4 border-t border-white/5 pt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          <span className="font-semibold text-slate-200">{manager.streak}</span> {t("daysStreak")}
        </span>
        <span className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">{manager.questsCompleted}</span> {t("questsCompleted")}
        </span>
        <span className="flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          #<span className="font-semibold text-slate-200">{rank}</span> {t("salesRanking")}
        </span>
      </div>
    </Card>
  );
}
