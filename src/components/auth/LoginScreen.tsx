import { useState } from "react";
import { LogIn, UserPlus, Zap } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { BgDecor } from "../ui/BgDecor";

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
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 px-4 text-slate-100">
      <BgDecor />
      <div className="absolute right-5 top-5 z-10">
        <LanguageSwitcher />
      </div>

      <Card glow="cyan" className="relative z-10 w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-violet-400 shadow-lg shadow-cyan-400/30">
            <Zap className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-black leading-none text-slate-50">{t("appName")}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-cyan-300/70">{t("appTagline")}</p>
          </div>
        </div>

        <h1 className="mb-1 text-lg font-bold text-slate-50">
          {mode === "login" ? t("loginTitle") : t("registerTitle")}
        </h1>
        <p className="mb-5 text-xs text-slate-500">{mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}</p>

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
          className="mt-4 w-full text-center text-xs font-semibold text-slate-500 hover:text-cyan-300"
        >
          {mode === "login" ? t("switchToRegister") : t("switchToLogin")}
        </button>

        {mode === "login" && (
          <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{t("demoAccountsHint")}</p>
            <p className="mt-1 text-[11px] text-slate-500">alexei@qgroup.demo · dmitri@qgroup.demo · olga@qgroup.demo (РОП)</p>
          </div>
        )}
        {mode === "register" && (
          <p className="mt-4 text-center text-[11px] text-slate-600">{t("pendingHint")}</p>
        )}
      </Card>
    </div>
  );
}
