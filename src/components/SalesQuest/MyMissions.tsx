import { useMemo, useState } from "react";
import type { PersonalTask, QuestCardData } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { PriorityBadge } from "../ui/Badge";
import { ProductImage } from "../ui/ProductImage";
import { Button } from "../ui/Button";
import { PersonalTaskCard } from "./PersonalTaskCard";

type MissionTab = "active" | "available" | "completed";

interface MyMissionsProps {
  quests: QuestCardData[];
  personalTasks: PersonalTask[];
  onSubmitPersonalTaskEntry: (taskId: string, input: { label: string; amount?: number; note?: string }) => void;
  onSelect: (quest: QuestCardData) => void;
}

/**
 * "Active" / "Available" / "Completed" are computed from real state, not
 * fabricated: Completed = stock fully cleared; Active = you've personally
 * logged at least one sale and stock remains; Available = stock remains and
 * you haven't touched it yet.
 */
export function MyMissions({ quests, personalTasks, onSubmitPersonalTaskEntry, onSelect }: MyMissionsProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<MissionTab>("active");

  const grouped = useMemo(() => {
    const active: QuestCardData[] = [];
    const available: QuestCardData[] = [];
    const completed: QuestCardData[] = [];
    for (const q of quests) {
      if (q.product.stock <= 0) completed.push(q);
      else if (q.mySold > 0) active.push(q);
      else available.push(q);
    }
    return { active, available, completed };
  }, [quests]);

  const TABS: { id: MissionTab; label: string; count: number }[] = [
    { id: "active", label: t("tabActive"), count: grouped.active.length },
    { id: "available", label: t("tabAvailable"), count: grouped.available.length },
    { id: "completed", label: t("tabCompleted"), count: grouped.completed.length },
  ];

  const list = grouped[tab];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#F5F7FA]">{t("myMissionsTitle")}</h1>
        <p className="mt-1 text-sm text-[#8B98A9]">{t("myMissionsSubtitle")}</p>
      </div>

      {personalTasks.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[#8B98A9]">Личные задачи</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {personalTasks.map((t) => (
              <PersonalTaskCard key={t.id} task={t} onSubmitEntry={onSubmitPersonalTaskEntry} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-[#223044]">
        {TABS.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === tb.id ? "border-cyan-400 text-[#F5F7FA]" : "border-transparent text-[#8B98A9] hover:text-[#F5F7FA]"
            }`}
          >
            {tb.label}
            <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold">{tb.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {list.map((q) => {
          const pct = (q.mySold / Math.max(1, q.product.initialStock)) * 100;
          return (
            <Card key={q.focusProductId} interactive className="flex items-center gap-3 p-3.5">
              <ProductImage name={q.product.name} category={q.product.category} sku={q.product.sku} src={q.product.imageUrl} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <PriorityBadge priority={q.priority} />
                  <p className="truncate text-sm font-semibold text-[#F5F7FA]">{q.product.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="max-w-[200px] flex-1">
                    <Progress value={pct} colorClassName="bg-violet-400" />
                  </div>
                  <span className="whitespace-nowrap text-[11px] font-mono text-[#8B98A9]">{q.mySold} / {q.product.initialStock}</span>
                </div>
              </div>
              <div className="hidden text-right text-xs sm:block">
                <p className="font-semibold text-violet-300">+{q.xpReward} XP</p>
                <p className="text-amber-300">+{q.coinReward} pts</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onSelect(q)}>
                {q.product.stock <= 0 ? t("viewDetails") : t("logSale")}
              </Button>
            </Card>
          );
        })}
        {list.length === 0 && <p className="py-10 text-center text-sm text-[#8B98A9]">{t("noMissionsInTab")}</p>}
      </div>
    </div>
  );
}
