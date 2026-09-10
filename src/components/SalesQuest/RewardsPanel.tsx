import { useState } from "react";
import { Car, Gift, Headphones, Pencil, Plane, Plus, Sun, Trash2, Utensils, X } from "lucide-react";
import type { Reward } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ConfirmButton } from "../ui/ConfirmButton";
import { useLanguage } from "../../i18n/LanguageContext";

const ICON_OPTIONS: { id: string; icon: typeof Gift }[] = [
  { id: "gift", icon: Gift },
  { id: "sun", icon: Sun },
  { id: "car", icon: Car },
  { id: "utensils", icon: Utensils },
  { id: "headphones", icon: Headphones },
  { id: "plane", icon: Plane },
];

interface RewardsPanelProps {
  rewards: Reward[];
  onCreate: (input: { name: string; description: string; costCoins: number; icon: string }) => void;
  onUpdate: (id: string, patch: { name?: string; description?: string; costCoins?: number; icon?: string }) => void;
  onDelete: (id: string) => void;
}

interface Draft {
  name: string;
  description: string;
  costCoins: string;
  icon: string;
}

const EMPTY: Draft = { name: "", description: "", costCoins: "", icon: "gift" };

export function RewardsPanel({ rewards, onCreate, onUpdate, onDelete }: RewardsPanelProps) {
  const { t } = useLanguage();
  const [creating, setCreating] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY);

  const field = "w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";

  const startEdit = (r: Reward) => {
    setEditingId(r.id);
    setEditDraft({ name: r.name, description: r.description, costCoins: String(r.costCoins), icon: r.icon });
  };

  const saveEdit = () => {
    if (!editingId) return;
    onUpdate(editingId, { name: editDraft.name, description: editDraft.description, costCoins: Number(editDraft.costCoins) || 0, icon: editDraft.icon });
    setEditingId(null);
  };

  const submitCreate = () => {
    if (!creating.name || !creating.costCoins) return;
    onCreate({ name: creating.name, description: creating.description, costCoins: Number(creating.costCoins) || 0, icon: creating.icon });
    setCreating(EMPTY);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-2.5 lg:col-span-3">
        <h2 className="mb-1 text-sm font-bold text-[#F5F7FA]">{t("rewardStore")}</h2>
        {rewards.map((r) => {
          const Icon = ICON_OPTIONS.find((o) => o.id === r.icon)?.icon ?? Gift;
          const isEditing = editingId === r.id;

          if (isEditing) {
            return (
              <Card key={r.id} className="space-y-2 border-cyan-400/30 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <input className={field} value={editDraft.name} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
                  <input className={field} type="number" value={editDraft.costCoins} onChange={(e) => setEditDraft((d) => ({ ...d, costCoins: e.target.value }))} />
                </div>
                <input className={field} value={editDraft.description} onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))} />
                <div className="flex items-center gap-1.5">
                  {ICON_OPTIONS.map((o) => (
                    <button key={o.id} onClick={() => setEditDraft((d) => ({ ...d, icon: o.id }))} className={`flex h-8 w-8 items-center justify-center rounded-lg ${editDraft.icon === o.id ? "bg-cyan-400/15 text-cyan-300" : "bg-white/[0.03] text-[#8B98A9]"}`}>
                      <o.icon className="h-4 w-4" />
                    </button>
                  ))}
                  <div className="ml-auto flex gap-1">
                    <button onClick={saveEdit} className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-300"><Plus className="h-4 w-4 rotate-45" /></button>
                    <button onClick={() => setEditingId(null)} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-[#8B98A9]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              </Card>
            );
          }

          return (
            <Card key={r.id} interactive className="flex items-center gap-3 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                <Icon className="h-4 w-4 text-[#F5F7FA]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#F5F7FA]">{r.name}</p>
                <p className="truncate text-[11px] text-[#8B98A9]">{r.description}</p>
              </div>
              <p className="whitespace-nowrap font-mono text-sm font-semibold text-amber-300">{r.costCoins} pts</p>
              <button onClick={() => startEdit(r)} className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <ConfirmButton onConfirm={() => onDelete(r.id)} variant="danger" size="sm" className="!p-1.5">
                <Trash2 className="h-3.5 w-3.5" />
              </ConfirmButton>
            </Card>
          );
        })}
        {rewards.length === 0 && <p className="py-8 text-center text-sm text-[#8B98A9]">Нет наград — добавь первую справа</p>}
      </div>

      <div className="lg:col-span-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
            <Plus className="h-4 w-4 text-cyan-300" /> Новая награда
          </h2>
          <div className="space-y-3">
            <input className={field} placeholder="Название" value={creating.name} onChange={(e) => setCreating((d) => ({ ...d, name: e.target.value }))} />
            <input className={field} placeholder="Описание" value={creating.description} onChange={(e) => setCreating((d) => ({ ...d, description: e.target.value }))} />
            <input className={field} type="number" placeholder="Цена, points" value={creating.costCoins} onChange={(e) => setCreating((d) => ({ ...d, costCoins: e.target.value }))} />
            <div className="flex items-center gap-1.5">
              {ICON_OPTIONS.map((o) => (
                <button key={o.id} onClick={() => setCreating((d) => ({ ...d, icon: o.id }))} className={`flex h-8 w-8 items-center justify-center rounded-lg ${creating.icon === o.id ? "bg-cyan-400/15 text-cyan-300" : "bg-white/[0.03] text-[#8B98A9]"}`}>
                  <o.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={submitCreate}>Добавить награду</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
