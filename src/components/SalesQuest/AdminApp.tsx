import { Suspense, lazy, useState } from "react";
import { Clock, FileSpreadsheet, Gift, LayoutDashboard, LogOut, Package, RotateCcw, Shield, Target, TrendingUp, Users } from "lucide-react";
import { BarChart3, ClipboardList } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { useToasts } from "../../hooks/useToasts";
import { useAdminState } from "../../hooks/useAdminState";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { Card } from "../ui/Card";
import { ToastStack } from "../ui/Toast";
import { AdminPanel } from "./AdminPanel";
import { ManagersPanel } from "./ManagersPanel";
import { ResetPanel } from "./ResetPanel";
import { PendingApprovalsPanel } from "./PendingApprovalsPanel";
import { SalesReportPanel } from "./SalesReportPanel";
import { RewardsPanel } from "./RewardsPanel";
import { PersonalTasksPanel } from "./PersonalTasksPanel";

const AdminAnalytics = lazy(() => import("./AdminAnalytics").then((m) => ({ default: m.AdminAnalytics })));

type AdminSection = "overview" | "pending" | "products" | "bossfights" | "rewards" | "personalTasks" | "managers" | "reports" | "analytics" | "reset";

interface AdminAppProps {
  managerName: string;
  logout: () => void;
}

/**
 * Dedicated control room for ROP/Admin accounts — left sidebar navigation,
 * matching the manager app's layout pattern instead of top pill tabs.
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
    { id: "bossfights", label: t("adminNavBossFights"), icon: Target },
    { id: "rewards", label: t("rewardStore"), icon: Gift },
    { id: "personalTasks", label: "Личные задачи", icon: ClipboardList },
    { id: "managers", label: t("adminNavManagers"), icon: Users },
    { id: "reports", label: t("salesReport"), icon: FileSpreadsheet },
    { id: "analytics", label: t("adminNavAnalytics"), icon: BarChart3 },
    { id: "reset", label: t("adminNavReset"), icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0B1119] text-[#F5F7FA]">
      <ToastStack toasts={toasts} />

      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#223044] bg-[#0B1119]/90 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15">
            <Shield className="h-4 w-4 text-cyan-300" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-[#F5F7FA]">{t("adminPanelTitle")}</p>
            <p className="mt-0.5 text-[10px] text-[#8B98A9]">{managerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-1.5 text-xs font-semibold text-[#8B98A9] hover:text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5" /> {t("logout")}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Left sidebar nav — desktop */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 flex-col overflow-y-auto border-r border-[#223044] px-3 py-5 lg:flex">
          <nav className="flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  section === s.id ? "bg-cyan-400/10 text-cyan-300" : "text-[#8B98A9] hover:bg-white/[0.03] hover:text-[#F5F7FA]"
                }`}
              >
                <s.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{s.label}</span>
                {!!s.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{s.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Same nav, horizontal + wrapping — mobile fallback */}
        <div className="flex flex-wrap gap-2 border-b border-[#223044] p-4 lg:hidden">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`relative flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                section === s.id ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-[#223044] bg-transparent text-[#8B98A9]"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" /> {s.label}
              {!!s.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{s.badge}</span>
              )}
            </button>
          ))}
        </div>

        <main className="min-w-0 flex-1 px-5 py-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#F5F7FA]">{SECTIONS.find((s) => s.id === section)?.label}</h1>
            <p className="mt-1 text-sm text-[#8B98A9]">{t("adminPanelSubtitle")}</p>
          </div>

          {section === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Users} label={t("totalManagers")} value={admin.approvedAccounts.length} color="#22D3EE" />
              <StatCard icon={Package} label={t("totalProducts")} value={admin.inventory.length} color="#A78BFA" />
              <StatCard icon={TrendingUp} label={t("totalStockValue")} value={totalStock.toLocaleString()} color="#34D399" />
              <StatCard icon={Target} label={t("activeBossFightsCount")} value={activeBossFights} color="#F5B93F" />
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
              onUpdateFocusProduct={admin.updateFocusProduct}
              onBulkImport={admin.bulkImportProducts}
              onRemoveFocusProduct={admin.removeFocusProduct}
              onUpdateCashBonus={admin.updateCashBonus}
              onToggleBossFight={admin.toggleBossFight}
              onCreateBossFight={admin.createBossFight}
              onUpdateBossFight={admin.updateBossFight}
              onDeleteBossFight={admin.deleteBossFight}
              onRecomputePriorities={admin.recomputePriorities}
              onRecomputeAchievements={admin.recomputeAchievements}
            onRecomputeCategories={admin.recomputeCategories}
              hideBossFights
            />
          )}

          {section === "bossfights" && (
            <AdminPanel
              inventory={admin.inventory}
              bossFights={admin.bossFights}
              onCreateFocusProduct={admin.addFocusProduct}
              onUpdateFocusProduct={admin.updateFocusProduct}
              onBulkImport={admin.bulkImportProducts}
              onRemoveFocusProduct={admin.removeFocusProduct}
              onUpdateCashBonus={admin.updateCashBonus}
              onToggleBossFight={admin.toggleBossFight}
              onCreateBossFight={admin.createBossFight}
              onUpdateBossFight={admin.updateBossFight}
              onDeleteBossFight={admin.deleteBossFight}
              onRecomputePriorities={admin.recomputePriorities}
              onRecomputeAchievements={admin.recomputeAchievements}
            onRecomputeCategories={admin.recomputeCategories}
              onlyBossFights
            />
          )}

          {section === "rewards" && (
            <RewardsPanel rewards={admin.rewards} onCreate={admin.createReward} onUpdate={admin.updateReward} onDelete={admin.deleteReward} />
          )}

          {section === "personalTasks" && (
            <PersonalTasksPanel
              tasks={admin.personalTasks}
              managers={admin.approvedAccounts.filter((m) => m.role === "manager")}
              onCreate={admin.createPersonalTask}
              onDelete={admin.deletePersonalTask}
              onApproveEntry={admin.approvePersonalTaskEntry}
              onRejectEntry={admin.rejectPersonalTaskEntry}
            />
          )}

          {section === "managers" && (
            <ManagersPanel
              managers={admin.approvedAccounts}
              onAdjust={admin.adjustManager}
              onChangeRole={admin.changeRole}
              onUpdate={admin.updateAccount}
              onDelete={admin.deleteAccount}
              onCreate={admin.createManager}
            />
          )}

          {section === "reports" && <SalesReportPanel products={admin.salesReport.products} managers={admin.salesReport.managers} />}

          {section === "analytics" && (
            <Suspense fallback={<div className="py-10 text-center text-sm text-[#8B98A9]">Loading…</div>}>
              <AdminAnalytics />
            </Suspense>
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
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
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
