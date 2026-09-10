import { useState } from "react";
import { Bell, Laptop, LogOut, Shield, Smartphone } from "lucide-react";
import type { Manager } from "../../types/sales";
import type { Session } from "../../hooks/useManagerProfile";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { PhotoPicker } from "../ui/PhotoPicker";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

interface ProfileAccountTabProps {
  account: Manager;
  sessions: Session[];
  onChangePassword: (current: string, next: string) => Promise<boolean>;
  onLogoutOthers: () => void;
  onUpdateProfile: (patch: { name?: string; avatarUrl?: string | null }) => void;
  onUpdateNotifyPrefs: (patch: { inApp?: boolean; email?: boolean; telegram?: boolean }) => void;
}

const field = "w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3 py-2 text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";
const label = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#8B98A9]";

function deviceIcon(userAgent: string) {
  return /mobile|android|iphone/i.test(userAgent) ? Smartphone : Laptop;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (d.getFullYear() < 1980) return "—"; // backfilled placeholder for pre-existing accounts
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export function ProfileAccountTab({ account, sessions, onChangePassword, onLogoutOthers, onUpdateProfile, onUpdateNotifyPrefs }: ProfileAccountTabProps) {
  const [name, setName] = useState(account.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const submitPasswordChange = async () => {
    setPwError("");
    if (newPassword.length < 8) return setPwError("Новый пароль должен быть не короче 8 символов");
    if (newPassword !== confirmPassword) return setPwError("Пароли не совпадают");
    const ok = await onChangePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const prefs = account.notifyPrefs ?? { inApp: true, email: false, telegram: false };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-bold text-[#F5F7FA]">Личные данные</h2>
          <div className="mb-4">
            <label className={label}>Фото профиля</label>
            <PhotoPicker value={account.avatarUrl ?? null} onChange={(avatarUrl) => onUpdateProfile({ avatarUrl })} />
          </div>
          <div className="mb-3">
            <label className={label}>Имя</label>
            <div className="flex gap-2">
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
              {name !== account.name && (
                <Button size="sm" onClick={() => onUpdateProfile({ name })}>Сохранить</Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-[#8B98A9]">
            <div>
              <p className={label}>Email</p>
              <p className="text-[#F5F7FA]">{account.email}</p>
            </div>
            <div>
              <p className={label}>Роль</p>
              <p className="text-[#F5F7FA]">{account.role === "rop" ? "РОП" : "Manager"}</p>
            </div>
            <div>
              <p className={label}>Отдел</p>
              <p className="text-[#F5F7FA]">{account.department ?? "Продажи"}</p>
            </div>
            <div>
              <p className={label}>В команде с</p>
              <p className="text-[#F5F7FA]">{formatDate(account.createdAt)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
            <Bell className="h-4 w-4 text-cyan-300" /> Уведомления
          </h2>
          <div className="space-y-2.5">
            <label className="flex items-center justify-between text-xs text-[#8B98A9]">
              In-App уведомления
              <input type="checkbox" checked={prefs.inApp} onChange={(e) => onUpdateNotifyPrefs({ inApp: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between text-xs text-[#8B98A9]">
              Email (нужна настройка SMTP на сервере)
              <input type="checkbox" checked={prefs.email} onChange={(e) => onUpdateNotifyPrefs({ email: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between text-xs text-[#8B98A9]">
              Telegram-бот (нужен токен бота на сервере)
              <input type="checkbox" checked={prefs.telegram} onChange={(e) => onUpdateNotifyPrefs({ telegram: e.target.checked })} />
            </label>
          </div>
          <p className="mt-3 text-[11px] text-[#8B98A9]">
            Сейчас реально работают In-App уведомления. Email/Telegram — настройка сохраняется, но отправка не подключена (нужны учётные данные почтового сервиса/бота).
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-bold text-[#F5F7FA]">Язык</h2>
          <LanguageSwitcher />
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#F5F7FA]">
            <Shield className="h-4 w-4 text-cyan-300" /> Смена пароля
          </h2>
          <div className="space-y-3">
            <div>
              <label className={label}>Текущий пароль</label>
              <input className={field} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className={label}>Новый пароль</label>
              <input className={field} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className={label}>Подтверждение нового пароля</label>
              <input className={field} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            {pwError && <p className="text-xs font-semibold text-rose-400">{pwError}</p>}
            <Button className="w-full" onClick={submitPasswordChange}>Обновить пароль</Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F5F7FA]">Активные сессии</h2>
            <Button size="sm" variant="secondary" onClick={onLogoutOthers}>
              <LogOut className="h-3.5 w-3.5" /> Выйти со всех устройств
            </Button>
          </div>
          <div className="space-y-2">
            {sessions.map((s) => {
              const Icon = deviceIcon(s.userAgent);
              return (
                <div key={s.id} className="flex items-center gap-2.5 rounded-lg bg-white/[0.02] px-3 py-2">
                  <Icon className="h-4 w-4 text-[#8B98A9]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#F5F7FA]">{s.userAgent}{s.current && " (это устройство)"}</p>
                    <p className="text-[10px] text-[#8B98A9]">Последняя активность: {new Date(s.lastSeenAt).toLocaleString("ru-RU")}</p>
                  </div>
                </div>
              );
            })}
            {sessions.length === 0 && <p className="text-xs text-[#8B98A9]">Нет активных сессий</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
