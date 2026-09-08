import { useState } from "react";
import { AlertTriangle, Coins, DollarSign, Minus, Package, Plus, TrendingUp, Zap } from "lucide-react";
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
  onSell: (quantity: number) => void;
}

const GLOW = { critical: "rose", high: "amber", normal: "emerald" } as const;
const GAUGE_COLOR = { critical: "#FB7185", high: "#FBBF24", normal: "#34D399" } as const;
const BORDER = {
  critical: "border-rose-500/50 hover:border-rose-400/70",
  high: "border-amber-500/50 hover:border-amber-400/70",
  normal: "border-emerald-500/50 hover:border-emerald-400/70",
} as const;

interface FloatingNumber {
  id: number;
  label: string;
}

export function QuestCard({ quest, pulsing, onSell }: QuestCardProps) {
  const { t } = useLanguage();
  const { product, priority, xpReward, coinReward, cashBonus } = quest;
  const soldOut = product.stock <= 0;
  const isCritical = !soldOut && product.stock <= 10;
  const isWarning = !soldOut && !isCritical && product.stock <= 25;
  const cat = getCategoryStyle(product.category);
  const cleared = Math.max(0, product.initialStock - product.stock);
  const clearedPct = product.initialStock > 0 ? (cleared / product.initialStock) * 100 : 0;

  const [qty, setQty] = useState(1);
  const [floaters, setFloaters] = useState<FloatingNumber[]>([]);
  const clampQty = (n: number) => Math.max(1, Math.min(product.stock || 1, n));

  const fireSplash = () => {
    const id = Date.now();
    setFloaters((f) => [...f, { id, label: `+${xpReward * qty} XP` }]);
    window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 900);
  };

  return (
    <Card
      glow={GLOW[priority]}
      className={`group relative flex flex-col overflow-hidden border p-0 transition-all duration-300 hover:-translate-y-1 ${BORDER[priority]} ${
        pulsing ? "scale-[1.02] ring-2 ring-emerald-400/60" : ""
      }`}
    >
      {/* floating +XP splash */}
      {floaters.map((f) => (
        <span
          key={f.id}
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 text-sm font-black text-violet-300 drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]"
          style={{ animation: "floatUp 0.9s ease-out forwards" }}
        >
          {f.label}
        </span>
      ))}

      {/* fixed 16:9 image container — dark padded backdrop so photos with white/gray backgrounds don't clash */}
      <div className="relative w-full overflow-hidden bg-slate-950/60" style={{ aspectRatio: "16/9" }}>
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <ProductImage
            name={product.name}
            category={product.category}
            src={product.imageUrl}
            accentFrom={cat.glowFrom}
            accentTo={cat.glowTo}
            className="h-full w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
        <div className="absolute left-2 top-2">
          <PriorityBadge priority={priority} />
        </div>
        {isCritical && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg shadow-rose-950/50">
            <AlertTriangle className="h-2.5 w-2.5" /> {t("critical")}
          </span>
        )}
        {isWarning && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-slate-950 shadow-lg shadow-amber-950/50">
            {t("lowStock")}
          </span>
        )}
        <div className="absolute bottom-1.5 left-2 right-2">
          <p className="truncate text-xs font-bold leading-tight text-white drop-shadow">{product.name}</p>
          <p className={`truncate text-[9px] font-semibold ${cat.text}`}>{product.category} · {product.sku}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-2.5 flex items-center gap-2.5">
          <RadialGauge pct={clearedPct} color={GAUGE_COLOR[priority]} icon={Package} size={40} stroke={4} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-slate-200">
              <span className="font-mono">{cleared}</span>/<span className="font-mono">{product.initialStock}</span>{" "}
              <span className="font-normal text-slate-500">{t("unitsCleared")}</span>
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              📦 <span className="font-semibold text-slate-300">{product.stock}</span> {t("unitsInStock")}
              {product.price > 0 && <span className="ml-1.5 font-mono text-slate-400">${product.price}</span>}
            </p>
          </div>
        </div>

        <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="flex items-center gap-1 font-bold text-violet-300">
            <Zap className="h-3.5 w-3.5" /> +{xpReward * qty}
          </span>
          <span className="flex items-center gap-1 font-bold text-amber-300">
            <Coins className="h-3.5 w-3.5" /> +{coinReward * qty}
          </span>
          {cashBonus > 0 && (
            <span className="flex items-center gap-1 font-bold text-emerald-300">
              <DollarSign className="h-3.5 w-3.5" /> +{(cashBonus * qty).toFixed(2)}
            </span>
          )}
        </div>

        {!soldOut && (
          <div className="mb-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-slate-950/40 p-1">
            <button
              type="button"
              onClick={() => setQty((q) => clampQty(q - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-slate-100"
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(clampQty(Number(e.target.value) || 1))}
              className="w-12 bg-transparent text-center text-sm font-bold text-slate-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQty((q) => clampQty(q + 1))}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-slate-100"
            >
              <Plus className="h-3 w-3" />
            </button>
            <span className="ml-1 text-[10px] text-slate-600">/ {product.stock}</span>
          </div>
        )}

        <Button
          onClick={() => {
            fireSplash();
            onSell(qty);
            setQty(1);
          }}
          disabled={soldOut}
          variant={soldOut ? "secondary" : "primary"}
          size="sm"
          className={`mt-auto w-full ${soldOut ? "!bg-slate-800/70 !text-slate-500 !shadow-none border-slate-700/60" : ""}`}
        >
          {soldOut ? (
            t("soldOut")
          ) : (
            <>
              <TrendingUp className="h-3.5 w-3.5" /> {t("registerSale")}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
