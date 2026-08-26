import type { Priority } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";

export type QuestFilter = "all" | Priority;

interface QuestFiltersProps {
  value: QuestFilter;
  onChange: (v: QuestFilter) => void;
}

export function QuestFilters({ value, onChange }: QuestFiltersProps) {
  const { t } = useLanguage();
  const FILTERS: { id: QuestFilter; label: string }[] = [
    { id: "all", label: t("filterAll") },
    { id: "critical", label: t("filterCritical") },
    { id: "high", label: t("filterHigh") },
    { id: "normal", label: t("filterNormal") },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
            value === f.id
              ? "border-zinc-100 bg-zinc-100 text-zinc-950"
              : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
