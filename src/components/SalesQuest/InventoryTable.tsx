import { Trash2 } from "lucide-react";
import type { InventoryRow } from "../../hooks/useAdminState";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../ui/Badge";
import { ProductImage } from "../ui/ProductImage";

interface InventoryTableProps {
  rows: InventoryRow[];
  onRemove: (focusProductId: string) => void;
}

export function InventoryTable({ rows, onRemove }: InventoryTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">XP</th>
              <th className="px-4 py-3 font-semibold">Coins</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
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
                <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
                <td className="px-4 py-3 font-semibold text-violet-300">{r.xpReward} XP</td>
                <td className="px-4 py-3 font-semibold text-amber-300">{r.coinReward} Coins</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold ${r.stock === 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {r.stock === 0 ? "Sold out" : "Active"}
                  </span>
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
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
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
