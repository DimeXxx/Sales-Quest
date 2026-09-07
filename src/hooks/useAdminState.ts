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
  productId: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  initialStock: number;
  imageUrl: string | null;
}

interface UseAdminStateArgs {
  pushToast: (title: string, subtitle?: string, kind?: ToastMessage["kind"]) => void;
}

export function useAdminState({ pushToast }: UseAdminStateArgs) {
  const [accounts, setAccounts] = useState<Manager[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [bossFights, setBossFights] = useState<BossFight[]>([]);

  const loadAll = useCallback(async () => {
    const [accountsRes, inventoryRes, bossRes] = await Promise.all([
      api.get<{ accounts: Manager[] }>("/admin/accounts"),
      api.get<{ rows: InventoryRow[] }>("/admin/inventory"),
      api.get<{ bossFights: BossFight[] }>("/boss-fights"),
    ]);
    setAccounts(accountsRes.accounts);
    setInventory(inventoryRes.rows);
    setBossFights(bossRes.bossFights);
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
    async (id: string) => {
      await api.del(`/admin/focus-products/${id}`);
      await loadAll();
    },
    [loadAll]
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

  return {
    accounts,
    pendingAccounts,
    approvedAccounts,
    inventory,
    bossFights,
    approveAccount,
    rejectAccount,
    adjustManager,
    changeRole,
    addFocusProduct,
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
