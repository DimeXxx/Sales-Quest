import { useMemo, useState } from "react";
import type { QuestCardData, BossFight, Manager } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";
import { ProfileCard } from "./ProfileCard";
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
        <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">{t("questsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("questsSubtitle")}</p>
      </div>

      <ProfileCard manager={manager} rank={rank} />

      {activeBossFights.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeBossFights.map((bf) => (
            <BossFightCard key={bf.id} bossFight={bf} onJoin={() => onJoinBossFight(bf.id)} />
          ))}
        </div>
      )}

      <QuestFilters value={filter} onChange={setFilter} />

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((q) => (
          <QuestCard key={q.focusProductId} quest={q} pulsing={pulseFocusId === q.focusProductId} onSell={(qty) => onSell(q.focusProductId, qty)} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-500">{t("noQuestsForFilter")}</p>
        )}
      </div>
    </div>
  );
}
