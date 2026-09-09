import { Clock, LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

export function PendingApprovalScreen() {
  const { logout, account } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B1119] px-4 text-[#F5F7FA]">
      <div className="absolute right-5 top-5">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-sm p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-400/15">
          <Clock className="h-6 w-6 text-amber-300" />
        </div>
        <h1 className="mb-2 text-lg font-bold text-[#F5F7FA]">{t("pendingScreenTitle")}</h1>
        <p className="mb-1 text-sm text-[#8B98A9]">{t("pendingScreenBody")}</p>
        {account && <p className="mb-5 text-xs text-[#8B98A9]">{account.name} · {account.email}</p>}
        <Button variant="secondary" onClick={logout} className="w-full">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </Button>
      </Card>
    </div>
  );
}
