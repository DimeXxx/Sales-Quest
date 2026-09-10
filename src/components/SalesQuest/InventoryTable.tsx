import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import type { InventoryRow } from "../../hooks/useAdminState";
import type { Priority } from "../../types/sales";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../ui/Badge";
import { ProductImage } from "../ui/ProductImage";
import { ConfirmButton } from "../ui/ConfirmButton";
import { PhotoPicker } from "../ui/PhotoPicker";
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
  onRemove: (focusProductId: string, permanent?: boolean) => void;
  onUpdateCashBonus: (focusProductId: string, cashBonus: number) => void;
  onUpdate: (
    focusProductId: string,
    patch: Partial<{
      name: string;
      sku: string;
      category: string;
      price: number;
      priority: Priority;
      xpReward: number;
      coinReward: number;
      cashBonus: number;
      stock: number;
      imageUrl: string | null;
    }>
  ) => void;
}

interface EditDraft {
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
  priority: Priority;
  xpReward: string;
  coinReward: string;
  cashBonus: string;
  imageUrl: string | null;
}

function toDraft(r: InventoryRow): EditDraft {
  return {
    name: r.name,
    sku: r.sku,
    category: r.category,
    price: String(r.price),
    stock: String(r.stock),
    priority: r.priority,
    xpReward: String(r.xpReward),
    coinReward: String(r.coinReward),
    cashBonus: String(r.cashBonus),
    imageUrl: r.imageUrl,
  };
}

const field = "w-full rounded-md border border-[#223044] bg-white/[0.03] px-1.5 py-1 text-xs text-[#F5F7FA] outline-none focus:border-cyan-400";

export function InventoryTable({ rows, onRemove, onUpdateCashBonus, onUpdate }: InventoryTableProps) {
  const { t } = useLanguage();
  const [cashDrafts, setCashDrafts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
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

  const startEdit = (r: InventoryRow) => {
    setEditingId(r.focusProductId);
    setEditDraft(toDraft(r));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = (focusProductId: string) => {
    if (!editDraft) return;
    onUpdate(focusProductId, {
      name: editDraft.name,
      sku: editDraft.sku,
      category: editDraft.category,
      price: Number(editDraft.price) || 0,
      stock: Number(editDraft.stock) || 0,
      priority: editDraft.priority,
      xpReward: Number(editDraft.xpReward) || 0,
      coinReward: Number(editDraft.coinReward) || 0,
      cashBonus: Number(editDraft.cashBonus) || 0,
      imageUrl: editDraft.imageUrl,
    });
    cancelEdit();
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        {/* Actions column is FIRST (not sticky-right) — avoids the overlap bug
            that sticky positioning caused when the table is wider than its
            container, and means edit/delete never need horizontal scroll. */}
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
              const isEditing = editingId === r.focusProductId;
              const cashDraft = cashDrafts[r.focusProductId] ?? String(r.cashBonus);
              const cashChanged = Number(cashDraft) !== r.cashBonus;

              if (isEditing && editDraft) {
                return (
                  <tr key={r.focusProductId} className="border-b border-cyan-500/20 bg-cyan-500/[0.03] last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => saveEdit(r.focusProductId)} className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={cancelEdit} className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-[#8B98A9] hover:bg-white/10">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="w-64 space-y-1.5">
                        <input className={field} value={editDraft.name} onChange={(e) => setEditDraft((d) => d && { ...d, name: e.target.value })} />
                        <PhotoPicker value={editDraft.imageUrl} onChange={(imageUrl) => setEditDraft((d) => d && { ...d, imageUrl })} />
                      </div>
                    </td>
                    <td className="px-4 py-2"><input className={field} value={editDraft.sku} onChange={(e) => setEditDraft((d) => d && { ...d, sku: e.target.value })} /></td>
                    <td className="px-4 py-2"><input className={field} type="number" value={editDraft.price} onChange={(e) => setEditDraft((d) => d && { ...d, price: e.target.value })} /></td>
                    <td className="px-4 py-2"><input className={field} type="number" value={editDraft.stock} onChange={(e) => setEditDraft((d) => d && { ...d, stock: e.target.value })} /></td>
                    <td className="px-4 py-2 font-mono text-emerald-300">{r.soldCount}</td>
                    <td className="px-4 py-2">
                      <select className={field} value={editDraft.priority} onChange={(e) => setEditDraft((d) => d && { ...d, priority: e.target.value as Priority })}>
                        <option value="critical">{t("filterCritical")}</option>
                        <option value="high">{t("filterHigh")}</option>
                        <option value="normal">{t("filterNormal")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-2"><input className={field} type="number" value={editDraft.xpReward} onChange={(e) => setEditDraft((d) => d && { ...d, xpReward: e.target.value })} /></td>
                    <td className="px-4 py-2"><input className={field} type="number" value={editDraft.coinReward} onChange={(e) => setEditDraft((d) => d && { ...d, coinReward: e.target.value })} /></td>
                    <td className="px-4 py-2"><input className={field} type="number" step="0.01" value={editDraft.cashBonus} onChange={(e) => setEditDraft((d) => d && { ...d, cashBonus: e.target.value })} /></td>
                  </tr>
                );
              }

              return (
                <tr key={r.focusProductId} className="border-b border-[#223044] last:border-0">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(r)} className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20">
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
                    <div className="flex max-w-[220px] items-center gap-2.5">
                      <ProductImage name={r.name} category={r.category} src={r.imageUrl ?? undefined} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      <span className="truncate font-semibold text-[#F5F7FA]" title={r.name}>{r.name}</span>
                    </div>
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
