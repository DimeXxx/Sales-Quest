import { LayoutGrid, Trophy } from "lucide-react";
import type { Manager } from "../../types/sales";
import { levelFromXp } from "../../types/sales";
import { useLanguage } from "../../i18n/LanguageContext";
import { Progress } from "../ui/Progress";

// Manager-facing app has exactly two areas — the Admin/ROP surface lives in
// a completely separate shell (see AdminApp.tsx), not as a tab here.
export type TabId = "quests" | "arena";

interface NavBarProps {
  active: TabId;
  onChange: (t: TabId) => void;
  manager?: Manager;
}

export function SideNav({ active, onChange, manager }: NavBarProps) {
  const { t } = useLanguage();
  const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
    { id: "quests", label: t("navQuests"), icon: LayoutGrid },
    { id: "arena", label: t("navArena"), icon: Trophy },
  ];

  const level = manager ? levelFromXp(manager.xp) : null;
  const nextLevelPct = level ? (level.xpIntoLevel / level.xpToNext) * 100 : 0;

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[#223044] bg-[#0B1119] px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15">
          <LayoutGrid className="h-4 w-4 text-cyan-300" strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-[13px] font-bold leading-none tracking-tight text-[#F5F7FA]">{t("appName")}</p>
          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.15em] text-[#8B98A9]">Stock → Focus → Sell → Earn</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-cyan-400/10 text-cyan-300" : "text-[#8B98A9] hover:bg-white/[0.03] hover:text-[#F5F7FA]"
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </nav>

      {manager && level && (
        <div className="mt-auto rounded-lg border border-[#223044] bg-white/[0.02] p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8B98A9]">{t("commandCenter")}</p>
          <p className="mt-1 mb-2 text-xs text-[#8B98A9]">Level {manager.level} → {manager.level + 1}</p>
          <Progress value={nextLevelPct} colorClassName="bg-violet-400" />
        </div>
      )}
    </aside>
  );
}

export function BottomNav({ active, onChange }: NavBarProps) {
  const { t } = useLanguage();
  const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
    { id: "quests", label: t("navQuests"), icon: LayoutGrid },
    { id: "arena", label: t("navArena"), icon: Trophy },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#223044] bg-[#0B1119]/95 backdrop-blur-md lg:hidden">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
            active === tab.id ? "text-cyan-300" : "text-[#8B98A9]"
          }`}
        >
          <tab.icon className="h-5 w-5" /> {tab.label}
        </button>
      ))}
    </nav>
  );
}
