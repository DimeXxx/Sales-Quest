import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

export interface WeeklyStat {
  week: string;
  units: number;
  xp: number;
  coins: number;
  deals: number;
}

export interface ProductStat {
  name: string;
  sku: string;
  units: number;
}

export interface MyAnalytics {
  salesByWeek: WeeklyStat[];
  topProducts: ProductStat[];
  totalUnits: number;
  totalDealValue: number;
  totalDeals: number;
}

const EMPTY: MyAnalytics = { salesByWeek: [], topProducts: [], totalUnits: 0, totalDealValue: 0, totalDeals: 0 };

export function useMyAnalytics() {
  const [data, setData] = useState<MyAnalytics>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const res = await api.get<MyAnalytics>("/my-analytics");
    setData(res);
  }, []);

  useEffect(() => {
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  return { ...data, loading, refetch };
}
