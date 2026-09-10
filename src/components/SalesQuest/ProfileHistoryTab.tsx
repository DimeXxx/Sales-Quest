import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, DollarSign, Package, Receipt, Target } from "lucide-react";
import type { MyKpi, SalesHistoryRow, XpLedgerEntry } from "../../hooks/useManagerProfile";
import { Card } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { KpiCard } from "./KpiCard";

interface ProfileHistoryTabProps {
  kpi: MyKpi | null;
  xpHistory: { entries: XpLedgerEntry[]; total: number };
  salesHistory: { sales: SalesHistoryRow[]; total: number };
  onFetchXpHistory: (page: number, source?: string) => void;
  onFetchSalesHistory: (page: number) => void;
}

const SOURCE_LABEL: Record<string, string> = {
  sale: "Продажа товара",
  personal_task: "Личная задача",
  rop_bonus: "Бонус от РОПа",
};

const PAGE_SIZE = 20;

export function ProfileHistoryTab({ kpi, xpHistory, salesHistory, onFetchXpHistory, onFetchSalesHistory }: ProfileHistoryTabProps) {
  const [xpPage, setXpPage] = useState(1);
  const [xpSource, setXpSource] = useState<string>("");
  const [salesPage, setSalesPage] = useState(1);

  useEffect(() => {
    onFetchXpHistory(xpPage, xpSource || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xpPage, xpSource]);

  useEffect(() => {
    onFetchSalesHistory(salesPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesPage]);

  const xpPageCount = Math.max(1, Math.ceil(xpHistory.total / PAGE_SIZE));
  const salesPageCount = Math.max(1, Math.ceil(salesHistory.total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-3 text-sm font-bold text-[#F5F7FA]">Личный KPI</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard icon={DollarSign} value={`$${(kpi?.avgDealSize ?? 0).toFixed(0)}`} label="Средний чек" accent="#34D399" />
          <KpiCard icon={Package} value={kpi?.focusUnitsSold ?? 0} label="Юнитов продано" accent="#A78BFA" />
          <KpiCard icon={Receipt} value={kpi?.totalDeals ?? 0} label="Всего сделок" accent="#22D3EE" />
        </div>
        {kpi && kpi.monthlyTarget > 0 ? (
          <Card className="mt-3 p-4">
            <div className="mb-1 flex items-center justify-between text-xs text-[#8B98A9]">
              <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> План на месяц</span>
              <span className="font-mono text-[#F5F7FA]">${kpi.monthRevenue.toLocaleString()} / ${kpi.monthlyTarget.toLocaleString()}</span>
            </div>
            <Progress value={kpi.monthPct} colorClassName="bg-cyan-400" />
          </Card>
        ) : (
          <p className="mt-3 text-xs text-[#8B98A9]">Месячный план не назначен — попроси РОПа установить его в панели менеджеров.</p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#F5F7FA]">История начислений</h2>
          <select
            value={xpSource}
            onChange={(e) => { setXpSource(e.target.value); setXpPage(1); }}
            className="rounded-lg border border-[#223044] bg-white/[0.02] px-2.5 py-1.5 text-xs text-[#F5F7FA] outline-none"
          >
            <option value="">Все источники</option>
            <option value="sale">Продажа товара</option>
            <option value="personal_task">Личная задача</option>
            <option value="rop_bonus">Бонус от РОПа</option>
          </select>
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#223044] text-[11px] uppercase tracking-wide text-[#8B98A9]">
                <th className="px-4 py-2.5 font-semibold">Дата</th>
                <th className="px-4 py-2.5 font-semibold">Источник</th>
                <th className="px-4 py-2.5 font-semibold">Комментарий</th>
                <th className="px-4 py-2.5 font-semibold">XP</th>
                <th className="px-4 py-2.5 font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              {xpHistory.entries.map((e) => (
                <tr key={e.id} className="border-b border-[#223044] last:border-0">
                  <td className="px-4 py-2.5 text-xs text-[#8B98A9]">{new Date(e.createdAt).toLocaleString("ru-RU")}</td>
                  <td className="px-4 py-2.5 text-xs text-[#F5F7FA]">{SOURCE_LABEL[e.source] ?? e.source}</td>
                  <td className="px-4 py-2.5 text-xs text-[#8B98A9]">{e.note}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-violet-300">+{e.xpDelta}</td>
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-amber-300">+{e.coinsDelta}</td>
                </tr>
              ))}
              {xpHistory.entries.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-[#8B98A9]">Пока нет начислений</td></tr>
              )}
            </tbody>
          </table>
          {xpHistory.total > PAGE_SIZE && (
            <Pagination page={xpPage} pageCount={xpPageCount} onChange={setXpPage} />
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold text-[#F5F7FA]">История продаж</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#223044] text-[11px] uppercase tracking-wide text-[#8B98A9]">
                <th className="px-4 py-2.5 font-semibold">Дата</th>
                <th className="px-4 py-2.5 font-semibold">Товар (SKU)</th>
                <th className="px-4 py-2.5 font-semibold">Кол-во</th>
                <th className="px-4 py-2.5 font-semibold">Сумма</th>
                <th className="px-4 py-2.5 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.sales.map((s) => (
                <tr key={s.id} className="border-b border-[#223044] last:border-0">
                  <td className="px-4 py-2.5 text-xs text-[#8B98A9]">{new Date(s.createdAt).toLocaleString("ru-RU")}</td>
                  <td className="px-4 py-2.5 text-xs text-[#F5F7FA]">{s.productName} <span className="text-[#8B98A9]">({s.sku})</span></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[#F5F7FA]">{s.quantity}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-[#F5F7FA]">{s.dealValue ? `$${s.dealValue.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">Confirmed</span>
                  </td>
                </tr>
              ))}
              {salesHistory.sales.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-[#8B98A9]">Пока нет продаж</td></tr>
              )}
            </tbody>
          </table>
          {salesHistory.total > PAGE_SIZE && (
            <Pagination page={salesPage} pageCount={salesPageCount} onChange={setSalesPage} />
          )}
        </Card>
      </div>
    </div>
  );
}

function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-[#223044] px-4 py-3 text-xs text-[#8B98A9]">
      <span className="font-mono">{page} / {pageCount}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#223044] disabled:opacity-30">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onChange(Math.min(pageCount, page + 1))} disabled={page >= pageCount} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#223044] disabled:opacity-30">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
