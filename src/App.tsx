import { Suspense, lazy, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useToasts } from "./hooks/useToasts";
import { useGameState } from "./hooks/useGameState";
import { usePersonalTasks } from "./hooks/usePersonalTasks";
import { useAuth } from "./auth/AuthContext";
import { useLanguage } from "./i18n/LanguageContext";
import type { QuestCardData } from "./types/sales";
import { ToastStack } from "./components/ui/Toast";
import { LoginScreen } from "./components/auth/LoginScreen";
import { PendingApprovalScreen } from "./components/auth/PendingApprovalScreen";
import { SideNav, BottomNav, type TabId } from "./components/SalesQuest/NavBar";
import { Header } from "./components/SalesQuest/Header";
import { QuestsTab } from "./components/SalesQuest/QuestsTab";
import { MyMissions } from "./components/SalesQuest/MyMissions";
import { Products } from "./components/SalesQuest/Products";
import { MissionDetailModal } from "./components/SalesQuest/MissionDetailModal";
import { ManagerProfileModal } from "./components/SalesQuest/ManagerProfileModal";
import { ArenaTab } from "./components/SalesQuest/ArenaTab";
import { AdminApp } from "./components/SalesQuest/AdminApp";

// recharts is a sizeable dependency — only the Analytics tab needs it, so it
// ships as its own chunk instead of bloating the initial load for everyone.
const Analytics = lazy(() => import("./components/SalesQuest/Analytics").then((m) => ({ default: m.Analytics })));

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
  const [selectedQuest, setSelectedQuest] = useState<QuestCardData | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { toasts, pushToast } = useToasts();
  const { t } = useLanguage();
  const game = useGameState({ pushToast });
  const personalTasks = usePersonalTasks({ pushToast });

  const rank = game.leaderboard.findIndex((m) => m.id === game.currentManager?.id) + 1;

  return (
    <div className="min-h-screen w-full bg-[#0B1119] text-[#F5F7FA]">
      <ToastStack toasts={toasts} />

      <div className="flex">
        <SideNav active={tab} onChange={setTab} manager={game.currentManager} />

        <div className="min-h-screen flex-1 pb-16 lg:pb-0">
          <Header name={accountName} roleLabel={t("roleManager")} onLogout={logout} onOpenProfile={() => setProfileOpen(true)} />

          <main className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
            {tab === "quests" && game.currentManager && (
              <QuestsTab
                manager={game.currentManager}
                rank={rank || game.leaderboard.length}
                quests={game.questCards}
                pulseFocusId={game.pulseFocusId}
                bossFights={game.bossFights}
                leaderboard={game.leaderboard}
                achievements={game.achievements}
                onSell={game.registerSale}
                onJoinBossFight={() => pushToast("You're in!", "Your sales now count toward the team challenge")}
                onNavigate={setTab}
              />
            )}

            {tab === "missions" && (
              <MyMissions
                quests={game.questCards}
                personalTasks={personalTasks.tasks}
                onSubmitPersonalTaskEntry={personalTasks.submitEntry}
                onSelect={setSelectedQuest}
              />
            )}

            {tab === "products" && <Products quests={game.questCards} onSelect={setSelectedQuest} />}

            {tab === "arena" && game.currentManager && (
              <ArenaTab
                managers={game.leaderboard}
                rewards={game.rewards}
                achievements={game.achievements}
                coins={game.currentManager.coins}
                onRedeem={game.redeemReward}
              />
            )}

            {tab === "analytics" && (
              <Suspense fallback={<div className="py-10 text-center text-sm text-[#8B98A9]">Loading…</div>}>
                <Analytics />
              </Suspense>
            )}
          </main>
        </div>
      </div>

      <MissionDetailModal quest={selectedQuest} onClose={() => setSelectedQuest(null)} onSell={game.registerSale} />

      <ManagerProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} onGoToRewards={() => setTab("arena")} />

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
