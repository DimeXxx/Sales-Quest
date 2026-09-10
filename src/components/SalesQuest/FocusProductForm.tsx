import { useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import type { Priority } from "../../types/sales";
import { calculateReward } from "../../types/sales";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { PhotoPicker } from "../ui/PhotoPicker";
import { PRODUCT_CATEGORIES } from "../../lib/productCategories";
import { useLanguage } from "../../i18n/LanguageContext";

interface FocusProductFormProps {
  onCreate: (input: {
    name: string;
    sku: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    priority: Priority;
    xpReward: number;
    coinReward: number;
    cashBonus: number;
    imageUrl: string | null;
  }) => void;
}

const EMPTY = {
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  priority: "normal" as Priority,
  xp: "",
  coins: "",
  cashBonus: "",
  imageUrl: null as string | null,
};

export function FocusProductForm({ onCreate }: FocusProductFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const [autoReward, setAutoReward] = useState(true);

  const stock = Number(form.stock) || 0;
  const suggested = calculateReward({ stock, stockAgeDays: 0, marginPercent: 0, priority: form.priority });
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
      priority: form.priority,
      xpReward,
      coinReward,
      cashBonus: Number(form.cashBonus) || 0,
      imageUrl: form.imageUrl,
    });
    setForm(EMPTY);
  };

  const field = "rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";

  return (
    <Card className="p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
        <Plus className="h-4 w-4 text-cyan-300" /> {t("addFocusProduct")}
      </h2>

      <div className="mb-3">
        <PhotoPicker value={form.imageUrl} onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder={t("productName")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className={field} placeholder={t("sku")} value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
        <select className={field} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
          <option value="">{t("category")}...</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <input className={field} type="number" placeholder={t("price")} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
        <input className={`${field} sm:col-span-2`} placeholder={t("description")} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <input className={field} type="number" placeholder={t("stock")} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
        <select className={field} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}>
          <option value="critical">{t("filterCritical")}</option>
          <option value="high">{t("filterHigh")}</option>
          <option value="normal">{t("filterNormal")}</option>
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-xs text-[#8B98A9]">
          <input type="checkbox" checked={autoReward} onChange={(e) => setAutoReward(e.target.checked)} />
          {t("autoReward")}
        </label>
        <div className="relative">
          <DollarSign className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-400" />
          <input
            className={`${field} pl-7`}
            type="number"
            step="0.01"
            placeholder={t("cashBonusPerUnit")}
            value={form.cashBonus}
            onChange={(e) => setForm((f) => ({ ...f, cashBonus: e.target.value }))}
          />
        </div>
      </div>

      {!autoReward && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input className={field} type="number" placeholder={t("xpReward")} value={form.xp} onChange={(e) => setForm((f) => ({ ...f, xp: e.target.value }))} />
          <input className={field} type="number" placeholder={t("coinReward")} value={form.coins} onChange={(e) => setForm((f) => ({ ...f, coins: e.target.value }))} />
        </div>
      )}

      {autoReward && (
        <p className="mt-3 text-xs text-[#8B98A9]">
          {t("rewardEngineSuggests")}: <span className="font-bold text-violet-300">+{xpReward} XP</span> ·{" "}
          <span className="font-bold text-amber-300">+{coinReward} Coins</span>
        </p>
      )}
      <p className="mt-1 text-[11px] text-[#8B98A9]">{t("cashBonusHint")}</p>

      <Button className="mt-4 w-full" onClick={submit}>
        <Plus className="h-4 w-4" /> {t("createQuest")}
      </Button>
    </Card>
  );
}
