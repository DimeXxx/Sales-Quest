import { useEffect, useState } from "react";
import { Skull, Swords } from "lucide-react";
import type { BossFight as BossFightType } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

interface BossFightProps {
  bossFight: BossFightType;
  onJoin?: () => void;
}

function useCountdown(deadline: string) {
  const [remaining, setRemaining] = useState(() => new Date(deadline).getTime() - Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining(new Date(deadline).getTime() - Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  const clamped = Math.max(0, remaining);
  const h = Math.floor(clamped / 3_600_000);
  const m = Math.floor((clamped % 3_600_000) / 60_000);
  const s = Math.floor((clamped % 60_000) / 1000);
  const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return { label, expired: clamped <= 0 };
}

export function BossFightCard({ bossFight, onJoin }: BossFightProps) {
  const { t } = useLanguage();
  const { label, expired } = useCountdown(bossFight.deadline);

  // Boss "health" — starts full, drains toward zero as the team sells.
  const healthPct = Math.max(0, 100 - (bossFight.currentQuantity / bossFight.targetQuantity) * 100);
  const remaining = bossFight.targetQuantity - bossFight.currentQuantity;
  const defeated = remaining <= 0;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-0.5 animate-pulse rounded-2xl bg-gradient-to-r from-rose-600/40 via-red-500/30 to-rose-600/40 blur-md" />

      <Card className="relative overflow-hidden border border-rose-500/60 bg-gradient-to-br from-rose-950/40 via-slate-950 to-black p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-red-500/10 blur-2xl" />

        <div className="relative mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {!defeated && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />}
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${defeated ? "bg-emerald-400" : "bg-rose-500"}`} />
            </span>
            <Skull className="h-5 w-5 text-rose-400" />
            <p className="text-sm font-black uppercase tracking-widest text-rose-300">{t("bossFight")}</p>
          </div>
          <span className="font-mono text-xs font-bold tracking-wider text-rose-300">{expired ? "00:00:00" : label}</span>
        </div>

        <p className="relative mb-1 text-lg font-black text-white">{bossFight.title}</p>
        <p className="relative mb-4 text-xs text-slate-400">{bossFight.description}</p>

        {/* Boss health bar */}
        <div className="relative mb-1.5 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wide text-rose-300">{t("bossHealthLabel")}</span>
          <span className="font-mono text-slate-300">
            {defeated ? t("bossDefeated") : `${remaining} / ${bossFight.targetQuantity}`}
          </span>
        </div>
        <div className="relative h-4 w-full overflow-hidden rounded-full border border-rose-900/60 bg-slate-950">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              defeated ? "bg-emerald-400" : "bg-gradient-to-r from-rose-600 via-rose-500 to-red-400"
            }`}
            style={{ width: `${healthPct}%`, filter: `drop-shadow(0 0 6px ${defeated ? "#34D399" : "#F43F5E"})` }}
          />
        </div>

        <div className="relative mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-300">{t("bossFightReward")}: <span className="font-semibold text-white">{bossFight.reward}</span></p>
          <Button variant="danger" size="sm" onClick={onJoin} disabled={expired || defeated}>
            <Swords className="h-3.5 w-3.5" /> {defeated ? t("bossDefeated") : t("bossFightJoin")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
