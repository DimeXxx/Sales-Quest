import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import type { Achievement } from "../types/sales";
import type { ToastMessage } from "../components/ui/Toast";

export interface Session {
  id: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface XpLedgerEntry {
  id: string;
  source: "sale" | "personal_task" | "rop_bonus";
  xpDelta: number;
  coinsDelta: number;
  note: string;
  createdAt: string;
}

export interface SalesHistoryRow {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  dealValue: number | null;
  status: string;
  createdAt: string;
}

export interface MyKpi {
  monthlyTarget: number;
  monthRevenue: number;
  monthPct: number;
  avgDealSize: number;
  focusUnitsSold: number;
  totalDeals: number;
  activeDays: string[];
}

interface UseManagerProfileArgs {
  pushToast: (title: string, subtitle?: string, kind?: ToastMessage["kind"]) => void;
}

export function useManagerProfile({ pushToast }: UseManagerProfileArgs) {
  const { refresh: refreshAccount } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [kpi, setKpi] = useState<MyKpi | null>(null);
  const [achievements, setAchievements] = useState<(Achievement & { progress: number; target: number })[]>([]);
  const [xpHistory, setXpHistory] = useState<{ entries: XpLedgerEntry[]; total: number }>({ entries: [], total: 0 });
  const [salesHistory, setSalesHistory] = useState<{ sales: SalesHistoryRow[]; total: number }>({ sales: [], total: 0 });

  const refetchAll = useCallback(async () => {
    const [sessionsRes, notifRes, kpiRes, achRes] = await Promise.all([
      api.get<{ sessions: Session[] }>("/auth/sessions"),
      api.get<{ notifications: Notification[]; unreadCount: number }>("/notifications"),
      api.get<MyKpi>("/my-kpi"),
      api.get<{ achievements: (Achievement & { progress: number; target: number })[] }>("/achievements-progress"),
    ]);
    setSessions(sessionsRes.sessions);
    setNotifications(notifRes.notifications);
    setUnreadCount(notifRes.unreadCount);
    setKpi(kpiRes);
    setAchievements(achRes.achievements);
  }, []);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  const fetchXpHistory = useCallback(async (page: number, source?: string) => {
    const qs = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (source) qs.set("source", source);
    const res = await api.get<{ entries: XpLedgerEntry[]; total: number }>(`/xp-history?${qs}`);
    setXpHistory(res);
  }, []);

  const fetchSalesHistory = useCallback(async (page: number) => {
    const res = await api.get<{ sales: SalesHistoryRow[]; total: number }>(`/sales-history?page=${page}&pageSize=20`);
    setSalesHistory(res);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await api.post("/auth/change-password", { currentPassword, newPassword });
        pushToast("Пароль изменён");
        return true;
      } catch (e) {
        const code = e instanceof ApiError ? e.code : "unknown_error";
        pushToast("Не удалось изменить пароль", code === "invalid_current_password" ? "Текущий пароль неверен" : code, "error");
        return false;
      }
    },
    [pushToast]
  );

  const logoutOtherSessions = useCallback(async () => {
    await api.post("/auth/sessions/logout-others");
    pushToast("Другие устройства разлогинены");
    await refetchAll();
  }, [refetchAll, pushToast]);

  const updateProfile = useCallback(
    async (patch: { name?: string; avatarUrl?: string | null; department?: string }) => {
      await api.put("/me/profile", patch);
      pushToast("Профиль обновлён");
      await refreshAccount();
    },
    [refreshAccount, pushToast]
  );

  const updateNotifyPrefs = useCallback(
    async (patch: { inApp?: boolean; email?: boolean; telegram?: boolean }) => {
      await api.put("/me/notify-prefs", patch);
      await refreshAccount();
    },
    [refreshAccount]
  );

  const markAllNotificationsRead = useCallback(async () => {
    await api.post("/notifications/read-all");
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    sessions,
    notifications,
    unreadCount,
    kpi,
    achievements,
    xpHistory,
    salesHistory,
    fetchXpHistory,
    fetchSalesHistory,
    changePassword,
    logoutOtherSessions,
    updateProfile,
    updateNotifyPrefs,
    markAllNotificationsRead,
    refetchAll,
  };
}
