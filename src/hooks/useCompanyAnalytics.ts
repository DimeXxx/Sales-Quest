import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { WeeklyStat, ProductStat } from "./useMyAnalytics";

export interface ManagerStat {
  accountId: string;
  name: string;
  units: number;
  revenue: number;
  deals: number;
  xpEarned: number;
  coinsEarned: number;
}

export interface CompanyAnalytics {
  salesByWeek: (WeeklyStat & { revenue: number })[];
  topProducts: ProductStat[];
  byManager: ManagerStat[];
  totalUnits: number;
  totalRevenue: number;
  totalXp: number;
  totalCoinsAwarded: number;
  totalCashPaid: number;
  totalDeals: number;
}

const EMPTY: CompanyAnalytics = {
  salesByWeek: [],
  topProducts: [],
  byManager: [],
  totalUnits: 0,
  totalRevenue: 0,
  totalXp: 0,
  totalCoinsAwarded: 0,
  totalCashPaid: 0,
  totalDeals: 0,
};

export function useCompanyAnalytics() {
  const [data, setData] = useState<CompanyAnalytics>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const res = await api.get<CompanyAnalytics>("/admin/analytics");
    setData(res);
  }, []);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  return { ...data, loading, refetch };
}
