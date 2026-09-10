import { useEffect, useState } from "react";
import { DollarSign, Trash2 } from "lucide-react";
import type { InventoryRow } from "../../hooks/useAdminState";
import type { Priority } from "../../types/sales";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { PhotoPicker } from "../ui/PhotoPicker";
import { ConfirmButton } from "../ui/ConfirmButton";
import { useLanguage } from "../../i18n/LanguageContext";

export interface ProductPatch {
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
}

interface EditProductModalProps {
  row: InventoryRow | null;
  onClose: () => void;
  onSave: (focusProductId: string, patch: ProductPatch) => void;
  onRemove: (focusProductId: string, permanent?: boolean) => void;
}

/**
 * Full-size product card for editing — a proper layout with a big photo
 * picker up top and clearly labelled fields below, instead of the old
 * cramped inline table-row inputs.
 */
export function EditProductModal({ row, onClose, onSave, onRemove }: EditProductModalProps) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<ProductPatch | null>(null);

  // Reset the draft to the newly-opened row's values (or clear it when closed).
  useEffect(() => {
    if (!row) {
      setDraft(null);
      return;
    }
    setDraft({
      name: row.name,
      sku: row.sku,
      category: row.category,
      description: row.description || "",
      price: row.price,
      stock: row.stock,
      priority: row.priority,
      xpReward: row.xpReward,
      coinReward: row.coinReward,
      cashBonus: row.cashBonus,
      imageUrl: row.imageUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.focusProductId]);

  if (!row || !draft) return null;

  const current = draft;

  const set = <K extends keyof ProductPatch>(key: K, value: ProductPatch[K]) =>
    setDraft({ ...current, [key]: value });

  const field = "w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";
  const label = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8B98A9]";

  return (
    <Modal open={Boolean(row)} onClose={onClose} title={row.name} maxWidth="max-w-xl">
      <div className="space-y-4">
        <div>
          <label className={label}>Фото товара</label>
          <PhotoPicker value={current.imageUrl} onChange={(imageUrl) => set("imageUrl", imageUrl)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>{t("productName")}</label>
            <input className={field} value={current.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className={label}>{t("sku")}</label>
            <input className={field} value={current.sku} onChange={(e) => set("sku", e.target.value)} />
          </div>
        </div>

        <div>
          <label className={label}>{t("description")}</label>
          <textarea className={`${field} min-h-[70px] resize-none`} value={current.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={label}>{t("category")}</label>
            <input className={field} value={current.category} onChange={(e) => set("category", e.target.value)} />
          </div>
          <div>
            <label className={label}>{t("price")}</label>
            <input className={field} type="number" value={current.price} onChange={(e) => set("price", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className={label}>{t("stock")}</label>
            <input className={field} type="number" value={current.stock} onChange={(e) => set("stock", Number(e.target.value) || 0)} />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
            <label className={label}>Priority</label>
            <select className={field} value={current.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
              <option value="critical">{t("filterCritical")}</option>
              <option value="high">{t("filterHigh")}</option>
              <option value="normal">{t("filterNormal")}</option>
            </select>
          </div>
          <div>
            <label className={label}>XP</label>
            <input className={field} type="number" value={current.xpReward} onChange={(e) => set("xpReward", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className={label}>Coins</label>
            <input className={field} type="number" value={current.coinReward} onChange={(e) => set("coinReward", Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className={label}><DollarSign className="inline h-3 w-3" /> Bonus</label>
            <input className={field} type="number" step="0.01" value={current.cashBonus} onChange={(e) => set("cashBonus", Number(e.target.value) || 0)} />
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[#223044] pt-4">
          <Button
            className="flex-1"
            onClick={() => {
              onSave(row.focusProductId, current);
              setDraft(null);
              onClose();
            }}
          >
            {t("apply")}
          </Button>
          <button
            onClick={() => {
              onRemove(row.focusProductId);
              setDraft(null);
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2.5 text-xs font-semibold text-[#8B98A9] hover:text-[#F5F7FA]"
            title="Скрыть из квестов"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <ConfirmButton
            onConfirm={() => {
              onRemove(row.focusProductId, true);
              setDraft(null);
              onClose();
            }}
            variant="danger"
            size="sm"
          >
            Удалить навсегда
          </ConfirmButton>
        </div>
      </div>
    </Modal>
  );
}
