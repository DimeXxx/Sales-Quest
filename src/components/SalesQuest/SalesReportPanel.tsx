import { FileSpreadsheet } from "lucide-react";
import type { SalesReportManager, SalesReportProduct } from "../../hooks/useAdminState";
import { Card } from "../ui/Card";
import { useLanguage } from "../../i18n/LanguageContext";

interface SalesReportPanelProps {
  products: SalesReportProduct[];
  managers: SalesReportManager[];
}

export function SalesReportPanel({ products, managers }: SalesReportPanelProps) {
  const { t } = useLanguage();
  const totalPaid = products.reduce((a, p) => a + (p.totalCashPaid ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#8B98A9]">
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> {t("salesReport")}
        </h2>
        <p className="text-xs text-[#8B98A9]">{t("salesReportHint")}</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#223044] text-[11px] uppercase tracking-wide text-[#8B98A9]">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">{t("soldQty")}</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">$/шт</th>
                <th className="px-4 py-3 font-semibold">{t("totalPaid")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.productId} className="border-b border-[#223044] last:border-0">
                  <td className="px-4 py-3 font-semibold text-[#F5F7FA]">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-[#8B98A9]">{p.sku}</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-300">{p.soldCount ?? 0}</td>
                  <td className="px-4 py-3 font-mono text-[#8B98A9]">{p.stock}/{p.initialStock}</td>
                  <td className="px-4 py-3 font-mono text-[#8B98A9]">${(p.cashBonusPerUnit ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-300">${(p.totalCashPaid ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#223044]">
                <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold uppercase text-[#8B98A9]">Итого</td>
                <td className="px-4 py-3 font-mono text-base font-bold text-amber-300">${totalPaid.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#8B98A9]">{t("totalCashEarned")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {managers.map((m) => (
            <Card key={m.accountId} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-[#F5F7FA]">{m.name}</p>
                <p className="text-[11px] text-[#8B98A9]">{m.questsCompleted} продаж</p>
              </div>
              <p className="font-mono text-lg font-bold text-amber-300">${(m.totalCashBonus ?? 0).toFixed(2)}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}