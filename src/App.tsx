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
import { AdminPanel } from "./components/SalesQuest/AdminPanel";

export default function App() {
  const { account, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated || !account) {
    return <LoginScreen />;
  }

  return <AuthenticatedApp accountManagerId={account.managerId} accountName={account.name} accountRole={account.role} logout={logout} t={t} />;
}

interface AuthenticatedAppProps {
  accountManagerId: string;
  accountName: string;
  accountRole: "manager" | "rop" | "admin";
  logout: () => void;
  t: (key: Parameters<ReturnType<typeof useLanguage>["t"]>[0]) => string;
}

function AuthenticatedApp({ accountManagerId, accountName, accountRole, logout, t }: AuthenticatedAppProps) {
  const [tab, setTab] = useState<TabId>(accountRole === "rop" ? "admin" : "quests");
  const { toasts, pushToast } = useToasts();
  const game = useGameState({ pushToast, currentUserId: accountManagerId });

  // If this is a freshly registered account, its manager profile won't exist
  // in the game state's seed data yet — create it once, on first render.
  useEffect(() => {
    const exists = game.managers.some((m) => m.id === accountManagerId);
    if (!exists) {
      game.addManager({ id: accountManagerId, name: accountName, avatar: initials(accountName), role: accountRole });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountManagerId]);

  const rank = game.leaderboard.findIndex((m) => m.id === game.currentManager.id) + 1;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100">
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
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-rose-500/30 hover:text-rose-300"
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

            {tab === "admin" && (
              <AdminPanel
                products={game.products}
                focusProducts={game.focusProducts}
                bossFights={game.bossFights}
                onCreateFocusProduct={game.addFocusProduct}
                onBulkImport={game.bulkImportProducts}
                onRemoveFocusProduct={game.removeFocusProduct}
                onToggleBossFight={game.toggleBossFight}
              />
            )}
          </div>
        </main>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
