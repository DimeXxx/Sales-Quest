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
          className={`rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            value === f.id
              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
              : "border-[#223044] bg-transparent text-[#8B98A9] hover:border-[#2D3E54] hover:text-[#F5F7FA]"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
