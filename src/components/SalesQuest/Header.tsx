import { useEffect, useState } from "react";
import { Bell, ChevronDown, LogOut, Search, User } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { api } from "../../lib/api";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface HeaderProps {
  name: string;
  roleLabel: string;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export function Header({ name, roleLabel, onLogout, onOpenProfile }: HeaderProps) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  useEffect(() => {
    api.get<{ notifications: Notification[]; unreadCount: number }>("/notifications").then((res) => {
      setNotifications(res.notifications.slice(0, 8));
      setUnreadCount(res.unreadCount);
    });
  }, []);

  const openBell = async () => {
    setBellOpen((o) => !o);
    if (unreadCount > 0) {
      await api.post("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#223044] bg-[#0B1119]/90 px-5 py-3 backdrop-blur-md">
      <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-[#8B98A9]">
        <Search className="h-4 w-4" />
        <span className="text-sm">{t("headerSearchPlaceholder")}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={openBell} className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#8B98A9] hover:bg-white/[0.04] hover:text-[#F5F7FA]">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400" />}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-lg border border-[#223044] bg-[#111923] p-2 shadow-xl">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#8B98A9]">Уведомления</p>
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-md px-2 py-1.5 text-xs text-[#F5F7FA] hover:bg-white/[0.03]">
                    <p>{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-[#8B98A9]">{new Date(n.createdAt).toLocaleString("ru-RU")}</p>
                  </div>
                ))}
                {notifications.length === 0 && <p className="px-2 py-2 text-xs text-[#8B98A9]">Пока пусто</p>}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
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

          {menuOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-52 rounded-lg border border-[#223044] bg-[#111923] p-2 shadow-xl">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenProfile();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold text-[#8B98A9] hover:bg-white/[0.04] hover:text-[#F5F7FA]"
              >
                <User className="h-3.5 w-3.5" /> Личный кабинет
              </button>
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
