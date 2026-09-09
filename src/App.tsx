import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useToasts } from "./hooks/useToasts";
import { useGameState } from "./hooks/useGameState";
import { useAuth } from "./auth/AuthContext";
import { useLanguage } from "./i18n/LanguageContext";
import { ToastStack } from "./components/ui/Toast";
import { LoginScreen } from "./components/auth/LoginScreen";
import { PendingApprovalScreen } from "./components/auth/PendingApprovalScreen";
import { SideNav, BottomNav, type TabId } from "./components/SalesQuest/NavBar";
import { Header } from "./components/SalesQuest/Header";
import { QuestsTab } from "./components/SalesQuest/QuestsTab";
import { ArenaTab } from "./components/SalesQuest/ArenaTab";
import { AdminApp } from "./components/SalesQuest/AdminApp";

export default function App() {
  const { account, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0B1119]">
        <LayoutGrid className="h-6 w-6 animate-pulse text-cyan-400" />
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
  // control room; managers only ever see the Overview/Leaderboard frontend.
  // Enforced server-side too (see server/auth.js requireRole) — this is UX
  // routing, not the security boundary.
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
    <div className="min-h-screen w-full bg-[#0B1119] text-[#F5F7FA]">
      <ToastStack toasts={toasts} />

      <div className="flex">
        <SideNav active={tab} onChange={setTab} manager={game.currentManager} />

        <div className="min-h-screen flex-1 pb-16 lg:pb-0">
          <Header name={accountName} roleLabel={t("roleManager")} onLogout={logout} />

          <main className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
            {tab === "quests" && game.currentManager && (
              <QuestsTab
                manager={game.currentManager}
                rank={rank || game.leaderboard.length}
                quests={game.questCards}
                pulseFocusId={game.pulseFocusId}
                bossFights={game.bossFights}
                onSell={game.registerSale}
                onJoinBossFight={() => pushToast("You're in!", "Your sales now count toward the team challenge")}
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
          </main>
        </div>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
