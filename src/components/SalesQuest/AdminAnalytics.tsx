import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Coins, DollarSign, Package, Receipt, Users } from "lucide-react";
import { useCompanyAnalytics } from "../../hooks/useCompanyAnalytics";
import { useLanguage } from "../../i18n/LanguageContext";
import { Card } from "../ui/Card";

const CHART_GRID = "#223044";
const CHART_TICK = { fill: "#8B98A9", fontSize: 11 };

export function AdminAnalytics() {
  const { t } = useLanguage();
  const { salesByWeek, topProducts, byManager, totalUnits, totalRevenue, totalCoinsAwarded, totalCashPaid, totalDeals, loading } = useCompanyAnalytics();
  const hasData = salesByWeek.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#F5F7FA]">{t("companyAnalyticsTitle")}</h1>
        <p className="mt-1 text-sm text-[#8B98A9]">{t("companyAnalyticsSubtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label={t("analyticsUnitsCleared")} value={totalUnits} color="#22D3EE" />
        <StatCard icon={DollarSign} label={t("totalRevenue")} value={`$${totalRevenue.toLocaleString()}`} color="#34D399" />
        <StatCard icon={Coins} label={t("totalCoinsAwarded")} value={totalCoinsAwarded.toLocaleString()} color="#F5B93F" />
        <StatCard icon={Receipt} label={t("analyticsDeals")} value={totalDeals} color="#A78BFA" />
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
                  <Line type="monotone" dataKey="revenue" stroke="#34D399" strokeWidth={2} dot={false} name="Revenue" />
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

          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
              <Users className="h-4 w-4 text-cyan-300" /> Продажи по менеджерам
            </h2>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <BarChart data={byManager} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={CHART_TICK} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ ...CHART_TICK, fontSize: 10 }} width={110} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#111923", border: "1px solid #223044", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="#22D3EE" radius={[0, 4, 4, 0]} name="Оборот $" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#223044] text-[11px] uppercase tracking-wide text-[#8B98A9]">
                    <th className="px-3 py-2 font-semibold">Менеджер</th>
                    <th className="px-3 py-2 font-semibold">Сделок</th>
                    <th className="px-3 py-2 font-semibold">Юнитов</th>
                    <th className="px-3 py-2 font-semibold">Оборот $</th>
                    <th className="px-3 py-2 font-semibold">XP</th>
                    <th className="px-3 py-2 font-semibold">Coins</th>
                  </tr>
                </thead>
                <tbody>
                  {byManager.map((m) => (
                    <tr key={m.accountId} className="border-b border-[#223044] last:border-0">
                      <td className="px-3 py-2 font-semibold text-[#F5F7FA]">{m.name}</td>
                      <td className="px-3 py-2 font-mono text-[#F5F7FA]">{m.deals}</td>
                      <td className="px-3 py-2 font-mono text-[#F5F7FA]">{m.units}</td>
                      <td className="px-3 py-2 font-mono text-emerald-300">${m.revenue.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono text-violet-300">{m.xpEarned}</td>
                      <td className="px-3 py-2 font-mono text-amber-300">{m.coinsEarned}</td>
                    </tr>
                  ))}
                  {byManager.length === 0 && (
                    <tr><td colSpan={6} className="px-3 py-4 text-center text-xs text-[#8B98A9]">Пока нет продаж</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-xs text-[#8B98A9]">{t("totalCashPaidLabel")}: <span className="font-mono font-semibold text-emerald-300">${totalCashPaid.toFixed(2)}</span></p>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Package; label: string; value: string | number; color: string }) {
  return (
    <Card interactive className="p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}18` }}>
        <Icon className="h-[18px] w-[18px]" style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-[#F5F7FA]">{value}</p>
      <p className="text-xs text-[#8B98A9]">{label}</p>
    </Card>
  );
}
