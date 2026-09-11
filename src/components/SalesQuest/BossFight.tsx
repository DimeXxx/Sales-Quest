import { useEffect, useState } from "react";
import { Clock, Gift, Users } from "lucide-react";
import type { BossFight as BossFightType, Product } from "../../types/sales";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { Button } from "../ui/Button";
import { ProductImage } from "../ui/ProductImage";
import { useLanguage } from "../../i18n/LanguageContext";

interface BossFightProps {
  bossFight: BossFightType;
  product?: Product;
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

/**
 * Team Challenge — a shared department goal (formerly "Boss Fight"). Reads
 * as a corporate initiative, not a game mechanic: no health bars, no skull
 * icons, no aggressive glow. Just a clear target, progress, and a reward.
 */
export function BossFightCard({ bossFight, product, onJoin }: BossFightProps) {
  const { t } = useLanguage();
  const { label, expired } = useCountdown(bossFight.deadline);
  const pct = (bossFight.currentQuantity / bossFight.targetQuantity) * 100;
  const remaining = Math.max(0, bossFight.targetQuantity - bossFight.currentQuantity);
  const defeated = remaining <= 0;

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/[0.04] blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-300">
              <Users className="h-3 w-3" /> {t("bossFight")}
            </span>
          </div>

          <p className="mb-1 text-base font-bold text-[#F5F7FA]">{bossFight.title}</p>
          <p className="mb-4 text-xs text-[#8B98A9]">{bossFight.description}</p>

          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-[#8B98A9]">
              {t("target")}: <span className="font-mono font-semibold text-[#F5F7FA]">{bossFight.currentQuantity} / {bossFight.targetQuantity}</span>
            </span>
            <span className="font-mono font-semibold text-cyan-300">{Math.round(pct)}%</span>
          </div>
          <Progress value={pct} height="h-2" colorClassName={defeated ? "bg-emerald-400" : "bg-cyan-400"} />

          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={onJoin} disabled={expired || defeated}>
              {defeated ? t("bossDefeated") : t("bossFightJoin")}
            </Button>
          </div>
        </div>

        {product && (
          <ProductImage name={product.name} category={product.category} sku={product.sku} src={product.imageUrl} className="hidden h-28 w-28 shrink-0 rounded-lg object-cover sm:block" />
        )}

        <div className="flex shrink-0 flex-col gap-2 sm:w-36">
          <div className="rounded-lg border border-[#223044] bg-white/[0.02] p-2.5">
            <p className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-[#8B98A9]">
              <Gift className="h-3 w-3" /> {t("bossFightReward")}
            </p>
            <p className="text-xs font-semibold text-[#F5F7FA]">{bossFight.reward}</p>
          </div>
          <div className="rounded-lg border border-[#223044] bg-white/[0.02] p-2.5">
            <p className="mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-[#8B98A9]">
              <Clock className="h-3 w-3" /> Ends in
            </p>
            <p className="font-mono text-xs font-semibold text-cyan-300">{expired ? "00:00:00" : label}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
