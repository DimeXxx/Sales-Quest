import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { QuestCardData } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../ui/Badge";
import { ProductImage } from "../ui/ProductImage";
import { QuestFilters, type QuestFilter } from "./QuestFilters";

interface ProductsProps {
  quests: QuestCardData[];
  onSelect: (quest: QuestCardData) => void;
}

export function Products({ quests, onSelect }: ProductsProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<QuestFilter>("all");

  const filtered = useMemo(() => {
    return quests.filter((q) => {
      if (filter !== "all" && q.priority !== filter) return false;
      if (!search.trim()) return true;
      const needle = search.trim().toLowerCase();
      return q.product.name.toLowerCase().includes(needle) || q.product.sku.toLowerCase().includes(needle);
    });
  }, [quests, filter, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#F5F7FA]">{t("productsTitle")}</h1>
        <p className="mt-1 text-sm text-[#8B98A9]">{t("productsSubtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex max-w-xs flex-1 items-center gap-2 rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-[#8B98A9]">
          <Search className="h-4 w-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9]"
          />
        </div>
        <QuestFilters value={filter} onChange={setFilter} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#223044] text-[11px] uppercase tracking-wide text-[#8B98A9]">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">{t("columnDaysInStock")}</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">{t("columnReward")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.focusProductId} className="border-b border-[#223044] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <ProductImage name={q.product.name} category={q.product.category} sku={q.product.sku} src={q.product.imageUrl} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                      <span className="font-semibold text-[#F5F7FA]">{q.product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[#8B98A9]">{q.product.sku}</td>
                  <td className="px-4 py-3 text-[#8B98A9]">{q.product.category}</td>
                  <td className="px-4 py-3 font-mono text-[#F5F7FA]">{q.product.stock}</td>
                  <td className="px-4 py-3 font-mono text-[#8B98A9]">{q.daysInStock}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={q.priority} /></td>
                  <td className="px-4 py-3 text-xs text-[#8B98A9]">
                    <span className="text-violet-300">+{q.xpReward} XP</span> · <span className="text-amber-300">+{q.coinReward} pts</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onSelect(q)} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
                      {t("viewDetails")} →
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#8B98A9]">{t("noQuestsForFilter")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
