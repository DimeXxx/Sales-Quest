import { useMemo, useState } from "react";
import { Calendar, Coins, DollarSign, Gift, LineChart, Target, Trophy } from "lucide-react";
import type { Achievement, BossFight, Manager, QuestCardData } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";
import { KpiCard } from "./KpiCard";
import { QuestCard } from "./QuestCard";
import { QuestFilters, type QuestFilter } from "./QuestFilters";
import { BossFightCard } from "./BossFight";
import { OverviewSidePanel } from "./OverviewSidePanel";

interface QuestsTabProps {
  manager: Manager;
  rank: number;
  quests: QuestCardData[];
  pulseFocusId: string | null;
  bossFights: BossFight[];
  leaderboard: Manager[];
  achievements: Achievement[];
  onSell: (focusProductId: string, quantity: number) => void;
  onJoinBossFight: (id: string) => void;
  onNavigate: (tab: "products" | "arena") => void;
}

function greetingKey(): "goodMorning" | "goodAfternoon" | "goodEvening" {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning";
  if (h < 18) return "goodAfternoon";
  return "goodEvening";
}

export function QuestsTab({
  manager,
  rank,
  quests,
  pulseFocusId,
  bossFights,
  leaderboard,
  achievements,
  onSell,
  onJoinBossFight,
  onNavigate,
}: QuestsTabProps) {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState<QuestFilter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? quests : quests.filter((q) => q.priority === filter)),
    [quests, filter]
  );

  const activeBossFights = bossFights.filter((bf) => bf.active);
  const firstName = manager.name.split(" ")[0];
  const today = new Date().toLocaleDateString(lang === "ro" ? "ro-RO" : "ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#F5F7FA]">{t(greetingKey())}, {firstName} 👋</h1>
            <p className="mt-1 text-sm text-[#8B98A9]">{t("questsSubtitle")}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#8B98A9]">
              <Calendar className="h-3.5 w-3.5" /> {today}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard icon={Target} value={quests.length} label={t("activeMissions")} accent="#22D3EE" />
            <KpiCard icon={Coins} value={manager.coins.toLocaleString()} label={t("rewardPoints")} accent="#F5B93F" />
            <KpiCard icon={DollarSign} value={`$${(manager.totalCashBonus ?? 0).toFixed(0)}`} label={t("cashEarnedLabel")} accent="#34D399" />
            <KpiCard icon={Trophy} value={`#${rank}`} label={t("yourRankLabel")} accent="#A78BFA" />
          </div>
        </div>

        {activeBossFights.map((bf) => (
          <BossFightCard
            key={bf.id}
            bossFight={bf}
            product={quests.find((q) => q.product.sku === bf.targetSku)?.product}
            onJoin={() => onJoinBossFight(bf.id)}
          />
        ))}

        <div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#F5F7FA]">{t("priorityMissions")}</h2>
              <p className="text-xs text-[#8B98A9]">{t("priorityMissionsHint")}</p>
            </div>
            <button onClick={() => onNavigate("products")} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
              {t("viewDetails")} →
            </button>
          </div>
          <QuestFilters value={filter} onChange={setFilter} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((q) => (
            <QuestCard key={q.focusProductId} quest={q} pulsing={pulseFocusId === q.focusProductId} onSell={(qty) => onSell(q.focusProductId, qty)} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-[#8B98A9]">{t("noQuestsForFilter")}</p>
          )}
        </div>

        <div>
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-[#8B98A9]">{t("quickAccess")}</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onNavigate("products")} className="flex items-center gap-2 rounded-lg border border-[#223044] bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-[#8B98A9] hover:text-[#F5F7FA]">
              <LineChart className="h-3.5 w-3.5" /> {t("topSellingProducts")}
            </button>
            <button onClick={() => onNavigate("arena")} className="flex items-center gap-2 rounded-lg border border-[#223044] bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-[#8B98A9] hover:text-[#F5F7FA]">
              <Gift className="h-3.5 w-3.5" /> {t("rewardsShop")}
            </button>
          </div>
        </div>
      </div>

      <OverviewSidePanel manager={manager} rank={rank} leaderboard={leaderboard} achievements={achievements} />
    </div>
  );
}
