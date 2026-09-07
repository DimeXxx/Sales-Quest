import { useState } from "react";
import { Coins, Crown, Users, Zap } from "lucide-react";
import type { Manager } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

interface ManagersPanelProps {
  managers: Manager[];
  onAdjust: (managerId: string, delta: { coins?: number; xp?: number }) => void;
  onChangeRole?: (managerId: string, role: "manager" | "rop") => void;
}

export function ManagersPanel({ managers, onAdjust, onChangeRole }: ManagersPanelProps) {
  const { t } = useLanguage();
  const [drafts, setDrafts] = useState<Record<string, { coins: string; xp: string }>>({});

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

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
        <Users className="h-4 w-4 text-cyan-400" /> {t("managersList")}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {managers.map((m) => {
          const d = draftFor(m.id);
          return (
            <Card key={m.id} interactive className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-bold">
                  {m.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-100">
                    {m.name}
                    {m.role === "rop" && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                  </p>
                  <p className="text-[11px] text-slate-500">Level {m.level} · {m.role}</p>
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

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder={t("grantCoins")}
                  value={d.coins}
                  onChange={(e) => setDraft(m.id, { coins: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs outline-none placeholder:text-slate-600 focus:border-amber-400/50"
                />
                <input
                  type="number"
                  placeholder={t("grantXp")}
                  value={d.xp}
                  onChange={(e) => setDraft(m.id, { xp: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs outline-none placeholder:text-slate-600 focus:border-violet-400/50"
                />
                <Button size="sm" variant="secondary" onClick={() => apply(m.id)}>
                  {t("apply")}
                </Button>
                {onChangeRole && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onChangeRole(m.id, m.role === "rop" ? "manager" : "rop")}
                    title={m.role === "rop" ? "Demote to manager" : "Promote to ROP"}
                  >
                    {m.role === "rop" ? "→ Manager" : "→ ROP"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
