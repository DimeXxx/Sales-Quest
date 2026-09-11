import { useState } from "react";
import { Calendar, DollarSign, Package, TrendingUp } from "lucide-react";
import type { QuestCardData } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Progress } from "../ui/Progress";
import { PriorityBadge } from "../ui/Badge";
import { ProductImage } from "../ui/ProductImage";

interface MissionDetailModalProps {
  quest: QuestCardData | null;
  onClose: () => void;
  onSell: (focusProductId: string, quantity: number, details?: { customer?: string; dealValue?: number }) => Promise<boolean>;
}

const PRIORITY_REASON_KEY = {
  critical: "reasonPriorityCritical",
  high: "reasonPriorityHigh",
  normal: "reasonPriorityNormal",
} as const;

/**
 * Combines the spec's "Mission Detail" screen and "Log Sale" modal into one
 * dialog — the reasoning ("Why this product?") is always real: days in
 * stock is computed from the focus product's actual creation date, stock
 * remaining and priority come straight from the data, nothing fabricated.
 */
export function MissionDetailModal({ quest, onClose, onSell }: MissionDetailModalProps) {
  const { t } = useLanguage();
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!quest) return null;

  const { product, priority, xpReward, coinReward, cashBonus, daysInStock, mySold } = quest;
  const soldOut = product.stock <= 0;
  const cleared = Math.max(0, product.initialStock - product.stock);

  const reset = () => {
    setQty(1);
    setCustomer("");
    setDealValue("");
  };

  const submit = async () => {
    setSubmitting(true);
    const ok = await onSell(quest.focusProductId, qty, {
      customer: customer || undefined,
      dealValue: dealValue ? Number(dealValue) : undefined,
    });
    setSubmitting(false);
    if (ok) {
      reset();
      onClose();
    }
  };

  return (
    <Modal open={Boolean(quest)} onClose={() => { reset(); onClose(); }} title={product.name} maxWidth="max-w-lg">
      <div className="mb-4 flex items-start gap-3">
        <ProductImage name={product.name} category={product.category} sku={product.sku} src={product.imageUrl} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        <div>
          <PriorityBadge priority={priority} />
          <p className="mt-1 text-xs text-[#8B98A9]">{product.category} · {product.sku}</p>
          {product.description && <p className="mt-1.5 text-xs text-[#8B98A9]">{product.description}</p>}
          <p className="mt-1 text-xs text-[#8B98A9]">{product.stock} units in stock</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-[#223044] bg-white/[0.02] p-3">
        <p className="mb-2 text-xs font-semibold text-[#F5F7FA]">{t("whyThisProduct")}</p>
        <ul className="space-y-1.5 text-xs text-[#8B98A9]">
          <li className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
            {t("reasonDaysInStock").replace("{days}", String(daysInStock))}
          </li>
          <li className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
            {t("reasonStockRemaining").replace("{stock}", String(product.stock))}
          </li>
          <li className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
            {t(PRIORITY_REASON_KEY[priority])}
          </li>
        </ul>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-[#8B98A9]">
          <span>{t("yourProgress")}</span>
          <span className="font-mono text-[#F5F7FA]">{mySold} / {product.initialStock}</span>
        </div>
        <Progress value={(mySold / Math.max(1, product.initialStock)) * 100} colorClassName="bg-violet-400" />
        <p className="mt-1 text-[11px] text-[#8B98A9]">{cleared} {t("unitsCleared")}</p>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-white/[0.02] p-3 text-center">
        <div>
          <p className="text-[9px] uppercase tracking-wide text-[#8B98A9]">XP</p>
          <p className="font-mono text-sm font-bold text-violet-300">+{xpReward * qty}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide text-[#8B98A9]">Points</p>
          <p className="font-mono text-sm font-bold text-amber-300">+{coinReward * qty}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide text-[#8B98A9]">$</p>
          <p className="font-mono text-sm font-bold text-emerald-300">+{(cashBonus * qty).toFixed(2)}</p>
        </div>
      </div>

      {!soldOut ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[#8B98A9]">{t("quantity")}</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
              className="w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#8B98A9]">{t("customerOptional")}</label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-[#8B98A9]"><DollarSign className="h-3 w-3" /> {t("dealValueOptional")}</label>
            <input
              type="number"
              step="0.01"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              className="w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none focus:border-cyan-400"
            />
          </div>
          <Button className="w-full" disabled={submitting} onClick={submit}>
            {t("submitSale")}
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm font-semibold text-[#8B98A9]">{t("soldOut")}</p>
      )}
    </Modal>
  );
}
