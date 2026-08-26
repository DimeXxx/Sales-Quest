import { Gamepad2, Trophy, Zap } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

// Manager-facing app has exactly two areas — the Admin/ROP surface lives in
// a completely separate shell (see AdminApp.tsx), not as a tab here.
export type TabId = "quests" | "arena";

interface NavBarProps {
  active: TabId;
  onChange: (t: TabId) => void;
}

export function SideNav({ active, onChange }: NavBarProps) {
  const { t } = useLanguage();
  const TABS: { id: TabId; label: string; icon: typeof Gamepad2 }[] = [
    { id: "quests", label: t("navQuests"), icon: Gamepad2 },
    { id: "arena", label: t("navArena"), icon: Trophy },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] bg-slate-950/90 px-4 py-6 backdrop-blur-sm lg:flex">
      <div className="mb-9 flex items-center gap-2.5 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-400 shadow-lg shadow-cyan-400/30">
          <Zap className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[15px] font-black leading-none tracking-tight text-slate-50">{t("appName")}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">{t("appTagline")}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                isActive ? "bg-cyan-400/[0.08] text-cyan-300" : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
              }`}
            >
              {isActive && (
                <span className="absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.8)]" />
              )}
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.08] to-cyan-500/[0.08] p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t("commandCenter")}</p>
        <p className="mt-1 text-xs text-slate-400">{t("commandCenterLoop")}</p>
      </div>
    </aside>
  );
}

export function BottomNav({ active, onChange }: NavBarProps) {
  const { t } = useLanguage();
  const TABS: { id: TabId; label: string; icon: typeof Gamepad2 }[] = [
    { id: "quests", label: t("navQuests"), icon: Gamepad2 },
    { id: "arena", label: t("navArena"), icon: Trophy },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-slate-950/95 backdrop-blur-md lg:hidden">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
            active === tab.id ? "text-cyan-300" : "text-slate-500"
          }`}
        >
          <tab.icon className="h-5 w-5" /> {tab.label}
        </button>
      ))}
    </nav>
  );
}
