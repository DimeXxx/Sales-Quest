import { useState } from "react";
import { Coins, Crown, Pencil, Plus, Trash2, UserPlus, Users, X, Zap } from "lucide-react";
import type { Manager } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ConfirmButton } from "../ui/ConfirmButton";
import { useLanguage } from "../../i18n/LanguageContext";

interface ManagersPanelProps {
  managers: Manager[];
  onAdjust: (managerId: string, delta: { coins?: number; xp?: number }) => void;
  onChangeRole?: (managerId: string, role: "manager" | "rop") => void;
  onUpdate?: (managerId: string, patch: { name?: string; email?: string }) => void;
  onDelete?: (managerId: string) => void;
  onCreate?: (input: { name: string; email: string; password: string; role: "manager" | "rop" }) => Promise<boolean>;
}

export function ManagersPanel({ managers, onAdjust, onChangeRole, onUpdate, onDelete, onCreate }: ManagersPanelProps) {
  const { t } = useLanguage();
  const [drafts, setDrafts] = useState<Record<string, { coins: string; xp: string }>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", email: "" });
  const [creating, setCreating] = useState({ name: "", email: "", password: "", role: "manager" as "manager" | "rop" });

  const draftFor = (id: string) => drafts[id] ?? { coins: "", xp: "" };
  const setDraft = (id: string, patch: Partial<{ coins: string; xp: string }>) =>
    setDrafts((d) => ({ ...d, [id]: { ...draftFor(id), ...patch } }));

  const apply = (id: string) => {
    const d = draftFor(id);
    const coins = Number(d.coins) || 0;
    const xp = Number(d.xp) || 0;
    if (!coins && !xp) return;
    onAdjust(id, { coins, xp });
    setDrafts((prev) => ({ ...prev, [id]: { coins: "", xp: "" } }));
  };

  const startEdit = (m: Manager) => {
    setEditingId(m.id);
    setEditDraft({ name: m.name, email: m.email ?? "" });
  };

  const saveEdit = () => {
    if (!editingId || !onUpdate) return;
    onUpdate(editingId, editDraft);
    setEditingId(null);
  };

  const field = "w-full rounded-lg border border-[#223044] bg-white/[0.02] px-2.5 py-1.5 text-xs text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";

  const submitCreate = async () => {
    if (!creating.name || !creating.email || !creating.password || !onCreate) return;
    const ok = await onCreate(creating);
    if (ok) setCreating({ name: "", email: "", password: "", role: "manager" });
  };

  return (
    <div className="space-y-5">
      {onCreate && (
        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
            <UserPlus className="h-4 w-4 text-cyan-300" /> Создать аккаунт менеджера
          </h2>
          <div className="grid gap-2 sm:grid-cols-5">
            <input className={field} placeholder="Имя" value={creating.name} onChange={(e) => setCreating((c) => ({ ...c, name: e.target.value }))} />
            <input className={field} placeholder="Email" value={creating.email} onChange={(e) => setCreating((c) => ({ ...c, email: e.target.value }))} />
            <input className={field} placeholder="Пароль" value={creating.password} onChange={(e) => setCreating((c) => ({ ...c, password: e.target.value }))} />
            <select className={field} value={creating.role} onChange={(e) => setCreating((c) => ({ ...c, role: e.target.value as "manager" | "rop" }))}>
              <option value="manager">Manager</option>
              <option value="rop">ROP</option>
            </select>
            <Button onClick={submitCreate}><Plus className="h-3.5 w-3.5" /> Создать</Button>
          </div>
          <p className="mt-2 text-[11px] text-[#8B98A9]">Аккаунт создаётся сразу подтверждённым — можно сразу отдать логин/пароль сотруднику.</p>
        </Card>
      )}
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
        <Users className="h-4 w-4 text-cyan-300" /> {t("managersList")}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {managers.map((m) => {
          const d = draftFor(m.id);
          const isEditing = editingId === m.id;

          if (isEditing) {
            return (
              <Card key={m.id} className="border-cyan-400/30 p-4">
                <div className="space-y-2">
                  <input className={field} value={editDraft.name} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
                  <input className={field} value={editDraft.email} onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))} />
                  <div className="flex gap-1.5">
                    <Button size="sm" className="flex-1" onClick={saveEdit}>{t("apply")}</Button>
                    <button onClick={() => setEditingId(null)} className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-[#8B98A9]"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              </Card>
            );
          }

          return (
            <Card key={m.id} interactive className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-[#F5F7FA]">
                  {m.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-[#F5F7FA]">
                    {m.name}
                    {m.role === "rop" && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                  </p>
                  <p className="truncate text-[11px] text-[#8B98A9]">{m.email} · Level {m.level}</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 text-xs font-bold text-amber-300">
                    <Coins className="h-3 w-3" /> {m.coins.toLocaleString()}
                  </p>
                  <p className="flex items-center justify-end gap-1 text-xs font-bold text-violet-300">
                    <Zap className="h-3 w-3" /> {m.xp.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder={t("grantCoins")}
                  value={d.coins}
                  onChange={(e) => setDraft(m.id, { coins: e.target.value })}
                  className={field}
                />
                <input
                  type="number"
                  placeholder={t("grantXp")}
                  value={d.xp}
                  onChange={(e) => setDraft(m.id, { xp: e.target.value })}
                  className={field}
                />
                <Button size="sm" variant="secondary" onClick={() => apply(m.id)}>
                  {t("apply")}
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                {onChangeRole && (
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => onChangeRole(m.id, m.role === "rop" ? "manager" : "rop")}>
                    {m.role === "rop" ? "→ Manager" : "→ ROP"}
                  </Button>
                )}
                {onUpdate && (
                  <button onClick={() => startEdit(m)} className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDelete && (
                  <ConfirmButton onConfirm={() => onDelete(m.id)} variant="danger" size="sm" className="!p-2">
                    <Trash2 className="h-3.5 w-3.5" />
                  </ConfirmButton>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
