import { useMemo, useState } from "react";
import { Target, Coins, Trophy } from "lucide-react";
import type { QuestCardData, BossFight, Manager } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";
import { ProfileCard } from "./ProfileCard";
import { KpiCard } from "./KpiCard";
import { QuestCard } from "./QuestCard";
import { QuestFilters, type QuestFilter } from "./QuestFilters";
import { BossFightCard } from "./BossFight";

interface QuestsTabProps {
  manager: Manager;
  rank: number;
  quests: QuestCardData[];
  pulseFocusId: string | null;
  bossFights: BossFight[];
  onSell: (focusProductId: string, quantity: number) => void;
  onJoinBossFight: (id: string) => void;
}

export function QuestsTab({ manager, rank, quests, pulseFocusId, bossFights, onSell, onJoinBossFight }: QuestsTabProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<QuestFilter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? quests : quests.filter((q) => q.priority === filter)),
    [quests, filter]
  );

  const activeBossFights = bossFights.filter((bf) => bf.active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#F5F7FA]">{t("questsTitle")}</h1>
        <p className="mt-1 text-sm text-[#8B98A9]">{t("questsSubtitle")}</p>
      </div>

      {/* KPI row + Level card */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Target} value={quests.length} label={t("activeMissions")} accent="#22D3EE" />
        <KpiCard icon={Coins} value={manager.coins.toLocaleString()} label={t("rewardPoints")} accent="#F5B93F" />
        <KpiCard icon={Trophy} value={`#${rank}`} label={t("yourRankLabel")} accent="#A78BFA" />
        <ProfileCard manager={manager} rank={rank} />
      </div>

      {activeBossFights.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeBossFights.map((bf) => (
            <BossFightCard key={bf.id} bossFight={bf} onJoin={() => onJoinBossFight(bf.id)} />
          ))}
        </div>
      )}

      <div>
        <div className="mb-3">
          <h2 className="text-sm font-bold text-[#F5F7FA]">{t("priorityMissions")}</h2>
          <p className="text-xs text-[#8B98A9]">{t("priorityMissionsHint")}</p>
        </div>
        <QuestFilters value={filter} onChange={setFilter} />
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((q) => (
          <QuestCard key={q.focusProductId} quest={q} pulsing={pulseFocusId === q.focusProductId} onSell={(qty) => onSell(q.focusProductId, qty)} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-[#8B98A9]">{t("noQuestsForFilter")}</p>
        )}
      </div>
    </div>
  );
}
