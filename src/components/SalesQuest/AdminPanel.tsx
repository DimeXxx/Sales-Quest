import { useMemo, useState } from "react";
import { Pencil, Search, Target, Trash2 } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import type { BossFight, Priority } from "../../types/sales";
import type { ParsedProductRow } from "../../lib/excelImport";
import type { InventoryRow } from "../../hooks/useAdminState";
import type { TeamChallengeInput } from "./TeamChallengeForm";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Progress } from "../ui/Progress";
import { Modal } from "../ui/Modal";
import { ConfirmButton } from "../ui/ConfirmButton";
import { FocusProductForm } from "./FocusProductForm";
import { InventoryTable } from "./InventoryTable";
import { ExcelImportPanel } from "./ExcelImportPanel";
import { TeamChallengeForm } from "./TeamChallengeForm";
import { EditProductModal } from "./EditProductModal";

interface AdminPanelProps {
  inventory: InventoryRow[];
  bossFights: BossFight[];
  onCreateFocusProduct: (input: {
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
  onBulkImport: (rows: ParsedProductRow[]) => void;
  onRemoveFocusProduct: (id: string, permanent?: boolean) => void;
  onUpdateCashBonus: (focusProductId: string, cashBonus: number) => void;
  onUpdateFocusProduct: (
    focusProductId: string,
    patch: Partial<{
      name: string;
      sku: string;
      category: string;
      price: number;
      priority: Priority;
      xpReward: number;
      coinReward: number;
      cashBonus: number;
      stock: number;
      imageUrl: string | null;
      description: string;
    }>
  ) => void;
  onToggleBossFight: (id: string) => void;
  onCreateBossFight: (input: TeamChallengeInput) => void;
  onUpdateBossFight: (id: string, input: TeamChallengeInput) => void;
  onDeleteBossFight: (id: string) => void;
  onRecomputePriorities: () => void;
  onRecomputeAchievements: () => void;
  /** Show only the products/inventory section (used by the split Admin nav). */
  hideBossFights?: boolean;
  /** Show only the Boss Fights section (used by the split Admin nav). */
  onlyBossFights?: boolean;
}

export function AdminPanel({
  inventory,
  bossFights,
  onCreateFocusProduct,
  onBulkImport,
  onRemoveFocusProduct,
  onUpdateCashBonus,
  onUpdateFocusProduct,
  onToggleBossFight,
  onCreateBossFight,
  onUpdateBossFight,
  onDeleteBossFight,
  onRecomputePriorities,
  onRecomputeAchievements,
  hideBossFights = false,
  onlyBossFights = false,
}: AdminPanelProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [editingBossFightId, setEditingBossFightId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<InventoryRow | null>(null);

  const filteredInventory = useMemo(() => {
    if (!search.trim()) return inventory;
    const needle = search.trim().toLowerCase();
    return inventory.filter((r) => r.name.toLowerCase().includes(needle) || r.sku.toLowerCase().includes(needle));
  }, [inventory, search]);

  const editingBossFight = bossFights.find((b) => b.id === editingBossFightId) ?? null;

  return (
    <div className="space-y-6">
      {!onlyBossFights && (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#F5F7FA]">{t("inventory")}</h2>
              <div className="flex items-center gap-2">
                <button onClick={onRecomputePriorities} className="whitespace-nowrap rounded-lg border border-[#223044] bg-white/[0.02] px-2.5 py-1.5 text-xs font-semibold text-[#8B98A9] hover:text-[#F5F7FA]">
                  Пересчитать приоритеты
                </button>
                <button onClick={onRecomputeAchievements} className="whitespace-nowrap rounded-lg border border-[#223044] bg-white/[0.02] px-2.5 py-1.5 text-xs font-semibold text-[#8B98A9] hover:text-[#F5F7FA]">
                  Пересчитать ачивки
                </button>
                <div className="flex max-w-[220px] items-center gap-2 rounded-lg border border-[#223044] bg-white/[0.02] px-2.5 py-1.5 text-[#8B98A9]">
                  <Search className="h-3.5 w-3.5" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-transparent text-xs text-[#F5F7FA] outline-none placeholder:text-[#8B98A9]"
                  />
                </div>
              </div>
            </div>
            <InventoryTable rows={filteredInventory} onEdit={setEditingRow} onRemove={onRemoveFocusProduct} onUpdateCashBonus={onUpdateCashBonus} />
          </div>
          <div className="space-y-5 lg:col-span-2">
            <ExcelImportPanel onImport={onBulkImport} />
            <FocusProductForm onCreate={onCreateFocusProduct} />
          </div>
        </div>
      )}

      {!hideBossFights && (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="space-y-3 lg:col-span-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
              <Target className="h-4 w-4 text-cyan-300" /> {t("bossFights")}
            </h2>
            {bossFights.map((bf) => (
              <Card key={bf.id} interactive className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-[#F5F7FA]">{bf.title}</p>
                  <span className={`text-[10px] font-bold uppercase ${bf.active ? "text-emerald-400" : "text-[#8B98A9]"}`}>
                    {bf.active ? t("active") : t("inactive")}
                  </span>
                </div>
                <p className="mb-3 text-xs text-[#8B98A9]">{bf.description}</p>
                <div className="mb-1 flex justify-between text-xs text-[#8B98A9]">
                  <span>{t("target")}: {bf.targetQuantity} units ({bf.targetSku})</span>
                  <span>{bf.currentQuantity}/{bf.targetQuantity}</span>
                </div>
                <Progress value={(bf.currentQuantity / bf.targetQuantity) * 100} colorClassName="bg-cyan-400" />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-[#8B98A9]">{t("bossFightReward")}: {bf.reward}</span>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant={bf.active ? "secondary" : "primary"} onClick={() => onToggleBossFight(bf.id)}>
                      {bf.active ? t("deactivate") : t("activate")}
                    </Button>
                    <button onClick={() => setEditingBossFightId(bf.id)} className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <ConfirmButton onConfirm={() => onDeleteBossFight(bf.id)} variant="danger" size="sm" className="!p-2">
                      <Trash2 className="h-3.5 w-3.5" />
                    </ConfirmButton>
                  </div>
                </div>
              </Card>
            ))}
            {bossFights.length === 0 && <p className="py-8 text-center text-sm text-[#8B98A9]">Нет Team Challenge — создай справа</p>}
          </div>
          <div className="lg:col-span-2">
            <TeamChallengeForm onSubmit={onCreateBossFight} submitLabel="Создать Team Challenge" />
          </div>
        </div>
      )}

      <Modal open={Boolean(editingBossFight)} onClose={() => setEditingBossFightId(null)} title="Редактировать Team Challenge" maxWidth="max-w-md">
        {editingBossFight && (
          <TeamChallengeForm
            initial={{
              title: editingBossFight.title,
              description: editingBossFight.description,
              targetSku: editingBossFight.targetSku,
              targetQuantity: editingBossFight.targetQuantity,
              deadline: editingBossFight.deadline,
              reward: editingBossFight.reward,
            }}
            submitLabel="Сохранить"
            onSubmit={(input) => {
              onUpdateBossFight(editingBossFight.id, input);
              setEditingBossFightId(null);
            }}
          />
        )}
      </Modal>

      <EditProductModal
        row={editingRow}
        onClose={() => setEditingRow(null)}
        onSave={onUpdateFocusProduct}
        onRemove={onRemoveFocusProduct}
      />
    </div>
  );
}
