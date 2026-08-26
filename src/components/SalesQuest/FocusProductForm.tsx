import { useState } from "react";
import { Plus } from "lucide-react";
import type { Priority } from "../../types/sales";
import { calculateReward } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";

interface FocusProductFormProps {
  onCreate: (input: {
    name: string;
    sku: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    stockAgeDays: number;
    marginPercent: number;
    priority: Priority;
    xpReward: number;
    coinReward: number;
  }) => void;
}

const EMPTY = {
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  stockAgeDays: "",
  marginPercent: "",
  priority: "normal" as Priority,
  xp: "",
  coins: "",
};

export function FocusProductForm({ onCreate }: FocusProductFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [autoReward, setAutoReward] = useState(true);

  const stock = Number(form.stock) || 0;
  const stockAgeDays = Number(form.stockAgeDays) || 0;
  const marginPercent = Number(form.marginPercent) || 0;

  const suggested = calculateReward({ stock, stockAgeDays, marginPercent, priority: form.priority });
  const xpReward = autoReward ? suggested.xpReward : Number(form.xp) || 0;
  const coinReward = autoReward ? suggested.coinReward : Number(form.coins) || 0;

  const submit = () => {
    if (!form.name || !form.sku || !stock) return;
    onCreate({
      name: form.name,
      sku: form.sku,
      category: form.category || "General",
      description: form.description || t("addFocusProduct"),
      price: Number(form.price) || 0,
      stock,
      stockAgeDays,
      marginPercent,
      priority: form.priority,
      xpReward,
      coinReward,
    });
    setForm(EMPTY);
  };

  const field = "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500";

  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-400">
        <Plus className="h-4 w-4 text-violet-400" /> {t("addFocusProduct")}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder={t("productName")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className={field} placeholder={t("sku")} value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
        <input className={field} placeholder={t("category")} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        <input className={field} type="number" placeholder={t("price")} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
        <input className={`${field} sm:col-span-2`} placeholder={t("description")} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <input className={field} type="number" placeholder={t("stock")} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
        <input className={field} type="number" placeholder={t("stockAge")} value={form.stockAgeDays} onChange={(e) => setForm((f) => ({ ...f, stockAgeDays: e.target.value }))} />
        <input className={field} type="number" placeholder={t("margin")} value={form.marginPercent} onChange={(e) => setForm((f) => ({ ...f, marginPercent: e.target.value }))} />
        <select className={field} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}>
          <option value="critical">{t("filterCritical")}</option>
          <option value="high">{t("filterHigh")}</option>
          <option value="normal">{t("filterNormal")}</option>
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
          <input type="checkbox" checked={autoReward} onChange={(e) => setAutoReward(e.target.checked)} />
          {t("autoReward")}
        </label>
      </div>

      {!autoReward && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input className={field} type="number" placeholder={t("xpReward")} value={form.xp} onChange={(e) => setForm((f) => ({ ...f, xp: e.target.value }))} />
          <input className={field} type="number" placeholder={t("coinReward")} value={form.coins} onChange={(e) => setForm((f) => ({ ...f, coins: e.target.value }))} />
        </div>
      )}

      {autoReward && (
        <p className="mt-3 text-xs text-zinc-500">
          {t("rewardEngineSuggests")}: <span className="font-bold text-violet-300">+{xpReward} XP</span> ·{" "}
          <span className="font-bold text-amber-300">+{coinReward} Coins</span>
        </p>
      )}

      <Button className="mt-4 w-full" onClick={submit}>
        <Plus className="h-4 w-4" /> {t("createQuest")}
      </Button>
    </Card>
  );
}
