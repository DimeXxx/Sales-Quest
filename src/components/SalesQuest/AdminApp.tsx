import { useState } from "react";
import { LayoutDashboard, LogOut, Package, RotateCcw, Shield, Skull, TrendingUp, Users } from "lucide-react";
import type { BossFight, FocusProduct, Manager, Priority, Product } from "../../types/sales";
import type { ParsedProductRow } from "../../lib/excelImport";
import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { BgDecor } from "../ui/BgDecor";
import { Card } from "../ui/Card";
import { AdminPanel } from "./AdminPanel";
import { ManagersPanel } from "./ManagersPanel";
import { ResetPanel } from "./ResetPanel";

type AdminSection = "overview" | "products" | "bossfights" | "managers" | "reset";

interface AdminAppProps {
  managerName: string;
  products: Product[];
  focusProducts: FocusProduct[];
  bossFights: BossFight[];
  managers: Manager[];
  onCreateFocusProduct: (input: {
    name: string;
    sku: string;
    category: string;
    description: string;
    price: number;
    stock: number;
    stockAgeDays: number;
    marginPercent: number;
    priority: Priority;
    xpReward: number;
    coinReward: number;
  }) => void;
  onBulkImport: (rows: ParsedProductRow[]) => void;
  onRemoveFocusProduct: (id: string) => void;
  onToggleBossFight: (id: string) => void;
  onAdjustManager: (managerId: string, delta: { coins?: number; xp?: number }) => void;
  onResetAll: () => void;
  onResetManager: (id: string) => void;
  onResetAllManagers: () => void;
  onResetAllStock: () => void;
  onResetAllBossFights: () => void;
  onResetAchievements: () => void;
  logout: () => void;
}

/**
 * Dedicated backend-style control room for ROP/Admin accounts. Deliberately
 * has its own layout (top bar + section nav instead of the manager sidebar)
 * so it reads as a distinct system, not just another tab in the manager app.
 * Managers never see this shell at all — routing happens in App.tsx based
 * on account role.
 */
export function AdminApp({
  managerName,
  products,
  focusProducts,
  bossFights,
  managers,
  onCreateFocusProduct,
  onBulkImport,
  onRemoveFocusProduct,
  onToggleBossFight,
  onAdjustManager,
  onResetAll,
  onResetManager,
  onResetAllManagers,
  onResetAllStock,
  onResetAllBossFights,
  onResetAchievements,
  logout,
}: AdminAppProps) {
  const { t } = useLanguage();
  const [section, setSection] = useState<AdminSection>("overview");

  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const activeBossFights = bossFights.filter((b) => b.active).length;

  const SECTIONS: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: t("adminNavOverview"), icon: LayoutDashboard },
    { id: "products", label: t("adminNavProducts"), icon: Package },
    { id: "bossfights", label: t("adminNavBossFights"), icon: Skull },
    { id: "managers", label: t("adminNavManagers"), icon: Users },
    { id: "reset", label: t("adminNavReset"), icon: RotateCcw },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100">
      <BgDecor />

      {/* Distinct top bar — amber/rose "control room" accent instead of the manager app's cyan */}
      <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-slate-950/90 px-5 py-3.5 backdrop-blur-md lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 shadow-lg shadow-amber-500/20">
              <Shield className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-black leading-none text-slate-50">{t("adminPanelTitle")}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-amber-300/70">{managerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-500/30 hover:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" /> {t("logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">{t("adminPanelTitle")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("adminPanelSubtitle")}</p>
        </div>

        {/* Section nav — pill row, distinct from the manager sidebar */}
        <div className="mb-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                section === s.id
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-slate-200"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </button>
          ))}
        </div>

        {section === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label={t("totalManagers")} value={managers.length} color="#22D3EE" />
            <StatCard icon={Package} label={t("totalProducts")} value={focusProducts.length} color="#A78BFA" />
            <StatCard icon={TrendingUp} label={t("totalStockValue")} value={totalStock.toLocaleString()} color="#34D399" />
            <StatCard icon={Skull} label={t("activeBossFightsCount")} value={activeBossFights} color="#FB7185" />
          </div>
        )}

        {section === "products" && (
          <AdminPanel
            products={products}
            focusProducts={focusProducts}
            bossFights={bossFights}
            onCreateFocusProduct={onCreateFocusProduct}
            onBulkImport={onBulkImport}
            onRemoveFocusProduct={onRemoveFocusProduct}
            onToggleBossFight={onToggleBossFight}
            hideBossFights
          />
        )}

        {section === "bossfights" && (
          <AdminPanel
            products={products}
            focusProducts={focusProducts}
            bossFights={bossFights}
            onCreateFocusProduct={onCreateFocusProduct}
            onBulkImport={onBulkImport}
            onRemoveFocusProduct={onRemoveFocusProduct}
            onToggleBossFight={onToggleBossFight}
            onlyBossFights
          />
        )}

        {section === "managers" && <ManagersPanel managers={managers} onAdjust={onAdjustManager} />}

        {section === "reset" && (
          <ResetPanel
            managers={managers}
            products={products}
            bossFights={bossFights}
            onResetAll={onResetAll}
            onResetManager={onResetManager}
            onResetAllManagers={onResetAllManagers}
            onResetAllStock={onResetAllStock}
            onResetAllBossFights={onResetAllBossFights}
            onResetAchievements={onResetAchievements}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
  return (
    <Card interactive className="p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}>
        <Icon className="h-[18px] w-[18px]" style={{ color }} />
      </div>
      <p className="text-2xl font-black text-slate-50">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Card>
  );
}
