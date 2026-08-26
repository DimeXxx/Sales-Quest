import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useToasts } from "./hooks/useToasts";
import { useGameState } from "./hooks/useGameState";
import { useAuth } from "./auth/AuthContext";
import { initials } from "./auth/accounts";
import { useLanguage } from "./i18n/LanguageContext";
import { ToastStack } from "./components/ui/Toast";
import { BgDecor } from "./components/ui/BgDecor";
import { LanguageSwitcher } from "./components/ui/LanguageSwitcher";
import { LoginScreen } from "./components/auth/LoginScreen";
import { SideNav, BottomNav, type TabId } from "./components/SalesQuest/NavBar";
import { QuestsTab } from "./components/SalesQuest/QuestsTab";
import { ArenaTab } from "./components/SalesQuest/ArenaTab";
import { AdminApp } from "./components/SalesQuest/AdminApp";

export default function App() {
  const { account, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !account) {
    return <LoginScreen />;
  }

  // Role-based routing: ROP/admin accounts never see the manager frontend —
  // they land straight in the separate AdminApp control room. Managers never
  // see the admin surface at all (no nav item, no route). This is a client-
  // side gate for the internal pilot; a production rollout should also
  // enforce this server-side once a real backend exists (see README).
  if (account.role === "rop" || account.role === "admin") {
    return <RoutedAdminApp accountManagerId={account.managerId} accountName={account.name} accountRole={account.role} logout={logout} />;
  }

  return <ManagerApp accountManagerId={account.managerId} accountName={account.name} accountRole={account.role} logout={logout} />;
}

interface AppProps {
  accountManagerId: string;
  accountName: string;
  accountRole: "manager" | "rop" | "admin";
  logout: () => void;
}

function useEnsureManagerProfile(accountManagerId: string, accountName: string, accountRole: AppProps["accountRole"], game: ReturnType<typeof useGameState>) {
  // If this is a freshly registered account, its manager profile won't exist
  // in the game state's seed data yet — create it once, on first render.
  useEffect(() => {
    const exists = game.managers.some((m) => m.id === accountManagerId);
    if (!exists) {
      game.addManager({ id: accountManagerId, name: accountName, avatar: initials(accountName), role: accountRole });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountManagerId]);
}

/** Manager-facing frontend: Quests + Arena only. */
function ManagerApp({ accountManagerId, accountName, accountRole, logout }: AppProps) {
  const [tab, setTab] = useState<TabId>("quests");
  const { toasts, pushToast } = useToasts();
  const { t } = useLanguage();
  const game = useGameState({ pushToast, currentUserId: accountManagerId });
  useEnsureManagerProfile(accountManagerId, accountName, accountRole, game);

  const rank = game.leaderboard.findIndex((m) => m.id === game.currentManager.id) + 1;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100">
      <BgDecor />
      <ToastStack toasts={toasts} />

      <div className="relative z-10 flex">
        <SideNav active={tab} onChange={setTab} />

        <main className="min-h-screen flex-1 pb-20 lg:pb-0">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-end gap-3">
              <LanguageSwitcher />
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-500/30 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" /> {t("logout")}
              </button>
            </div>

            {tab === "quests" && (
              <QuestsTab
                manager={game.currentManager}
                rank={rank || game.leaderboard.length}
                quests={game.questCards}
                pulseFocusId={game.pulseFocusId}
                bossFights={game.bossFights}
                onSell={game.registerSale}
                onJoinBossFight={() => pushToast("Ты в игре!", "Твои продажи теперь считаются в Boss Fight")}
              />
            )}

            {tab === "arena" && (
              <ArenaTab
                managers={game.leaderboard}
                rewards={game.rewards}
                achievements={game.achievements}
                coins={game.currentManager.coins}
                onRedeem={game.redeemReward}
              />
            )}
          </div>
        </main>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

/** Separate admin/backend control room — entirely different shell, no manager tabs at all. */
function RoutedAdminApp({ accountManagerId, accountName, accountRole, logout }: AppProps) {
  const { pushToast } = useToasts();
  const game = useGameState({ pushToast, currentUserId: accountManagerId });
  useEnsureManagerProfile(accountManagerId, accountName, accountRole, game);

  return (
    <AdminApp
      managerName={accountName}
      products={game.products}
      focusProducts={game.focusProducts}
      bossFights={game.bossFights}
      managers={game.managers}
      onCreateFocusProduct={game.addFocusProduct}
      onBulkImport={game.bulkImportProducts}
      onRemoveFocusProduct={game.removeFocusProduct}
      onToggleBossFight={game.toggleBossFight}
      onAdjustManager={game.adjustManager}
      logout={logout}
    />
  );
}
