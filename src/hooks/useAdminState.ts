import { useCallback, useEffect, useState } from "react";
import type { BossFight, Manager, PersonalTask, Priority, Reward } from "../types/sales";
import type { ParsedProductRow } from "../lib/excelImport";
import type { TeamChallengeInput } from "../components/SalesQuest/TeamChallengeForm";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
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
  description: string;
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
  const { account: myAccount, refresh: refreshMyAccount } = useAuth();
  const [accounts, setAccounts] = useState<Manager[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [bossFights, setBossFights] = useState<BossFight[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [personalTasks, setPersonalTasks] = useState<PersonalTask[]>([]);
  const [salesReport, setSalesReport] = useState<{ products: SalesReportProduct[]; managers: SalesReportManager[] }>({
    products: [],
    managers: [],
  });

  const loadAll = useCallback(async () => {
    const [accountsRes, inventoryRes, bossRes, rewardsRes, personalTasksRes, reportRes] = await Promise.all([
      api.get<{ accounts: Manager[] }>("/admin/accounts"),
      api.get<{ rows: InventoryRow[] }>("/admin/inventory"),
      api.get<{ bossFights: BossFight[] }>("/boss-fights"),
      api.get<{ rewards: Reward[] }>("/admin/rewards"),
      api.get<{ tasks: PersonalTask[] }>("/admin/personal-tasks"),
      api.get<{ products: SalesReportProduct[]; managers: SalesReportManager[] }>("/admin/sales-report"),
    ]);
    setAccounts(accountsRes.accounts);
    setInventory(inventoryRes.rows);
    setBossFights(bossRes.bossFights);
    setRewards(rewardsRes.rewards);
    setPersonalTasks(personalTasksRes.tasks);
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
      try {
        await api.post(`/admin/accounts/${id}/role`, { role });
        pushToast("Роль обновлена");
        await loadAll();
        // If we just changed our OWN role, refresh AuthContext immediately —
        // otherwise the app keeps showing the Admin shell (routing reads the
        // cached account from login) until the next manual refresh.
        if (id === myAccount?.id) await refreshMyAccount();
      } catch (e) {
        pushToast("Не удалось изменить роль", e instanceof Error ? e.message : "", "error");
      }
    },
    [loadAll, pushToast, myAccount, refreshMyAccount]
  );

  const updateAccount = useCallback(
    async (id: string, patch: { name?: string; email?: string }) => {
      await api.put(`/admin/accounts/${id}`, patch);
      pushToast("Менеджер обновлён");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const createManager = useCallback(
    async (input: { name: string; email: string; password: string; role: "manager" | "rop" }) => {
      try {
        await api.post("/admin/accounts", input);
        pushToast("Аккаунт создан", `${input.name} может войти этими данными сразу`);
        await loadAll();
        return true;
      } catch (e) {
        const code = e instanceof ApiError ? e.code : "unknown_error";
        pushToast("Не удалось создать аккаунт", code === "email_taken" ? "Такой email уже занят" : code, "error");
        return false;
      }
    },
    [loadAll, pushToast]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      try {
        await api.del(`/admin/accounts/${id}`);
        pushToast("Менеджер удалён");
        await loadAll();
      } catch {
        pushToast("Не удалось удалить", "Это последний админ — назначь другого перед удалением", "error");
      }
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
      imageUrl: string | null;
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
        imageUrl: string | null;
        description: string;
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

  const createBossFight = useCallback(
    async (input: TeamChallengeInput) => {
      await api.post("/admin/boss-fights", input);
      pushToast("Team Challenge создан");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const updateBossFight = useCallback(
    async (id: string, input: TeamChallengeInput) => {
      await api.put(`/admin/boss-fights/${id}`, input);
      pushToast("Team Challenge обновлён");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const deleteBossFight = useCallback(
    async (id: string) => {
      await api.del(`/admin/boss-fights/${id}`);
      pushToast("Team Challenge удалён");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const createReward = useCallback(
    async (input: { name: string; description: string; costCoins: number; icon: string }) => {
      await api.post("/admin/rewards", input);
      pushToast("Награда добавлена");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const updateReward = useCallback(
    async (id: string, patch: { name?: string; description?: string; costCoins?: number; icon?: string }) => {
      await api.put(`/admin/rewards/${id}`, patch);
      pushToast("Награда обновлена");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const deleteReward = useCallback(
    async (id: string) => {
      await api.del(`/admin/rewards/${id}`);
      pushToast("Награда удалена");
      await loadAll();
    },
    [loadAll, pushToast]
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
    pushToast("Все данные сброшены", "Менеджеры, склад, Team Challenge и ачивки — на старте");
    await loadAll();
  }, [loadAll, pushToast]);

  const updateCashBonus = useCallback(
    async (focusProductId: string, cashBonus: number) => {
      await api.post(`/admin/focus-products/${focusProductId}/cash-bonus`, { cashBonus });
      await loadAll();
    },
    [loadAll]
  );

  const recomputePriorities = useCallback(async () => {
    const res = await api.post<{ changed: number }>("/admin/recompute-priorities");
    pushToast("Приоритеты пересчитаны", `Изменено товаров: ${res.changed}`);
    await loadAll();
  }, [loadAll, pushToast]);

  const recomputeAchievements = useCallback(async () => {
    const res = await api.post<{ totalUnlocked: number }>("/admin/recompute-achievements");
    pushToast("Ачивки пересчитаны", `Новых разблокировок: ${res.totalUnlocked}`);
  }, [pushToast]);

  const recomputeCategories = useCallback(async () => {
    const res = await api.post<{ changed: number }>("/admin/recompute-categories");
    pushToast("Категории пересчитаны", `Изменено товаров: ${res.changed}`);
    await loadAll();
  }, [loadAll, pushToast]);

  const createPersonalTask = useCallback(
    async (input: {
      type: "debt_collection" | "individual_kpi";
      title: string;
      description: string;
      assigneeIds: string[];
      targetType: "sum" | "count";
      targetSum?: number;
      targetCount?: number;
      universeCount?: number;
      deadline: string;
      xpReward: number;
      coinReward: number;
      perEntryXp: number;
      perEntryCoins: number;
    }) => {
      await api.post("/admin/personal-tasks", input);
      pushToast("Задача назначена", `${input.assigneeIds.length} сотрудник(ов)`);
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const deletePersonalTask = useCallback(
    async (id: string) => {
      await api.del(`/admin/personal-tasks/${id}`);
      pushToast("Задача удалена");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const approvePersonalTaskEntry = useCallback(
    async (taskId: string, entryId: string) => {
      await api.post(`/admin/personal-tasks/${taskId}/entries/${entryId}/approve`);
      pushToast("Подтверждено", "Награда начислена сотруднику");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  const rejectPersonalTaskEntry = useCallback(
    async (taskId: string, entryId: string) => {
      await api.post(`/admin/personal-tasks/${taskId}/entries/${entryId}/reject`);
      pushToast("Отклонено");
      await loadAll();
    },
    [loadAll, pushToast]
  );

  return {
    accounts,
    pendingAccounts,
    approvedAccounts,
    inventory,
    bossFights,
    rewards,
    personalTasks,
    salesReport,
    approveAccount,
    rejectAccount,
    adjustManager,
    changeRole,
    updateAccount,
    createManager,
    deleteAccount,
    addFocusProduct,
    updateCashBonus,
    recomputePriorities,
    recomputeAchievements,
    recomputeCategories,
    createPersonalTask,
    deletePersonalTask,
    approvePersonalTaskEntry,
    rejectPersonalTaskEntry,
    updateFocusProduct,
    bulkImportProducts,
    removeFocusProduct,
    toggleBossFight,
    createBossFight,
    updateBossFight,
    deleteBossFight,
    createReward,
    updateReward,
    deleteReward,
    resetManagerProgress,
    resetAllManagersProgress,
    resetAllStock,
    resetAllBossFights,
    resetAchievements,
    resetEverything,
    refetch: loadAll,
  };
}
