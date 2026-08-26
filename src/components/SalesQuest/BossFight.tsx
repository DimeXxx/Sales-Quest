import { useEffect, useState } from "react";
import { Skull, Swords } from "lucide-react";
import type { BossFight as BossFightType } from "../../types/sales";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
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
  const pct = (bossFight.currentQuantity / bossFight.targetQuantity) * 100;

  return (
    <Card glow="rose" className="relative overflow-hidden border border-rose-500/30 p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl" />
      <div className="mb-3 flex items-center gap-2">
        <Skull className="h-5 w-5 text-rose-400" />
        <p className="text-sm font-black uppercase tracking-wide text-rose-300">{t("bossFight")}</p>
      </div>

      <p className="mb-1 text-base font-bold text-zinc-100">{bossFight.title}</p>
      <p className="mb-4 text-xs text-zinc-500">{bossFight.description}</p>

      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-zinc-400">
          {t("target")}: <span className="font-mono font-semibold text-zinc-200">{bossFight.currentQuantity} / {bossFight.targetQuantity}</span>
        </span>
        <span className="font-mono font-semibold text-rose-300">{expired ? "00:00:00" : label}</span>
      </div>
      <Progress value={pct} colorClassName="bg-gradient-to-r from-rose-500 to-rose-400" />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-300">{t("bossFightReward")}: {bossFight.reward}</p>
        <Button variant="danger" size="sm" onClick={onJoin} disabled={expired}>
          <Swords className="h-3.5 w-3.5" /> {t("bossFightJoin")}
        </Button>
      </div>
    </Card>
  );
}
