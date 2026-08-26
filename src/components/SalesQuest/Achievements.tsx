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
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-400">
        <Award className="h-4 w-4 text-violet-400" /> {t("achievements")}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {achievements.map((a) => {
          const Icon = ICONS[a.icon] ?? Award;
          return (
            <Card
              key={a.id}
              className={`flex flex-col items-center gap-1.5 p-3 text-center ${a.unlocked ? "" : "opacity-40 grayscale"}`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${a.unlocked ? "bg-violet-500/15" : "bg-white/5"}`}>
                <Icon className={`h-5 w-5 ${a.unlocked ? "text-violet-300" : "text-zinc-600"}`} />
              </div>
              <p className="text-[11px] font-bold leading-tight text-zinc-200">{a.name}</p>
              <p className="text-[10px] leading-tight text-zinc-600">{a.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
