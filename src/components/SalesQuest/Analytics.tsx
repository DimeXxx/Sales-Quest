import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, Package, Receipt } from "lucide-react";
import { useMyAnalytics } from "../../hooks/useMyAnalytics";
import { useLanguage } from "../../i18n/LanguageContext";
import { Card } from "../ui/Card";
import { KpiCard } from "./KpiCard";

const CHART_GRID = "#223044";
const CHART_TICK = { fill: "#8B98A9", fontSize: 11 };

export function Analytics() {
  const { t } = useLanguage();
  const { salesByWeek, topProducts, totalUnits, totalDealValue, totalDeals, loading } = useMyAnalytics();

  const hasData = salesByWeek.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#F5F7FA]">{t("analyticsTitle")}</h1>
        <p className="mt-1 text-sm text-[#8B98A9]">{t("analyticsSubtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard icon={Package} value={totalUnits} label={t("analyticsUnitsCleared")} accent="#22D3EE" />
        <KpiCard icon={DollarSign} value={`$${totalDealValue.toLocaleString()}`} label={t("analyticsDealValue")} accent="#34D399" />
        <KpiCard icon={Receipt} value={totalDeals} label={t("analyticsDeals")} accent="#A78BFA" />
      </div>

      {!loading && !hasData && (
        <Card className="p-6 text-center text-sm text-[#8B98A9]">{t("analyticsNoData")}</Card>
      )}

      {hasData && (
        <>
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-bold text-[#F5F7FA]">{t("analyticsSalesByWeek")}</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <LineChart data={salesByWeek}>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={CHART_TICK} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                  <YAxis tick={CHART_TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#111923", border: "1px solid #223044", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="units" stroke="#22D3EE" strokeWidth={2} dot={false} name="Units" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-sm font-bold text-[#F5F7FA]">{t("analyticsTopProducts")}</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={CHART_TICK} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ ...CHART_TICK, fontSize: 10 }} width={140} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#111923", border: "1px solid #223044", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="units" fill="#A78BFA" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
