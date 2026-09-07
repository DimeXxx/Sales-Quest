import { Clock, LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { BgDecor } from "../ui/BgDecor";

export function PendingApprovalScreen() {
  const { logout, account } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 px-4 text-slate-100">
      <BgDecor />
      <div className="absolute right-5 top-5 z-10">
        <LanguageSwitcher />
      </div>

      <Card glow="amber" className="relative z-10 w-full max-w-sm p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15">
          <Clock className="h-7 w-7 text-amber-300" />
        </div>
        <h1 className="mb-2 text-lg font-bold text-slate-50">{t("pendingScreenTitle")}</h1>
        <p className="mb-1 text-sm text-slate-400">{t("pendingScreenBody")}</p>
        {account && <p className="mb-5 text-xs text-slate-600">{account.name} · {account.email}</p>}
        <Button variant="secondary" onClick={logout} className="w-full">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </Button>
      </Card>
    </div>
  );
}
