import { AlertTriangle, Coins, Package, TrendingUp, Zap } from "lucide-react";
import type { QuestCardData } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { PriorityBadge } from "../ui/Badge";
import { RadialGauge } from "../ui/RadialGauge";
import { ProductImage } from "../ui/ProductImage";
import { getCategoryStyle } from "../../lib/categoryColors";
import { useLanguage } from "../../i18n/LanguageContext";

interface QuestCardProps {
  quest: QuestCardData;
  pulsing: boolean;
  onSell: () => void;
}

const GLOW = { critical: "rose", high: "amber", normal: "emerald" } as const;
const GAUGE_COLOR = { critical: "#FB7185", high: "#FBBF24", normal: "#34D399" } as const;
const BORDER = {
  critical: "border-rose-500/50 hover:border-rose-400/70",
  high: "border-amber-500/50 hover:border-amber-400/70",
  normal: "border-emerald-500/50 hover:border-emerald-400/70",
} as const;

export function QuestCard({ quest, pulsing, onSell }: QuestCardProps) {
  const { t } = useLanguage();
  const { product, priority, xpReward, coinReward } = quest;
  const soldOut = product.stock <= 0;
  const isCritical = !soldOut && product.stock <= 10;
  const isWarning = !soldOut && !isCritical && product.stock <= 25;
  const cat = getCategoryStyle(product.category);
  const cleared = Math.max(0, product.initialStock - product.stock);
  const clearedPct = product.initialStock > 0 ? (cleared / product.initialStock) * 100 : 0;

  return (
    <Card
      glow={GLOW[priority]}
      className={`group flex flex-col overflow-hidden border p-0 transition-all duration-300 hover:-translate-y-1 ${BORDER[priority]} ${
        pulsing ? "scale-[1.02] ring-2 ring-emerald-400/60" : ""
      }`}
    >
      {/* image / placeholder banner */}
      <div className="relative h-36 w-full overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          accentFrom={cat.glowFrom}
          accentTo={cat.glowTo}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
        <div className="absolute left-3 top-3">
          <PriorityBadge priority={priority} />
        </div>
        {isCritical && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-rose-950/50">
            <AlertTriangle className="h-3 w-3" /> {t("critical")}
          </span>
        )}
        {isWarning && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow-lg shadow-amber-950/50">
            {t("lowStock")}
          </span>
        )}
        <div className="absolute bottom-2.5 left-3 right-3">
          <p className="truncate text-sm font-bold leading-tight text-white drop-shadow">{product.name}</p>
          <p className={`text-[11px] font-semibold ${cat.text}`}>{product.category} · {product.sku}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center gap-3.5">
          <RadialGauge pct={clearedPct} color={GAUGE_COLOR[priority]} icon={Package} size={56} stroke={5} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-200">
              <span className="font-mono">{cleared}</span> / <span className="font-mono">{product.initialStock}</span>{" "}
              <span className="font-normal text-slate-500">{t("unitsCleared")}</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              📦 <span className="font-semibold text-slate-300">{product.stock}</span> {t("unitsInStock")}
              {product.price > 0 && <span className="ml-2 font-mono text-slate-400">${product.price}</span>}
            </p>
          </div>
        </div>

        <p className="mb-3 line-clamp-2 text-xs text-slate-500">{product.description}</p>

        <div className="mb-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-bold text-violet-300">
            <Zap className="h-4 w-4" /> +{xpReward} XP
          </span>
          <span className="flex items-center gap-1.5 font-bold text-amber-300">
            <Coins className="h-4 w-4" /> +{coinReward} Coins
          </span>
        </div>

        <Button onClick={onSell} disabled={soldOut} variant="primary" className="mt-auto w-full">
          {soldOut ? (
            t("soldOut")
          ) : (
            <>
              <TrendingUp className="h-4 w-4" /> {t("registerSale")}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
