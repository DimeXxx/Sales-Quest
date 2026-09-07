import { RotateCcw, Skull, Trophy, Users } from "lucide-react";
import type { BossFight, Manager } from "../../types/sales";
import type { InventoryRow } from "../../hooks/useAdminState";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ConfirmButton } from "../ui/ConfirmButton";
import { useLanguage } from "../../i18n/LanguageContext";

interface ResetPanelProps {
  managers: Manager[];
  inventory: InventoryRow[];
  bossFights: BossFight[];
  onResetAll: () => void;
  onResetManager: (id: string) => void;
  onResetAllManagers: () => void;
  onResetAllStock: () => void;
  onResetAllBossFights: () => void;
  onResetAchievements: () => void;
}

export function ResetPanel({
  managers,
  inventory,
  bossFights,
  onResetAll,
  onResetManager,
  onResetAllManagers,
  onResetAllStock,
  onResetAllBossFights,
  onResetAchievements,
}: ResetPanelProps) {
  const { t } = useLanguage();
  const clearedTotal = inventory.reduce((a, r) => a + (r.initialStock - r.stock), 0);

  return (
    <div className="space-y-6">
      <Card
        className="p-5"
        style={{ borderColor: "rgba(244,63,94,0.4)", boxShadow: "0 0 40px -15px rgba(244,63,94,0.35)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
              <RotateCcw className="h-5 w-5 text-rose-300" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-100">{t("resetAllTitle")}</p>
              <p className="mt-1 max-w-xl text-xs text-slate-500">{t("resetAllDesc")}</p>
            </div>
          </div>
          <ConfirmButton onConfirm={onResetAll} variant="danger">
            <RotateCcw className="h-3.5 w-3.5" /> {t("resetAllButton")}
          </ConfirmButton>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <p className="text-sm font-bold text-slate-100">{t("resetManagersTitle")}</p>
          </div>
          <ConfirmButton onConfirm={onResetAllManagers} variant="secondary">
            {t("resetAllManagersButton")}
          </ConfirmButton>
        </div>
        <p className="mb-3 text-xs text-slate-500">{t("resetManagersDesc")}</p>
        <div className="space-y-1.5">
          {managers.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
              <span className="text-xs font-semibold text-slate-300">
                {m.name} <span className="ml-1 text-slate-600">Lvl {m.level} · {m.xp.toLocaleString()} XP · {m.coins.toLocaleString()} Coins</span>
              </span>
              <ConfirmButton onConfirm={() => onResetManager(m.id)} variant="secondary">
                {t("resetOneButton")}
              </ConfirmButton>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-100">{t("resetStockTitle")}</p>
            <p className="mt-1 text-xs text-slate-500">{t("resetStockDesc")}</p>
          </div>
          <ConfirmButton onConfirm={onResetAllStock} variant="secondary">
            {t("resetAllStockButton")}
          </ConfirmButton>
        </div>
        <p className="text-xs text-slate-500">
          {t("unitsCleared")}: <span className="font-mono font-semibold text-slate-300">{clearedTotal.toLocaleString()}</span>
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Skull className="h-4 w-4 text-rose-400" />
            <p className="text-sm font-bold text-slate-100">{t("resetBossFightsTitle")}</p>
          </div>
          <p className="mb-3 text-xs text-slate-500">{t("resetBossFightsDesc")}</p>
          <p className="mb-3 text-xs text-slate-600">
            {bossFights.map((bf) => `${bf.currentQuantity}/${bf.targetQuantity}`).join(" · ")}
          </p>
          <ConfirmButton onConfirm={onResetAllBossFights} variant="secondary" className="w-full">
            {t("resetAllBossFightsButton")}
          </ConfirmButton>
        </Card>

        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <p className="text-sm font-bold text-slate-100">{t("resetAchievementsTitle")}</p>
          </div>
          <p className="mb-3 text-xs text-slate-500">{t("resetAchievementsDesc")}</p>
          <Button variant="secondary" size="sm" onClick={onResetAchievements} className="w-full">
            {t("resetAchievementsButton")}
          </Button>
        </Card>
      </div>
    </div>
  );
}
