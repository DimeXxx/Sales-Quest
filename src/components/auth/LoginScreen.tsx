import { useState } from "react";
import { LayoutGrid, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";

export function LoginScreen() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      if (!email || !password) {
        setError(t("fillAllFields"));
        return;
      }
      setSubmitting(true);
      const result = await login(email, password);
      setSubmitting(false);
      if (!result.ok) setError(t("invalidCredentials"));
    } else {
      if (!name || !email || !password) {
        setError(t("fillAllFields"));
        return;
      }
      setSubmitting(true);
      const result = await register(name, email, password);
      setSubmitting(false);
      if (!result.ok) setError(result.error === "email_taken" ? t("emailTaken") : t("fillAllFields"));
    }
  };

  const field =
    "w-full rounded-lg border border-[#223044] bg-white/[0.02] px-3.5 py-2.5 text-sm text-[#F5F7FA] outline-none placeholder:text-[#8B98A9] focus:border-cyan-400";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B1119] px-4 text-[#F5F7FA]">
      <div className="absolute right-5 top-5">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/15">
            <LayoutGrid className="h-4.5 w-4.5 text-cyan-300" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-[#F5F7FA]">{t("appName")}</p>
            <p className="mt-0.5 text-[10px] text-[#8B98A9]">Stock → Focus → Sell → Earn</p>
          </div>
        </div>

        <h1 className="mb-1 text-lg font-bold text-[#F5F7FA]">
          {mode === "login" ? t("loginTitle") : t("registerTitle")}
        </h1>
        <p className="mb-5 text-xs text-[#8B98A9]">{mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}</p>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input className={field} placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <input
            className={field}
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={field}
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {mode === "login" ? (
              <>
                <LogIn className="h-4 w-4" /> {t("loginButton")}
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> {t("registerButton")}
              </>
            )}
          </Button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="mt-4 w-full text-center text-xs font-semibold text-[#8B98A9] hover:text-cyan-300"
        >
          {mode === "login" ? t("switchToRegister") : t("switchToLogin")}
        </button>

        {mode === "login" && (
          <div className="mt-5 rounded-lg border border-[#223044] bg-white/[0.02] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8B98A9]">{t("demoAccountsHint")}</p>
            <p className="mt-1 text-[11px] text-[#8B98A9]">alexei@qgroup.demo · dmitri@qgroup.demo · olga@qgroup.demo (РОП)</p>
          </div>
        )}
        {mode === "register" && (
          <p className="mt-4 text-center text-[11px] text-[#8B98A9]">{t("pendingHint")}</p>
        )}
      </Card>
    </div>
  );
}
