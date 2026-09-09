import { useState } from "react";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

interface HeaderProps {
  name: string;
  roleLabel: string;
  onLogout: () => void;
}

export function Header({ name, roleLabel, onLogout }: HeaderProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#223044] bg-[#0B1119]/90 px-5 py-3 backdrop-blur-md">
      <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-[#8B98A9]">
        <Search className="h-4 w-4" />
        <span className="text-sm">{t("headerSearchPlaceholder")}</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#8B98A9] hover:bg-white/[0.04] hover:text-[#F5F7FA]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-white/[0.03]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-[11px] font-bold text-[#F5F7FA]">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-none text-[#F5F7FA]">{name}</p>
              <p className="mt-0.5 text-[10px] text-[#8B98A9]">{roleLabel}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#8B98A9]" />
          </button>

          {open && (
            <div className="absolute right-0 top-full z-40 mt-2 w-48 rounded-lg border border-[#223044] bg-[#111923] p-2 shadow-xl">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-xs text-[#8B98A9]">{t("language")}</span>
                <LanguageSwitcher />
              </div>
              <button
                onClick={onLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-[#8B98A9] hover:bg-white/[0.04] hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" /> {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
