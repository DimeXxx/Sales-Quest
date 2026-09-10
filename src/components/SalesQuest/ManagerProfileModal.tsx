import { useState } from "react";
import { BarChart3, Shield, Trophy, X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useManagerProfile } from "../../hooks/useManagerProfile";
import { useToasts } from "../../hooks/useToasts";
import { ToastStack } from "../ui/Toast";
import { ProfileAccountTab } from "./ProfileAccountTab";
import { ProfileStatsTab } from "./ProfileStatsTab";
import { ProfileHistoryTab } from "./ProfileHistoryTab";

type ProfileTab = "account" | "stats" | "history";

interface ManagerProfileModalProps {
  open: boolean;
  onClose: () => void;
  onGoToRewards: () => void;
}

export function ManagerProfileModal({ open, onClose, onGoToRewards }: ManagerProfileModalProps) {
  const { account } = useAuth();
  const { toasts, pushToast } = useToasts();
  const profile = useManagerProfile({ pushToast });
  const [tab, setTab] = useState<ProfileTab>("account");

  if (!open || !account) return null;

  const TABS: { id: ProfileTab; label: string; icon: typeof Shield }[] = [
    { id: "account", label: "Профиль и Безопасность", icon: Shield },
    { id: "stats", label: "Статистика и Достижения", icon: Trophy },
    { id: "history", label: "Аналитика и История", icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-8" onClick={onClose}>
      <ToastStack toasts={toasts} />
      <div
        className="w-full max-w-5xl rounded-xl border border-[#223044] bg-[#0B1119] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#223044] bg-[#0B1119] px-5 py-4">
          <h1 className="text-base font-bold text-[#F5F7FA]">Личный кабинет</h1>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-[#8B98A9] hover:bg-white/[0.04] hover:text-[#F5F7FA]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-[#223044] px-5 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 border-b-2 px-1 pb-2.5 text-xs font-semibold transition-colors sm:text-sm ${
                tab === t.id ? "border-cyan-400 text-[#F5F7FA]" : "border-transparent text-[#8B98A9] hover:text-[#F5F7FA]"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {tab === "account" && (
            <ProfileAccountTab
              account={account}
              sessions={profile.sessions}
              onChangePassword={profile.changePassword}
              onLogoutOthers={profile.logoutOtherSessions}
              onUpdateProfile={profile.updateProfile}
              onUpdateNotifyPrefs={profile.updateNotifyPrefs}
            />
          )}
          {tab === "stats" && (
            <ProfileStatsTab
              account={account}
              achievements={profile.achievements}
              activeDays={profile.kpi?.activeDays ?? []}
              onGoToRewards={() => {
                onClose();
                onGoToRewards();
              }}
            />
          )}
          {tab === "history" && (
            <ProfileHistoryTab
              kpi={profile.kpi}
              xpHistory={profile.xpHistory}
              salesHistory={profile.salesHistory}
              onFetchXpHistory={profile.fetchXpHistory}
              onFetchSalesHistory={profile.fetchSalesHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
}
