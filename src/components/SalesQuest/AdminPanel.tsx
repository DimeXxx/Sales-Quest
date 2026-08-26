import { Skull, Sparkles } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import type { BossFight, FocusProduct, Priority, Product } from "../../types/sales";
import type { ParsedProductRow } from "../../lib/excelImport";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Progress } from "../ui/Progress";
import { FocusProductForm } from "./FocusProductForm";
import { InventoryTable } from "./InventoryTable";
import { ExcelImportPanel } from "./ExcelImportPanel";

interface AdminPanelProps {
  products: Product[];
  focusProducts: FocusProduct[];
  bossFights: BossFight[];
  onCreateFocusProduct: (input: {
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
  onBulkImport: (rows: ParsedProductRow[]) => void;
  onRemoveFocusProduct: (id: string) => void;
  onToggleBossFight: (id: string) => void;
  /** Show only the products/inventory section (used by the split Admin nav). */
  hideBossFights?: boolean;
  /** Show only the Boss Fights section (used by the split Admin nav). */
  onlyBossFights?: boolean;
}

export function AdminPanel({
  products,
  focusProducts,
  bossFights,
  onCreateFocusProduct,
  onBulkImport,
  onRemoveFocusProduct,
  onToggleBossFight,
  hideBossFights = false,
  onlyBossFights = false,
}: AdminPanelProps) {
  const { t } = useLanguage();
  const rows = focusProducts
    .map((fp) => ({ focusProduct: fp, product: products.find((p) => p.id === fp.productId)! }))
    .filter((r) => r.product);

  return (
    <div className="space-y-6">
      {!onlyBossFights && (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">{t("inventory")}</h2>
            <InventoryTable rows={rows} onRemove={onRemoveFocusProduct} />
          </div>
          <div className="space-y-5 lg:col-span-2">
            <ExcelImportPanel onImport={onBulkImport} />
            <FocusProductForm onCreate={onCreateFocusProduct} />
          </div>
        </div>
      )}

      {!hideBossFights && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
            <Skull className="h-4 w-4 text-rose-400" /> {t("bossFights")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {bossFights.map((bf) => (
              <Card key={bf.id} interactive className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-100">{bf.title}</p>
                  <span className={`text-[10px] font-bold uppercase ${bf.active ? "text-emerald-400" : "text-slate-500"}`}>
                    {bf.active ? t("active") : t("inactive")}
                  </span>
                </div>
                <p className="mb-3 text-xs text-slate-500">{bf.description}</p>
                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>{t("target")}: {bf.targetQuantity} units</span>
                  <span>{bf.currentQuantity}/{bf.targetQuantity}</span>
                </div>
                <Progress value={(bf.currentQuantity / bf.targetQuantity) * 100} colorClassName="bg-gradient-to-r from-rose-500 to-rose-400" glowColor="#F43F5E" />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t("bossFightReward")}: {bf.reward}</span>
                  <Button size="sm" variant={bf.active ? "secondary" : "primary"} onClick={() => onToggleBossFight(bf.id)}>
                    <Sparkles className="h-3.5 w-3.5" /> {bf.active ? t("deactivate") : t("activate")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
