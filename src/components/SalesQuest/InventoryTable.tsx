import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import type { InventoryRow } from "../../hooks/useAdminState";
import type { Priority } from "../../types/sales";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../ui/Badge";
import { ProductImage } from "../ui/ProductImage";
import { ConfirmButton } from "../ui/ConfirmButton";
import { useLanguage } from "../../i18n/LanguageContext";

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
  };
}

const field = "w-full rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 text-xs text-slate-200 outline-none focus:border-cyan-400";

export function InventoryTable({ rows, onRemove, onUpdateCashBonus, onUpdate }: InventoryTableProps) {
  const { t } = useLanguage();
  const [cashDrafts, setCashDrafts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);

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
    });
    cancelEdit();
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">{t("soldQty")}</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">XP</th>
              <th className="px-4 py-3 font-semibold">Coins</th>
              <th className="px-4 py-3 font-semibold">$ {t("cashBonusPerUnit")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isEditing = editingId === r.focusProductId;
              const cashDraft = cashDrafts[r.focusProductId] ?? String(r.cashBonus);
              const cashChanged = Number(cashDraft) !== r.cashBonus;

              if (isEditing && editDraft) {
                return (
                  <tr key={r.focusProductId} className="border-b border-cyan-500/20 bg-cyan-500/[0.03] last:border-0">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <ProductImage name={r.name} category={r.category} src={r.imageUrl ?? undefined} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                        <input className={field} value={editDraft.name} onChange={(e) => setEditDraft((d) => d && { ...d, name: e.target.value })} />
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
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => saveEdit(r.focusProductId)} className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={cancelEdit} className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-slate-400 hover:bg-white/10">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={r.focusProductId} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <ProductImage name={r.name} category={r.category} src={r.imageUrl ?? undefined} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      <span className="font-semibold text-slate-200">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">{r.sku}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{r.price ? `$${r.price}` : "—"}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{r.stock}</td>
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
                        className="w-16 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-emerald-300 outline-none focus:border-emerald-400"
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
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
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-500">
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
