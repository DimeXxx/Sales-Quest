import { useCallback, useEffect, useState } from "react";
import type { BossFight, Manager, Priority } from "../types/sales";
import type { ParsedProductRow } from "../lib/excelImport";
import { api } from "../lib/api";
import type { ToastMessage } from "../components/ui/Toast";

export interface InventoryRow {
  focusProductId: string;
  priority: Priority;
  xpReward: number;
  coinReward: number;
  cashBonus: number;
  productId: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  initialStock: number;
  soldCount: number;
  imageUrl: string | null;
}

export interface SalesReportProduct {
  productId: string;
  name: string;
  sku: string;
  category: string;
  soldCount: number;
  stock: number;
  initialStock: number;
  cashBonusPerUnit: number;
  totalCashPaid: number;
}

export interface SalesReportManager {
  accountId: string;
  name: string;
  questsCompleted: number;
  totalCashBonus: number;
}

interface UseAdminStateArgs {
  pushToast: (title: string, subtitle?: string, kind?: ToastMessage["kind"]) => void;
}

export function useAdminState({ pushToast }: UseAdminStateArgs) {
  const [accounts, setAccounts] = useState<Manager[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [bossFights, setBossFights] = useState<BossFight[]>([]);
  const [salesReport, setSalesReport] = useState<{ products: SalesReportProduct[]; managers: SalesReportManager[] }>({
    products: [],
    managers: [],
  });

  const loadAll = useCallback(async () => {
    const [accountsRes, inventoryRes, bossRes, reportRes] = await Promise.all([
      api.get<{ accounts: Manager[] }>("/admin/accounts"),
      api.get<{ rows: InventoryRow[] }>("/admin/inventory"),
      api.get<{ bossFights: BossFight[] }>("/boss-fights"),
      api.get<{ products: SalesReportProduct[]; managers: SalesReportManager[] }>("/admin/sales-report"),
    ]);
    setAccounts(accountsRes.accounts);
    setInventory(inventoryRes.rows);
    setBossFights(bossRes.bossFights);
    setSalesReport(reportRes);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const pendingAccounts = accounts.filter((a) => a.status === "pending");
  const approvedAccounts = accounts.filter((a) => a.status !== "pending");

  const approveAccount = useCallback(
    async (id: string) => {
      await api.post(`/admin/accounts/${id}/approve`);
      pushToast("Аккаунт подтверждён", "Менеджер теперь может войти");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const rejectAccount = useCallback(
    async (id: string) => {
      await api.post(`/admin/accounts/${id}/reject`);
      pushToast("Заявка отклонена");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const adjustManager = useCallback(
    async (id: string, delta: { coins?: number; xp?: number }) => {
      await api.post(`/admin/accounts/${id}/adjust`, delta);
      await loadAll();
    },
    [loadAll]
  );

  const changeRole = useCallback(
    async (id: string, role: "manager" | "rop") => {
      await api.post(`/admin/accounts/${id}/role`, { role });
      pushToast("Роль обновлена");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const addFocusProduct = useCallback(
    async (input: {
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
    }) => {
      await api.post("/admin/focus-products", input);
      pushToast("Квест создан", `${input.name} теперь виден менеджерам`);
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const bulkImportProducts = useCallback(
    async (rows: ParsedProductRow[]) => {
      await api.post("/admin/focus-products/bulk", { rows });
      pushToast(`Импортировано ${rows.length} товаров`, "Все позиции доступны менеджерам как квесты");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const removeFocusProduct = useCallback(
    async (id: string, permanent = false) => {
      await api.del(`/admin/focus-products/${id}${permanent ? "?permanent=true" : ""}`);
      await loadAll();
    },
    [loadAll]
  );

  const updateFocusProduct = useCallback(
    async (
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
      }>
    ) => {
      await api.put(`/admin/focus-products/${focusProductId}`, patch);
      pushToast("Товар обновлён");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const toggleBossFight = useCallback(
    async (id: string) => {
      await api.post(`/admin/boss-fights/${id}/toggle`);
      await loadAll();
    },
    [loadAll]
  );

  const resetManagerProgress = useCallback(async (id: string) => {
    await api.post(`/admin/reset/manager/${id}`);
    await loadAll();
  }, [loadAll]);

  const resetAllManagersProgress = useCallback(async () => {
    await api.post("/admin/reset/managers");
    await loadAll();
  }, [loadAll]);

  const resetAllStock = useCallback(async () => {
    await api.post("/admin/reset/stock");
    await loadAll();
  }, [loadAll]);

  const resetAllBossFights = useCallback(async () => {
    await api.post("/admin/reset/boss-fights");
    await loadAll();
  }, [loadAll]);

  const resetAchievements = useCallback(async () => {
    await api.post("/admin/reset/achievements");
  }, []);

  const resetEverything = useCallback(async () => {
    await api.post("/admin/reset/all");
    pushToast("Все данные сброшены", "Менеджеры, склад, Boss Fight и ачивки — на старте");
    await loadAll();
  }, [loadAll, pushToast]);

  const updateCashBonus = useCallback(
    async (focusProductId: string, cashBonus: number) => {
      await api.post(`/admin/focus-products/${focusProductId}/cash-bonus`, { cashBonus });
      await loadAll();
    },
    [loadAll]
  );

  return {
    accounts,
    pendingAccounts,
    approvedAccounts,
    inventory,
    bossFights,
    salesReport,
    approveAccount,
    rejectAccount,
    adjustManager,
    changeRole,
    addFocusProduct,
    updateCashBonus,
    updateFocusProduct,
    bulkImportProducts,
    removeFocusProduct,
    toggleBossFight,
    resetManagerProgress,
    resetAllManagersProgress,
    resetAllStock,
    resetAllBossFights,
    resetAchievements,
    resetEverything,
    refetch: loadAll,
  };
}
