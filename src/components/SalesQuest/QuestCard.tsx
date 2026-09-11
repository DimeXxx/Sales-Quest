import { useState } from "react";
import { ArrowRight, DollarSign, Minus, Plus } from "lucide-react";
import type { QuestCardData } from "../../types/sales";
import { Card } from "../ui/Card";
import { PriorityBadge } from "../ui/Badge";
import { Progress } from "../ui/Progress";
import { ProductImage } from "../ui/ProductImage";
import { useLanguage } from "../../i18n/LanguageContext";

interface QuestCardProps {
  quest: QuestCardData;
  pulsing: boolean;
  onSell: (quantity: number) => void;
}

/**
 * Compact "mission card" — reads as a B2B product opportunity, not a game
 * card. Small thumbnail, clear stats row (Stock / Target / Reward), thin
 * progress bar, quiet priority tag, "Start quest →" style CTA.
 */
export function QuestCard({ quest, pulsing, onSell }: QuestCardProps) {
  const { t } = useLanguage();
  const { product, priority, xpReward, coinReward, cashBonus } = quest;
  const soldOut = product.stock <= 0;
  const cleared = Math.max(0, product.initialStock - product.stock);
  const clearedPct = product.initialStock > 0 ? (cleared / product.initialStock) * 100 : 0;

  const [qty, setQty] = useState(1);
  const clampQty = (n: number) => Math.max(1, Math.min(product.stock || 1, n));

  return (
    <Card interactive className={`flex flex-col p-3 ${pulsing ? "border-cyan-400/50" : ""}`}>
      <div className="mb-2.5 flex items-start gap-2.5">
        <ProductImage
          name={product.name}
          category={product.category}
          sku={product.sku}
          src={product.imageUrl}
          className="h-11 w-11 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <PriorityBadge priority={priority} />
          <p className="mt-1 truncate text-[13px] font-semibold leading-tight text-[#F5F7FA]" title={product.description || undefined}>{product.name}</p>
          <p className="truncate text-[11px] text-[#8B98A9]">{product.category} · {product.sku}</p>
        </div>
      </div>

      <div className="mb-2.5 grid grid-cols-3 gap-2 rounded-lg bg-white/[0.02] px-2.5 py-2 text-center">
        <div>
          <p className="text-[9px] uppercase tracking-wide text-[#8B98A9]">Stock</p>
          <p className="font-mono text-xs font-bold text-[#F5F7FA]">{product.stock}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide text-[#8B98A9]">XP</p>
          <p className="font-mono text-xs font-bold text-violet-300">+{xpReward * qty}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide text-[#8B98A9]">Points</p>
          <p className="font-mono text-xs font-bold text-amber-300">+{coinReward * qty}</p>
        </div>
      </div>

      {cashBonus > 0 && (
        <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
          <DollarSign className="h-3 w-3" /> +{(cashBonus * qty).toFixed(2)}
        </p>
      )}

      <div className="mb-2.5">
        <div className="mb-1 flex items-center justify-between text-[10px] text-[#8B98A9]">
          <span>{cleared}/{product.initialStock} {t("unitsCleared")}</span>
          <span className="font-mono text-cyan-300">{Math.round(clearedPct)}%</span>
        </div>
        <Progress value={clearedPct} />
      </div>

      {!soldOut ? (
        <div className="mb-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-[#223044] bg-white/[0.02] p-1">
          <button type="button" onClick={() => setQty((q) => clampQty(q - 1))} className="flex h-6 w-6 items-center justify-center rounded-md text-[#8B98A9] hover:bg-white/5 hover:text-[#F5F7FA]">
            <Minus className="h-3 w-3" />
          </button>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(clampQty(Number(e.target.value) || 1))}
            className="w-10 bg-transparent text-center text-sm font-bold text-[#F5F7FA] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button type="button" onClick={() => setQty((q) => clampQty(q + 1))} className="flex h-6 w-6 items-center justify-center rounded-md text-[#8B98A9] hover:bg-white/5 hover:text-[#F5F7FA]">
            <Plus className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <p className="mb-2.5 text-center text-[11px] font-semibold text-[#8B98A9]">{t("soldOut")}</p>
      )}

      <button
        onClick={() => {
          onSell(qty);
          setQty(1);
        }}
        disabled={soldOut}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-400/10 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:bg-white/[0.03] disabled:text-[#8B98A9]"
      >
        {soldOut ? t("soldOut") : <>{t("registerSale")} <ArrowRight className="h-3.5 w-3.5" /></>}
      </button>
    </Card>
  );
}
