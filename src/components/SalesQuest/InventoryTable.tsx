import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import type { InventoryRow } from "../../hooks/useAdminState";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../ui/Badge";
import { ProductImage } from "../ui/ProductImage";
import { useLanguage } from "../../i18n/LanguageContext";

interface InventoryTableProps {
  rows: InventoryRow[];
  onRemove: (focusProductId: string) => void;
  onUpdateCashBonus: (focusProductId: string, cashBonus: number) => void;
}

export function InventoryTable({ rows, onRemove, onUpdateCashBonus }: InventoryTableProps) {
  const { t } = useLanguage();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">{t("soldQty")}</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">XP</th>
              <th className="px-4 py-3 font-semibold">$ {t("cashBonusPerUnit")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const draft = drafts[r.focusProductId] ?? String(r.cashBonus);
              const changed = Number(draft) !== r.cashBonus;
              return (
                <tr key={r.focusProductId} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <ProductImage name={r.name} category={r.category} src={r.imageUrl ?? undefined} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      <span className="font-semibold text-slate-200">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">{r.sku}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{r.stock}</td>
                  <td className="px-4 py-3 font-mono text-emerald-300">{r.soldCount}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-4 py-3 font-semibold text-violet-300">{r.xpReward} XP</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        value={draft}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r.focusProductId]: e.target.value }))}
                        className="w-20 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-emerald-300 outline-none focus:border-emerald-400"
                      />
                      {changed && (
                        <button
                          onClick={() => onUpdateCashBonus(r.focusProductId, Number(draft) || 0)}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRemove(r.focusProductId)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                  Нет активных фокусных товаров.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
