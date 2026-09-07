import { useState } from "react";
import { LogOut, Zap } from "lucide-react";
import { useToasts } from "./hooks/useToasts";
import { useGameState } from "./hooks/useGameState";
import { useAuth } from "./auth/AuthContext";
import { useLanguage } from "./i18n/LanguageContext";
import { ToastStack } from "./components/ui/Toast";
import { BgDecor } from "./components/ui/BgDecor";
import { LanguageSwitcher } from "./components/ui/LanguageSwitcher";
import { LoginScreen } from "./components/auth/LoginScreen";
import { PendingApprovalScreen } from "./components/auth/PendingApprovalScreen";
import { SideNav, BottomNav, type TabId } from "./components/SalesQuest/NavBar";
import { QuestsTab } from "./components/SalesQuest/QuestsTab";
import { ArenaTab } from "./components/SalesQuest/ArenaTab";
import { AdminApp } from "./components/SalesQuest/AdminApp";

export default function App() {
  const { account, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950">
        <Zap className="h-8 w-8 animate-pulse text-cyan-400" />
      </div>
    );
  }

  if (!isAuthenticated || !account) {
    return <LoginScreen />;
  }

  if (account.status === "pending") {
    return <PendingApprovalScreen />;
  }

  // Role-based routing: ROP/admin accounts land in the separate AdminApp
  // control room; managers only ever see the Quests/Arena frontend. This is
  // enforced server-side too (see server/auth.js requireRole) — the client
  // routing here is just UX, not the security boundary.
  if (account.role === "rop" || account.role === "admin") {
    return <AdminApp managerName={account.name} logout={logout} />;
  }

  return <ManagerApp accountName={account.name} logout={logout} />;
}

function ManagerApp({ accountName, logout }: { accountName: string; logout: () => void }) {
  const [tab, setTab] = useState<TabId>("quests");
  const { toasts, pushToast } = useToasts();
  const { t } = useLanguage();
  const game = useGameState({ pushToast });

  const rank = game.leaderboard.findIndex((m) => m.id === game.currentManager?.id) + 1;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-slate-100">
      <BgDecor />
      <ToastStack toasts={toasts} />

      <div className="relative z-10 flex">
        <SideNav active={tab} onChange={setTab} />

        <main className="min-h-screen flex-1 pb-20 lg:pb-0">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-end gap-3">
              <span className="text-xs text-slate-500">{accountName}</span>
              <LanguageSwitcher />
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-500/30 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" /> {t("logout")}
              </button>
            </div>

            {tab === "quests" && game.currentManager && (
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

            {tab === "arena" && game.currentManager && (
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
