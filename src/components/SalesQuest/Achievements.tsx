import { Award, Calendar, Coins as CoinsIcon, Crosshair, Flame, Medal, Rocket, Skull, Swords, Warehouse, Zap } from "lucide-react";
import type { Achievement } from "../../types/sales";
import { Card } from "../ui/Card";
import { useLanguage } from "../../i18n/LanguageContext";

const ICONS: Record<string, typeof Zap> = {
  zap: Zap,
  swords: Swords,
  crosshair: Crosshair,
  calendar: Calendar,
  skull: Skull,
  warehouse: Warehouse,
  flame: Flame,
  medal: Medal,
  coins: CoinsIcon,
  rocket: Rocket,
};

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const { t } = useLanguage();
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
        <Award className="h-4 w-4 text-violet-400" /> {t("achievements")}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {achievements.map((a) => {
          const Icon = ICONS[a.icon] ?? Award;
          return (
            <Card
              key={a.id}
              className={`relative flex flex-col items-center gap-1.5 overflow-hidden p-3 text-center transition-all ${
                a.unlocked
                  ? "border-violet-500/40 shadow-lg shadow-violet-950/30"
                  : "border-slate-800/60 opacity-60"
              }`}
            >
              {a.unlocked && (
                <div className="pointer-events-none absolute -top-6 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-violet-500/25 blur-xl" />
              )}
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
                  a.unlocked ? "bg-violet-500/20 ring-1 ring-violet-400/40" : "bg-slate-800/50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${a.unlocked ? "text-violet-300 drop-shadow-[0_0_6px_rgba(167,139,250,0.7)]" : "text-slate-600"}`}
                  strokeWidth={a.unlocked ? 2 : 1.5}
                />
              </div>
              <p className={`relative text-[11px] font-bold leading-tight ${a.unlocked ? "text-slate-100" : "text-slate-500"}`}>{a.name}</p>
              <p className={`relative text-[10px] leading-tight ${a.unlocked ? "text-slate-500" : "text-slate-600"}`}>{a.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
