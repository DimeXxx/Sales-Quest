import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import type { InventoryRow } from "../../hooks/useAdminState";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../ui/Badge";
import { ProductImage } from "../ui/ProductImage";
import { ConfirmButton } from "../ui/ConfirmButton";
import { useLanguage } from "../../i18n/LanguageContext";

type SortKey = "name" | "price" | "stock" | "soldCount";

const PAGE_SIZE = 25;

function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: 1 | -1; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 hover:text-[#F5F7FA]">
      {label}
      {active && (dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );
}

interface InventoryTableProps {
  rows: InventoryRow[];
  onEdit: (row: InventoryRow) => void;
  onRemove: (focusProductId: string, permanent?: boolean) => void;
  onUpdateCashBonus: (focusProductId: string, cashBonus: number) => void;
}

/**
 * A plain, scannable list — editing opens the full Product Card modal
 * (EditProductModal) instead of cramming inputs into the row. The only
 * thing still editable inline is the $ bonus, since that's a single quick
 * number admins tend to tweak often.
 */
export function InventoryTable({ rows, onEdit, onRemove, onUpdateCashBonus }: InventoryTableProps) {
  const { t } = useLanguage();
  const [cashDrafts, setCashDrafts] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "stock", dir: -1 });
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string") return av.localeCompare(String(bv)) * sort.dir;
      return (Number(av) - Number(bv)) * sort.dir;
    });
    return copy;
  }, [rows, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const paged = sorted.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    setPage(0);
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: -1 }));
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#223044] text-[11px] uppercase tracking-wide text-[#8B98A9]">
              <th className="px-3 py-3" />
              <th className="px-4 py-3 font-semibold"><SortHeader label="Product" active={sort.key === "name"} dir={sort.dir} onClick={() => toggleSort("name")} /></th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold"><SortHeader label="Price" active={sort.key === "price"} dir={sort.dir} onClick={() => toggleSort("price")} /></th>
              <th className="px-4 py-3 font-semibold"><SortHeader label="Stock" active={sort.key === "stock"} dir={sort.dir} onClick={() => toggleSort("stock")} /></th>
              <th className="px-4 py-3 font-semibold"><SortHeader label={t("soldQty")} active={sort.key === "soldCount"} dir={sort.dir} onClick={() => toggleSort("soldCount")} /></th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">XP</th>
              <th className="px-4 py-3 font-semibold">Coins</th>
              <th className="px-4 py-3 font-semibold">$ {t("cashBonusPerUnit")}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => {
              const cashDraft = cashDrafts[r.focusProductId] ?? String(r.cashBonus);
              const cashChanged = Number(cashDraft) !== r.cashBonus;

              return (
                <tr key={r.focusProductId} className="border-b border-[#223044] last:border-0 hover:bg-white/[0.015]">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(r)} className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20" title="Открыть карточку товара">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => onRemove(r.focusProductId)} className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" title="Скрыть из квестов">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ConfirmButton onConfirm={() => onRemove(r.focusProductId, true)} variant="danger" size="sm" className="!p-1.5">
                        <X className="h-3.5 w-3.5" />
                      </ConfirmButton>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onEdit(r)} className="flex max-w-[220px] items-center gap-2.5 text-left hover:opacity-80">
                      <ProductImage name={r.name} category={r.category} sku={r.sku} src={r.imageUrl ?? undefined} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      <span className="truncate font-semibold text-[#F5F7FA]" title={r.name}>{r.name}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-[#8B98A9]">{r.sku}</td>
                  <td className="px-4 py-3 font-mono text-[#F5F7FA]">{r.price ? `$${r.price}` : "—"}</td>
                  <td className="px-4 py-3 font-mono text-[#F5F7FA]">{r.stock}</td>
                  <td className="px-4 py-3 font-mono text-emerald-300">{r.soldCount}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                  <td className="px-4 py-3 font-semibold text-violet-300">{r.xpReward} XP</td>
                  <td className="px-4 py-3 font-semibold text-amber-300">{r.coinReward}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        value={cashDraft}
                        onChange={(e) => setCashDrafts((d) => ({ ...d, [r.focusProductId]: e.target.value }))}
                        className="w-16 rounded-md border border-[#223044] bg-white/[0.02] px-2 py-1 text-xs text-emerald-300 outline-none focus:border-emerald-400"
                      />
                      {cashChanged && (
                        <button
                          onClick={() => onUpdateCashBonus(r.focusProductId, Number(cashDraft) || 0)}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-[#8B98A9]">
                  Нет активных фокусных товаров.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-[#223044] px-4 py-3 text-xs text-[#8B98A9]">
          <span>
            {clampedPage * PAGE_SIZE + 1}–{Math.min(sorted.length, (clampedPage + 1) * PAGE_SIZE)} из {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={clampedPage === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#223044] disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono">{clampedPage + 1} / {pageCount}</span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={clampedPage >= pageCount - 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#223044] disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
