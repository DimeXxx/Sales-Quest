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
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
        <Award className="h-4 w-4 text-[#8B98A9]" /> {t("achievements")}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {achievements.map((a) => {
          const Icon = ICONS[a.icon] ?? Award;
          return (
            <Card key={a.id} className={`flex flex-col items-center gap-1.5 p-3 text-center ${a.unlocked ? "" : "opacity-40"}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.unlocked ? "bg-violet-500/15" : "bg-white/[0.04]"}`}>
                <Icon className={`h-4 w-4 ${a.unlocked ? "text-violet-300" : "text-[#8B98A9]"}`} strokeWidth={1.75} />
              </div>
              <p className={`text-[11px] font-semibold leading-tight ${a.unlocked ? "text-[#F5F7FA]" : "text-[#8B98A9]"}`}>{a.name}</p>
              <p className="text-[10px] leading-tight text-[#8B98A9]">{a.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
