import { useState } from "react";
import { Clock, LayoutDashboard, LogOut, Package, RotateCcw, Shield, Skull, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { useToasts } from "../../hooks/useToasts";
import { useAdminState } from "../../hooks/useAdminState";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { BgDecor } from "../ui/BgDecor";
import { Card } from "../ui/Card";
import { ToastStack } from "../ui/Toast";
import { AdminPanel } from "./AdminPanel";
import { ManagersPanel } from "./ManagersPanel";
import { ResetPanel } from "./ResetPanel";
import { PendingApprovalsPanel } from "./PendingApprovalsPanel";

type AdminSection = "overview" | "pending" | "products" | "bossfights" | "managers" | "reset";

interface AdminAppProps {
  managerName: string;
  logout: () => void;
}

/**
 * Dedicated backend-style control room for ROP/Admin accounts. Fetches and
 * mutates all its own data via useAdminState (real backend API) — managers
 * never see this shell at all, App.tsx routes purely by account role.
 */
export function AdminApp({ managerName, logout }: AdminAppProps) {
  const { t } = useLanguage();
  const { toasts, pushToast } = useToasts();
  const admin = useAdminState({ pushToast });
  const [section, setSection] = useState<AdminSection>("overview");

  const totalStock = admin.inventory.reduce((a, r) => a + r.stock, 0);
  const activeBossFights = admin.bossFights.filter((b) => b.active).length;

  const SECTIONS: { id: AdminSection; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: "overview", label: t("adminNavOverview"), icon: LayoutDashboard },
    { id: "pending", label: t("adminNavPending"), icon: Clock, badge: admin.pendingAccounts.length },
    { id: "products", label: t("adminNavProducts"), icon: Package },
    { id: "bossfights", label: t("adminNavBossFights"), icon: Skull },
    { id: "managers", label: t("adminNavManagers"), icon: Users },
    { id: "reset", label: t("adminNavReset"), icon: RotateCcw },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100">
      <BgDecor />
      <ToastStack toasts={toasts} />

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

        <div className="mb-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                section === s.id
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-slate-200"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" /> {s.label}
              {!!s.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                  {s.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {section === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label={t("totalManagers")} value={admin.approvedAccounts.length} color="#22D3EE" />
            <StatCard icon={Package} label={t("totalProducts")} value={admin.inventory.length} color="#A78BFA" />
            <StatCard icon={TrendingUp} label={t("totalStockValue")} value={totalStock.toLocaleString()} color="#34D399" />
            <StatCard icon={Skull} label={t("activeBossFightsCount")} value={activeBossFights} color="#FB7185" />
          </div>
        )}

        {section === "pending" && (
          <PendingApprovalsPanel
            pending={admin.pendingAccounts}
            onApprove={admin.approveAccount}
            onReject={admin.rejectAccount}
          />
        )}

        {section === "products" && (
          <AdminPanel
            inventory={admin.inventory}
            bossFights={admin.bossFights}
            onCreateFocusProduct={admin.addFocusProduct}
            onBulkImport={admin.bulkImportProducts}
            onRemoveFocusProduct={admin.removeFocusProduct}
            onToggleBossFight={admin.toggleBossFight}
            hideBossFights
          />
        )}

        {section === "bossfights" && (
          <AdminPanel
            inventory={admin.inventory}
            bossFights={admin.bossFights}
            onCreateFocusProduct={admin.addFocusProduct}
            onBulkImport={admin.bulkImportProducts}
            onRemoveFocusProduct={admin.removeFocusProduct}
            onToggleBossFight={admin.toggleBossFight}
            onlyBossFights
          />
        )}

        {section === "managers" && (
          <ManagersPanel managers={admin.approvedAccounts} onAdjust={admin.adjustManager} onChangeRole={admin.changeRole} />
        )}

        {section === "reset" && (
          <ResetPanel
            managers={admin.approvedAccounts}
            inventory={admin.inventory}
            bossFights={admin.bossFights}
            onResetAll={admin.resetEverything}
            onResetManager={admin.resetManagerProgress}
            onResetAllManagers={admin.resetAllManagersProgress}
            onResetAllStock={admin.resetAllStock}
            onResetAllBossFights={admin.resetAllBossFights}
            onResetAchievements={admin.resetAchievements}
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
